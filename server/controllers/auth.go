package controllers

import (
	"os"
	"time"

	"github.com/Oattha/expense-app/common"
	"github.com/Oattha/expense-app/models"
	"github.com/Oattha/expense-app/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// Register ลงทะเบียนผู้ใช้ใหม่
// @Summary Register a new user
func Register(c *fiber.Ctx) error {
	var user models.User
	if err := c.BodyParser(&user); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	// เข้ารหัสรหัสผ่าน และรับค่า error เพื่อป้องกันปัญหา multiple-value
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถเข้ารหัสผ่านได้"})
	}
	user.Password = hashedPassword

	if err := common.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถสร้างบัญชีผู้ใช้ได้ อาจมีชื่อผู้ใช้นี้แล้ว"})
	}

	return c.Status(201).JSON(fiber.Map{"message": "Success"})
}

// Login เข้าสู่ระบบและรับ JWT Token
// @Summary Login and get JWT token
func Login(c *fiber.Ctx) error {
	var in, user models.User
	if err := c.BodyParser(&in); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	common.DB.Where("username = ?", in.Username).First(&user)
	if user.ID == 0 || !utils.CheckPasswordHash(in.Password, user.Password) {
		return c.Status(401).JSON(fiber.Map{"error": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	// แก้ไข: รับค่า 2 ตัวแปร (t และ err) เพื่อป้องกัน error multiple-value ใน JWT
	t, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "ไม่สามารถสร้าง Token ได้"})
	}

	return c.JSON(fiber.Map{"token": t})
}

// GetProfile ดึงข้อมูลโปรไฟล์ผู้ใช้
// @Summary Get user profile
func GetProfile(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	var user models.User

	if err := common.DB.First(&user, uID).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "ไม่พบผู้ใช้งาน"})
	}

	return c.JSON(fiber.Map{
		"id":                       user.ID,
		"username":                 user.Username,
		"full_name":                user.FullName,
		"email":                    user.Email,
		"monthly_budget":           user.MonthlyBudget,
		"default_account_id":       user.DefaultAccountID,
		"budget_update_count":      user.BudgetUpdateCount,
		"last_budget_update_month": user.LastBudgetUpdateMonth,
		"profile_image":            user.ProfileImage,
		"avatar_frame":             user.AvatarFrame,
		"avatar_update_count":      user.AvatarUpdateCount,
		"last_avatar_update_month": user.LastAvatarUpdateMonth,
		"last_avatar_update_year":  user.LastAvatarUpdateYear,
	})
}