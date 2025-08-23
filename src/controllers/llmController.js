const express = require('express');
const router = express.Router();
const llmService = require('../services/llmService');

router.post('/chat', async (req, res) => {
    let messages = [{ role: 'user', content: req.body.keywords }]
    let answer = await llmService.chat(messages)
    res.send(answer);
});

module.exports = router;