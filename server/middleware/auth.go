package middleware
import (
	"os"
	"strings"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func Protected() fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" { return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"}) }
		tokenString := strings.Replace(auth, "Bearer ", "", 1)
		token, _ := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil
		})
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			c.Locals("user_id", uint(claims["user_id"].(float64)))
			return c.Next()
		}
		return c.Status(401).JSON(fiber.Map{"error": "Invalid Token"})
	}
}