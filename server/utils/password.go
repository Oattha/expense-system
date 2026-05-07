package utils
import "golang.org/x/crypto/bcrypt"

func HashPassword(p string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(p), 14)
	return string(b), err
}

func CheckPasswordHash(p, h string) bool {
	return bcrypt.CompareHashAndPassword([]byte(h), []byte(p)) == nil
}