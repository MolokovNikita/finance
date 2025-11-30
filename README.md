# Приложение для учета личных финансов

Веб-приложение для учета личных финансов с полным функционалом управления счетами, транзакциями, бюджетами и финансовыми целями.

## Технологический стек

### Backend
- Node.js + Express.js
- PostgreSQL
- Sequelize ORM
- JWT аутентификация
- bcrypt для хеширования паролей
- Joi для валидации
- Winston для логирования
- Swagger для документации API

### Frontend
- React.js
- Redux Toolkit
- React Router
- Material-UI
- Axios
- Recharts для графиков
- Vite

## Установка и запуск

### Требования
- Node.js (v18+)
- PostgreSQL (v12+)

### Backend

1. Перейдите в директорию backend:
```bash
cd backend
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Настройте переменные окружения в `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
```

5. Создайте базу данных:
```bash
createdb finance_db
```

6. Инициализируйте базу данных:
```bash
psql -U postgres -d finance_db -f database/init.sql
```

7. Запустите сервер:
```bash
npm run dev
```

Backend будет доступен на `http://localhost:3000`
API документация (Swagger): `http://localhost:3000/api-docs`

### Frontend

1. Перейдите в директорию frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите dev сервер:
```bash
npm run dev
```

Frontend будет доступен на `http://localhost:3001`

## Структура проекта

```
finance/
├── backend/
│   ├── config/          # Конфигурация (БД, логгер)
│   ├── database/        # SQL скрипты
│   ├── middleware/      # Middleware (auth, validation)
│   ├── models/          # Sequelize модели
│   ├── routes/          # API routes
│   ├── utils/           # Утилиты (JWT, password)
│   └── server.js        # Точка входа
├── frontend/
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── pages/       # Страницы
│   │   ├── store/       # Redux store и slices
│   │   ├── services/    # API сервисы
│   │   └── App.jsx      # Главный компонент
│   └── package.json
└── README.md
```

## Основные функции

- ✅ Регистрация и аутентификация пользователей
- ✅ Управление счетами (создание, редактирование, удаление)
- ✅ Управление транзакциями (доходы, расходы, переводы)
- ✅ Управление категориями (иерархические категории)
- ✅ Управление бюджетами
- ✅ Управление финансовыми целями
- ✅ Теги для транзакций
- ✅ Получатели платежей
- ✅ Способы оплаты
- ✅ Регулярные транзакции
- ✅ Статистика и отчеты
- ✅ Уведомления
- ✅ Настройки пользователя

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Счета
- `GET /api/accounts` - Список счетов
- `POST /api/accounts` - Создать счет
- `GET /api/accounts/:id` - Получить счет
- `PUT /api/accounts/:id` - Обновить счет
- `DELETE /api/accounts/:id` - Удалить счет

### Транзакции
- `GET /api/transactions` - Список транзакций (с фильтрами и пагинацией)
- `POST /api/transactions` - Создать транзакцию
- `GET /api/transactions/:id` - Получить транзакцию
- `PUT /api/transactions/:id` - Обновить транзакцию
- `DELETE /api/transactions/:id` - Удалить транзакцию

И другие endpoints для категорий, бюджетов, целей и т.д.

Полная документация API доступна в Swagger UI: `http://localhost:3000/api-docs`

## Лицензия

ISC

# finance
