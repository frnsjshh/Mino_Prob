from PyQt6.QtCore import Qt
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QFrame, QTableWidget, QTableWidgetItem, QHeaderView, QMessageBox
)
from models.user import Admin, User, Organization


class AdminDashboard(QWidget):
    def __init__(self, admin: Admin):
        super().__init__()
        self.admin = admin
        layout = QVBoxLayout(self)
        
        header = QHBoxLayout()
        header.setContentsMargins(28, 28, 28, 0)
        title = QLabel("Admin Panel — Organization Verification")
        title.setObjectName("PageTitle")
        header.addWidget(title)
        header.addStretch()
        layout.addLayout(header)
        
        # Deactivate user section
        deact_frame = QFrame()
        deact_frame.setStyleSheet("background: #FFFFFF; border: 1px solid #E1E8ED; border-radius: 12px; padding: 14px;")
        d_lay = QHBoxLayout(deact_frame)
        d_lay.setContentsMargins(18, 12, 18, 12)
        d_label = QLabel("Deactivate a user:")
        d_label.setObjectName("FieldLabel")
        self.deact_email = QLineEdit()
        self.deact_email.setPlaceholderText("Enter user email to deactivate")
        self.deact_email.setMaximumWidth(320)
        deact_btn = QPushButton("Deactivate")
        deact_btn.setStyleSheet("background: #D64545; color: white; font-weight: 700; border-radius: 8px; padding: 12px 20px;")
        deact_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        deact_btn.clicked.connect(self._deactivate_user)
        d_lay.addWidget(d_label)
        d_lay.addWidget(self.deact_email)
        d_lay.addWidget(deact_btn)
        d_lay.addStretch()
        
        deact_container = QHBoxLayout()
        deact_container.setContentsMargins(28, 14, 28, 0)
        deact_container.addWidget(deact_frame)
        layout.addLayout(deact_container)
        
        table_container = QWidget()
        t_layout = QVBoxLayout(table_container)
        t_layout.setContentsMargins(28, 14, 28, 28)
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(["Org Name", "Email", "Location", "Status", "Action"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        t_layout.addWidget(self.table)
        layout.addWidget(table_container)
        self.refresh()
    
    def _deactivate_user(self):
        email = self.deact_email.text().strip().lower()
        if not email:
            QMessageBox.warning(self, "Error", "Please enter an email address.")
            return
        users = User.load_from_csv()
        user = next((u for u in users if u.email == email), None)
        if user is None:
            QMessageBox.warning(self, "Not Found", f"No user found with email: {email}")
            return
        if isinstance(user, Admin):
            QMessageBox.warning(self, "Error", "Cannot deactivate an admin account.")
            return
        user.active = 'False'
        user.save_to_csv()
        self.deact_email.clear()
        QMessageBox.information(self, "Success", f"User {email} has been deactivated.")
        self.refresh()
        
    def refresh(self):
        users = User.load_from_csv()
        orgs = [u for u in users if isinstance(u, Organization)]
        
        self.table.setRowCount(len(orgs))
        for i, org in enumerate(orgs):
            self.table.setItem(i, 0, QTableWidgetItem(org.name))
            self.table.setItem(i, 1, QTableWidgetItem(org.email))
            self.table.setItem(i, 2, QTableWidgetItem(org.location))
            
            status_item = QTableWidgetItem(org.status)
            self.table.setItem(i, 3, status_item)
            
            action_w = QWidget()
            a_lay = QHBoxLayout(action_w)
            a_lay.setContentsMargins(6, 4, 6, 4)
            a_lay.setSpacing(8)

            approve_btn = QPushButton("Approve")
            approve_btn.setStyleSheet(
                "QPushButton { background: #2DA3A9; color: #FFFFFF; font-weight: 700; "
                "border-radius: 8px; padding: 6px 14px; font-size: 13px; }"
                "QPushButton:hover { background: #248A8F; }"
                "QPushButton:disabled { background: #A8D8DA; color: #FFFFFF; }"
            )
            approve_btn.setCursor(Qt.CursorShape.PointingHandCursor)
            approve_btn.setFixedHeight(32)
            approve_btn.clicked.connect(lambda _, o=org: self._set_status(o, "APPROVED"))

            reject_btn = QPushButton("Reject")
            reject_btn.setStyleSheet(
                "QPushButton { background: #D64545; color: #FFFFFF; font-weight: 700; "
                "border-radius: 8px; padding: 6px 14px; font-size: 13px; }"
                "QPushButton:hover { background: #B83535; }"
                "QPushButton:disabled { background: #E8A8A8; color: #FFFFFF; }"
            )
            reject_btn.setCursor(Qt.CursorShape.PointingHandCursor)
            reject_btn.setFixedHeight(32)
            reject_btn.clicked.connect(lambda _, o=org: self._set_status(o, "REJECTED"))

            if org.status == "APPROVED":
                approve_btn.setEnabled(False)
            if org.status == "REJECTED":
                reject_btn.setEnabled(False)

            a_lay.addWidget(approve_btn)
            a_lay.addWidget(reject_btn)
            a_lay.addStretch()
            self.table.setCellWidget(i, 4, action_w)
            self.table.setRowHeight(i, 46)
    
    def _set_status(self, org: Organization, status: str):
        org.status = status
        org.save_to_csv()
        self.refresh()
