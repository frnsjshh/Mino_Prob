from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QPixmap
from PyQt6.QtWidgets import QWidget, QHBoxLayout, QLabel, QPushButton
from utils.constants import APP_LOGO

class Navbar(QWidget):
    home_requested = pyqtSignal()
    profile_requested = pyqtSignal()
    help_requested = pyqtSignal()
    logout_requested = pyqtSignal()

    def __init__(self) -> None:
        super().__init__()
        self.setObjectName("Navbar")
        layout = QHBoxLayout(self)
        layout.setContentsMargins(28, 14, 28, 14)
        
        # App logo
        if APP_LOGO.exists():
            logo_lbl = QLabel()
            logo_lbl.setFixedHeight(64)
            logo_lbl.setAlignment(Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignLeft)
            logo_lbl.setPixmap(
                QPixmap(str(APP_LOGO)).scaled(
                    250, 64,
                    Qt.AspectRatioMode.KeepAspectRatio,
                    Qt.TransformationMode.SmoothTransformation
                )
            )
            layout.addWidget(logo_lbl)
        
        layout.addStretch(1)

        self.home_btn = QPushButton("Dashboard")
        self.home_btn.setProperty("nav", True)
        self.home_btn.clicked.connect(self.home_requested.emit)
        
        self.profile_btn = QPushButton("Profile")
        self.profile_btn.setProperty("nav", True)
        self.profile_btn.clicked.connect(self.profile_requested.emit)
        
        self.help_btn = QPushButton("Help")
        self.help_btn.setProperty("nav", True)
        self.help_btn.clicked.connect(self.help_requested.emit)
        
        self.logout_btn = QPushButton("Logout")
        self.logout_btn.setProperty("nav", True)
        self.logout_btn.clicked.connect(self.logout_requested.emit)

        layout.addWidget(self.home_btn)
        layout.addWidget(self.profile_btn)
        layout.addWidget(self.help_btn)
        layout.addWidget(self.logout_btn)
        self.hide_nav(True)
        
    def hide_nav(self, hidden: bool):
        self.home_btn.setHidden(hidden)
        self.profile_btn.setHidden(hidden)
        self.help_btn.setHidden(hidden)
        self.logout_btn.setHidden(hidden)
