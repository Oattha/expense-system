# Stage 1: Build (ระบุเวอร์ชันแบบเจาะจงเพื่อเลี่ยงช่องโหว่)
FROM golang:1.23.4-alpine3.21 AS builder
WORKDIR /app

# อัปเดตแพ็กเกจภายใน builder ให้ใหม่ล่าสุด
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download && go mod tidy
COPY . .
# Compile แบบ Static เพื่อรันบน distroless
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main .

# Stage 2: Run (ใช้ distroless เพื่อความปลอดภัยสูงสุด)
FROM gcr.io/distroless/base-debian12:nonroot
WORKDIR /app

# ก๊อปไฟล์ที่จำเป็นมาจาก stage แรก
COPY --from=builder --chown=nonroot:nonroot /app/main .
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

EXPOSE 5000
CMD ["./main"]