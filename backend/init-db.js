// Скрипт для инициализации схемы базы данных
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const dbName = process.env.DB_NAME || 'finance_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(dbName, dbUser, dbPassword || null, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  logging: false
});

async function initDatabase() {
  try {
    console.log('Подключение к базе данных...');
    await sequelize.authenticate();
    console.log('✅ Подключение успешно!');
    
    const sqlFile = path.join(__dirname, 'database', 'init.sql');
    
    if (!fs.existsSync(sqlFile)) {
      console.error(`❌ Файл ${sqlFile} не найден!`);
      process.exit(1);
    }
    
    console.log('Чтение SQL файла...');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Выполнение SQL скрипта...');
    // Разбиваем на отдельные команды (упрощенная версия)
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));
    
    // Выполняем команды по частям
    for (const command of commands) {
      if (command.length > 10) { // Пропускаем очень короткие команды
        try {
          await sequelize.query(command);
        } catch (err) {
          // Игнорируем ошибки типа "таблица уже существует"
          if (!err.message.includes('already exists') && 
              !err.message.includes('does not exist')) {
            console.warn('Предупреждение:', err.message);
          }
        }
      }
    }
    
    // Альтернативный способ - выполнить весь файл сразу
    console.log('Выполнение полного SQL скрипта...');
    await sequelize.query(sql);
    
    console.log('✅ Схема базы данных успешно инициализирована!');
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:');
    console.error(error.message);
    
    if (error.original) {
      console.error('Детали:', error.original.message);
    }
    
    // Если ошибка из-за того, что таблицы уже существуют - это нормально
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Некоторые объекты уже существуют. Это нормально.');
      console.log('✅ База данных готова к использованию!');
      process.exit(0);
    }
    
    process.exit(1);
  }
}

initDatabase();

