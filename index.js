const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/api/yandexgpt', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Нет текста запроса.' });
    }

    try {
        const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Api-Key ${process.env.API_KEY}`,
                'x-folder-id': process.env.CATALOG_ID
            },
            body: JSON.stringify({
                modelUri: `gpt://${process.env.CATALOG_ID}/yandexgpt-lite`,
                completionOptions: {
                    stream: false,
                    temperature: 0.6,
                    maxTokens: 2000
                },
                messages: [
                    { role: 'system', text: 'Ты полезный ассистент.' },
                    { role: 'user', text: prompt }
                ]
            })
        });

        const data = await response.json();
        res.json({ text: data.result.alternatives[0].message.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

app.get('/', (req, res) => {
    res.send('ЯндексGPT-прокси работает!');
});

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
