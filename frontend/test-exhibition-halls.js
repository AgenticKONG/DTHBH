// 简单测试脚本 - 验证展厅配置数据结构
import { getHallConfig, getAllHalls } from './src/config/exhibitionHalls.js';

console.log('====================================');
console.log('开始测试展厅配置数据');
console.log('====================================\n');

// 测试1: 获取所有展厅
console.log('测试1: 获取所有展厅');
const allHalls = getAllHalls();
console.log('展厅数量:', allHalls.length);
console.log(
  '展厅列表:',
  allHalls.map((h) => h.id)
);

// 测试2: 验证每个展厅的必需字段
console.log('\n测试2: 验证每个展厅的必需字段');
const requiredFields = [
  'id',
  'name',
  'type',
  'period',
  'description',
  'space',
  'materials',
  'lighting',
  'camera',
  'paintings',
  'intros'
];
let allValid = true;

allHalls.forEach((hall, index) => {
  console.log(`\n检查展厅 ${index + 1}: ${hall.id}`);
  requiredFields.forEach((field) => {
    if (!hall[field]) {
      console.error(`  ❌ 缺少字段: ${field}`);
      allValid = false;
    } else {
      console.log(`  ✅ ${field}: ${typeof hall[field]}`);
    }
  });
});

// 测试3: 验证intros配置结构
console.log('\n测试3: 验证intros配置结构');
allHalls.forEach((hall, index) => {
  console.log(`\n展厅 ${hall.id} 的 intros:`);
  if (hall.intros && hall.intros.length > 0) {
    hall.intros.forEach((intro, i) => {
      console.log(`  Intro ${i + 1}:`);
      console.log(`    name: ${intro.name}`);
      console.log(`    lifespan: ${intro.lifespan}`);
      console.log(`    title: ${intro.title}`);
      console.log(`    honor: ${intro.honor}`);
      console.log(`    detail: ${intro.detail ? '有' : '缺失'}`);
      console.log('    position:', intro.position);
      console.log(`    panelWidth: ${intro.panelWidth}`);
      console.log(`    panelHeight: ${intro.panelHeight}`);
    });
  } else {
    console.log('  该展厅没有intros配置');
  }
});

// 测试4: 验证space配置结构
console.log('\n测试4: 验证space配置结构');
allHalls.forEach((hall, index) => {
  console.log(`\n展厅 ${hall.id} 的 space:`);
  const space = hall.space;
  console.log(`  length: ${space.length}`);
  console.log(`  width: ${space.width}`);
  console.log(`  height: ${space.height}`);
  console.log(`  wallThickness: ${space.wallThickness}`);
});

// 测试5: 验证paintings配置结构
console.log('\n测试5: 验证paintings配置结构');
allHalls.forEach((hall, index) => {
  console.log(`\n展厅 ${hall.id} 的 paintings: ${hall.paintings.length}件`);
  hall.paintings.forEach((painting, i) => {
    console.log(`  ${i + 1}. id=${painting.id}, url=${painting.url}`);
  });
});

// 测试6: 验证getHallConfig函数
console.log('\n测试6: 验证getHallConfig函数');
['entrance', 'early', 'middle', 'late'].forEach((hallId) => {
  const hall = getHallConfig(hallId);
  if (hall) {
    console.log(`  ✅ 获取展厅 ${hallId}: ${hall.name}`);
  } else {
    console.log(`  ❌ 无法获取展厅 ${hallId}`);
  }
});

console.log('\n====================================');
console.log('测试完成');
console.log('====================================');
