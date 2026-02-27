const fs = require('fs');

const inputFile = '/Users/erickong/Desktop/黄賓虹年譜-from-doc.txt';
const outputFile = '/Users/erickong/Desktop/KDK/PROJECTS/DTHBH/frontend/src/data/timeline-events-v5.json';

const BIRTH_YEAR = 1865;
const DEATH_YEAR = 1955;

const CITIES = [
  '上海', '杭州', '北平', '北京', '南京', '苏州', '金华', '宁波', '绍兴', '嘉兴', '湖州',
  '成都', '重庆', '峨眉山', '乐山', '嘉定', '宜宾', '内江', '重庆', '万县',
  '广州', '香港', '澳门', '深圳', '汕头',
  '天津', '济南', '青岛', '大连', '沈阳', '长春', '哈尔滨',
  '西安', '兰州', '敦煌', '洛阳', '开封', '郑州',
  '武汉', '长沙', '南昌', '福州', '厦门', '桂林', '南宁',
  '黄山', '庐山', '泰山', '华山', '衡山', '嵩山', '莫干山', '天目山',
  '歙县', '徽州', '屯溪', '休宁', '祁门', '黟县',
  '金华的', '金华县', '浙东', '浙西', '江南',
  '虹口', '静安寺', '西泠', '西泠印社'
];

const CONTENT_LOCATIONS = [
  '沪', '杭', '平津', '京津', '浙'
];

const content = fs.readFileSync(inputFile, 'utf-8');

let inMainSection = false;
let currentYear = null;
let currentEra = null;
let currentAge = null;
let lastLocation = null;

const allEvents = [];

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('黄賓虹年譜') && !inMainSection) {
    inMainSection = true;
    continue;
  }
  
  if (!inMainSection) continue;
  
  if (currentYear && (line.includes('初版後記') || line.includes('主要參考書目') || line.includes('附錄：'))) {
    break;
  }
  
  const yearMatch = line.match(/^公元(\d{4})年/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= BIRTH_YEAR && year <= DEATH_YEAR) {
      currentYear = year;
      
      if (line.includes('民國')) {
        currentEra = '民國';
      } else if (line.includes('新中國') || line.includes('中華人民共和國')) {
        currentEra = '新中國';
      } else {
        currentEra = '晚清';
      }
      
      const ageMatch = line.match(/(\d+)歲/);
      currentAge = ageMatch ? parseInt(ageMatch[1]) : (year - BIRTH_YEAR);
      lastLocation = null;
      continue;
    }
  }
  
  if (currentYear && line.length > 3) {
    const dateMatch = line.match(/^(\d{1,2})月(\d{1,2})日(.+)/);
    const monthOnlyMatch = line.match(/^(\d{1,2})月(.+)/);
    
    let month = null;
    let day = null;
    let eventContent = '';
    
    if (dateMatch) {
      month = parseInt(dateMatch[1]);
      day = parseInt(dateMatch[2]);
      eventContent = dateMatch[3].trim();
    } else if (monthOnlyMatch) {
      const rawContent = monthOnlyMatch[2].trim();
      if (rawContent.length > 2) {
        month = parseInt(monthOnlyMatch[1]);
        eventContent = rawContent;
      }
    } else {
      const isYearHeader = /^公元\d+年/.test(line);
      const isQuote = line.startsWith('《') || line.startsWith('[') || line.startsWith('（');
      const isParenthetical = /^\([^)]+\)$/.test(line) || /^\[.*\]$/.test(line);
      const isBlank = line.length < 3;
      
      if (!isYearHeader && !isQuote && !isParenthetical && !isBlank) {
        if (line.length > 3 && line.length < 120) {
          eventContent = line;
        }
      }
    }
    
    if (eventContent && eventContent.length > 2) {
      const isPureQuote = eventContent.startsWith('《') || eventContent.startsWith('[') || eventContent.startsWith('（') || eventContent.startsWith('「');
      const hasQuoteMark = eventContent.includes('《') || eventContent.includes('[') || eventContent.includes('「');
      const isAnnotation = eventContent.startsWith('按：') || eventContent.startsWith('按:');
      const isFamilyEvent = /^(祖父|祖母|父|母)/.test(eventContent) && !eventContent.includes('黄賓虹');
      
      const categoryKeywords = {
        '出生': ['生於', '出生', '诞生', '诞辰'],
        '求学': ['入学', '肆业', '修業', '從師', '問業', '從', '習', '讀', '学习', '畢業', '毕业', '求學'],
        '艺术': ['作畫', '作画', '畫', '書法', '书法', '篆刻', '刻印', '臨摹', '临摹', '寫生', '写生', '山水', '花卉', '花鳥', '花鸟', '展覽', '展览', '展出', '畫展', '笔', '墨', '皴', '章法', '自題', '題'],
        '交游': ['访', '來謁', '来见', '相访', '会见', '遇', '识', '交', '游', '赴', '去', '至', '抵', '赴约', '宴请', '餞行', '送行', '雅集', '谈心', '談心', '晤', '陪', '同游', '同行', '招待', '接待', '来沪', '来杭', '来平', '謁', '招邀'],
        '职业': ['任教', '任职', '聘', '辞', '赴任', '就职', '辞职', '创办', '设立', '成立', '开会', '参加', '任校长', '任主任', '任教授', '任讲师'],
        '展览': ['展出', '展览', '展售', '画展', '个展', '陈列', '陈列'],
        '著作': ['著', '编', '印行', '出版', '发行', '发表', '稿', '撰', '序', '跋'],
        '家族': ['弟', '妹', '兄', '姐', '妻', '子', '婚', '嫁', '卒', '死', '逝', '病', '寿辰', '诞辰'],
        '逝世': ['去世', '逝世', '病逝', '卒于', '终于', '亡', '長辭', '去世'],
        '迁徙': ['迁', '搬', '移', '居', '住', '赴', '去', '至', '抵', '返', '归', '回到'],
      };
      
      let category = '其他';
      for (const [cat, kws] of Object.entries(categoryKeywords)) {
        if (kws.some(kw => eventContent.includes(kw))) {
          category = cat;
          break;
        }
      }
      
      let location = null;
      for (const city of CITIES) {
        if (eventContent.includes(city)) {
          location = city;
          break;
        }
      }
      if (!location && lastLocation && eventContent.includes('仍') || eventContent.includes('继续')) {
        location = lastLocation;
      }
      if (location) {
        lastLocation = location;
      }
      
      const personExcludeWords = ['黄賓虹', '宾虹', '黄山', '先生', '夫人', '女士', '兄', '弟', '翁', '公', '子'];
      
      const personPatterns = [
        /([A-Za-z·\u4e00-\u9fa5]{2,4})(?:先生|女士|夫人|教授|校长|主任|医师|画家|诗人|社长|记者|编辑|主席|委员|厅长|省长|市长|处长|局长|司令|师长|将军|大使|经理|董事)/g,
        /(?:與|同|和|与|陪|赴|访|见|謁|招|邀|宴|餞|送|迎)([A-Za-z·\u4e00-\u9fa5]{2,4})(?:先生|女士|夫人|兄|翁|公)/g,
        /([A-Za-z·\u4e00-\u9fa5]{2,4})(?:來訪|来访|来谒|相访|会见|赴约|招邀|宴请|餞行|送行|雅集|招飲)/g,
      ];
      
      const persons = new Set();
      personPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(eventContent)) !== null) {
          const name = match[1];
          const isExcluded = personExcludeWords.some(ex => name.includes(ex));
          if (!isExcluded && name.length >= 2 && name.length <= 4) {
            persons.add(name);
          }
        }
      });
      
      const personArray = Array.from(persons);
      const mainPerson = personArray.length > 0 ? personArray[0] : null;
      const otherPersons = personArray.length > 1 ? personArray.slice(1) : [];
      
      const isKeyEvent = /去世|逝世|病逝|卒于|终于|亡|長辭|诞辰|出生|始|创办|成立|任教|辞职|结婚|嫁|娶|獲獎|獲賞|捐獻|捐贈|出售|遷移|搬遷|遊歷|遊學|回國|出国|歸國|赴京|來訪|來謁/.test(eventContent);
      
      allEvents.push({
        id: `${currentYear}-${allEvents.length}`,
        year: currentYear,
        era: currentEra,
        age: currentAge,
        month: month,
        day: day,
        content: eventContent,
        location: location,
        mainPerson: mainPerson,
        otherPersons: otherPersons,
        flags: {
          isPureQuote: isPureQuote,
          hasQuoteMark: hasQuoteMark,
          isAnnotation: isAnnotation,
          isFamilyEvent: isFamilyEvent,
          isKeyEvent: isKeyEvent,
        },
        category: category,
      });
    }
  }
}

const byYear = {};
allEvents.forEach(e => {
  if (!byYear[e.year]) byYear[e.year] = [];
  byYear[e.year].push(e);
});

const contentMap = new Map();
allEvents.forEach(e => {
  const key = e.content.substring(0, 30);
  if (!contentMap.has(key)) {
    contentMap.set(key, []);
  }
  contentMap.get(key).push(e.id);
});

contentMap.forEach((ids, key) => {
  if (ids.length > 1) {
    ids.forEach(id => {
      const event = allEvents.find(e => e.id === id);
      if (event) {
        event.flags.isDuplicate = true;
      }
    });
  }
});

const result = {
  metadata: {
    subject: '黄賓虹',
    birthYear: BIRTH_YEAR,
    deathYear: DEATH_YEAR,
    totalRawEvents: allEvents.length,
    yearSpan: DEATH_YEAR - BIRTH_YEAR + 1,
    yearsWithEvents: Object.keys(byYear).length,
    source: '黄賓虹年譜 (DOC)',
    extractDate: new Date().toISOString(),
    version: 'v5 - with location & persons'
  },
  events: allEvents,
  byYear: byYear,
  stats: {
    withLocation: allEvents.filter(e => e.location).length,
    withPerson: allEvents.filter(e => e.mainPerson).length,
    categories: Object.entries(allEvents.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {})).sort((a,b) => b[1] - a[1])
  }
};

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

console.log(`✅ v5 提取完成！`);
console.log(`📊 总事件: ${allEvents.length} 条`);
console.log(`📁 已保存到: ${outputFile}`);
console.log(`\n📍 地点统计: ${result.stats.withLocation} 条有地点 (${Math.round(result.stats.withLocation/allEvents.length*100)}%)`);
console.log(`👤 人物统计: ${result.stats.withPerson} 条有人物 (${Math.round(result.stats.withPerson/allEvents.length*100)}%)`);
console.log(`\n📊 分类分布:`);
result.stats.categories.forEach(([cat, count]) => {
  console.log(`  - ${cat}: ${count}`);
});
