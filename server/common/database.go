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
    // ดึงค่า sslmode จาก .env ถ้าไม่มีให้ใช้ disable เป็นค่าเริ่มต้นกันพัง
    sslMode := os.Getenv("DB_SSLMODE")
    if sslMode == "" {
        sslMode = "disable" 
    }

    // --- แก้ไขจุดนี้: เอา sslMode มาใส่เป็นตัวแปรแบบไดนามิก ---
    dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
        os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASS"), os.Getenv("DB_NAME"), os.Getenv("DB_PORT"), sslMode)
    
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