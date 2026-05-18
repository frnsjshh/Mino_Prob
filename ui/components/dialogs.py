import uuid
import shutil
from pathlib import Path
from PyQt6.QtCore import Qt, pyqtSignal, QDateTime, QUrl
from PyQt6.QtGui import QFont, QDesktopServices
from PyQt6.QtWidgets import (
    QDialog, QFormLayout, QLineEdit, QTextEdit, QDateTimeEdit,
    QWidget, QHBoxLayout, QLabel, QPushButton, QMessageBox,
    QFileDialog, QVBoxLayout, QFrame, QTableWidget, QTableWidgetItem, QHeaderView
)

from models.user import Organization, Volunteer, User
from models.event import Event
from models.registration import Registration
from utils.constants import EVENT_IMGS_DIR, FB_ICON, IG_ICON, LI_ICON
from utils.ui_helpers import get_cropped_pixmap, make_event_img, make_social_widget


class CreateEventDialog(QDialog):
    def __init__(self, org: Organization, parent=None):
        super().__init__(parent)
        self.org = org
        self.selected_img_path = ""
        self.setWindowTitle("Create Event")
        layout = QFormLayout(self)
        
        self.title_input = QLineEdit()
        self.desc_input = QTextEdit()
        self.loc_input = QLineEdit()
        
        self.start_input = QDateTimeEdit()
        self.start_input.setCalendarPopup(True)
        self.start_input.setMinimumDateTime(QDateTime.currentDateTime())
        self.end_input = QDateTimeEdit()
        self.end_input.setCalendarPopup(True)
        self.end_input.setMinimumDateTime(QDateTime.currentDateTime())
        
        self.start_input.dateTimeChanged.connect(self.end_input.setMinimumDateTime)
        
        self.slots_input = QLineEdit()
        
        # Image picker
        img_w = QWidget()
        img_lay = QHBoxLayout(img_w)
        img_lay.setContentsMargins(0, 0, 0, 0)
        self.img_preview = QLabel("No image selected")
        self.img_preview.setFixedSize(160, 90)
        self.img_preview.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.img_preview.setObjectName("ImagePlaceholder")
        img_btn = QPushButton("Browse...")
        img_btn.clicked.connect(self._pick_image)
        img_lay.addWidget(self.img_preview)
        img_lay.addWidget(img_btn)
        
        layout.addRow("Title:", self.title_input)
        layout.addRow("Description:", self.desc_input)
        layout.addRow("Location:", self.loc_input)
        layout.addRow("Start Date:", self.start_input)
        layout.addRow("End Date:", self.end_input)
        layout.addRow("Slots Available:", self.slots_input)
        layout.addRow("Event Image:", img_w)
        
        self.submit_btn = QPushButton("Create")
        self.submit_btn.clicked.connect(self._submit)
        layout.addRow(self.submit_btn)
    
    def _pick_image(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select Event Image", "", "Images (*.png *.jpg *.jpeg *.bmp)")
        if file_path:
            self.selected_img_path = file_path
            self.img_preview.setPixmap(get_cropped_pixmap(file_path, 160, 90))
        
    def _submit(self):
        if self.start_input.dateTime() > self.end_input.dateTime():
            QMessageBox.warning(self, "Error", "Start date cannot be after the end date.")
            return
            
        try:
            slots = int(self.slots_input.text())
        except:
            QMessageBox.warning(self, "Error", "Slots must be a number")
            return
        
        # Copy image to resources
        img_dest = ""
        if self.selected_img_path:
            EVENT_IMGS_DIR.mkdir(parents=True, exist_ok=True)
            event_id = str(uuid.uuid4())
            ext = Path(self.selected_img_path).suffix
            dest = EVENT_IMGS_DIR / f"{event_id}{ext}"
            shutil.copy2(self.selected_img_path, dest)
            img_dest = str(dest)
        else:
            event_id = str(uuid.uuid4())
            
        self.org.create_event({
            "title": self.title_input.text(),
            "description": self.desc_input.toPlainText(),
            "location": self.loc_input.text(),
            "start_date": self.start_input.dateTime().toString("yyyy-MM-dd HH:mm"),
            "end_date": self.end_input.dateTime().toString("yyyy-MM-dd HH:mm"),
            "slots_available": slots,
            "img": img_dest
        })
        self.accept()


class EventDetailDialog(QDialog):
    """Popup showing full event details and org info."""
    applied = pyqtSignal()
    
    def __init__(self, event: Event, volunteer: Volunteer, parent=None):
        super().__init__(parent)
        self.event = event
        self.volunteer = volunteer
        self.setWindowTitle(event.title)
        self.setMinimumWidth(520)
        layout = QVBoxLayout(self)
        layout.setSpacing(14)
        
        # Event image
        layout.addWidget(make_event_img(event.img, 520, 293))
        
        # Title
        title = QLabel(event.title)
        title.setFont(QFont("Poppins", 28, QFont.Weight.Bold))
        title.setWordWrap(True)
        layout.addWidget(title)
        
        # Meta row
        meta_lay = QHBoxLayout()
        loc_label = QLabel(f"📍 {event.location}")
        loc_label.setStyleSheet("color: #2DA3A9; font-weight: 600;")
        slots_label = QLabel(f"🎟 {event.slots_available} slots left")
        slots_label.setStyleSheet("color: #2E9E6F; font-weight: 600;")
        meta_lay.addWidget(loc_label)
        meta_lay.addWidget(slots_label)
        meta_lay.addStretch()
        layout.addLayout(meta_lay)
        
        # Dates
        dates_lay = QHBoxLayout()
        start_l = QLabel(f"🕐 Start: {event.start_date}")
        end_l = QLabel(f"🏁 End: {event.end_date}")
        start_l.setStyleSheet("color: #5A6B7B;")
        end_l.setStyleSheet("color: #5A6B7B;")
        dates_lay.addWidget(start_l)
        dates_lay.addWidget(end_l)
        dates_lay.addStretch()
        layout.addLayout(dates_lay)
        
        # Description
        desc_title = QLabel("About this Event")
        desc_title.setObjectName("FieldLabel")
        layout.addWidget(desc_title)
        desc = QLabel(event.description)
        desc.setWordWrap(True)
        desc.setStyleSheet("color: #5A6B7B; line-height: 1.5;")
        layout.addWidget(desc)
        
        # Org info
        users = User.load_from_csv()
        org = next((u for u in users if isinstance(u, Organization) and u.uuid == event.organizer_id), None)
        if org:
            sep = QFrame()
            sep.setFrameShape(QFrame.Shape.HLine)
            sep.setStyleSheet("color: #E1E8ED;")
            layout.addWidget(sep)
            
            org_title = QLabel("Organized by")
            org_title.setObjectName("FieldLabel")
            layout.addWidget(org_title)
            
            org_info = QHBoxLayout()
            org_pic = QLabel()
            org_pic.setFixedSize(48, 48)
            org_pic.setStyleSheet("border-radius: 24px; background: #EEF2F4; border: 2px solid #6FD3D8;")
            org_pic.setAlignment(Qt.AlignmentFlag.AlignCenter)
            if org.profile_pic and Path(org.profile_pic).exists():
                org_pic.setPixmap(get_cropped_pixmap(org.profile_pic, 48, 48))
            else:
                org_pic.setText("🏢")
            org_info.addWidget(org_pic)
            
            org_text = QVBoxLayout()
            org_name = QLabel(org.name)
            org_name.setFont(QFont("Poppins", 18, QFont.Weight.DemiBold))
            org_text.addWidget(org_name)
            org_text.addWidget(QLabel(f"📧 {org.email}"))
            if org.location:
                org_text.addWidget(QLabel(f"📍 {org.location}"))
            org_info.addLayout(org_text)
            org_info.addStretch()
            layout.addLayout(org_info)
            
            # Org social links
            if org.facebook:
                layout.addWidget(make_social_widget(FB_ICON, org.facebook))
            if org.instagram:
                layout.addWidget(make_social_widget(IG_ICON, org.instagram))
            if org.linkedin:
                layout.addWidget(make_social_widget(LI_ICON, org.linkedin))
        
        # Buttons
        btn_lay = QHBoxLayout()
        btn_lay.addStretch()
        apply_btn = QPushButton("Apply Now")
        apply_btn.setObjectName("AuthPrimaryButton")
        apply_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        apply_btn.clicked.connect(self._apply)
        close_btn = QPushButton("Close")
        close_btn.clicked.connect(self.reject)
        btn_lay.addWidget(close_btn)
        btn_lay.addWidget(apply_btn)
        layout.addLayout(btn_lay)
        
    def _apply(self):
        if self.volunteer.apply_for_event(self.event):
            QMessageBox.information(self, "Success", "Applied successfully!")
            self.applied.emit()
            self.accept()
        else:
            QMessageBox.warning(self, "Error", "Event is full!")


class VolunteerProfileDialog(QDialog):
    """Shows a volunteer's profile info, social links, and event history."""
    def __init__(self, volunteer: Volunteer, parent=None):
        super().__init__(parent)
        self.setWindowTitle(f"Profile — {volunteer.first_name} {volunteer.last_name}")
        self.setMinimumWidth(500)
        layout = QVBoxLayout(self)
        layout.setSpacing(14)
        
        # Header with photo and name
        h_lay = QHBoxLayout()
        pic = QLabel()
        pic.setFixedSize(64, 64)
        pic.setStyleSheet("border-radius: 32px; background: #EEF2F4; border: 2px solid #6FD3D8;")
        pic.setAlignment(Qt.AlignmentFlag.AlignCenter)
        if volunteer.profile_pic and Path(volunteer.profile_pic).exists():
            pic.setPixmap(get_cropped_pixmap(volunteer.profile_pic, 64, 64))
        else:
            pic.setText("👤")
        h_lay.addWidget(pic)
        
        info_lay = QVBoxLayout()
        name_label = QLabel(f"{volunteer.first_name} {volunteer.last_name}")
        name_label.setFont(QFont("Poppins", 20, QFont.Weight.DemiBold))
        info_lay.addWidget(name_label)
        info_lay.addWidget(QLabel(f"📧 {volunteer.email}"))
        info_lay.addWidget(QLabel(f"📅 Joined: {volunteer.join_date}"))
        h_lay.addLayout(info_lay)
        h_lay.addStretch()
        layout.addLayout(h_lay)
        
        # Social links
        has_socials = volunteer.facebook or volunteer.instagram or volunteer.linkedin
        if has_socials:
            sep = QLabel("Social Media")
            sep.setObjectName("FieldLabel")
            layout.addWidget(sep)
            if volunteer.facebook:
                layout.addWidget(make_social_widget(FB_ICON, volunteer.facebook))
            if volunteer.instagram:
                layout.addWidget(make_social_widget(IG_ICON, volunteer.instagram))
            if volunteer.linkedin:
                layout.addWidget(make_social_widget(LI_ICON, volunteer.linkedin))
        else:
            layout.addWidget(QLabel("No social media links provided."))
        
        # Stats
        stats_lay = QHBoxLayout()
        att_label = QLabel(f"Attendance: {volunteer.get_attendance_rating():.1f}%")
        att_label.setStyleSheet("background: #EEF2F4; color: #2E9E6F; padding: 10px 16px; border-radius: 10px; font-weight: 700; font-size: 14px;")
        rat_label = QLabel(f"Avg Rating: {volunteer.get_average_rating():.1f} ★")
        rat_label.setStyleSheet("background: #F8D27A; color: #1F2D3D; padding: 10px 16px; border-radius: 10px; font-weight: 700; font-size: 14px;")
        stats_lay.addWidget(att_label)
        stats_lay.addWidget(rat_label)
        stats_lay.addStretch()
        layout.addLayout(stats_lay)
        
        # Event history
        history_label = QLabel("Event History (Approved)")
        history_label.setObjectName("FieldLabel")
        layout.addWidget(history_label)
        
        regs = Registration.load_from_csv()
        events = Event.load_from_csv()
        event_map = {e.id: e for e in events}
        approved_regs = [r for r in regs if r.volunteer_id == volunteer.uuid and r.status == "APPROVED"]
        
        if approved_regs:
            hist_table = QTableWidget()
            hist_table.setColumnCount(3)
            hist_table.setHorizontalHeaderLabels(["Event", "Date", "Attended"])
            hist_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
            hist_table.setRowCount(len(approved_regs))
            for i, reg in enumerate(approved_regs):
                ev = event_map.get(reg.event_id)
                hist_table.setItem(i, 0, QTableWidgetItem(ev.title if ev else "Unknown"))
                hist_table.setItem(i, 1, QTableWidgetItem(ev.start_date if ev else "—"))
                attended = "✅ Present" if reg.participated else "❌ Absent"
                hist_table.setItem(i, 2, QTableWidgetItem(attended))
            hist_table.setMaximumHeight(200)
            layout.addWidget(hist_table)
        else:
            layout.addWidget(QLabel("  No approved event history yet."))
        
        close_btn = QPushButton("Close")
        close_btn.clicked.connect(self.accept)
        layout.addWidget(close_btn, alignment=Qt.AlignmentFlag.AlignRight)


class HelpDialog(QDialog):
    """Compose and send a complaint/help email to admin."""
    def __init__(self, user_email: str, parent=None):
        super().__init__(parent)
        self.user_email = user_email
        self.setWindowTitle("Contact Admin — Help")
        self.setMinimumWidth(440)
        layout = QVBoxLayout(self)
        layout.setSpacing(12)
        
        title = QLabel("Send a message to the Admin")
        title.setFont(QFont("Poppins", 20, QFont.Weight.DemiBold))
        layout.addWidget(title)
        
        layout.addWidget(QLabel("Subject"))
        self.subject_input = QLineEdit()
        self.subject_input.setPlaceholderText("e.g. Issue with my account")
        layout.addWidget(self.subject_input)
        
        layout.addWidget(QLabel("Message"))
        self.body_input = QTextEdit()
        self.body_input.setPlaceholderText("Describe your issue or complaint here...")
        self.body_input.setMaximumHeight(150)
        layout.addWidget(self.body_input)
        
        send_btn = QPushButton("Open Email Client")
        send_btn.setObjectName("AuthPrimaryButton")
        send_btn.clicked.connect(self._send)
        layout.addWidget(send_btn)
        
    def _send(self):
        subject = self.subject_input.text()
        body = self.body_input.toPlainText()
        mailto = f"mailto:admin@test.com?subject={subject}&body=From: {self.user_email}%0A%0A{body}"
        QDesktopServices.openUrl(QUrl(mailto))
        self.accept()
