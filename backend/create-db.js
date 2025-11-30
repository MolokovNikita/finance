// Скрипт для создания базы данных через Node.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbName = process.env.DB_NAME || 'finance_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;

// Подключаемся к системной базе данных postgres для создания новой БД
const sequelize = new Sequelize('postgres', dbUser, dbPassword || null, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false
});

async function createDatabase() {
  try {
    console.log('Подключение к PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Подключение успешно!');
    
    console.log(`Создание базы данных "${dbName}"...`);
    
    // Проверяем, существует ли база данных
    const [results] = await sequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${dbName}'`
    );
    
    if (results.length > 0) {
      console.log(`⚠️  База данных "${dbName}" уже существует`);
    } else {
      await sequelize.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ База данных "${dbName}" успешно создана!`);
    }
    
    await sequelize.close();
    
    console.log('\n📝 Следующий шаг:');
    console.log(`   Запустите: psql -U ${dbUser} -d ${dbName} -f database/init.sql`);
    console.log('   Или используйте: node init-db.js (если будет создан)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:');
    console.error(error.message);
    
    if (error.original) {
      console.error('\nДетали:', error.original.message);
    }
    
    console.error('\n💡 Попробуйте:');
    console.error('1. Проверить, что PostgreSQL запущен');
    console.error('2. Проверить учетные данные в .env');
    console.error('3. Создать БД вручную: createdb finance_db');
    
    process.exit(1);
  }
}

createDatabase();

