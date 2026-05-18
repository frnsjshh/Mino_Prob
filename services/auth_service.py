import re
import uuid
import bcrypt
from datetime import date
from dataclasses import dataclass
from typing import Optional
from models.user import User, Volunteer, Organization

@dataclass
class AuthResult:
    success: bool
    message: str
    user: Optional[User] = None

class AuthService:
    EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

    def register_volunteer(self, email, password, confirm_password, first_name, last_name):
        return self._register(email, password, confirm_password, "volunteer", {"first_name": first_name, "last_name": last_name})

    def register_organization(self, email, password, confirm_password, org_name, org_location, org_desc):
        return self._register(email, password, confirm_password, "organization", {"org_name": org_name, "org_location": org_location, "org_description": org_desc})

    def _register(self, email: str, password: str, confirm_password: str, role: str, extra_data: dict) -> AuthResult:
        email = email.strip().lower()

        if not email or not self.EMAIL_PATTERN.match(email):
            return AuthResult(False, "Enter a valid email address.")
        if len(password) < 6:
            return AuthResult(False, "Password must be at least 6 characters.")
        if password != confirm_password:
            return AuthResult(False, "Passwords do not match.")

        users = User.load_from_csv()
        if any(u.email == email for u in users):
            return AuthResult(False, "Email is already registered.")

        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        user_uuid = str(uuid.uuid4())
        join_date = date.today().isoformat()

        if role == "volunteer":
            user = Volunteer(user_uuid, email, role, join_date, password_hash, extra_data.get("first_name",""), extra_data.get("last_name",""))
        else:
            user = Organization(user_uuid, email, role, join_date, password_hash, extra_data.get("org_name",""), extra_data.get("org_location",""), extra_data.get("org_description",""), "PENDING")
        
        user.save_to_csv()
        return AuthResult(True, "Account created. You can now log in.", user)

    def login_user(self, email: str, password: str) -> AuthResult:
        email = email.strip().lower()
        if not email or not password:
            return AuthResult(False, "Email and password are required.")

        users = User.load_from_csv()
        user = next((u for u in users if u.email == email), None)
        if user is None:
            return AuthResult(False, "Invalid email or password.")

        if not bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8")):
            return AuthResult(False, "Invalid email or password.")

        if user.active != 'True':
            return AuthResult(False, "This account has been deactivated. Contact admin.")

        return AuthResult(True, "Login successful.", user)
