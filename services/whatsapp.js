const axios = require('axios');

async function sendWhatsappMessage(to, body) {
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await axios.post(url, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body }
  }, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
  });
}

module.exports = { sendWhatsappMessage };
