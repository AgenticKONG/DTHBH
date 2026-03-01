import csv
import os
import json

MASTER_PATH = '/Users/DingkeKong/Desktop/KDK/DTHBH/data/HBH_Full_Chronology_Master.csv'
LOG_DIR = '/Users/DingkeKong/Desktop/KDK/DTHBH/scripts/logs'
LOG_PATH = os.path.join(LOG_DIR, 'FixMasterChronology.log.json')

def fix_data():
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR)

    rows = []
    changes = []
    
    with open(MASTER_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        for row in reader:
            id_year = row['Event_ID'][1:5]
            date_parts = row['Exact_Date'].split('.')
            date_year = date_parts[0]
            
            if id_year != date_year and id_year.isdigit():
                old_date = row['Exact_Date']
                # 保持原有的月日/季節，僅替換年份
                new_date = id_year + ('.' + '.'.join(date_parts[1:]) if len(date_parts) > 1 else '')
                row['Exact_Date'] = new_date
                changes.append({
                    "id": row['Event_ID'],
                    "old": old_date,
                    "new": new_date,
                    "summary": row['Summary_Text'][:30] + '...'
                })
            rows.append(row)

    # 寫回基座數據 (SOT)
    with open(MASTER_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # 記錄日誌 (Agreement 3)
    log_data = {
        "status": "success",
        "total_processed": len(rows),
        "total_fixed": len(changes),
        "sample_changes": changes[:10]
    }
    with open(LOG_PATH, 'w', encoding='utf-8') as f:
        json.dump(log_data, f, ensure_ascii=False, indent=2)
    
    return log_data

if __name__ == "__main__":
    result = fix_data()
    print(f"校準完成。共處理 {result['total_processed']} 條，修正 {result['total_fixed']} 條。")
    print("前 5 條修正預覽：")
    for c in result['sample_changes'][:5]:
        print(f"ID: {c['id']} | {c['old']} -> {c['new']}")
