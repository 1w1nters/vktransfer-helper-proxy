const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Мы будем использовать этот путь: /api/sendvk
app.post('/api/sendvk', async (req, res) => {
  // Теперь сервер ожидает 'token', 'vkId' и готовое 'message'
  const { token, vkId, message } = req.body;

  // Если чего-то не хватает, возвращаем ошибку
  if (!token || !vkId || !message) {
    return res.status(400).json({ success: false, message: 'Missing required parameters.' });
  }

  const params = new URLSearchParams({
    peer_id: vkId,
    message: message, // Используем полученное сообщение напрямую
    random_id: Date.now(),
    v: '5.199',
    access_token: token
  });

  try {
    const vkResponse = await fetch('https://api.vk.ru/method/messages.send', {
      method: 'POST',
      body: params,
    });
    const vkData = await vkResponse.json();
    if (vkData.error) {
      return res.status(400).json({ success: false, message: `VK API Error: ${vkData.error.error_msg}` });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
