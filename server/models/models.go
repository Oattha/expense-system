package models

import "time"

type User struct {
	ID                    uint      `gorm:"primaryKey" json:"id"`
	Username              string    `gorm:"unique;not null" json:"username"`
	Password              string    `json:"-"`
	FullName              string    `json:"full_name"`
	Email                 string    `json:"email"`
	LastFullNameUpdate    time.Time `json:"last_full_name_update"`
	DefaultAccountID      uint      `json:"default_account_id"`
	MonthlyBudget         float64   `json:"monthly_budget"`
	BudgetUpdateCount     int       `json:"budget_update_count"`
	LastBudgetUpdateMonth int       `json:"last_budget_update_month"`
	ProfileImage          string    `json:"profile_image"` // ฟิลด์นี้จะเก็บ URL จาก Cloudinary
	AvatarFrame           string    `json:"avatar_frame"`

	AvatarUpdateCount     int       `json:"avatar_update_count"`      // นับจำนวนครั้งที่เปลี่ยนรูป
	LastAvatarUpdateMonth int       `json:"last_avatar_update_month"` // เก็บเดือนที่เปลี่ยนรูปล่าสุด
	LastAvatarUpdateYear  int       `json:"last_avatar_update_year"`  // เก็บปีที่เปลี่ยนรูปล่าสุด
}

type UpdateDefaultReq struct {
	AccountID uint `json:"account_id"`
}

type Account struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	UserID   uint    `json:"user_id"`
	Name     string  `json:"name"`
	Type     string  `json:"type"`
	Balance  float64 `json:"balance"`
	IsActive bool    `gorm:"default:true" json:"is_active"`
	ImageURL string  `json:"image_url"` // เพิ่มฟิลด์นี้เพื่อแก้ Error ใน account.go
}

type Transaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	AccountID uint      `json:"account_id"`
	UserID    uint      `json:"user_id"`
	Amount    float64   `json:"amount"`
	Type      string    `json:"type"`
	Category  string    `json:"category"`
	Note      string    `json:"note"`
	Image     string    `json:"image"` // ฟิลด์นี้จะเก็บ URL รูปสลิปจาก Cloudinary
	Date      time.Time `json:"date"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"-"`
}

type Category struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	UserID  uint   `json:"user_id"`
	Name    string `json:"name"`
	Type    string `json:"type"`
	IconURL string `json:"icon_url"` // เพิ่มฟิลด์นี้เพื่อให้รองรับรูปไอคอนจาก Cloudinary
}

type AvatarFrame struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	Price     int    `json:"price"`
	CssClass  string `json:"css_class"`
	IconType  string `json:"icon_type"`
	IsPremium bool   `json:"is_premium"`
	CreatedBy uint   `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	Creator   User   `gorm:"foreignKey:CreatedBy" json:"creator"`
}
