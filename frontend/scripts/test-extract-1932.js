const fs = require('fs');

const inputFile = '/Users/erickong/Desktop/黄賓虹年譜-from-doc.txt';

const BIRTH_YEAR = 1865;
const DEATH_YEAR = 1955;
const TARGET_YEAR = 1932;

const CITIES = ['上海', '杭州', '北平', '北京', '南京', '苏州', '金华', '宁波', '绍兴', '嘉兴', '湖州', '成都', '重庆', '乐山', '嘉定', '宜宾', '广州', '香港', '天津', '济南', '青岛', '大连', '沈阳', '长春', '哈尔滨', '西安', '兰州', '敦煌', '洛阳', '开封', '郑州', '武汉', '长沙', '南昌', '福州', '厦门', '桂林', '南宁', '黄山', '庐山', '泰山', '华山', '衡山', '嵩山', '莫干山', '天目山', '歙县', '徽州', '屯溪', '休宁', '祁门', '黟县', '浙东', '浙西', '江南', '虹口', '静安寺', '西泠'];

const content = fs.readFileSync(inputFile, 'utf-8');

let inMainSection = false;
let currentYear = null;
let currentEra = null;
let currentAge = null;

const events = [];
let currentEvent = null;
let lastLocation = null;

const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('黄賓虹年譜') && !inMainSection) {
    inMainSection = true;
    continue;
  }
  
  if (!inMainSection) continue;
  
  if (currentYear && (line.includes('初版後記') || line.includes('主要參考書目'))) {
    break;
  }
  
  const yearMatch = line.match(/^公元(\d{4})年/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    if (year >= BIRTH_YEAR && year <= DEATH_YEAR) {
      if (currentEvent && currentEvent.content) {
        events.push(currentEvent);
      }
      currentYear = year;
      currentEra = line.includes('民國') ? '民國' : (line.includes('新中國') ? '新中國' : '晚清');
      const ageMatch = line.match(/(\d+)歲/);
      currentAge = ageMatch ? parseInt(ageMatch[1]) : (year - BIRTH_YEAR);
      lastLocation = null;
      currentEvent = null;
      continue;
    }
  }
  
  if (currentYear !== TARGET_YEAR) continue;
  
  if (line.length < 3) continue;
  
  const isAnnotation = line.startsWith('按：') || line.startsWith('按:');
  const isPureQuote = line.startsWith('《') || line.startsWith('[') || line.startsWith('（') || line.startsWith('「');
  
  const dateMatch = line.match(/^(\d{1,2})月(\d{1,2})日(.+)/);
  const monthOnlyMatch = line.match(/^(\d{1,2})月(.+)/);
  
  if (dateMatch || monthOnlyMatch || !line.includes(',')) {
    if (currentEvent && currentEvent.content) {
      events.push(currentEvent);
    }
    
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
    } else if (!line.includes(',')) {
      eventContent = line;
    }
    
    if (eventContent && eventContent.length > 2 && !isPureQuote) {
      let location = null;
      for (const city of CITIES) {
        if (eventContent.includes(city)) {
          location = city;
          break;
        }
      }
      if (!location && lastLocation && (eventContent.includes('仍') || eventContent.includes('继续'))) {
        location = lastLocation;
      }
      if (location) lastLocation = location;
      
      currentEvent = {
        year: currentYear,
        era: currentEra,
        age: currentAge,
        month: month,
        day: day,
        content: eventContent,
        location: location || lastLocation,
        isAnnotation: isAnnotation,
        rawLines: [line]
      };
    }
  } else if (currentEvent && !isAnnotation && !isPureQuote) {
    currentEvent.content += ' ' + line;
    currentEvent.rawLines.push(line);
  }
}

if (currentEvent && currentEvent.content) {
  events.push(currentEvent);
}

console.log(`1932年共提取 ${events.length} 条原始事件:\n`);
events.forEach((e, i) => {
  const date = e.month ? (e.day ? `${e.month}月${e.day}日` : `${e.month}月`) : '';
  console.log(`${i+1}. [${date}] ${e.location || '-'} | ${e.content.substring(0, 50)}...`);
});
