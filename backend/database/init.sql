-- ===============================================
-- База данных для приложения учета личных финансов
-- PostgreSQL
-- ===============================================

-- Удаление существующих таблиц (если нужно пересоздать)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS saved_reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS goal_contributions CASCADE;
DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TABLE IF EXISTS budget_accounts CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS recurring_transactions CASCADE;
DROP TABLE IF EXISTS transaction_tags CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS payees CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS category_types CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS currencies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===============================================
-- СОЗДАНИЕ ТАБЛИЦ
-- ===============================================

-- 1. Пользователи
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    default_currency_id INTEGER,
    timezone VARCHAR(50) DEFAULT 'UTC',
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Валюты
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    decimal_places SMALLINT DEFAULT 2,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Курсы обмена валют
CREATE TABLE exchange_rates (
    id SERIAL PRIMARY KEY,
    from_currency_id INTEGER NOT NULL REFERENCES currencies(id),
    to_currency_id INTEGER NOT NULL REFERENCES currencies(id),
    rate DECIMAL(18, 8) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_currency_id, to_currency_id, date)
);

-- 4. Счета пользователя
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    currency_id INTEGER NOT NULL REFERENCES currencies(id),
    initial_balance DECIMAL(15, 2) DEFAULT 0,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    color VARCHAR(7),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    is_included_in_total BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Типы категорий
CREATE TABLE category_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Категории
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    parent_category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    category_type_id INTEGER NOT NULL REFERENCES category_types(id),
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Теги
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- 8. Получатели платежей
CREATE TABLE payees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    default_category_id INTEGER REFERENCES categories(id),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Способы оплаты
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Регулярные транзакции
CREATE TABLE recurring_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    payee_id INTEGER REFERENCES payees(id) ON DELETE SET NULL,
    payment_method_id INTEGER REFERENCES payment_methods(id),
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency_id INTEGER NOT NULL REFERENCES currencies(id),
    description TEXT,
    frequency VARCHAR(50) NOT NULL,
    interval_value INTEGER DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE,
    next_due_date DATE NOT NULL,
    last_generated_date DATE,
    is_active BOOLEAN DEFAULT true,
    auto_create BOOLEAN DEFAULT false,
    remind_before_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Транзакции
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    payee_id INTEGER REFERENCES payees(id) ON DELETE SET NULL,
    payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency_id INTEGER NOT NULL REFERENCES currencies(id),
    exchange_rate DECIMAL(18, 8) DEFAULT 1,
    amount_in_account_currency DECIMAL(15, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_transaction_id INTEGER REFERENCES recurring_transactions(id),
    transfer_transaction_id INTEGER REFERENCES transactions(id),
    location VARCHAR(255),
    is_excluded_from_stats BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Связь транзакций с тегами
CREATE TABLE transaction_tags (
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (transaction_id, tag_id)
);

-- 13. Бюджеты
CREATE TABLE budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency_id INTEGER NOT NULL REFERENCES currencies(id),
    period_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    rollover_unused BOOLEAN DEFAULT false,
    alert_threshold DECIMAL(5, 2) DEFAULT 80.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Связь бюджетов со счетами
CREATE TABLE budget_accounts (
    budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (budget_id, account_id)
);

-- 15. Финансовые цели
CREATE TABLE financial_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) DEFAULT 0,
    currency_id INTEGER NOT NULL REFERENCES currencies(id),
    target_date DATE,
    priority INTEGER DEFAULT 0,
    is_achieved BOOLEAN DEFAULT false,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. История пополнения целей
CREATE TABLE goal_contributions (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER NOT NULL REFERENCES financial_goals(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    contribution_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Вложения
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Уведомления
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_entity_type VARCHAR(50),
    related_entity_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- 19. Сохраненные отчеты
CREATE TABLE saved_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    filters JSONB,
    chart_type VARCHAR(50),
    is_favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Настройки пользователя
CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language VARCHAR(10) DEFAULT 'ru',
    date_format VARCHAR(20) DEFAULT 'DD.MM.YYYY',
    start_of_week SMALLINT DEFAULT 1,
    start_of_month SMALLINT DEFAULT 1,
    notification_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT false,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. Журнал аудита
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===============================================
-- ИНДЕКСЫ
-- ===============================================

-- Транзакции
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);

-- Счета
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_currency_id ON accounts(currency_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);

-- Категории
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type_id ON categories(category_type_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_category_id);

-- Бюджеты
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_category_id ON budgets(category_id);
CREATE INDEX idx_budgets_dates ON budgets(start_date, end_date);
CREATE INDEX idx_budgets_active ON budgets(is_active) WHERE is_active = true;

-- Регулярные транзакции
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_next_due ON recurring_transactions(next_due_date) WHERE is_active = true;
CREATE INDEX idx_recurring_account_id ON recurring_transactions(account_id);

-- Финансовые цели
CREATE INDEX idx_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_goals_target_date ON financial_goals(target_date);
CREATE INDEX idx_goals_achieved ON financial_goals(is_achieved);

-- Курсы валют
CREATE INDEX idx_exchange_rates_date ON exchange_rates(date DESC);
CREATE INDEX idx_exchange_rates_currencies ON exchange_rates(from_currency_id, to_currency_id, date DESC);

-- Уведомления
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Получатели платежей
CREATE INDEX idx_payees_user_id ON payees(user_id);

-- Теги
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Вложения
CREATE INDEX idx_attachments_transaction_id ON attachments(transaction_id);
CREATE INDEX idx_attachments_user_id ON attachments(user_id);

-- Аудит
CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- ===============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ (SEED)
-- ===============================================

-- Валюты
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
('RUB', 'Российский рубль', '₽', 2),
('USD', 'Доллар США', '$', 2),
('EUR', 'Евро', '€', 2),
('GBP', 'Фунт стерлингов', '£', 2),
('CNY', 'Китайский юань', '¥', 2),
('JPY', 'Японская иена', '¥', 0),
('KZT', 'Казахстанский тенге', '₸', 2),
('BYN', 'Белорусский рубль', 'Br', 2);

-- Типы категорий
INSERT INTO category_types (name) VALUES
('income'),
('expense'),
('transfer');

-- Системные категории доходов
INSERT INTO categories (user_id, parent_category_id, category_type_id, name, icon, color, is_system, sort_order) VALUES
(NULL, NULL, 1, 'Зарплата', '💰', '#4CAF50', true, 1),
(NULL, NULL, 1, 'Бизнес', '💼', '#2196F3', true, 2),
(NULL, NULL, 1, 'Инвестиции', '📈', '#9C27B0', true, 3),
(NULL, NULL, 1, 'Подарки', '🎁', '#FF9800', true, 4),
(NULL, NULL, 1, 'Прочие доходы', '💵', '#607D8B', true, 5);

-- Системные категории расходов (родительские)
INSERT INTO categories (user_id, parent_category_id, category_type_id, name, icon, color, is_system, sort_order) VALUES
(NULL, NULL, 2, 'Продукты', '🛒', '#F44336', true, 10),
(NULL, NULL, 2, 'Транспорт', '🚗', '#2196F3', true, 20),
(NULL, NULL, 2, 'Жилье', '🏠', '#9C27B0', true, 30),
(NULL, NULL, 2, 'Здоровье', '🏥', '#E91E63', true, 40),
(NULL, NULL, 2, 'Развлечения', '🎮', '#FF9800', true, 50),
(NULL, NULL, 2, 'Образование', '📚', '#3F51B5', true, 60),
(NULL, NULL, 2, 'Одежда', '👔', '#00BCD4', true, 70),
(NULL, NULL, 2, 'Рестораны', '🍽️', '#FF5722', true, 80),
(NULL, NULL, 2, 'Связь', '📱', '#009688', true, 90),
(NULL, NULL, 2, 'Прочие расходы', '📦', '#607D8B', true, 100);

-- Подкатегории продуктов
INSERT INTO categories (user_id, parent_category_id, category_type_id, name, icon, is_system, sort_order) VALUES
(NULL, (SELECT id FROM categories WHERE name = 'Продукты' AND is_system = true), 2, 'Супермаркет', '🏪', true, 1),
(NULL, (SELECT id FROM categories WHERE name = 'Продукты' AND is_system = true), 2, 'Фрукты/Овощи', '🥗', true, 2),
(NULL, (SELECT id FROM categories WHERE name = 'Продукты' AND is_system = true), 2, 'Мясо/Рыба', '🥩', true, 3);

-- Подкатегории транспорта
INSERT INTO categories (user_id, parent_category_id, category_type_id, name, icon, is_system, sort_order) VALUES
(NULL, (SELECT id FROM categories WHERE name = 'Транспорт' AND is_system = true), 2, 'Топливо', '⛽', true, 1),
(NULL, (SELECT id FROM categories WHERE name = 'Транспорт' AND is_system = true), 2, 'Общественный транспорт', '🚌', true, 2),
(NULL, (SELECT id FROM categories WHERE name = 'Транспорт' AND is_system = true), 2, 'Такси', '🚕', true, 3),
(NULL, (SELECT id FROM categories WHERE name = 'Транспорт' AND is_system = true), 2, 'Обслуживание авто', '🔧', true, 4);

-- Подкатегории жилья
INSERT INTO categories (user_id, parent_category_id, category_type_id, name, icon, is_system, sort_order) VALUES
(NULL, (SELECT id FROM categories WHERE name = 'Жилье' AND is_system = true), 2, 'Аренда', '🔑', true, 1),
(NULL, (SELECT id FROM categories WHERE name = 'Жилье' AND is_system = true), 2, 'Коммунальные услуги', '💡', true, 2),
(NULL, (SELECT id FROM categories WHERE name = 'Жилье' AND is_system = true), 2, 'Ремонт', '🔨', true, 3),
(NULL, (SELECT id FROM categories WHERE name = 'Жилье' AND is_system = true), 2, 'Мебель', '🛋️', true, 4);

-- Системные способы оплаты
INSERT INTO payment_methods (user_id, name, type, is_system) VALUES
(NULL, 'Наличные', 'cash', true),
(NULL, 'Банковская карта', 'card', true),
(NULL, 'Банковский перевод', 'bank_transfer', true),
(NULL, 'Электронный кошелек', 'electronic', true);

-- ===============================================
-- FOREIGN KEY для users.default_currency_id
-- ===============================================
ALTER TABLE users 
ADD CONSTRAINT fk_users_default_currency 
FOREIGN KEY (default_currency_id) 
REFERENCES currencies(id);

-- ===============================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- ===============================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payees_updated_at BEFORE UPDATE ON payees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_reports_updated_at BEFORE UPDATE ON saved_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для обновления баланса счета
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.transaction_type = 'income' THEN
            UPDATE accounts 
            SET current_balance = current_balance + NEW.amount_in_account_currency
            WHERE id = NEW.account_id;
        ELSIF NEW.transaction_type = 'expense' THEN
            UPDATE accounts 
            SET current_balance = current_balance - NEW.amount_in_account_currency
            WHERE id = NEW.account_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Откатываем старую транзакцию
        IF OLD.transaction_type = 'income' THEN
            UPDATE accounts 
            SET current_balance = current_balance - OLD.amount_in_account_currency
            WHERE id = OLD.account_id;
        ELSIF OLD.transaction_type = 'expense' THEN
            UPDATE accounts 
            SET current_balance = current_balance + OLD.amount_in_account_currency
            WHERE id = OLD.account_id;
        END IF;
        -- Применяем новую транзакцию
        IF NEW.transaction_type = 'income' THEN
            UPDATE accounts 
            SET current_balance = current_balance + NEW.amount_in_account_currency
            WHERE id = NEW.account_id;
        ELSIF NEW.transaction_type = 'expense' THEN
            UPDATE accounts 
            SET current_balance = current_balance - NEW.amount_in_account_currency
            WHERE id = NEW.account_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.transaction_type = 'income' THEN
            UPDATE accounts 
            SET current_balance = current_balance - OLD.amount_in_account_currency
            WHERE id = OLD.account_id;
        ELSIF OLD.transaction_type = 'expense' THEN
            UPDATE accounts 
            SET current_balance = current_balance + OLD.amount_in_account_currency
            WHERE id = OLD.account_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления баланса счета
CREATE TRIGGER trigger_update_account_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance();

