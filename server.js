const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json()); 

// Ваша ссылка на базу данных
const connectionString = 'postgresql://digital_assessment_user:Z9XsQfYxnSgaURkCbwnXOpKM3OrZIBnf@dpg-dbmlicui0phs73c7brpg-a.frankfurt-postgres.render.com/digital_assessment';

const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

// Проверка подключения
pool.connect()
    .then(() => console.log('Успешно подключено к базе данных на Render!'))
    .catch(err => console.error('Ошибка подключения:', err.stack));

// Прием данных с сайта и запись в таблицу users
app.post('/api/register', async (req, res) => {
    try {
        const { full_name, email, password_hash } = req.body;
        
        const newUser = await pool.query(
            'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [full_name, email, password_hash]
        );
        
        res.json({ success: true, user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Ошибка при сохранении в базу' });
    }
});

// Запуск сервера (с поддержкой удаленного хостинга)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер бэкенда запущен на порту ${PORT}`);
});
