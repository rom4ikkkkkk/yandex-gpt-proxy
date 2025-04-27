import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/proxy", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch("https://llm.api.cloud.yandex.net/foundationModels/v1/completion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Api-Key ${process.env.API_KEY}`,
        "x-folder-id": process.env.CATALOG_ID,
      },
      body: JSON.stringify({
        modelUri: `gpt://${process.env.CATALOG_ID}/yandexgpt-lite`,
        completionOptions: {
          stream: false,
          temperature: 0.6,
          maxTokens: 2000,
        },
        messages: [
          { role: "system", text: "Ты полезный ассистент." },
          { role: "user", text: prompt },
        ],
      }),
    });

    const data = await response.json();
    res.json(data.result.alternatives[0].message.text);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка на сервере" });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
