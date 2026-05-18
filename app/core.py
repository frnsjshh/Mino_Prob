import uuid
import bcrypt
from datetime import date
from PyQt6.QtWidgets import QMainWindow, QWidget, QVBoxLayout, QStackedWidget

from utils.constants import USERS_CSV, EVENTS_CSV, REGISTRATIONS_CSV, USER_FIELDS, EVENT_FIELDS, REGISTRATION_FIELDS, PROFILE_PICS_DIR
from utils.helpers import write_csv
from models.user import User, Admin, Volunteer, Organization
from services.auth_service import AuthService
from ui.components.navbar import Navbar
from ui.components.dialogs import HelpDialog
from ui.views.auth import LoginPage, SignupPage
from ui.views.volunteer_dash import VolunteerDashboard
from ui.views.org_dash import OrgDashboard
from ui.views.admin_dash import AdminDashboard
from ui.views.profile import ProfilePage


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("TaraTulong Volunteer Events")
        self.resize(1180, 760)
        self.auth_service = AuthService()

        root = QWidget()
        root_layout = QVBoxLayout(root)
        self.setCentralWidget(root)

        self.navbar = Navbar()
        root_layout.addWidget(self.navbar)

        self.pages = QStackedWidget()
        self.login_page = LoginPage(self.auth_service)
        self.signup_page = SignupPage(self.auth_service)
        
        self.pages.addWidget(self.login_page)
        self.pages.addWidget(self.signup_page)
        root_layout.addWidget(self.pages, stretch=1)

        self.navbar.home_requested.connect(self.show_dashboard)
        self.navbar.profile_requested.connect(self.show_profile)
        self.navbar.help_requested.connect(self.show_help)
        self.navbar.logout_requested.connect(self.logout)
        self.login_page.signup_requested.connect(lambda: self.pages.setCurrentWidget(self.signup_page))
        self.signup_page.login_requested.connect(lambda: self.pages.setCurrentWidget(self.login_page))
        
        self.login_page.login_successful.connect(self.handle_login)
        self.signup_page.signup_successful.connect(self.handle_login)

        self.current_user = None

    def handle_login(self, user: User):
        self.current_user = user
        self.navbar.hide_nav(False)
        
        if isinstance(user, Admin):
            self.dash = AdminDashboard(user)
        elif isinstance(user, Volunteer):
            self.dash = VolunteerDashboard(user)
        else:
            self.dash = OrgDashboard(user)
        
        self.profile_page = ProfilePage(user)
            
        self.pages.addWidget(self.dash)
        self.pages.addWidget(self.profile_page)
        self.pages.setCurrentWidget(self.dash)

    def show_dashboard(self):
        if hasattr(self, 'dash'):
            if isinstance(self.dash, AdminDashboard):
                self.dash.refresh()
            self.pages.setCurrentWidget(self.dash)

    def show_profile(self):
        if hasattr(self, 'profile_page'):
            self.pages.setCurrentWidget(self.profile_page)

    def show_help(self):
        if self.current_user:
            dlg = HelpDialog(self.current_user.email, self)
            dlg.exec()

    def logout(self):
        self.current_user = None
        self.navbar.hide_nav(True)
        if hasattr(self, 'dash'):
            self.pages.removeWidget(self.dash)
            self.dash.deleteLater()
            delattr(self, 'dash')
        if hasattr(self, 'profile_page'):
            self.pages.removeWidget(self.profile_page)
            self.profile_page.deleteLater()
            delattr(self, 'profile_page')
        self.pages.setCurrentWidget(self.login_page)

def init_dummy_data():
    if not USERS_CSV.exists() or not EVENTS_CSV.exists() or not REGISTRATIONS_CSV.exists():
        USERS_CSV.parent.mkdir(parents=True, exist_ok=True)
        PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)
        
        write_csv(USERS_CSV, USER_FIELDS, [])
        write_csv(EVENTS_CSV, EVENT_FIELDS, [])
        write_csv(REGISTRATIONS_CSV, REGISTRATION_FIELDS, [])
        
        # Seed admin (not through AuthService — hardcoded)
        admin_hash = bcrypt.hashpw("password".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        admin = Admin(str(uuid.uuid4()), "admin@test.com", "admin", date.today().isoformat(), admin_hash, "System", "Admin")
        admin.save_to_csv()
        
        auth = AuthService()
        auth.register_volunteer("vol1@test.com", "password", "password", "Juan", "Dela Cruz")
        auth.register_volunteer("vol2@test.com", "password", "password", "Maria", "Clara")
        
        # Org 1 — manually set to APPROVED for testing
        org_res = auth.register_organization("org1@test.com", "password", "password", "Bayanihan Foundation", "Quezon City", "Helping communities")
        if org_res.user and isinstance(org_res.user, Organization):
            org_res.user.status = "APPROVED"
            org_res.user.save_to_csv()
            org_res.user.create_event({
                "title": "Community Pantry",
                "description": "Help distribute food.",
                "location": "QC Circle",
                "start_date": "2026-05-01 08:00",
                "end_date": "2026-05-01 12:00",
                "slots_available": 10,
                "img": ""
            })
            org_res.user.create_event({
                "title": "River Clean up",
                "description": "Cleaning the local river.",
                "location": "Pasig River",
                "start_date": "2026-05-02 06:00",
                "end_date": "2026-05-02 10:00",
                "slots_available": 20,
                "img": ""
            })
        
        # Org 2 — stays PENDING
        auth.register_organization("org2@test.com", "password", "password", "Tulong Kabataan", "Manila", "Youth empowerment programs")
