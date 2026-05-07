package routes

import (
    "github.com/Oattha/expense-app/controllers"
    "github.com/Oattha/expense-app/middleware"
    "github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
    api := app.Group("/api")
    api.Post("/register", controllers.Register)
    api.Post("/login", controllers.Login)

    api.Get("/frames", controllers.GetAvatarFrames)

    // กลุ่มที่ต้องใช้ Token (Middleware Protected)
    p := api.Group("/", middleware.Protected())
    p.Post("/accounts", controllers.CreateAccount)
    p.Get("/accounts", controllers.GetAccounts)
    p.Post("/transactions", controllers.CreateTransaction)
	p.Get("/transactions", controllers.GetTransactions)
    p.Get("/summary", controllers.GetSummary)
	p.Put("/accounts/default", controllers.UpdateDefaultAccount)
	p.Put("/accounts/:id", controllers.UpdateAccount)
    
    p.Get("/profile", controllers.GetProfile) 
	p.Put("/user/budget", controllers.UpdateBudget)
    // ในกลุ่ม Protected (p)
    p.Get("/stats/annual", controllers.GetAnnualStats)

    p.Get("/categories", controllers.GetCategories)
    p.Post("/categories", controllers.CreateCategory)
    p.Get("/report/categories", controllers.GetCategoryReport)

    p.Put("/profile", controllers.UpdateProfile)

    p.Post("/admin/frames", controllers.CreateAvatarFrame)
    
}