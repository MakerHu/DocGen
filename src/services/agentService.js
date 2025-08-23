const llmService = require('./llmService');
const commonUtils = require('../utils/commonUtils');

const fs = require('fs');
const path = require('path');

const prompts = loadPrompts();

/**
 * 功能拆解智能体
 * @param {g} prompt 
 * @returns 拆分后的模块列表
 */
async function moduleSplitAgent(prompt) {
    const replacements = {
        BACKGROUND: prompt,
    };

    let enhancedPrompt = commonUtils.replaceKeywords(prompts.moduleSplit, replacements);
    let messages = [{ role: 'system', content: enhancedPrompt }]
    let answer = await llmService.chat(messages)
    let jsonObject;
    try {
        // 使用 JSON.parse() 将 JSON 字符串转换为 JavaScript 对象
        jsonObject = JSON.parse(answer);
    } catch (error) {
        console.error('解析JSON时发生错误，正在重新尝试...');
        return await moduleSplitAgent(prompt)
    }
    return jsonObject
}

/**
 * 生成模块概述
 */
async function moduleContentAgent(background, modules, moduleName) {
    const replacements = {
        BACKGROUND: background,
        MODULES: modules,
        MODULENAME: moduleName,
    };

    let enhancedPrompt = commonUtils.replaceKeywords(prompts.moduleContent, replacements);
    let messages = [{ role: 'system', content: enhancedPrompt }]
    let answer = await llmService.chat(messages)
    return answer
}

/**
 * 生成内部交互关系表
 */
async function internalInteractionTableAgent(background, modules, moduleName) {
    const replacements = {
        BACKGROUND: background,
        MODULES: modules,
        MODULENAME: moduleName
    };

    let enhancedPrompt = commonUtils.replaceKeywords(prompts.internalInteraction, replacements);
    let messages = [{ role: 'system', content: enhancedPrompt }]
    let answer = await llmService.chat(messages)
    return answer
}

/**
 * 生成外部交互关系表
 */
async function externalInteractionTableAgent(background, modules, moduleName) {
    const replacements = {
        BACKGROUND: background,
        MODULES: modules,
        MODULENAME: moduleName
    };

    let enhancedPrompt = commonUtils.replaceKeywords(prompts.externalInteraction, replacements);
    let messages = [{ role: 'system', content: enhancedPrompt }]
    let answer = await llmService.chat(messages)
    return answer
}

/**
 * 生成交互关系图
 */
async function interactionGraphAgent(interactionTable) {
    const replacements = {
        INTERACTION: interactionTable
    };

    let enhancedPrompt = commonUtils.replaceKeywords(prompts.interactionGraph, replacements);
    let messages = [{ role: 'system', content: enhancedPrompt }]
    let answer = await llmService.chat(messages)
    return answer
}


/**
 * 生成模块业务流程图
 */
async function flowChartAgent(background, modules, moduleName) {
    const replacements = {
        BACKGROUND: background,
        MODULES: modules,
        MODULENAME: moduleName,
    };

    let enhancedPrompt = commonUtils.replaceKeywords(prompts.flowChart, replacements);
    let messages = [{ role: 'system', content: enhancedPrompt }]
    let answer = await llmService.chat(messages)
    return answer
}

/**
 * 生成功能详细设计
 */
async function functionDetailAgent(background, modules, moduleName) {
    const replacements = {
        BACKGROUND: background,
        MODULES: modules,
        MODULENAME: moduleName,
    };

    let enhancedPrompt = commonUtils.replaceKeywords(prompts.functionDetail, replacements);
    let messages = [{ role: 'system', content: enhancedPrompt }]
    let answer = await llmService.chat(messages)
    return answer
}

// 读取提示词文件
function loadPrompts() {
    const promptsDir = path.join(process.cwd(), 'src', 'prompts');

    let prompts = {};

    try {
        const files = fs.readdirSync(promptsDir);
        files.forEach(file => {
            const filePath = path.join(promptsDir, file);
            const data = fs.readFileSync(filePath, 'utf8');
            prompts[file.replace('.md', '')] = data;
        });
    } catch (err) {
        console.error('无法读取提示词文件:', err);
    }

    return prompts;
}

module.exports = { moduleSplitAgent, moduleContentAgent, functionDetailAgent, flowChartAgent, internalInteractionTableAgent, externalInteractionTableAgent, interactionGraphAgent };