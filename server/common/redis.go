package common
import (
	"context"
	"os"
	"github.com/redis/go-redis/v9"
)

var Rdb *redis.Client
var Ctx = context.Background()

func ConnectRedis() {
	Rdb = redis.NewClient(&redis.Options{
		Addr: os.Getenv("REDIS_URL"),
		DB:   0,
	})
}