import csv
import json
import os
import re

class SoulmateRefiner:
    def __init__(self, input_csv):
        self.input_csv = input_csv
        self.output_json = "frontend/public/data/soulmate_ribbon_data.json"
        self.HBH_DEATH = "1955.03.25"
        self.targets = {
            "許承堯": ["許承堯", "許疑庵", "疑庵"],
            "陳柱": ["陳柱", "陳柱尊", "柱尊"],
            "黃節": ["黃節", "黃晦聞", "晦聞"]
        }
        
    def normalize_date(self, date_str):
        parts = date_str.split('.')
        y = parts[0]
        m = parts[1].zfill(2) if len(parts) > 1 else "01"
        d = parts[2].zfill(2) if len(parts) > 2 else "01"
        return f"{y}.{m}.{d}"

    def run(self):
        with open(self.input_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            rows = list(reader)

        results = {}
        for name in self.targets: results[name] = []

        for row in rows:
            date_raw = row['Exact_Date']
            norm_date = self.normalize_date(date_raw)
            if norm_date > self.HBH_DEATH: continue

            summary = row['Summary_Text']
            details = row['Details_Evidence']
            full_text = row['Primary_Figure'] + summary + details

            for name, keywords in self.targets.items():
                if any(k in full_text for k in keywords) or row['Primary_Figure'] == name:
                    # 極強書信識別
                    action_full = row['Subject_Action'] + summary
                    letter_kws = ["書信", "函", "寄", "致", "來信", "信", "札", "柬", "復", "報", "答", "寄書", "致書", "手教", "手札"]
                    is_letter = any(x in action_full for x in letter_kws)
                    
                    results[name].append({
                        "date": date_raw,
                        "norm_date": norm_date,
                        "hbh_loc": row['Master_Location'] or "",
                        "friend_loc": "上海" if is_letter else "",
                        "topic": "藝術交流",
                        "is_echo": False,
                        "quote": re.findall(r'[「“](.*?)[」”]', details)[0] if re.findall(r'[「“](.*?)[」”]', details) else "",
                        "summary": summary,
                        "details": details,
                        "Artifact_Refs": row.get('Artifact_Refs', ''),
                        "is_letter": is_letter
                    })

        for name in results:
            results[name].append({
                "date": "1955.03.25", "norm_date": "1955.03.25", "hbh_loc": "杭州", "friend_loc": "杭州",
                "topic": "物理終點", "is_echo": False, "is_letter": False,
                "summary": "黃賓虹於杭州逝世。", "details": "哲人萎謝，知音永隔。", "is_letter": False
            })
            results[name].sort(key=lambda x: x['norm_date'])

        with open(self.output_json, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print("General Soulmate Data V12.0 Restored.")

if __name__ == "__main__":
    refiner = SoulmateRefiner("data/HBH_Full_Chronology_Master.csv")
    refiner.run()
