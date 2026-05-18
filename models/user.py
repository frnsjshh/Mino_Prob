import uuid
from typing import List
from models.registration import Registration
from models.event import Event
from utils.constants import USERS_CSV, USER_FIELDS
from utils.helpers import read_csv, save_record_to_csv

class User:
    def __init__(self, uuid_val: str, email: str, role: str, join_date: str, password_hash: str,
                 profile_pic: str = '', facebook: str = '', instagram: str = '', linkedin: str = '', active: str = 'True'):
        self.uuid = uuid_val
        self.email = email
        self.role = role
        self.join_date = join_date
        self.password_hash = password_hash
        self.profile_pic = profile_pic
        self.facebook = facebook
        self.instagram = instagram
        self.linkedin = linkedin
        self.active = active if active else 'True'

    def save_to_csv(self):
        record = {
            "uuid": self.uuid,
            "email": self.email,
            "password_hash": self.password_hash,
            "role": self.role,
            "join_date": self.join_date,
            "first_name": getattr(self, 'first_name', ''),
            "last_name": getattr(self, 'last_name', ''),
            "org_name": getattr(self, 'name', ''),
            "org_location": getattr(self, 'location', ''),
            "org_description": getattr(self, 'description', ''),
            "org_status": getattr(self, 'status', ''),
            "profile_pic": self.profile_pic,
            "facebook": self.facebook,
            "instagram": self.instagram,
            "linkedin": self.linkedin,
            "active": self.active
        }
        save_record_to_csv(USERS_CSV, USER_FIELDS, record, 'uuid')

    @classmethod
    def load_from_csv(cls) -> List['User']:
        data = read_csv(USERS_CSV)
        users = []
        for row in data:
            extra = (row.get('profile_pic',''), row.get('facebook',''), row.get('instagram',''), row.get('linkedin',''), row.get('active','True'))
            if row.get('role') == 'volunteer':
                u = Volunteer(row['uuid'], row['email'], row['role'], row['join_date'], row['password_hash'],
                              row.get('first_name',''), row.get('last_name',''), *extra)
            elif row.get('role') == 'organization':
                u = Organization(row['uuid'], row['email'], row['role'], row['join_date'], row['password_hash'],
                                 row.get('org_name',''), row.get('org_location',''), row.get('org_description',''), row.get('org_status',''), *extra)
            elif row.get('role') == 'admin':
                u = Admin(row['uuid'], row['email'], row['role'], row['join_date'], row['password_hash'],
                          row.get('first_name',''), row.get('last_name',''), *extra)
            else:
                u = User(row['uuid'], row['email'], row['role'], row['join_date'], row['password_hash'], *extra)
            users.append(u)
        return users


class Volunteer(User):
    def __init__(self, uuid_val: str, email: str, role: str, join_date: str, password_hash: str,
                 first_name: str, last_name: str,
                 profile_pic: str = '', facebook: str = '', instagram: str = '', linkedin: str = '', active: str = 'True'):
        super().__init__(uuid_val, email, role, join_date, password_hash, profile_pic, facebook, instagram, linkedin, active)
        self.first_name = first_name
        self.last_name = last_name

    def apply_for_event(self, event: Event):
        if not event.is_full():
            reg = Registration(str(uuid.uuid4()), self.uuid, event.id, "PENDING", False, 0)
            reg.save_to_csv()
            event.decrement_slots()
            return True
        return False

    def view_history(self) -> List[Registration]:
        regs = Registration.load_from_csv()
        return [r for r in regs if r.volunteer_id == self.uuid]

    def get_attendance_rating(self) -> float:
        regs = Registration.load_from_csv()
        my_regs = [r for r in regs if r.volunteer_id == self.uuid and r.status == "APPROVED"]
        if not my_regs:
            return 0.0
        present = sum(1 for r in my_regs if r.participated)
        return (present / len(my_regs)) * 100

    def get_average_rating(self) -> float:
        regs = Registration.load_from_csv()
        my_ratings = [r.rating for r in regs if r.volunteer_id == self.uuid and r.status == "APPROVED" and r.rating > 0]
        if not my_ratings:
            return 0.0
        return sum(my_ratings) / len(my_ratings)


class Organization(User):
    def __init__(self, uuid_val: str, email: str, role: str, join_date: str, password_hash: str,
                 name: str, location: str, description: str, status: str,
                 profile_pic: str = '', facebook: str = '', instagram: str = '', linkedin: str = '', active: str = 'True'):
        super().__init__(uuid_val, email, role, join_date, password_hash, profile_pic, facebook, instagram, linkedin, active)
        self.name = name
        self.location = location
        self.description = description
        self.status = status

    def create_event(self, event_details: dict):
        event = Event(
            id_val=str(uuid.uuid4()),
            organizer_id=self.uuid,
            title=event_details.get("title", ""),
            description=event_details.get("description", ""),
            location=event_details.get("location", ""),
            start_date=event_details.get("start_date", ""),
            end_date=event_details.get("end_date", ""),
            slots_available=int(event_details.get("slots_available", 0)),
            img=event_details.get("img", "")
        )
        event.save_to_csv()

    def review_applications(self, event_id: str) -> List[Registration]:
        regs = Registration.load_from_csv()
        return [r for r in regs if r.event_id == event_id]


class Admin(User):
    def __init__(self, uuid_val: str, email: str, role: str, join_date: str, password_hash: str,
                 first_name: str, last_name: str,
                 profile_pic: str = '', facebook: str = '', instagram: str = '', linkedin: str = '', active: str = 'True'):
        super().__init__(uuid_val, email, role, join_date, password_hash, profile_pic, facebook, instagram, linkedin, active)
        self.first_name = first_name
        self.last_name = last_name
