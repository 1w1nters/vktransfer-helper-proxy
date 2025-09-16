const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Путь теперь /api/sendvk для ясности
app.post('/api/sendvk', async (req, res) => { 
  // Теперь мы ожидаем готовое сообщение 'message'
  const { token, vkId, message } = req.body; 

  if (!token || !vkId || !message) {
    return res.status(400).json({ success: false, message: 'Missing required parameters.' });
  }

  const params = new URLSearchParams({
    peer_id: vkId,
    message: message, // Используем полученное сообщение
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));```
4.  Нажмите зеленую кнопку **"Commit changes"**. Render автоматически заметит изменения и перезагрузит ваш сервер (1-2 минуты).

5.  И последнее: **обновите URL** в вашем `background.js` в функции `transferComplaintViaVkApi`:

```javascript
// Было: const PROXY_URL = ".../api/feedback";
const PROXY_URL = "https://arizona-helper-proxy.onrender.com/api/sendvk"; // Стало: .../api/sendvk
