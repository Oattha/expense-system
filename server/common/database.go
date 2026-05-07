package common

import (
	"fmt"
	"log"
	"os"

	"github.com/Oattha/expense-app/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASS"), os.Getenv("DB_NAME"), os.Getenv("DB_PORT"))
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	db.AutoMigrate(
		&models.User{}, 
		&models.Account{}, 
		&models.Transaction{}, 
		&models.Category{}, 
		&models.AvatarFrame{},
	)
	
	DB = db
	fmt.Println("Database & Migration: Ready")
}