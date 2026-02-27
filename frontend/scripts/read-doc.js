const mammoth = require('mammoth');
const fs = require('fs');

const inputFile = '/Users/erickong/Desktop/黄賓虹年譜.doc';
const outputFile = '/Users/erickong/Desktop/KDK/PROJECTS/DTHBH/frontend/src/data/timeline-doc-extract.txt';

async function extractDoc() {
  console.log('📖 正在读取 DOC 文件...');
  
  const result = await mammoth.extractRawText({ path: inputFile });
  const text = result.value;
  
  console.log(`✅ 提取文本成功，总长度: ${text.length} 字符`);
  
  // 保存为 txt 方便查看
  fs.writeFileSync(outputFile, text, 'utf-8');
  console.log(`📁 已保存到: ${outputFile}`);
  
  // 显示前 3000 字符了解结构
  console.log('\n📄 文件开头预览:');
  console.log(text.substring(0, 3000));
  
  console.log('\n\n📄 文件结尾预览:');
  console.log(text.substring(text.length - 2000));
  
  // 分析年份格式
  const yearMatches = text.match(/公元\d{4}年/g);
  if (yearMatches) {
    const uniqueYears = [...new Set(yearMatches)];
    console.log(`\n📅 发现年份: ${uniqueYears.slice(0, 10).join(', ')}... (共 ${uniqueYears.length} 个年份)`);
  }
  
  // 分析段落结构
  const lines = text.split('\n').filter(l => l.trim());
  console.log(`\n📊 总行数: ${lines.length}`);
  
  // 检查每年开头格式
  console.log('\n🔍 年份行样本:');
  const yearHeaderLines = lines.filter(l => /^公元\d{4}年/.test(l)).slice(0, 10);
  yearHeaderLines.forEach(l => console.log(`   ${l.substring(0, 60)}`));
}

extractDoc().catch(err => {
  console.error('❌ 错误:', err);
});
