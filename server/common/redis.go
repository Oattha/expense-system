package common

import (
    "context"
    "log"
    "os"

    "github.com/redis/go-redis/v9"
)

var Rdb *redis.Client
var Ctx = context.Background()

func ConnectRedis() {
    // 1. ดึงค่า REDIS_URL จาก Environment Variable
    redisURL := os.Getenv("REDIS_URL")
    
    // 2. ดักจับกรณีไม่มีค่า URL แอปจะได้ไม่ Panic ตอนรัน
    if redisURL == "" {
        log.Println("⚠️ REDIS_URL is not set in environment variables")
        return
    }

    // 3. ใช้ ParseURL เพื่อรองรับรูปแบบ rediss:// (SSL) ของ Upstash/Cloud
    opt, err := redis.ParseURL(redisURL)
    if err != nil {
        log.Fatalf("❌ Failed to parse REDIS_URL: %v", err)
    }

    // 4. สร้าง Client จาก Options ที่ Parse มาได้
    Rdb = redis.NewClient(opt)

    // 5. ลองเช็คการเชื่อมต่อจริง (Ping)
    if err := Rdb.Ping(Ctx).Err(); err != nil {
        log.Fatalf("❌ Could not connect to Redis: %v", err)
    }

    log.Println("✅ Redis Connected Successfully!")
}