// Скрипт для проверки подключения к базе данных
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'finance_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || null,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  }
);

async function checkConnection() {
  try {
    console.log('Попытка подключения к базе данных...');
    const password = process.env.DB_PASSWORD;
    console.log('Параметры:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: password ? '***' : '(не указан)'
    });
    
    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных успешно!');
    
    // Проверяем существование базы данных
    const [results] = await sequelize.query("SELECT current_database()");
    console.log('✅ Текущая база данных:', results[0].current_database);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:');
    console.error(error.message);
    
    if (error.original) {
      console.error('\nДетали ошибки:');
      console.error('Код:', error.original.code);
      console.error('Сообщение:', error.original.message);
    }
    
    console.error('\nВозможные решения:');
    console.error('1. Убедитесь, что PostgreSQL запущен');
    console.error('2. Проверьте учетные данные в .env файле');
    console.error('3. Создайте базу данных: createdb finance_db');
    console.error('4. На macOS с Homebrew попробуйте DB_USER=ваш_username, DB_PASSWORD=');
    
    process.exit(1);
  }
}

checkConnection();

