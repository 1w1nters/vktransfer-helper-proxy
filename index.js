const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- МАРШРУТ ДЛЯ VK (остается без изменений) ---
app.post('/api/sendvk', async (req, res) => {
  const { token, vkId, message } = req.body;
  if (!token || !vkId || !message) {
    return res.status(400).json({ success: false, message: 'Missing required parameters for VK.' });
  }
  const params = new URLSearchParams({
    peer_id: vkId, message: message, random_id: Date.now(), v: '5.199', access_token: token
  });
  try {
    const vkResponse = await fetch('https://api.vk.ru/method/messages.send', { method: 'POST', body: params });
    const vkData = await vkResponse.json();
    if (vkData.error) {
      return res.status(400).json({ success: false, message: `VK API Error: ${vkData.error.error_msg}` });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
});

// --- НОВЫЙ МАРШРУТ ДЛЯ DISCORD ---
app.post('/api/senddiscord', async (req, res) => {
  // Теперь сервер ожидает webhookUrl и payload (данные для сообщения)
  const { webhookUrl, payload } = req.body;
  if (!webhookUrl || !payload) {
    return res.status(400).json({ success: false, message: 'Missing required parameters for Discord.' });
  }
  try {
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      // Пересылаем ошибку от Discord обратно в расширение
      return res.status(discordResponse.status).json({ success: false, message: `Discord API Error: ${errorText}` });
    }
    res.status(204).send(); // Discord в случае успеха возвращает 204 No Content
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
