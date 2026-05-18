from PyQt6.QtCore import Qt
from PyQt6.QtGui import QColor
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QStackedWidget,
    QScrollArea, QGridLayout, QFrame, QGraphicsDropShadowEffect,
    QPushButton, QSizePolicy, QSpacerItem, QTableWidget,
    QTableWidgetItem, QHeaderView, QComboBox, QCheckBox, QSpinBox
)

from models.user import Organization, User, Volunteer
from models.event import Event
from models.registration import Registration
from ui.components.dialogs import CreateEventDialog, VolunteerProfileDialog


class OrgDashboard(QWidget):
    def __init__(self, org: Organization):
        super().__init__()
        self.org = org
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        self.stack = QStackedWidget()
        layout.addWidget(self.stack)
        
        # --- Events View ---
        self.events_view = QWidget()
        e_layout = QVBoxLayout(self.events_view)
        
        header_lay = QHBoxLayout()
        header_lay.setContentsMargins(28, 28, 28, 0)
        title = QLabel(f"Dashboard: {org.name}")
        title.setObjectName("PageTitle")
        header_lay.addWidget(title)
        header_lay.addStretch()
        create_btn = QPushButton("Create Event")
        create_btn.setObjectName("PrimaryNavButton")
        create_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        create_btn.clicked.connect(self._create_event)
        header_lay.addWidget(create_btn)
        e_layout.addLayout(header_lay)
        
        # Gate for non-approved orgs
        if org.status != "APPROVED":
            create_btn.setHidden(True)
            banner = QLabel("⚠ Your organization is pending admin approval. You cannot create events yet.")
            banner.setStyleSheet("background: #F8D27A; color: #1F2D3D; padding: 12px 20px; border-radius: 8px; font-weight: 600;")
            banner.setWordWrap(True)
            banner_container = QHBoxLayout()
            banner_container.setContentsMargins(28, 0, 28, 0)
            banner_container.addWidget(banner)
            e_layout.addLayout(banner_container)
        
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(QFrame.Shape.NoFrame)
        self.grid_w = QWidget()
        self.grid = QGridLayout(self.grid_w)
        self.grid.setContentsMargins(28, 28, 28, 28)
        self.grid.setHorizontalSpacing(20)
        self.grid.setVerticalSpacing(20)
        self.scroll.setWidget(self.grid_w)
        e_layout.addWidget(self.scroll)
        
        # --- Applicants View ---
        self.apps_view = QWidget()
        a_layout = QVBoxLayout(self.apps_view)
        
        a_header_lay = QHBoxLayout()
        a_header_lay.setContentsMargins(28, 28, 28, 0)
        back_btn = QPushButton("← Back to Events")
        back_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        back_btn.clicked.connect(lambda: self.stack.setCurrentWidget(self.events_view))
        a_header_lay.addWidget(back_btn)
        self.event_title_label = QLabel()
        self.event_title_label.setObjectName("PageSubtitle")
        self.event_title_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        a_header_lay.addWidget(self.event_title_label)
        a_header_lay.addStretch()
        a_layout.addLayout(a_header_lay)
        
        table_container = QWidget()
        t_layout = QVBoxLayout(table_container)
        t_layout.setContentsMargins(28, 14, 28, 28)
        self.table = QTableWidget()
        self.table.setColumnCount(6)
        self.table.setHorizontalHeaderLabels(["Volunteer", "Avg Rating", "Attendance", "Status", "Present?", "Rating"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        t_layout.addWidget(self.table)
        a_layout.addWidget(table_container)
        
        self.stack.addWidget(self.events_view)
        self.stack.addWidget(self.apps_view)
        
        self.refresh()
        
    def _create_event(self):
        dlg = CreateEventDialog(self.org, self)
        if dlg.exec():
            self.refresh()
            
    def refresh(self):
        # Refresh Events Grid
        while self.grid.count():
            item = self.grid.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
        events = Event.load_from_csv()
        org_events = [e for e in events if e.organizer_id == self.org.uuid]
        
        row, col = 0, 0
        for event in org_events:
            card = QFrame()
            card.setProperty("class", "EventCard")
            card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
            card.setMinimumWidth(260)
            
            shadow = QGraphicsDropShadowEffect(card)
            shadow.setBlurRadius(20)
            shadow.setOffset(0, 5)
            shadow.setColor(QColor(31, 45, 61, 28))
            card.setGraphicsEffect(shadow)
            
            c_lay = QVBoxLayout(card)
            c_lay.setContentsMargins(18, 18, 18, 18)
            c_lay.setSpacing(12)
            
            title = QLabel(event.title)
            title.setObjectName("CardTitle")
            
            desc = QLabel(event.description)
            desc.setObjectName("CardDescription")
            desc.setWordWrap(True)
            
            meta = QLabel(f"Slots: {event.slots_available} | {event.start_date}")
            meta.setObjectName("CardMeta")
            
            btn = QPushButton("Show Applicants")
            btn.setObjectName("DetailsButton")
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.clicked.connect(lambda _, e=event: self.show_applicants(e))
            
            c_lay.addWidget(title)
            c_lay.addWidget(desc)
            c_lay.addWidget(meta)
            c_lay.addStretch(1)
            c_lay.addWidget(btn, alignment=Qt.AlignmentFlag.AlignLeft)
            
            self.grid.addWidget(card, row, col)
            col += 1
            if col > 2:
                col = 0
                row += 1
        
        # spacer to push cards up
        self.grid.addItem(QSpacerItem(20, 20, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Expanding), row+1, 0, 1, 3)

    def show_applicants(self, event: Event):
        self.event_title_label.setText(f"Applicants for: {event.title}")
        regs = Registration.load_from_csv()
        users = User.load_from_csv()
        
        user_map = {}
        for u in users:
            if isinstance(u, Volunteer):
                user_map[u.uuid] = u
                
        event_regs = [r for r in regs if r.event_id == event.id]
        
        self.table.setRowCount(len(event_regs))
        for i, reg in enumerate(event_regs):
            v_user = user_map.get(reg.volunteer_id)
            v_name = f"{v_user.first_name} {v_user.last_name}" if v_user else "Unknown"
            attendance_str = f"{v_user.get_attendance_rating():.1f}%" if v_user else "0%"
            avg_rating_str = f"{v_user.get_average_rating():.1f} ★" if v_user else "0.0 ★"
            
            # Clickable name
            name_btn = QPushButton(v_name)
            name_btn.setStyleSheet("color: #2DA3A9; text-decoration: underline; background: transparent; text-align: left; font-weight: 600; border: none; padding: 4px;")
            name_btn.setCursor(Qt.CursorShape.PointingHandCursor)
            if v_user:
                name_btn.clicked.connect(lambda _, v=v_user: VolunteerProfileDialog(v, self).exec())
            self.table.setCellWidget(i, 0, name_btn)
            self.table.setItem(i, 1, QTableWidgetItem(avg_rating_str))
            self.table.setItem(i, 2, QTableWidgetItem(attendance_str))
            
            # Status Combo
            status_combo = QComboBox()
            status_combo.addItems(["PENDING", "APPROVED", "REJECTED"])
            status_combo.setCurrentText(reg.status)
            self.table.setCellWidget(i, 3, status_combo)
            
            # Present Checkbox
            present_cb = QCheckBox("Present")
            present_cb.setChecked(reg.participated)
            
            # Rating SpinBox
            rating_spin = QSpinBox()
            rating_spin.setRange(0, 5)
            rating_spin.setValue(reg.rating)
            
            if reg.status != "APPROVED":
                present_cb.setEnabled(False)
                rating_spin.setEnabled(False)
                
            cb_container = QWidget()
            cb_lay = QHBoxLayout(cb_container)
            cb_lay.addWidget(present_cb)
            cb_lay.setContentsMargins(10, 0, 0, 0)
            self.table.setCellWidget(i, 4, cb_container)
            
            self.table.setCellWidget(i, 5, rating_spin)
            
            # Connect signals
            status_combo.currentTextChanged.connect(lambda text, r=reg, cb=present_cb, rs=rating_spin: self._update_status(r, text, cb, rs))
            present_cb.toggled.connect(lambda checked, r=reg: self._update_present(r, checked))
            rating_spin.valueChanged.connect(lambda val, r=reg: self._update_rating(r, val))

        self.stack.setCurrentWidget(self.apps_view)

    def _update_status(self, reg: Registration, status: str, present_cb: QCheckBox, rating_spin: QSpinBox):
        reg.update_status(status)
        is_approved = (status == "APPROVED")
        present_cb.setEnabled(is_approved)
        rating_spin.setEnabled(is_approved)
        if not is_approved:
            present_cb.setChecked(False)
            rating_spin.setValue(0)
            self._update_present(reg, False)
            self._update_rating(reg, 0)
        
    def _update_present(self, reg: Registration, present: bool):
        reg.record_attendance(present)
        
    def _update_rating(self, reg: Registration, rating: int):
        reg.rating = rating
        reg.save_to_csv()
