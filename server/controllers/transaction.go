package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/Oattha/expense-app/common"
	"github.com/Oattha/expense-app/models"
	"github.com/cloudinary/cloudinary-go/v2"              // สำหรับ Cloudinary
	"github.com/cloudinary/cloudinary-go/v2/api/uploader" // สำหรับ Cloudinary
	"github.com/gofiber/fiber/v2"
)

// Helper สำหรับอัปโหลดรูปภาพหลักฐานการโอนไป Cloudinary
func uploadTransactionImageToCloud(c *fiber.Ctx) (string, error) {
	file, err := c.FormFile("image") // รับไฟล์จาก Form Data ชื่อ image
	if err != nil {
		return "", nil // ถ้าไม่มีการส่งรูปมา ให้ข้ามไป
	}

	f, err := file.Open() // เปิดไฟล์เตรียมอัปโหลด
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

	// อัปโหลดไฟล์ไปที่โฟลเดอร์ transactions
	resp, err := cld.Upload.Upload(ctx, f, uploader.UploadParams{
		Folder: "expense_app/transactions", // แยกโฟลเดอร์หลักฐานการทำรายการ
	})
	if err != nil {
		return "", err
	}

	return resp.SecureURL, nil // คืนค่า URL ที่เป็น https
}

// CreateTransaction สร้างรายการใหม่
func CreateTransaction(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)

	// 1. รับค่าจาก FormValue
	amount, _ := strconv.ParseFloat(c.FormValue("amount"), 64)
	tType := c.FormValue("type")
	category := c.FormValue("category")
	note := c.FormValue("note")
	accID, _ := strconv.ParseUint(c.FormValue("account_id"), 10, 32)

	// รับค่าวันที่
	dateStr := c.FormValue("date")
	parsedDate, err := time.Parse(time.RFC3339, dateStr)
	if err != nil {
		// ถ้าส่งวันที่มาผิดรูปแบบ ให้ใช้เวลาปัจจุบันแทน
		parsedDate = time.Now()
	}

	// 2. จัดการไฟล์รูปภาพผ่าน Cloudinary
	imageURL, err := uploadTransactionImageToCloud(c)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to upload image to cloud"})
	}

	t := models.Transaction{
		UserID:    uID,
		Amount:    amount,
		Type:      tType,
		Category:  category,
		Note:      note,
		AccountID: uint(accID),
		Date:      parsedDate,
		Image:     imageURL, // เก็บ URL จาก Cloudinary ลงในฟิลด์ Image
	}

	// 3. เริ่ม Transaction
	tx := common.DB.Begin()
	if err := tx.Create(&t).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Could not create transaction"})
	}

	var acc models.Account
	if err := tx.First(&acc, t.AccountID).Error; err != nil {
		tx.Rollback()
		return c.Status(404).JSON(fiber.Map{"error": "Account not found"})
	}

	if t.Type == "expense" {
		acc.Balance -= t.Amount
	} else {
		acc.Balance += t.Amount
	}

	if err := tx.Save(&acc).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{"error": "Could not update account balance"})
	}

	tx.Commit()

	// --- แก้ไขส่วนการล้าง Cache ให้ครอบคลุมทุกเงื่อนไข ---
	// 1. ล้าง Cache ส่วน Summary (Dashboard)
	summaryPattern := fmt.Sprintf("summary:%d*", uID)
	iter1 := common.Rdb.Scan(common.Ctx, 0, summaryPattern, 0).Iterator()
	for iter1.Next(common.Ctx) {
		common.Rdb.Del(common.Ctx, iter1.Val())
	}

	// 2. ล้าง Cache ส่วน Report Categories
	reportPattern := fmt.Sprintf("report:categories:%d*", uID)
	iter2 := common.Rdb.Scan(common.Ctx, 0, reportPattern, 0).Iterator()
	for iter2.Next(common.Ctx) {
		common.Rdb.Del(common.Ctx, iter2.Val())
	}
	// ----------------------------------------------

	return c.JSON(t)
}

// GetTransactions ดึงประวัติรายการ
func GetTransactions(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	var ts []models.Transaction
	common.DB.Where("user_id = ?", uID).Order("date desc, created_at desc").Find(&ts)
	return c.JSON(ts)
}

type MonthlyStat struct {
	Month   string  `json:"month"`
	Savings float64 `json:"savings"`
}

// GetAnnualStats ดึงสถิติเงินเก็บรายเดือนในปีที่เลือก
func GetAnnualStats(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)

	year := c.Query("year", fmt.Sprintf("%d", time.Now().Year()))

	var stats []MonthlyStat

	query := `
	SELECT 
		TO_CHAR(date, 'MM') as month_num, 
		SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as savings
	FROM transactions
	WHERE user_id = ? 
	  AND EXTRACT(YEAR FROM date) = ?
	GROUP BY month_num
	ORDER BY month_num ASC
	`

	rows, err := common.DB.Raw(query, uID, year).Rows()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถดึงข้อมูลสถิติได้"})
	}
	defer rows.Close()

	monthNames := map[string]string{
		"01": "ม.ค.", "02": "ก.พ.", "03": "มี.ค.", "04": "เม.ย.",
		"05": "พ.ค.", "06": "มิ.ย.", "07": "ก.ค.", "08": "ส.ค.",
		"09": "ก.ย.", "10": "ต.ค.", "11": "พ.ย.", "12": "ธ.ค.",
	}

	for rows.Next() {
		var mNum string
		var savings float64
		rows.Scan(&mNum, &savings)
		stats = append(stats, MonthlyStat{
			Month:   monthNames[mNum],
			Savings: savings,
		})
	}

	return c.JSON(stats)
}

type CategoryReport struct {
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
}

// GetCategoryReport ดึงรายงานสรุปตามหมวดหมู่
func GetCategoryReport(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	tType := c.Query("type", "expense")
	period := c.Query("period", "month")

	year := c.Query("year", fmt.Sprintf("%d", time.Now().Year()))
	month := c.Query("month")

	cacheKey := fmt.Sprintf("report:categories:%d:%s:%s:%s:%s", uID, tType, period, year, month)

	val, err := common.Rdb.Get(common.Ctx, cacheKey).Result()
	if err == nil {
		return c.SendString(val)
	}

	var report []struct {
		Category string  `json:"category"`
		Amount   float64 `json:"amount"`
	}

	dbQuery := common.DB.Model(&models.Transaction{}).
		Select("category, SUM(amount) as amount").
		Where("user_id = ? AND type = ?", uID, tType).
		Group("category").
		Order("amount DESC")

	switch period {
	case "day":
		dbQuery = dbQuery.Where("DATE(date) = CURRENT_DATE")
	case "month":
		if month != "" {
			dbQuery = dbQuery.Where("EXTRACT(YEAR FROM date) = ? AND EXTRACT(MONTH FROM date) = ?", year, month)
		} else {
			dbQuery = dbQuery.Where("EXTRACT(YEAR FROM date) = ?", year)
		}
	case "year":
		dbQuery = dbQuery.Where("EXTRACT(YEAR FROM date) = ?", year)
	}

	if err := dbQuery.Scan(&report).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Cannot fetch report data"})
	}

	if report == nil {
		report = make([]struct {
			Category string  `json:"category"`
			Amount   float64 `json:"amount"`
		}, 0)
	}

	res, _ := json.Marshal(report)
	common.Rdb.Set(common.Ctx, cacheKey, res, 5*time.Minute)

	return c.JSON(report)
}