#!/bin/bash

# Скрипт для создания .env файла

echo "Создание .env файла..."

cat > .env << 'EOF'
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
# ВАЖНО: Измените DB_USER и DB_PASSWORD на ваши реальные настройки PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_db
DB_USER=macbook
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-please
JWT_EXPIRE=7d

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=info
EOF

echo ".env файл создан!"
echo ""
echo "ВАЖНО: Проверьте и при необходимости измените:"
echo "  - DB_USER (текущее значение: macbook)"
echo "  - DB_PASSWORD (текущее значение: пусто)"
echo ""
echo "Если PostgreSQL установлен через Homebrew, попробуйте:"
echo "  DB_USER=macbook"
echo "  DB_PASSWORD="
echo ""
echo "Если используется стандартный postgres пользователь:"
echo "  DB_USER=postgres"
echo "  DB_PASSWORD=ваш_пароль"

