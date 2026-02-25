import re
import csv

# 核心目标人物清单
targets = ["傅雷", "黄節", "黄节", "蔡守", "胡韞玉", "胡韫玉", "狄平子", "潘飛聲", "潘飞声", "宣古愚", "陈叔通", "马公愚", "郑振铎", "陈柱", "陆丹林"]
# 第三方人物参考名单（用于关联分析）
peer_list = ["齐白石", "溥心畬", "张大千", "徐悲鸿", "庞薰琹", "夏丏尊", "柳亚子", "李叔同", "邓实", "宣愚公", "朱砚英"]

def get_hbh_loc(year):
    if year < 1907: return "安徽/金华"
    if year < 1937: return "上海"
    if year < 1948: return "北平"
    return "杭州"

results = []
current_year = 1865
current_month_day = ""

with open("/Users/DingkeKong/Desktop/黄賓虹年譜.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        # 匹配年份行
        year_match = re.search(r"公元(\d{4})年", line)
        if year_match:
            current_year = int(year_match.group(1))
            continue
        
        # 匹配日期行 (例如 11月19日)
        date_match = re.search(r"(\d{1,2})月(\d{1,2})[日|號]", line)
        if date_match:
            current_month_day = f"{date_match.group(1)}.{date_match.group(2)}"
        
        # 在每一行中搜索目标人物
        for target in targets:
            if target in line:
                # 提取上下文
                context = line.strip()
                if i+1 < len(lines): context += " " + lines[i+1].strip()
                
                # 识别第三方人物
                involved = [p for p in peer_list if p in context and p != target]
                
                # 判定交互类型
                it_type = "书信"
                if "访" in context or "晤" in context or "面" in context or "同游" in context: it_type = "见面"
                elif "画展" in context or "筹办" in context: it_type = "合作"
                elif "寄" in context or "赠" in context: it_type = "寄赠"
                elif "病逝" in context or "噩耗" in context or "挽" in context: it_type = "讣告"

                results.append({
                    "Date": f"{current_year}.{current_month_day}" if current_month_day else str(current_year),
                    "HBH_Loc": get_hbh_loc(current_year),
                    "Target_Name": target,
                    "Interaction_Type": it_type,
                    "Third_Party": " / ".join(involved),
                    "Context_Snippet": context[:200] # 截取一段详情
                })
                break # 避免同一行重复计入

# 写入CSV
with open("HBH_Social_Dynamic.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["Date", "HBH_Loc", "Target_Name", "Interaction_Type", "Third_Party", "Context_Snippet"])
    writer.writeheader()
    writer.writerows(results)

print(f"Extraction complete. Total records: {len(results)}")
