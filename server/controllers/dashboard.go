package controllers

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/Oattha/expense-app/common"
	"github.com/Oattha/expense-app/models"
	"github.com/gofiber/fiber/v2"
)

// @Summary Get income and expense summary
// @Tags Dashboard
// @Security ApiKeyAuth
// @Produce json
// @Success 200 {object} map[string]float64
// @Router /api/summary [get]
func GetSummary(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	
	// รับค่าจาก Query Parameter
	year := c.Query("year", fmt.Sprintf("%d", time.Now().Year()))
	month := c.Query("month")
	period := c.Query("period") // ระบุว่าเป็นรายวัน/เดือน/ปี
	
	// ปรับ key ของ Redis ให้ครอบคลุม Filter เพื่อป้องกันข้อมูลปนกัน
	key := fmt.Sprintf("summary:%d:%s:%s:%s", uID, year, month, period)

	// เช็ค Cache ใน Redis
	val, err := common.Rdb.Get(common.Ctx, key).Result()
	if err == nil {
		return c.SendString(val)
	}

	var summary struct {
		Income  float64 `json:"income"`
		Expense float64 `json:"expense"`
		Balance float64 `json:"balance"`
	}

	// สร้าง Base Query สำหรับรายรับและรายจ่าย โดยล็อกปีไว้เป็นพื้นฐาน
	queryIncome := common.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND EXTRACT(YEAR FROM date) = ?", uID, "income", year)
	
	queryExpense := common.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND type = ? AND EXTRACT(YEAR FROM date) = ?", uID, "expense", year)

	// Logic การกรองเพิ่มเติม
	if period == "day" {
		// ถ้าเลือกเป็นรายวัน ให้กรองเฉพาะวันนี้จริงๆ
		queryIncome = queryIncome.Where("DATE(date) = CURRENT_DATE")
		queryExpense = queryExpense.Where("DATE(date) = CURRENT_DATE")
	} else if month != "" {
		// ถ้าเลือกเป็นเดือนใดเดือนหนึ่ง (month ไม่ว่าง) ให้กรองตามเดือนนั้น
		queryIncome = queryIncome.Where("EXTRACT(MONTH FROM date) = ?", month)
		queryExpense = queryExpense.Where("EXTRACT(MONTH FROM date) = ?", month)
	}
	// หมายเหตุ: ถ้าเลือก "ทั้งปี" หน้าบ้านจะส่ง month="" และระบบจะใช้เงื่อนไข YEAR จาก Base Query อัตโนมัติ

	// 1. คำนวณรายรับรวม
	queryIncome.Select("COALESCE(SUM(amount), 0)").Scan(&summary.Income)

	// 2. คำนวณรายจ่ายรวม
	queryExpense.Select("COALESCE(SUM(amount), 0)").Scan(&summary.Expense)

	// 3. ดึงยอดเงินคงเหลือรวมจากทุกบัญชี (ยอดปัจจุบันสุทธิ)
	common.DB.Model(&models.Account{}).
		Where("user_id = ?", uID).
		Select("COALESCE(SUM(balance), 0)").
		Scan(&summary.Balance)

	// เก็บค่าลง Redis 5 นาที
	res, _ := json.Marshal(summary)
	common.Rdb.Set(common.Ctx, key, res, 5*time.Minute)

	return c.JSON(summary)
}