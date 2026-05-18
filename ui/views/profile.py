import shutil
from pathlib import Path
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QTextEdit,
    QPushButton, QFrame, QFileDialog
)
from models.user import User, Volunteer, Admin, Organization
from utils.constants import PROFILE_PICS_DIR
from utils.ui_helpers import get_cropped_pixmap, get_circular_pixmap

class ProfilePage(QWidget):
    profile_updated = pyqtSignal()
    
    def __init__(self, user: User):
        super().__init__()
        self.user = user
        layout = QVBoxLayout(self)
        layout.addStretch(1)
        
        card = QFrame()
        card.setObjectName("AuthCard")
        card.setMaximumWidth(520)
        c_layout = QVBoxLayout(card)
        c_layout.setSpacing(10)
        
        title = QLabel("Edit Profile")
        title.setObjectName("PageTitle")
        c_layout.addWidget(title)
        
        # Profile picture
        pic_layout = QHBoxLayout()
        self.pic_label = QLabel()
        self.pic_label.setFixedSize(80, 80)
        self.pic_label.setStyleSheet(
            "border-radius: 40px; background: #EEF2F4; border: 2px solid #6FD3D8;"
        )
        self.pic_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.pic_label.setScaledContents(False)
        self._load_pic()
        pic_layout.addWidget(self.pic_label)
        
        change_pic_btn = QPushButton("Change Photo")
        change_pic_btn.clicked.connect(self._pick_photo)
        pic_layout.addWidget(change_pic_btn)
        pic_layout.addStretch()
        c_layout.addLayout(pic_layout)
        
        # Role-specific fields
        if isinstance(user, Volunteer) or isinstance(user, Admin):
            self.fname_input = QLineEdit(user.first_name)
            self.fname_input.setPlaceholderText("First Name")
            self.lname_input = QLineEdit(user.last_name)
            self.lname_input.setPlaceholderText("Last Name")
            c_layout.addWidget(QLabel("First Name"))
            c_layout.addWidget(self.fname_input)
            c_layout.addWidget(QLabel("Last Name"))
            c_layout.addWidget(self.lname_input)
        elif isinstance(user, Organization):
            self.orgname_input = QLineEdit(user.name)
            self.orgname_input.setPlaceholderText("Organization Name")
            self.orgloc_input = QLineEdit(user.location)
            self.orgloc_input.setPlaceholderText("Location")
            self.orgdesc_input = QTextEdit(user.description)
            self.orgdesc_input.setPlaceholderText("Description")
            self.orgdesc_input.setMaximumHeight(80)
            c_layout.addWidget(QLabel("Organization Name"))
            c_layout.addWidget(self.orgname_input)
            c_layout.addWidget(QLabel("Location"))
            c_layout.addWidget(self.orgloc_input)
            c_layout.addWidget(QLabel("Description"))
            c_layout.addWidget(self.orgdesc_input)
        
        # Social links
        sep = QLabel("Social Media Links (optional)")
        sep.setObjectName("FieldLabel")
        c_layout.addWidget(sep)
        
        self.fb_input = QLineEdit(user.facebook)
        self.fb_input.setPlaceholderText("Facebook URL")
        self.ig_input = QLineEdit(user.instagram)
        self.ig_input.setPlaceholderText("Instagram URL")
        self.li_input = QLineEdit(user.linkedin)
        self.li_input.setPlaceholderText("LinkedIn URL")
        c_layout.addWidget(self.fb_input)
        c_layout.addWidget(self.ig_input)
        c_layout.addWidget(self.li_input)
        
        self.msg_label = QLabel()
        c_layout.addWidget(self.msg_label)
        
        save_btn = QPushButton("Save Changes")
        save_btn.setObjectName("AuthPrimaryButton")
        save_btn.clicked.connect(self._save)
        c_layout.addWidget(save_btn)
        
        layout.addWidget(card, alignment=Qt.AlignmentFlag.AlignCenter)
        layout.addStretch(1)
    
    def _load_pic(self):
        if self.user.profile_pic and Path(self.user.profile_pic).exists():
            self.pic_label.setPixmap(get_circular_pixmap(self.user.profile_pic, 80))
        else:
            self.pic_label.setText("No Photo")
    
    def _pick_photo(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Select Profile Picture", "", "Images (*.png *.jpg *.jpeg *.bmp)")
        if file_path:
            PROFILE_PICS_DIR.mkdir(parents=True, exist_ok=True)
            dest = PROFILE_PICS_DIR / f"{self.user.uuid}{Path(file_path).suffix}"
            shutil.copy2(file_path, dest)
            self.user.profile_pic = str(dest)
            self._load_pic()
    
    def _save(self):
        if isinstance(self.user, (Volunteer, Admin)):
            self.user.first_name = self.fname_input.text()
            self.user.last_name = self.lname_input.text()
        elif isinstance(self.user, Organization):
            self.user.name = self.orgname_input.text()
            self.user.location = self.orgloc_input.text()
            self.user.description = self.orgdesc_input.toPlainText()
        
        self.user.facebook = self.fb_input.text()
        self.user.instagram = self.ig_input.text()
        self.user.linkedin = self.li_input.text()
        self.user.save_to_csv()
        self.msg_label.setText("Profile saved successfully!")
        self.msg_label.setStyleSheet("color: #2E9E6F; font-weight: 700;")
        self.profile_updated.emit()
