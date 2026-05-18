from typing import List
from utils.constants import EVENTS_CSV, EVENT_FIELDS
from utils.helpers import read_csv, save_record_to_csv

class Event:
    def __init__(self, id_val: str, organizer_id: str, title: str, description: str, location: str, start_date: str, end_date: str, slots_available: int, img: str):
        self.id = id_val
        self.organizer_id = organizer_id
        self.title = title
        self.description = description
        self.location = location
        self.start_date = start_date
        self.end_date = end_date
        self.slots_available = int(slots_available)
        self.img = img

    def is_full(self) -> bool:
        return self.slots_available <= 0

    def decrement_slots(self):
        if self.slots_available > 0:
            self.slots_available -= 1
            self.save_to_csv()

    def save_to_csv(self):
        record = {
            "id": self.id,
            "organizer_id": self.organizer_id,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "slots_available": str(self.slots_available),
            "img": self.img
        }
        save_record_to_csv(EVENTS_CSV, EVENT_FIELDS, record, 'id')

    @classmethod
    def load_from_csv(cls) -> List['Event']:
        data = read_csv(EVENTS_CSV)
        events = []
        for row in data:
            events.append(Event(
                row['id'], row['organizer_id'], row['title'], row['description'],
                row['location'], row.get('start_date', ''), row.get('end_date', ''), row.get('slots_available', 0), row.get('img', '')
            ))
        return events
