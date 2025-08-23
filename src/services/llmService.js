const axios = require('axios');
const LLM_API_URL = process.env.LLM_API_URL;
const LLM_MODEL = process.env.LLM_MODEL;
const LLM_API_KEY = process.env.LLM_API_KEY;

async function chat(messages) {

  // 定义请求头
  const headers = {
    'Authorization': 'Bearer ' + LLM_API_KEY,
    'Content-Type': 'application/json'
  };

  // 请求体
  const requestBody = {
    model: LLM_MODEL,
    messages: messages
  };

  let response = await axios.post(LLM_API_URL, requestBody, { headers })

  return response.data.choices[0].message.content

}

module.exports = { chat };