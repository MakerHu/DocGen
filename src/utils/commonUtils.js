

function replaceKeywords(text, replacements) {
  // 创建正则表达式来匹配所有的 {{KEYWORD}}
  const regex = /\{\{(\w+)\}\}/g;

  // 使用 replace 方法进行替换
  const replacedText = text.replace(regex, (match, keyword) => {
    // 从 replacements 对象中获取替换值
    return replacements[keyword] || match;
  });

  return replacedText;
}

module.exports = { replaceKeywords };