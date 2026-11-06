const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json()); 

const connectionString = 'postgresql://digital_assessment_user:Z9XsQfYxnSgaURkCbwnXOpKM3OrZIBnf@dpg-dbmlicui0phs73c7brpg-a.frankfurt-postgres.render.com/digital_assessment';

const pool = new Pool({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log('Успешно подключено к БД Render!'))
    .catch(err => console.error('Ошибка:', err.stack));

// 1. Регистрация
app.post('/api/register', async (req, res) => {
    try {
        const { full_name, email, password_hash } = req.body;
        const newUser = await pool.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [full_name, email, password_hash]
        );
        res.json({ success: true, user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка регистрации' });
    }
});

// 2. ВХОД (Авторизация) - НОВОЕ
app.post('/api/login', async (req, res) => {
    try {
        const { email, password_hash } = req.body;
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND password_hash = $2', 
            [email, password_hash]
        );
        
        if (user.rows.length > 0) {
            res.json({ success: true, user: user.rows[0] });
        } else {
            res.status(401).json({ success: false, error: 'Неверный email или пароль' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера при входе' });
    }
});

// 3. Сохранение результатов теста - НОВОЕ
app.post('/api/results', async (req, res) => {
    try {
        const { user_id, test_id, score } = req.body;
        const newResult = await pool.query(
            'INSERT INTO results (user_id, test_id, score) VALUES ($1, $2, $3) RETURNING *',
            [user_id, test_id, score]
        );
        res.json({ success: true, result: newResult.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сохранения результата' });
    }
});

// 4. Просмотр логов прокторинга
app.post('/api/proctoring', async (req, res) => {
    try {
        const { user_id, event_type } = req.body;
        const newLog = await pool.query(
            'INSERT INTO proctoring_logs (user_id, event_type) VALUES ($1, $2) RETURNING *',
            [user_id, event_type]
        );
        res.json({ success: true, log: newLog.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка записи лога' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
