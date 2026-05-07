package controllers

import (
	"github.com/Oattha/expense-app/common"
	"github.com/Oattha/expense-app/models"
	"github.com/gofiber/fiber/v2"
)

func GetCategories(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	var cats []models.Category
	common.DB.Where("user_id = ?", uID).Find(&cats)
	return c.JSON(cats)
}

func CreateCategory(c *fiber.Ctx) error {
	uID := c.Locals("user_id").(uint)
	var cat models.Category
	if err := c.BodyParser(&cat); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	cat.UserID = uID
	common.DB.Create(&cat)
	return c.JSON(cat)
}