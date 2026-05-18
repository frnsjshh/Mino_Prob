# 🤝 TaraTulong — Volunteer Events Management System

> A professional desktop application for managing volunteer events, built with Python and PyQt6.

---

## 📖 About the Project

**TaraTulong** (Filipino for *"Let's go help"*) is a volunteer management system that connects organizations, volunteers, and administrators through a unified desktop interface. It allows organizations to post and manage volunteer events, volunteers to browse and register for opportunities, and admins to oversee all platform activity.

The application was built as a school project and evolved from a single monolithic script into a clean, modular, and maintainable PyQt6 desktop application following software engineering best practices.

---

## ✨ Features

### 👤 Role-Based Access
- **Admin** — Manages all users (approve/suspend organizations, view volunteers), oversees platform activity
- **Organization** — Creates and manages volunteer events, reviews applicants, marks attendance, and rates volunteers
- **Volunteer** — Browses and registers for events, tracks application history and personal ratings

### 🗂️ Core Functionality
- **Authentication** — Secure login and signup with bcrypt password hashing and email validation
- **Event Management** — Create, view, and manage volunteer events with images, location, date/time, and slot limits
- **Application Workflow** — Volunteers apply for events; organizations approve or reject applications
- **Attendance & Ratings** — Organizations can mark volunteer attendance and assign performance ratings
- **Profile Management** — Users can update their profile picture and link social media accounts (Facebook, Instagram, LinkedIn)
- **Help Dialog** — In-app support dialog accessible from the navigation bar

### 🎨 UI/UX
- Branded split-layout authentication screen
- Role-specific dashboards with sidebar navigation
- Custom QSS stylesheet for a consistent Teal/Orange/Yellow color palette
- Poppins + Inter typography system
- 16:9 event image cards

---

## 🏗️ Project Architecture

The project follows a clean **layered architecture**, separating concerns into distinct modules:

```
schoolprj/
│
├── main.py                  # Application entry point
├── style.qss                # Global Qt stylesheet
│
├── app/
│   └── core.py              # MainWindow orchestrator; handles page routing & login flow
│
├── models/                  # Data models (CSV-backed persistence)
│   ├── user.py              # User, Volunteer, Organization, Admin classes
│   ├── event.py             # Event model
│   └── registration.py      # Registration model
│
├── services/
│   └── auth_service.py      # Registration, login, bcrypt hashing logic
│
├── ui/
│   ├── components/          # Reusable UI components
│   │   ├── navbar.py        # Top navigation bar with role-aware controls
│   │   ├── branding_panel.py# Left branding panel on the auth screen
│   │   └── dialogs.py       # Reusable dialogs (Help, confirmations, etc.)
│   │
│   └── views/               # Full-page view screens
│       ├── auth.py          # Login & Signup pages
│       ├── volunteer_dash.py# Volunteer dashboard (browse events, history)
│       ├── org_dash.py      # Organization dashboard (manage events & applicants)
│       ├── admin_dash.py    # Admin dashboard (user management)
│       └── profile.py       # User profile page
│
├── utils/
│   ├── constants.py         # Central file paths and CSV field definitions
│   ├── helpers.py           # CSV read/write utilities
│   └── ui_helpers.py        # Shared UI utility functions
│
└── resources/               # Static assets
    ├── app_logo.png
    ├── app_icon.png
    ├── fb_icon.png
    ├── ig_icon.png
    ├── li_icon.png
    ├── profile_pics/        # User-uploaded profile pictures
    └── event_imgs/          # Event banner images
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| GUI Framework | PyQt6 |
| Password Security | bcrypt |
| Data Persistence | CSV files |
| Styling | Qt Style Sheets (QSS) |

> **Note:** No external database is required. All data is stored locally in `.csv` files (`users.csv`, `events.csv`, `registrations.csv`).

---

## 🚀 Getting Started

### Prerequisites

- Python **3.10** or higher
- `pip` package manager

### 1. Clone the repository

```bash
git clone https://github.com/your-username/taratulong.git
cd taratulong
```

### 2. Create and activate a virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install PyQt6 bcrypt
```

### 4. Run the application

```bash
python main.py
```

> On first launch, the app automatically seeds demo accounts so you can explore all roles immediately.

---

## 🔐 Demo Accounts

The application seeds the following test accounts on first run:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@test.com` | `password` |
| Volunteer | `vol1@test.com` | `password` |
| Volunteer | `vol2@test.com` | `password` |
| Organization (Approved) | `org1@test.com` | `password` |
| Organization (Pending) | `org2@test.com` | `password` |

---

## 📸 Screenshots

> *(Add screenshots of the login screen, dashboards, and event views here)*

---

## 📂 Data Storage

All persistent data is stored as flat CSV files in the project root:

| File | Contents |
|---|---|
| `users.csv` | All registered users (volunteers, organizations, admins) |
| `events.csv` | All volunteer events created by organizations |
| `registrations.csv` | Volunteer applications and attendance records |

To **reset** the application to a clean state, simply delete these three CSV files and restart — the app will re-seed the demo data automatically.

---

## 🗺️ Roadmap

- [ ] SQLite or PostgreSQL backend to replace CSV persistence
- [ ] Email notifications for application status updates
- [ ] Event search and filtering
- [ ] Export attendance/participation reports to PDF
- [ ] Map integration for event locations

---

## 🤝 Contributing

This is a school project. Contributions are not expected, but feel free to fork and extend it for your own learning.

---

## 📄 License

This project is for educational purposes. No license is applied.

---

<div align="center">
  Made with ❤️ for the Filipino community — <em>Tara, tulong na!</em>
</div>
