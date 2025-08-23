const express = require('express');
const router = express.Router();
const docController = require('../controllers/docController');
const llmController = require('../controllers/llmController');

router.get('/', (req, res) => {
    res.send('Hello World!');
});

router.use('/doc', docController);
router.use('/llm', llmController);

module.exports = router;