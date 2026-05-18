from typing import List
from utils.constants import REGISTRATIONS_CSV, REGISTRATION_FIELDS
from utils.helpers import read_csv, save_record_to_csv

class Registration:
    def __init__(self, id_val: str, volunteer_id: str, event_id: str, status: str, participated: bool, rating: int):
        self.id = id_val
        self.volunteer_id = volunteer_id
        self.event_id = event_id
        self.status = status
        self.participated = participated
        self.rating = rating

    def update_status(self, new_status: str):
        self.status = new_status
        self.save_to_csv()

    def record_attendance(self, participated: bool):
        self.participated = participated
        self.save_to_csv()

    def save_to_csv(self):
        record = {
            "id": self.id,
            "volunteer_id": self.volunteer_id,
            "event_id": self.event_id,
            "status": self.status,
            "participated": str(self.participated),
            "rating": str(self.rating)
        }
        save_record_to_csv(REGISTRATIONS_CSV, REGISTRATION_FIELDS, record, 'id')

    @classmethod
    def load_from_csv(cls) -> List['Registration']:
        data = read_csv(REGISTRATIONS_CSV)
        regs = []
        for row in data:
            regs.append(Registration(
                row['id'], row['volunteer_id'], row['event_id'], row['status'],
                row.get('participated') == 'True', int(row.get('rating') or 0)
            ))
        return regs
