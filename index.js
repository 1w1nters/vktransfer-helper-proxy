const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Включаем CORS для всех запросов

app.post('/api/feedback', async (req, res) => {
  const { token, vkId, url } = req.body;

  if (!token || !vkId || !url) {
    return res.status(400).json({ success: false, message: 'Missing required parameters.' });
  }

  const message = `Новая жалоба для рассмотрения:\n${url}`;
  const params = new URLSearchParams({
    peer_id: vkId,
    message: message,
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
      console.error('VK API Error:', vkData.error);
      return res.status(400).json({ success: false, message: `VK API Error: ${vkData.error.error_msg}` });
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
