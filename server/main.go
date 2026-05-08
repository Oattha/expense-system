package main

import (
	"os" // เพิ่มตัวนี้เข้ามาเพื่อดึงค่าจากระบบ

	"github.com/Oattha/expense-app/common"
	_ "github.com/Oattha/expense-app/docs"
	"github.com/Oattha/expense-app/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/swagger"
	"github.com/joho/godotenv"
)

func main() {
	// บนเครื่องตัวเองจะโหลดจาก .env แต่บน Railway จะข้ามไปเอง
	godotenv.Load()

	common.ConnectDatabase()
	// common.ConnectRedis()

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		// ถ้าดีพลอยหน้าบ้านแล้ว อย่าลืมเปลี่ยนจาก localhost เป็น URL จริงนะครับ[cite: 4]
		AllowOrigins: "https://expense-system-1-zp46.onrender.com",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE",
	}))

	app.Get("/expense/swagger-document/*", swagger.HandlerDefault)

	// ถ้าเปลี่ยนไปใช้ Cloudinary แล้ว บรรทัด Static นี้สามารถเอาออกได้เลย[cite: 4]
	// app.Static("/uploads", "./uploads")

	routes.Setup(app)

	// เปลี่ยนจากล็อคพอร์ต :3000 เป็นการดึงค่า PORT จาก Railway
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000" // ค่า default ถ้าไม่ได้ตั้งไว้
	}

	app.Listen(":" + port)
}
