import csv
from pathlib import Path
from typing import List, Dict

def read_csv(path: Path) -> List[Dict]:
    if not path.exists():
        return []
    with path.open('r', newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        return list(reader)

def write_csv(path: Path, fieldnames: List[str], data: List[Dict]):
    with path.open('w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

def save_record_to_csv(path: Path, fieldnames: List[str], record: Dict, key_field: str):
    data = read_csv(path)
    updated = False
    for i, row in enumerate(data):
        if row.get(key_field) == record.get(key_field):
            data[i] = record
            updated = True
            break
    if not updated:
        data.append(record)
    write_csv(path, fieldnames, data)
