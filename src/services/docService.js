const agentService = require("./agentService");
const commonUtils = require("../utils/commonUtils");
const path = require("path");
const fs = require("fs").promises;
const fs1 = require("fs");
const FILE_PATH = path.join(process.cwd(), "outputs");

const templates = loadTemplates();

async function genOutline(keywords) {
  let outlineName = "outline.json";
  console.log("开始生成提纲...");
  let modules = await agentService.moduleSplitAgent(keywords);
  await overwriteFile(outlineName, JSON.stringify(modules));
  console.log("提纲已生成...");
  return modules;
}

async function readOutline() {
  let outlineName = "outline.json";
  try {
    let outline;
    const filePath = path.join(FILE_PATH, outlineName);
    const data = await fs.readFile(filePath, "utf8");
    outline = JSON.parse(data);
    return outline;
  } catch (err) {
    throw err;
  }
}

async function genDoc(keywords) {
  let docName = "output.md";
  let modules = "";
  try {
    modules = await readOutline();
  } catch (err) {
    console.error("读取提纲内容异常:", err);
    return;
  }

  await overwriteFile(docName, "");

  console.log("开始生成文章内容...");
  let content = await genContent(keywords, JSON.stringify(modules), modules, 0);
  await appendToFile(docName, content);
  console.log("文章生成完毕！");
}

/**
 * 递归生成文档
 * @param {*} keywords 用户对文档的需求描述
 * @param {*} totalModulesStr 文档的提纲
 * @param {*} module 当前撰写的模块
 * @param {*} index 当前递归的层级
 * @returns
 */
async function genContent(keywords, totalModulesStr, module, index) {
  let content = "";

  // 标题级别
  let shup = "#";
  for (let j = 0; j < index; j++) {
    shup = shup + "#";
  }

  console.log("开始撰写：" + module.moduleName + "...");

  // 当存在子模块时
  if (
    module.hasOwnProperty("subModules") &&
    Array.isArray(module["subModules"]) &&
    module["subModules"].length > 0
  ) {
    let parallelGroup = [];

    // 0 生成概述
    parallelGroup.push(
      agentService.moduleContentAgent(
        keywords,
        totalModulesStr,
        module.moduleName
      )
    );

    // 1 生成功能组成
    parallelGroup.push(genModuleComposition(module));

    // 2 生成业务流程
    parallelGroup.push(
      agentService.flowChartAgent(keywords, totalModulesStr, module.moduleName)
    );

    // 3 生成内部交互关系
    parallelGroup.push(
      genInternalInteraction(keywords, totalModulesStr, module)
    );

    // 4 生成外部交互关系
    parallelGroup.push(
      genExternalInteraction(keywords, totalModulesStr, module)
    );

    // 5 递归生成子模块的内容
    for (let i = 0; i < module["subModules"].length; i++) {
      let subModule = module["subModules"][i];
      parallelGroup.push(
        genContent(keywords, totalModulesStr, subModule, index + 1)
      );
    }

    let results;
    try {
      results = await Promise.all(parallelGroup);
    } catch (error) {
      console.error("One of the async functions failed:", error);
    }

    // 组装子模块的内容
    let subModulesContent = "";
    for (let i = 5; i < results.length; i++) {
      let result = results[i];
      subModulesContent = subModulesContent + result + "\n";
    }

    // 为模板的占位符赋值
    const replacements = {
      MODULENAME: module.moduleName,
      SHUP: shup,
      OVERVIEW: results[0],
      COMPOSITION: results[1],
      BUSINESS_PROCESS: results[2],
      INTERNAL_INTERACTION: results[3],
      EXTERNAL_INTERACTION: results[4],
      SUBMODULES: subModulesContent,
    };

    content = commonUtils.replaceKeywords(templates.module, replacements);
  } else if (!module.hasOwnProperty("subModules")) {
    // 写入模块标题
    content = content + shup + " " + module.moduleName + "\n";
    let functionDetail = await agentService.functionDetailAgent(
      keywords,
      totalModulesStr,
      module.moduleName
    );
    content = content + functionDetail + "\n";
  }

  console.log("撰写完成：" + module.moduleName + " ！");
  return content;
}

/**
 * 生成模块的功能组成描述及功能组成图
 * @param {*} module
 * @returns
 */
async function genModuleComposition(module) {
  let content = module.moduleName + "主要包括";
  let graph = "";
  graph = graph + "```mermaid\n";
  graph = graph + "flowchart TD\n";
  graph = graph + "A[" + module.moduleName + "]\n";

  for (let i = 0; i < module["subModules"].length; i++) {
    let subModule = module["subModules"][i];
    content = content + subModule.moduleName;
    if (i < module["subModules"].length - 1) {
      content = content + "、";
    }

    graph = graph + "A --- A" + i + "[" + subModule.moduleName + "]\n";
  }
  graph = graph + "```\n";

  content = content + "。其功能组成如下图所示。\n";

  content = content + graph;

  return content;
}

/**
 * 生成内部交互关系
 * @param {*} background
 * @param {*} totalModulesStr
 * @param {*} module
 * @returns
 */
async function genInternalInteraction(background, totalModulesStr, module) {
  let table = await agentService.internalInteractionTableAgent(
    background,
    totalModulesStr,
    module.moduleName
  );

  let graph = await agentService.interactionGraphAgent(table);

  const replacements = {
    MODULENAME: module.moduleName,
    TYPE: "内部",
    GRAPH: graph,
    TABLE: table,
  };

  let content = commonUtils.replaceKeywords(
    templates.interaction,
    replacements
  );

  return content;
}

/**
 * 生成外部交互关系
 * @param {*} background
 * @param {*} totalModulesStr
 * @param {*} module
 * @returns
 */
async function genExternalInteraction(background, totalModulesStr, module) {
  let table = await agentService.externalInteractionTableAgent(
    background,
    totalModulesStr,
    module.moduleName
  );

  let graph = await agentService.interactionGraphAgent(table);

  const replacements = {
    MODULENAME: module.moduleName,
    TYPE: "外部",
    GRAPH: graph,
    TABLE: table,
  };

  let content = commonUtils.replaceKeywords(
    templates.interaction,
    replacements
  );

  return content;
}

// 异步函数用于向文件追加文本
async function appendToFile(filename, content) {
  let filePath = path.join(FILE_PATH, filename);
  // 获取文件所在的目录路径
  let dirPath = path.dirname(filePath);

  try {
    // 检查目录是否存在
    await fs.access(dirPath);
  } catch {
    // 目录不存在，创建目录（recursive: true 允许创建多级目录）
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`目录已创建: ${dirPath}`);
  }
  try {
    await fs.appendFile(filePath, content);
    console.log(`文本已追加到文件 ${filePath}`);
  } catch (err) {
    console.error("追加文本时发生错误:", err);
  }
}

// 异步函数用于覆盖文件内容
async function overwriteFile(filename, content) {
  let filePath = path.join(FILE_PATH, filename);
  // 获取文件所在的目录路径
  let dirPath = path.dirname(filePath);

  try {
    // 检查目录是否存在
    await fs.access(dirPath);
  } catch {
    // 目录不存在，创建目录（recursive: true 允许创建多级目录）
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`目录已创建: ${dirPath}`);
  }
  try {
    await fs.writeFile(filePath, content);
    console.log(`文件 ${filePath} 已被覆盖`);
  } catch (err) {
    console.error("覆盖文件时发生错误:", err);
  }
}

// 读取模板文件
function loadTemplates() {
  const templatesDir = path.join(process.cwd(), "src", "templates");

  let templates = {};

  try {
    const files = fs1.readdirSync(templatesDir);
    files.forEach((file) => {
      const filePath = path.join(templatesDir, file);
      const data = fs1.readFileSync(filePath, "utf8");
      templates[file.replace(".md", "")] = data;
    });
  } catch (err) {
    console.error("无法读取提示词文件:", err);
  }

  return templates;
}

module.exports = { genDoc, genOutline, readOutline };
