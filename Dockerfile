# Stage 1: Build
FROM golang:1.23.4-alpine3.21 AS builder
WORKDIR /app

# ติดตั้งแพ็กเกจที่จำเป็นสำหรับการบิลด์
RUN apk add --no-cache ca-certificates tzdata

# แก้ไขจุดเสี่ยง: ใช้ wildcard เพื่อไม่ให้พังถ้าไม่มี go.sum
COPY go.mod go.sum* ./
RUN go mod download

COPY . .

# Compile แบบ Static และจัดการเรื่องสิทธิ์ไฟล์ให้เสร็จในขั้นตอนนี้
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o main . && \
    chmod +x main

# Stage 2: Run (distroless)
FROM gcr.io/distroless/base-debian12:nonroot
WORKDIR /app

# ก๊อปไฟล์ที่จำเป็น (เน้นเรื่อง Timezone และ SSL สำหรับยิง API ข้างนอก)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder --chown=nonroot:nonroot /app/main .

# บังคับใช้พอร์ต 5000 ตามที่คุยกันไว้
EXPOSE 5000

USER nonroot:nonroot
ENTRYPOINT ["./main"]