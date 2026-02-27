const fs = require('fs');

const inputFile = '/Users/erickong/Desktop/黄賓虹年譜-from-doc.txt';
const outputFile = '/Users/erickong/Desktop/KDK/PROJECTS/DTHBH/frontend/src/data/timeline-events-v6.json';

const BIRTH_YEAR = 1865;
const DEATH_YEAR = 1955;

const CITIES = [
  '上海', '杭州', '北平', '北京', '南京', '苏州', '金华', '宁波', '绍兴', '嘉兴', '湖州',
  '成都', '重庆', '乐山', '嘉定', '宜宾', '内江', '万县', '绵阳', '雅安',
  '广州', '香港', '澳门', '深圳', '汕头', '珠海',
  '天津', '济南', '青岛', '大连', '沈阳', '长春', '哈尔滨',
  '西安', '兰州', '敦煌', '洛阳', '开封', '郑州', '太原',
  '武汉', '长沙', '南昌', '福州', '厦门', '桂林', '南宁', '柳州',
  '庐山', '泰山', '华山', '衡山', '嵩山', '莫干山', '天目山', '普陀山',
  '歙县', '徽州', '屯溪', '休宁', '祁门', '黟县', '婺源',
  '浦东', '虹口', '静安寺', '西泠', '闽', '浙西', '浙东', '江南', '江浙'
];

const TIME_KEYWORDS = {
  '初春': 2, '早春': 2, '新春': 2,
  '春': 3, '春季': 3,
  '暮春': 4, '晚春': 4, '春末': 4,
  '初夏': 5, '早夏': 5,
  '夏': 6, '夏季': 6,
  '盛夏': 7, '仲夏': 7,
  '夏末': 8, '末夏': 8,
  '初秋': 8, '早秋': 8,
  '秋': 9, '秋季': 9,
  '深秋': 10, '晚秋': 10, '秋末': 10,
  '初冬': 11,
  '冬': 12, '冬季': 12,
  '年终': 12, '年末': 12
};

const content = fs.readFileSync(inputFile, 'utf-8');

let inMainSection = false;
let currentYear = null;
let currentEra = null;
let currentAge = null;

const allEvents = [];
let lastLocation = null;

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
      lastLocation = null;
      currentYear = year;
      currentEra = line.includes('民國') ? '民國' : (line.includes('新中國') ? '新中國' : '晚清');
      const ageMatch = line.match(/(\d+)歲/);
      currentAge = ageMatch ? parseInt(ageMatch[1]) : (year - BIRTH_YEAR);
      continue;
    }
  }
  
  if (currentYear && line.length > 3) {
    const isAnnotation = line.startsWith('按：') || line.startsWith('按:');
    const isPureQuote = line.startsWith('《') || line.startsWith('[') || line.startsWith('（') || line.startsWith('「');
    
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
      const isParenthetical = /^\([^)]+\)$/.test(line);
      
      if (!isYearHeader && !isPureQuote && !isParenthetical && !isAnnotation && line.length > 3 && line.length < 150) {
        eventContent = line;
      }
    }
    
    if (eventContent && eventContent.length > 2) {
      let location = null;
      for (const city of CITIES) {
        if (eventContent.includes(city)) {
          location = city;
          break;
        }
      }
      if (location) {
        lastLocation = location;
      } else if (lastLocation && (eventContent.includes('仍') || eventContent.includes('继续') || eventContent.includes('在'))) {
        location = lastLocation;
      }
      
      if (!month) {
        for (const [kw, m] of Object.entries(TIME_KEYWORDS)) {
          // 使用单词边界匹配，避免"秋"匹配到"秋君"
          const regex = new RegExp(kw + '(?![\u4e00-\u9fa5])');
          if (regex.test(eventContent)) {
            month = m;
            break;
          }
        }
      }
      
      // 农历月份转换 (需要前面有空格或特定字符)
      if (!month) {
        if (/(?:^|[\s，。、])三月/.test(eventContent)) month = 3;
        else if (/(?:^|[\s，。、])四月/.test(eventContent)) month = 4;
        else if (/(?:^|[\s，。、])五月/.test(eventContent)) month = 5;
        else if (/(?:^|[\s，。、])六月/.test(eventContent)) month = 6;
        else if (/(?:^|[\s，。、])七月/.test(eventContent)) month = 7;
        else if (/(?:^|[\s，。、])八月/.test(eventContent)) month = 8;
        else if (/(?:^|[\s，。、])九月/.test(eventContent)) month = 9;
        else if (/(?:^|[\s，。、])十月/.test(eventContent)) month = 10;
        else if (/(?:^|[\s，。、])十一月/.test(eventContent) || /(?:^|[\s，。、])冬月/.test(eventContent)) month = 11;
        else if (/(?:^|[\s，。、])十二月/.test(eventContent) || /(?:^|[\s，。、])臘月/.test(eventContent)) month = 12;
      }
      
      const categoryKeywords = {
        '出生': ['生於', '出生', '诞生', '诞辰'],
        '求学': ['入学', '肆业', '修業', '從師', '問業', '讀', '学习', '畢業', '毕业', '求學', '肄業'],
        '艺术': ['作畫', '作画', '畫', '書法', '书法', '篆刻', '刻印', '臨摹', '临摹', '寫生', '写生', '山水', '花卉', '花鳥', '花鸟', '展覽', '展览', '展出', '畫展', '笔', '墨', '皴', '章法', '自題', '題', '畫作'],
        '交游': ['访', '來謁', '来见', '相访', '会见', '遇', '识', '游', '赴约', '宴请', '餞行', '送行', '雅集', '谈心', '談心', '晤', '招飲', '招邀', '同游', '同行', '來訪', '謁'],
        '职业': ['任教', '任职', '聘', '辞', '赴任', '就职', '辞职', '创办', '设立', '成立', '任校长', '任主任', '任教授', '任讲师', '推举'],
        '著作': ['出版', '发行', '发表', '印行', '著', '编', '撰', '序', '跋', '書', '集'],
        '书信': ['書', '函', '信'],
        '家族': ['弟', '妹', '兄', '姐', '寿辰', '诞辰'],
        '逝世': ['去世', '逝世', '病逝', '卒于', '终于', '亡', '長辭'],
        '迁徙': ['迁', '搬', '移', '居', '住', '返', '归', '回到', '赴', '去', '至', '抵', '启程', '出发', '登程'],
        '展览': ['展出', '展览', '展售', '画展', '个展', '陈列'],
      };
      
      let category = '其他';
      for (const [cat, kws] of Object.entries(categoryKeywords)) {
        if (kws.some(kw => eventContent.includes(kw))) {
          category = cat;
          break;
        }
      }
      
      const personExcludeWords = ['黄賓虹', '宾虹', '黄山賓虹', '先生', '夫人', '女士', '兄', '弟', '翁', '公', '子', '時', '日', '月', '年', '此', '其一'];
      
      const personPatterns = [
        /(?:與|同|和|与|陪|赴|访|见|謁|招|邀|宴|餞|送|迎|为|給|寄|致)([A-Za-z·\u4e00-\u9fa5]{2,4})(?:先生|女士|夫人|翁|公|書|函)/g,
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
      
      const isKeyEvent = /去世|逝世|病逝|卒于|终于|亡|長辭|诞辰|出生|始|创办|成立|任教|辞职|结婚|嫁|娶|獲獎|獲賞|捐獻|捐贈|出售|遷移|搬遷|遊歷|遊學|回國|出国|歸國|赴京|來訪|來謁|聘请/.test(eventContent);
      
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
        category: category,
        isAnnotation: isAnnotation,
        isKeyEvent: isKeyEvent
      });
    }
  }
}

for (let i = allEvents.length - 1; i >= 0; i--) {
  const e = allEvents[i];
  if (e.isAnnotation) {
    if (i > 0) {
      allEvents[i - 1].content += ' ' + e.content;
    }
    allEvents.splice(i, 1);
  }
}

for (let i = 0; i < allEvents.length - 1; i++) {
  const curr = allEvents[i];
  const next = allEvents[i + 1];
  
  if (curr.year === next.year) {
    if (!curr.month && next.month) {
      curr.month = next.month;
    } else if (curr.month && !next.month) {
      next.month = curr.month;
    }
  }
}

const contentSeen = new Set();
for (let i = allEvents.length - 1; i >= 0; i--) {
  const e = allEvents[i];
  const key = `${e.month || ''}-${e.content.substring(0, 40)}`;
  if (contentSeen.has(key)) {
    allEvents.splice(i, 1);
  } else {
    contentSeen.add(key);
  }
}

const byYear = {};
allEvents.forEach(e => {
  if (!byYear[e.year]) byYear[e.year] = [];
  byYear[e.year].push(e);
});

const result = {
  metadata: {
    subject: '黄賓虹',
    birthYear: BIRTH_YEAR,
    deathYear: DEATH_YEAR,
    totalRawEvents: allEvents.length,
    yearsWithEvents: Object.keys(byYear).length,
    source: '黄賓虹年譜 (DOC)',
    extractDate: new Date().toISOString(),
    version: 'v6 - improved extraction'
  },
  events: allEvents,
  byYear: byYear
};

fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

console.log(`✅ v6 提取完成！`);
console.log(`📊 总事件: ${allEvents.length} 条`);
console.log(`📁 已保存到: ${outputFile}`);

const y1932 = allEvents.filter(e => e.year === 1932);
console.log(`\n📅 1932年事件: ${y1932.length} 条`);

console.log('\n前10条:');
y1932.slice(0, 10).forEach((e, i) => {
  const date = e.month ? (e.day ? `${e.month}月${e.day}日` : `${e.month}月`) : '';
  console.log(`${i+1}. [${date}] ${e.location || '-'} | ${e.mainPerson || '-'} | ${e.category} | ${e.content.substring(0, 40)}...`);
});
