package controllers

import (
	"fmt"
	"os"
	"time"

	"github.com/Oattha/expense-app/common"
	"github.com/Oattha/expense-app/models"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gofiber/fiber/v2"
)

// UpdateBudget อัปเดตงบประมาณรายเดือน
func UpdateBudget(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	var data struct {
		Budget float64 `json:"budget"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลไม่ถูกต้อง"})
	}

	var user models.User
	if err := common.DB.First(&user, uID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบข้อมูลผู้ใช้งาน"})
	}

	// 1. ตรวจสอบเดือนปัจจุบัน
	currentMonth := int(time.Now().Month())

	// 2. ถ้าเป็นเดือนใหม่ ให้รีเซ็ตตัวนับเป็น 0
	if user.LastBudgetUpdateMonth != currentMonth {
		user.BudgetUpdateCount = 0
		user.LastBudgetUpdateMonth = currentMonth
	}

	// 3. ตรวจสอบว่าแก้ไปครบ 2 ครั้งหรือยัง
	if user.BudgetUpdateCount >= 2 {
		return c.Status(403).JSON(fiber.Map{
			"error": "คุณแก้ไขงบประมาณครบ 2 ครั้งในเดือนนี้แล้ว เพื่อวินัยการเงินที่ดี โปรดรอเดือนถัดไปครับ",
		})
	}

	// 4. บันทึกข้อมูลและเพิ่มจำนวนครั้ง
	user.MonthlyBudget = data.Budget
	user.BudgetUpdateCount += 1

	if err := common.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถบันทึกข้อมูลได้"})
	}

	return c.JSON(fiber.Map{
		"message": "บันทึกเป้าหมายสำเร็จ",
		"count":   user.BudgetUpdateCount, // ส่งจำนวนครั้งกลับไปให้หน้าบ้านอัปเดต UI
	})
}

// UpdateProfile อัปเดตรูปโปรไฟล์ ชื่อ และกรอบ
func UpdateProfile(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)

	var user models.User
	if err := common.DB.First(&user, uID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบผู้ใช้"})
	}

	// 1. จัดการการเปลี่ยนชื่อ (เปลี่ยนได้เดือนละครั้ง)
	newName := c.FormValue("full_name")
	if newName != "" && newName != user.FullName {
		oneMonthAgo := time.Now().AddDate(0, -1, 0)
		if user.LastFullNameUpdate.After(oneMonthAgo) {
			return c.Status(403).JSON(fiber.Map{
				"error": "พี่เปลี่ยนชื่อได้เดือนละครั้งเท่านั้นครับ โปรดรอเดือนถัดไปนะพี่ชาย",
			})
		}
		user.FullName = newName
		user.LastFullNameUpdate = time.Now()
	}

	// 2. รับค่ากรอบ
	frame := c.FormValue("avatar_frame")
	if frame != "" {
		user.AvatarFrame = frame
	}

	// 3. จัดการไฟล์รูปโปรไฟล์ (อัปโหลดขึ้น Cloudinary พร้อมจำกัดจำนวนครั้ง)
	file, err := c.FormFile("profile_image")
	if err == nil {
		// --- ส่วนที่เพิ่มใหม่: ตรวจสอบโควตาการเปลี่ยนรูป 3 ครั้งต่อเดือน ---
		currentMonth := int(time.Now().Month())
		currentYear := time.Now().Year()

		// รีเซ็ตตัวนับถ้าข้ามเดือนหรือข้ามปี
		if user.LastAvatarUpdateMonth != currentMonth || user.LastAvatarUpdateYear != currentYear {
			user.AvatarUpdateCount = 0
			user.LastAvatarUpdateMonth = currentMonth
			user.LastAvatarUpdateYear = currentYear
		}

		// ตรวจสอบว่าเกิน 3 ครั้งหรือยัง
		if user.AvatarUpdateCount >= 3 {
			return c.Status(403).JSON(fiber.Map{
				"error": "พี่เปลี่ยนรูปโปรไฟล์ครบ 3 ครั้งในเดือนนี้แล้วครับ โปรดรอเดือนถัดไปนะพี่ชาย",
			})
		}

		// เปิดไฟล์ที่รับมา
		f, errOpen := file.Open()
		if errOpen == nil {
			defer f.Close()

			// เชื่อมต่อ Cloudinary
			cld, errCld := cloudinary.NewFromURL(os.Getenv("CLOUDINARY_URL"))
			if errCld == nil {
				// อัปโหลดขึ้น Cloudinary
				uploadResult, errUpload := cld.Upload.Upload(c.Context(), f, uploader.UploadParams{
					Folder: "profile_images",
				})
				if errUpload == nil {
					// บันทึก URL และเพิ่มตัวนับจำนวนครั้งเมื่ออัปโหลดสำเร็จ
					user.ProfileImage = uploadResult.SecureURL
					user.AvatarUpdateCount += 1
				}
			}
		}
	}

	// 4. บันทึกข้อมูลลง Database
	if err := common.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Database บันทึกข้อมูลไม่สำเร็จ"})
	}

	// ล้าง Cache ใน Redis
	common.Rdb.Del(common.Ctx, fmt.Sprintf("profile:%d", uID))

	return c.JSON(fiber.Map{
		"message":       "อัปเดตโปรไฟล์สำเร็จ",
		"full_name":     user.FullName,
		"profile_image": user.ProfileImage,
		"avatar_frame":  user.AvatarFrame,
	})
}

// GetAvatarFrames ดึงรายการกรอบโปรไฟล์ทั้งหมด
func GetAvatarFrames(c *fiber.Ctx) error {
	var frames []models.AvatarFrame
	if err := common.DB.Preload("Creator").Order("id asc").Find(&frames).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถดึงข้อมูลได้"})
	}
	return c.JSON(frames)
}

// CreateAvatarFrame สำหรับแอดมินใช้เพิ่มกรอบใหม่
// CreateAvatarFrame สำหรับแอดมินใช้เพิ่มกรอบใหม่ (จำกัด 3 กรอบต่อเดือน)
func CreateAvatarFrame(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	var frame models.AvatarFrame

	if err := c.BodyParser(&frame); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลไม่ถูกต้อง"})
	}

	// --- ส่วนที่แก้ไข: ตรวจสอบจำนวนการสร้างกรอบในเดือนปัจจุบัน ---
	var count int64
	now := time.Now()
	// เริ่มต้นของเดือนปัจจุบัน
	firstDayOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	// สิ้นสุดของเดือนปัจจุบัน
	lastDayOfMonth := firstDayOfMonth.AddDate(0, 1, 0).Add(-time.Nanosecond)

	// นับจำนวนกรอบที่ user_id นี้สร้างขึ้น เฉพาะในช่วงวันที่ของเดือนปัจจุบัน [cite: 10]
	common.DB.Model(&models.AvatarFrame{}).
		Where("created_by = ? AND created_at BETWEEN ? AND ?", uID, firstDayOfMonth, lastDayOfMonth).
		Count(&count)

	if count >= 3 {
		return c.Status(403).JSON(fiber.Map{
			"error": fmt.Sprintf("พี่เพิ่มกรอบครบ 3 อันของเดือน %s แล้วครับ แบ่งให้คนอื่นสร้างบ้างนะ!", now.Month().String()),
		})
	}
	// ------------------------------------------------------

	// 2. บันทึกข้อมูลพร้อมระบุเจ้าของ
	frame.CreatedBy = uID
	if err := common.DB.Create(&frame).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถเพิ่มกรอบได้"})
	}

	return c.Status(201).JSON(frame)
}

// UpdateCycleDate อัปเดตวันที่ตัดรอบบิล (1-28 หรือ 31 สำหรับวันสิ้นเดือน)
func UpdateCycleDate(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	var data struct {
		CycleDate int `json:"cycle_date"`
	}
	if err := c.BodyParser(&data); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "ข้อมูลไม่ถูกต้อง"})
	}

	// บังคับรับแค่ 1-28 หรือ 31
	if (data.CycleDate < 1 || data.CycleDate > 28) && data.CycleDate != 31 {
		return c.Status(400).JSON(fiber.Map{"error": "กรุณาเลือกวันที่ 1-28 หรือ 31 (วันสิ้นเดือน)"})
	}

	var user models.User
	if err := common.DB.First(&user, uID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบข้อมูลผู้ใช้งาน"})
	}

	currentMonth := int(time.Now().Month())

	// รีเซ็ตโควต้าถ้าขึ้นเดือนใหม่
	if user.LastCycleUpdateMonth != currentMonth {
		user.CycleUpdateCount = 0
		user.LastCycleUpdateMonth = currentMonth
	}

	// เช็คโควต้า 2 ครั้ง
	if user.CycleUpdateCount >= 2 {
		return c.Status(403).JSON(fiber.Map{
			"error": "คุณแก้ไขวันตัดรอบครบ 2 ครั้งในเดือนนี้แล้ว โปรดรอเดือนถัดไปครับ",
		})
	}

	user.CycleDate = data.CycleDate
	user.CycleUpdateCount += 1

	if err := common.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถบันทึกข้อมูลได้"})
	}

	// ล้างแคช Summary ใน Redis เพราะวันตัดรอบเปลี่ยน ยอดรวมต้องคำนวณใหม่
	keys, _ := common.Rdb.Keys(common.Ctx, fmt.Sprintf("summary:%d:*", uID)).Result()
	for _, key := range keys {
		common.Rdb.Del(common.Ctx, key)
	}

	return c.JSON(fiber.Map{
		"message": "บันทึกวันตัดรอบสำเร็จ",
		"count":   user.CycleUpdateCount,
		"cycle_date": user.CycleDate,
	})
}