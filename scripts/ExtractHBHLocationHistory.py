import csv
import json
import os

class HBHLocationExtractor:
    def __init__(self, input_csv):
        self.input_csv = input_csv
        self.output_json = "frontend/public/data/hbh_location_history.json"
        self.START_DATE = "1930.01.01"
        self.END_DATE = "1955.03.25"

    def normalize_date(self, date_str):
        parts = date_str.split('.')
        y = parts[0]
        m = parts[1].zfill(2) if len(parts) > 1 else "01"
        d = parts[2].zfill(2) if len(parts) > 2 else "01"
        return f"{y}.{m}.{d}"

    def run(self):
        if not os.path.exists(self.input_csv): return
        
        with open(self.input_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        history = []
        current_loc = ""
        
        # 初始狀態校準（1930年他在上海）
        history.append({"date": "1930.01.01", "loc": "上海"})
        current_loc = "上海"

        for row in rows:
            date = self.normalize_date(row['Exact_Date'])
            loc = row['Master_Location']
            
            if date < self.START_DATE:
                if loc: current_loc = loc # 追蹤到1930年前的最後位置
                continue
            if date > self.END_DATE: break

            if loc and loc != current_loc:
                current_loc = loc
                history.append({
                    "date": date,
                    "loc": loc,
                    "summary": f"黄賓虹移居{loc}"
                })

        # 確保終點
        history.append({"date": "1955.03.25", "loc": current_loc, "summary": "黄賓虹辭世"})

        with open(self.output_json, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
        
        print(f"HBH Location History Extracted. Total: {len(history)} change points.")

if __name__ == "__main__":
    extractor = HBHLocationExtractor("data/HBH_Full_Chronology_Master.csv")
    extractor.run()
