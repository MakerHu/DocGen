const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const docService = require('../services/docService');
const agentService = require('../services/agentService');

router.post('/gen', async (req, res) => {
    docService.genDoc(req.body.keywords)
    res.status(200);

    // 发送 JSON 响应
    res.json({
        status: 'success',
        message: '已启动生成',
        data: {}
    });
});

router.post('/genOutline', async (req, res) => {
    let modules = await docService.genOutline(req.body.keywords)
    res.send(modules);
});

router.post('/genFlowChart', async (req, res) => {
    let flowChart = await agentService.flowChartAgent(req.body.keywords)
    res.send(flowChart);
});

router.get('/download', (req, res) => {
    let filename = req.query.filename
    const filePath = path.join(process.cwd(), 'files', filename);

    // 设置响应头
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', 'text/plain');

    // 创建可读流，并通过 res 管道发送文件
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
});



module.exports = router;