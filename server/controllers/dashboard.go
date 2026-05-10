package controllers

import (
	"encoding/json"
	"fmt"
	"strconv"
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
	
	year := c.Query("year", fmt.Sprintf("%d", time.Now().Year()))
	month := c.Query("month")
	period := c.Query("period") 
	
	// ดึงค่า CycleDate ของ User คนนี้มาก่อน
	var user models.User
	common.DB.Select("cycle_date").First(&user, uID)
	cycleDate := user.CycleDate
	if cycleDate == 0 { cycleDate = 1 } // กันเหนียว ค่าเริ่มต้นคือ 1

	key := fmt.Sprintf("summary:%d:%s:%s:%s:cycle:%d", uID, year, month, period, cycleDate)

	val, err := common.Rdb.Get(common.Ctx, key).Result()
	if err == nil {
		return c.SendString(val)
	}

	var summary struct {
		Income  float64 `json:"income"`
		Expense float64 `json:"expense"`
		Balance float64 `json:"balance"`
	}

	// --- แก้ไขใหญ่: ลบการบังคับล็อค EXTRACT(YEAR) ออก เพื่อให้ข้ามปีได้ เช่น 25 ธ.ค. - 24 ม.ค. ---
	queryIncome := common.DB.Model(&models.Transaction{}).Where("user_id = ? AND type = ?", uID, "income")
	queryExpense := common.DB.Model(&models.Transaction{}).Where("user_id = ? AND type = ?", uID, "expense")

	// Logic การคำนวณแกนเวลา
	if period == "day" {
		queryIncome = queryIncome.Where("DATE(date) = CURRENT_DATE")
		queryExpense = queryExpense.Where("DATE(date) = CURRENT_DATE")
	} else if month != "" {
		m, _ := strconv.Atoi(month)
		y, _ := strconv.Atoi(year)
		var startDate, endDate time.Time

		if cycleDate == 31 || cycleDate == 1 {
			// กรณี: ปฏิทินปกติ (วันที่ 1 ถึง วันสิ้นเดือน)
			startDate = time.Date(y, time.Month(m), 1, 0, 0, 0, 0, time.Local)
			endDate = startDate.AddDate(0, 1, 0).Add(-time.Nanosecond)
		} else {
			// กรณี: ตัดรอบวันอื่น (เช่น 25) -> ข้ามจากวันที่ 25 เดือนก่อน ถึง วันที่ 24 เดือนนี้
			startDate = time.Date(y, time.Month(m-1), cycleDate, 0, 0, 0, 0, time.Local)
			endDate = time.Date(y, time.Month(m), cycleDate, 0, 0, 0, 0, time.Local).Add(-time.Nanosecond)
		}

		queryIncome = queryIncome.Where("date BETWEEN ? AND ?", startDate, endDate)
		queryExpense = queryExpense.Where("date BETWEEN ? AND ?", startDate, endDate)
	} else {
		// กรณีดูสรุปทั้งปี 
		queryIncome = queryIncome.Where("EXTRACT(YEAR FROM date) = ?", year)
		queryExpense = queryExpense.Where("EXTRACT(YEAR FROM date) = ?", year)
	}

	queryIncome.Select("COALESCE(SUM(amount), 0)").Scan(&summary.Income)
	queryExpense.Select("COALESCE(SUM(amount), 0)").Scan(&summary.Expense)

	common.DB.Model(&models.Account{}).
		Where("user_id = ?", uID).
		Select("COALESCE(SUM(balance), 0)").
		Scan(&summary.Balance)

	res, _ := json.Marshal(summary)
	common.Rdb.Set(common.Ctx, key, res, 5*time.Minute)

	return c.JSON(summary)
}