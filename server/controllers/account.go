package controllers

import (
	"context"
	"os"

	"github.com/Oattha/expense-app/common"
	"github.com/Oattha/expense-app/models"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gofiber/fiber/v2"
)

// ฟังก์ชันช่วยอัปโหลดรูปไป Cloudinary
func uploadToCloudinary(c *fiber.Ctx) (string, error) {
	file, err := c.FormFile("image") // รับไฟล์จาก Form Data ชื่อ image
	if err != nil {
		return "", nil // ถ้าไม่มีการส่งรูปมา ให้ข้ามไป (ไม่ถือเป็น error)
	}

	// เปิดไฟล์เพื่อเตรียมอัปโหลด[cite: 4]
	f, err := file.Open()
	if err != nil {
		return "", err
	}
	defer f.Close()

	ctx := context.Background()
	// ดึง CLOUDINARY_URL จาก Environment Variable
	cld, err := cloudinary.NewFromURL(os.Getenv("CLOUDINARY_URL"))
	if err != nil {
		return "", err
	}

	// อัปโหลดไฟล์
	resp, err := cld.Upload.Upload(ctx, f, uploader.UploadParams{
		Folder: "expense_app/accounts", // เก็บแยกโฟลเดอร์ให้เป็นระเบียบ
	})
	if err != nil {
		return "", err
	}

	return resp.SecureURL, nil // คืนค่า URL ที่เป็น https
}

// @Summary Create a new account
// @Tags Accounts
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param account body models.Account true "Account Data"
// @Success 200 {object} models.Account
// @Router /api/accounts [post]
func CreateAccount(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	var acc models.Account

	if err := c.BodyParser(&acc); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// เพิ่มส่วนการจัดการรูปภาพผ่าน Cloudinary
	imageURL, err := uploadToCloudinary(c)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถอัปโหลดรูปภาพได้"})
	}
	if imageURL != "" {
		// สมมติว่าใน models.Account มีฟิลด์ ImageURL นะครับ
	}

	acc.UserID = uID
	common.DB.Create(&acc)
	return c.JSON(acc)
}

// @Summary Get all accounts
// @Tags Accounts
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {array} models.Account
// @Router /api/accounts [get]
func GetAccounts(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	var accs []models.Account
	common.DB.Where("user_id = ?", uID).Find(&accs)
	return c.JSON(accs)
}

// @Summary Update default account
// @Tags Accounts
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param account body models.UpdateDefaultReq true "Default Account ID"
// @Success 200 {object} map[string]string
// @Router /api/accounts/default [put]
func UpdateDefaultAccount(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)

	var data models.UpdateDefaultReq
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลไม่ถูกต้อง"})
	}

	result := common.DB.Model(&models.User{}).Where("id = ?", uID).Update("default_account_id", data.AccountID)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถอัปเดตข้อมูลได้"})
	}

	return c.JSON(fiber.Map{"message": "บันทึกค่าเริ่มต้นแล้ว"})
}

// UpdateAccount แก้ไขชื่อบัญชี
// @Summary Update account name
// @Tags Accounts
// @Security ApiKeyAuth
// @Accept json
// @Produce json
// @Param id path int true "Account ID"
// @Param account body models.Account true "Account Data"
// @Router /api/accounts/{id} [put]
func UpdateAccount(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	id := c.Params("id")

	var data map[string]interface{}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลไม่ถูกต้อง"})
	}

	// เพิ่ม: ถ้ามีการส่งรูปภาพมาใหม่ในตอน Update ให้ส่งขึ้น Cloudinary
	imageURL, err := uploadToCloudinary(c)
	if err == nil && imageURL != "" {
		data["image_url"] = imageURL
	}

	result := common.DB.Model(&models.Account{}).
		Where("id = ? AND user_id = ?", id, uID).
		Updates(data)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถอัปเดตข้อมูลบัญชีได้"})
	}

	return c.JSON(fiber.Map{"message": "อัปเดตข้อมูลเรียบร้อยแล้ว"})
}
