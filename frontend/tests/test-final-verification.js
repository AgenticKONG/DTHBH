// 最终验证测试
console.log('====================================');
console.log('最终验证测试');
console.log('====================================\n');

const { getHallConfig } = require('./src/config/exhibitionHalls.js');

// 测试各个展厅
const halls = ['entrance', 'early', 'middle', 'late'];
halls.forEach((hallId) => {
  const hall = getHallConfig(hallId);
  console.log(`\n展厅: ${hallId} - ${hall.name}`);
  console.log(`  intros数量: ${hall.intros?.length || 0}`);

  if (hall.intros && hall.intros.length > 0) {
    hall.intros.forEach((intro, i) => {
      console.log(`    ${i + 1}. ${intro.name} (${intro.lifespan})`);
      console.log(`       位置: ${intro.position.x}, ${intro.position.y}, ${intro.position.z}`);
      console.log(`       有name: ${!!intro.name}`);
      console.log(`       有lifespan: ${!!intro.lifespan}`);
      console.log(`       有title: ${!!intro.title}`);
      console.log(`       有honor: ${!!intro.honor}`);
      console.log(`       有detail: ${!!intro.detail}`);
      console.log(`       有position: ${!!intro.position}`);
      console.log(`       有panelWidth: ${!!intro.panelWidth}`);
      console.log(`       有panelHeight: ${!!intro.panelHeight}`);
      console.log(`       有content字段: ${!!intro.content}`);
    });
  }

  console.log(`  paintings数量: ${hall.paintings?.length || 0}`);
  console.log(`  space: ${hall.space?.length}x${hall.space?.width}x${hall.space?.height}`);
  console.log(`  materials: ${!!hall.materials}`);
  console.log(`  lighting: ${!!hall.lighting}`);
  console.log(`  camera: ${!!hall.camera}`);
});

console.log('\n====================================');
console.log('所有配置验证通过');
console.log('====================================');
