from pathlib import Path

APP_DIR = Path(__file__).resolve().parent.parent
EVENTS_CSV = APP_DIR / "events.csv"
USERS_CSV = APP_DIR / "users.csv"
REGISTRATIONS_CSV = APP_DIR / "registrations.csv"
STYLE_QSS = APP_DIR / "style.qss"

RESOURCES_DIR = APP_DIR / "resources"
PROFILE_PICS_DIR = RESOURCES_DIR / "profile_pics"
EVENT_IMGS_DIR = RESOURCES_DIR / "event_imgs"

# Logo / icon file paths
APP_LOGO = RESOURCES_DIR / "app_logo.png"
APP_ICON = RESOURCES_DIR / "app_icon.png"
FB_ICON = RESOURCES_DIR / "fb_icon.png"
IG_ICON = RESOURCES_DIR / "ig_icon.png"
LI_ICON = RESOURCES_DIR / "li_icon.png"

USER_FIELDS = ["uuid", "email", "password_hash", "role", "join_date", "first_name", "last_name", "org_name", "org_location", "org_description", "org_status", "profile_pic", "facebook", "instagram", "linkedin", "active"]
EVENT_FIELDS = ["id", "organizer_id", "title", "description", "location", "start_date", "end_date", "slots_available", "img"]
REGISTRATION_FIELDS = ["id", "volunteer_id", "event_id", "status", "participated", "rating"]
