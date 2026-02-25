// Vue组件逻辑测试
console.log('====================================');
console.log('开始测试ThreeDExhibition组件逻辑');
console.log('====================================\n');

const { getHallConfig, getAllHalls } = require('./src/config/exhibitionHalls.js');

// 测试1: 验证配置获取
console.log('测试1: 验证配置获取');
const hall = getHallConfig('entrance');
console.log('hall存在?', !!hall);
console.log('hall对象:', hall);

// 测试2: 验证intros访问路径
console.log('\n测试2: 验证intros访问路径');
console.log('hall.intros存在?', !!hall?.intros);
console.log('hall.intros类型:', typeof hall?.intros);
console.log('hall.intros长度:', hall?.intros?.length);

// 测试3: 模拟Vue组件的computed属性
console.log('\n测试3: 模拟Vue组件的computed属性');
const currentHallId = 'entrance';
const currentHall = getHallConfig(currentHallId);
const spaceParams = currentHall?.space || { length: 200, width: 14, height: 14, wallThickness: 0.1 };
const hallPaintings = currentHall?.paintings || [];
const hallLighting = currentHall?.lighting || { ambient: { color: 0xfffff0, intensity: 0.8 }, directional: [] };
const hallMaterials = currentHall?.materials || { wall: {}, floor: {}, ceiling: {} };

console.log('currentHallId:', currentHallId);
console.log('currentHall.name:', currentHall?.name);
console.log('spaceParams:', spaceParams);
console.log('hallPaintings数量:', hallPaintings.length);
console.log('hallLighting:', hallLighting);
console.log('hallMaterials:', hallMaterials);

// 测试4: 验证intros forEach循环
console.log('\n测试4: 验证intros forEach循环');
const intros = currentHall?.intros || [];
console.log('intros数组:', intros);

intros.forEach((introConfig, index) => {
  console.log(`\n  Intro ${index + 1}:`);
  console.log(`    introConfig存在: ${!!introConfig}`);
  console.log(`    name: ${introConfig.name}`);
  console.log(`    lifespan: ${introConfig.lifespan}`);
  console.log(`    title: ${introConfig.title}`);
  console.log(`    honor: ${introConfig.honor}`);
  console.log(`    detail长度: ${introConfig.detail?.length || 0}`);
  console.log('    position:', introConfig.position);
  console.log(`    panelWidth: ${introConfig.panelWidth}`);
  console.log(`    panelHeight: ${introConfig.panelHeight}`);

  // 检查是否应该使用introConfig还是introConfig.content
  console.log(`    有content字段: ${!!introConfig.content}`);
  if (introConfig.content) {
    console.log(`    content.name: ${introConfig.content.name}`);
  }
});

// 测试5: 测试所有展厅
console.log('\n测试5: 测试所有展厅');
const halls = getAllHalls();
halls.forEach((h, index) => {
  console.log(`\n展厅 ${index + 1}: ${h.id} - ${h.name}`);
  console.log(`  intros数量: ${h.intros?.length || 0}`);
  if (h.intros && h.intros.length > 0) {
    h.intros.forEach((intro, i) => {
      console.log(`    ${i + 1}. name: ${intro.name}, position:`, intro.position);
    });
  }
});

console.log('\n====================================');
console.log('测试完成');
console.log('====================================');
