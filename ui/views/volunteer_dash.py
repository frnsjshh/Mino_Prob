from datetime import datetime
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QColor, QFont
from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QTabWidget,
    QScrollArea, QGridLayout, QFrame, QGraphicsDropShadowEffect,
    QPushButton, QSizePolicy, QSpacerItem, QTableWidget,
    QTableWidgetItem, QHeaderView, QMessageBox
)

from models.user import Volunteer, User, Organization
from models.event import Event
from ui.components.dialogs import EventDetailDialog
from utils.ui_helpers import make_event_img

class VolunteerDashboard(QWidget):
    def __init__(self, volunteer: Volunteer):
        super().__init__()
        self.volunteer = volunteer
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        
        # Header
        header_lay = QHBoxLayout()
        header_lay.setContentsMargins(28, 28, 28, 0)
        title = QLabel(f"Welcome, {volunteer.first_name}!")
        title.setObjectName("PageTitle")
        header_lay.addWidget(title)
        header_lay.addStretch()
        layout.addLayout(header_lay)
        
        # Tabs
        self.tabs = QTabWidget()
        layout.addWidget(self.tabs)
        
        # --- TAB 1: Discover / Dashboard ---
        discover_tab = QWidget()
        discover_lay = QVBoxLayout(discover_tab)
        discover_lay.setContentsMargins(0, 0, 0, 0)
        
        self.discover_scroll = QScrollArea()
        self.discover_scroll.setWidgetResizable(True)
        self.discover_scroll.setFrameShape(QFrame.Shape.NoFrame)
        self.discover_w = QWidget()
        self.discover_inner_lay = QVBoxLayout(self.discover_w)
        self.discover_inner_lay.setContentsMargins(28, 20, 28, 28)
        self.discover_inner_lay.setSpacing(24)
        self.discover_scroll.setWidget(self.discover_w)
        discover_lay.addWidget(self.discover_scroll)
        
        # Upcoming Events Section
        self.upcoming_label = QLabel("Upcoming Accepted Events")
        self.upcoming_label.setObjectName("PageTitle")
        self.upcoming_label.setStyleSheet("font-size: 20px;")
        self.discover_inner_lay.addWidget(self.upcoming_label)
        
        self.upcoming_w = QWidget()
        self.upcoming_grid = QGridLayout(self.upcoming_w)
        self.upcoming_grid.setContentsMargins(0, 0, 0, 0)
        self.upcoming_grid.setHorizontalSpacing(20)
        self.upcoming_grid.setVerticalSpacing(20)
        self.discover_inner_lay.addWidget(self.upcoming_w)
        
        self.no_upcoming_label = QLabel("No upcoming events at the moment.")
        self.no_upcoming_label.setStyleSheet("color: #5A6B7B; font-style: italic;")
        self.discover_inner_lay.addWidget(self.no_upcoming_label)
        
        # Discover Events Section
        discover_title = QLabel("Discover Events")
        discover_title.setObjectName("PageTitle")
        discover_title.setStyleSheet("font-size: 20px;")
        self.discover_inner_lay.addWidget(discover_title)
        
        self.discover_grid_w = QWidget()
        self.discover_grid = QGridLayout(self.discover_grid_w)
        self.discover_grid.setContentsMargins(0, 0, 0, 0)
        self.discover_grid.setHorizontalSpacing(20)
        self.discover_grid.setVerticalSpacing(20)
        self.discover_inner_lay.addWidget(self.discover_grid_w)
        self.discover_inner_lay.addStretch()
        
        self.tabs.addTab(discover_tab, "Dashboard")
        
        # --- TAB 2: My Applications ---
        apps_tab = QWidget()
        apps_lay = QVBoxLayout(apps_tab)
        apps_lay.setContentsMargins(28, 20, 28, 28)
        
        self.apps_table = QTableWidget()
        self.apps_table.setColumnCount(5)
        self.apps_table.setHorizontalHeaderLabels(["Event Title", "Organization", "Date", "Status", "Attended"])
        self.apps_table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.apps_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        self.apps_table.setEditTriggers(QTableWidget.EditTrigger.NoEditTriggers)
        self.apps_table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.apps_table.verticalHeader().setVisible(False)
        apps_lay.addWidget(self.apps_table)
        
        self.tabs.addTab(apps_tab, "My Applications")
        
        self.refresh()
        
    def refresh(self):
        self._refresh_discover()
        self._refresh_applications()
        
    def _refresh_discover(self):
        # Clear upcoming
        while self.upcoming_grid.count():
            item = self.upcoming_grid.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
        # Clear discover
        while self.discover_grid.count():
            item = self.discover_grid.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
        events = Event.load_from_csv()
        regs = self.volunteer.view_history()
        
        approved_event_ids = [r.event_id for r in regs if r.status == "APPROVED"]
        all_reg_event_ids = [r.event_id for r in regs]
        
        users = User.load_from_csv()
        org_map = {u.uuid: u for u in users if isinstance(u, Organization)}
        
        now = datetime.now()
        
        upc_row, upc_col = 0, 0
        disc_row, disc_col = 0, 0
        has_upcoming = False
        
        for event in events:
            try:
                event_date = datetime.strptime(event.start_date, "%Y-%m-%d %H:%M")
            except ValueError:
                event_date = now
                
            try:
                end_date = datetime.strptime(event.end_date, "%Y-%m-%d %H:%M")
            except ValueError:
                end_date = now
                
            # Render card helper
            def _create_card(is_upcoming: bool):
                card = QFrame()
                card.setProperty("class", "EventCard")
                card.setFixedWidth(320)
                card.setMaximumHeight(420)
                card.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)
                
                shadow = QGraphicsDropShadowEffect(card)
                shadow.setBlurRadius(22)
                shadow.setOffset(0, 5)
                shadow.setColor(QColor(31, 45, 61, 28))
                card.setGraphicsEffect(shadow)
                
                c_lay = QVBoxLayout(card)
                c_lay.setContentsMargins(0, 0, 0, 14)
                c_lay.setSpacing(8)
                
                c_lay.addWidget(make_event_img(event.img, 320, 180))
                
                content = QWidget()
                ct_lay = QVBoxLayout(content)
                ct_lay.setContentsMargins(16, 8, 16, 0)
                ct_lay.setSpacing(6)
                
                title = QLabel(event.title)
                title.setObjectName("CardTitle")
                
                raw_desc = event.description
                truncated = raw_desc[:90] + "..." if len(raw_desc) > 90 else raw_desc
                desc = QLabel(truncated)
                desc.setObjectName("CardDescription")
                desc.setWordWrap(True)
                desc.setMaximumHeight(50)
                
                org = org_map.get(event.organizer_id)
                org_label = QLabel(f"🏢 {org.name}" if org else "")
                org_label.setObjectName("CardOrganizer")
                
                meta = QLabel(f"🎟 {event.slots_available} slots  ·  📅 {event.start_date}")
                meta.setObjectName("CardMeta")
                
                ct_lay.addWidget(title)
                ct_lay.addWidget(desc)
                ct_lay.addWidget(org_label)
                ct_lay.addWidget(meta)
                c_lay.addWidget(content)
                
                btn_lay = QHBoxLayout()
                btn_lay.setContentsMargins(16, 0, 16, 0)
                
                details_btn = QPushButton("Show Details")
                details_btn.setObjectName("DetailsButton")
                details_btn.setCursor(Qt.CursorShape.PointingHandCursor)
                details_btn.clicked.connect(lambda _, e=event: self._show_details(e))
                btn_lay.addWidget(details_btn)
                
                if not is_upcoming:
                    apply_btn = QPushButton("Volunteer Now")
                    apply_btn.setObjectName("CTAButton")
                    apply_btn.setCursor(Qt.CursorShape.PointingHandCursor)
                    apply_btn.clicked.connect(lambda _, e=event: self._apply(e))
                    btn_lay.addWidget(apply_btn)
                
                c_lay.addLayout(btn_lay)
                return card

            # Upcoming section logic
            if event.id in approved_event_ids and end_date >= now:
                has_upcoming = True
                card = _create_card(is_upcoming=True)
                self.upcoming_grid.addWidget(card, upc_row, upc_col)
                upc_col += 1
                if upc_col > 2:
                    upc_col = 0
                    upc_row += 1
                    
            # Discover section logic
            elif event.slots_available > 0 and event.id not in all_reg_event_ids and event_date >= now:
                card = _create_card(is_upcoming=False)
                self.discover_grid.addWidget(card, disc_row, disc_col)
                disc_col += 1
                if disc_col > 2:
                    disc_col = 0
                    disc_row += 1
                    
        self.no_upcoming_label.setVisible(not has_upcoming)
        self.upcoming_w.setVisible(has_upcoming)
        
        # Fill empty space
        self.upcoming_grid.addItem(QSpacerItem(20, 20, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Expanding), upc_row + 1, 0, 1, 3)
        self.discover_grid.addItem(QSpacerItem(20, 20, QSizePolicy.Policy.Minimum, QSizePolicy.Policy.Expanding), disc_row + 1, 0, 1, 3)

    def _refresh_applications(self):
        regs = self.volunteer.view_history()
        events = Event.load_from_csv()
        users = User.load_from_csv()
        
        event_map = {e.id: e for e in events}
        org_map = {u.uuid: u for u in users if isinstance(u, Organization)}
        
        self.apps_table.setRowCount(len(regs))
        
        for i, reg in enumerate(regs):
            event = event_map.get(reg.event_id)
            if not event:
                continue
                
            org = org_map.get(event.organizer_id)
            org_name = org.name if org else "Unknown"
            
            self.apps_table.setItem(i, 0, QTableWidgetItem(event.title))
            self.apps_table.setItem(i, 1, QTableWidgetItem(org_name))
            self.apps_table.setItem(i, 2, QTableWidgetItem(event.start_date))
            
            # Status styling
            status_item = QTableWidgetItem(reg.status)
            if reg.status == "APPROVED":
                status_item.setForeground(QColor("#2E9E6F"))
            elif reg.status == "REJECTED":
                status_item.setForeground(QColor("#D64545"))
            elif reg.status == "PENDING":
                status_item.setForeground(QColor("#D9A63C"))
            status_item.setFont(QFont("Inter", 14, QFont.Weight.Bold))
            self.apps_table.setItem(i, 3, status_item)
            
            # Attended logic
            try:
                end_date = datetime.strptime(event.end_date, "%Y-%m-%d %H:%M")
            except ValueError:
                end_date = datetime.now()
                
            if end_date < datetime.now() and reg.status == "APPROVED":
                att_text = "Yes" if reg.participated else "No"
                att_item = QTableWidgetItem(att_text)
                if reg.participated:
                    att_item.setForeground(QColor("#2E9E6F"))
                else:
                    att_item.setForeground(QColor("#D64545"))
            else:
                att_item = QTableWidgetItem("N/A")
                att_item.setForeground(QColor("#9AA5B1"))
                
            self.apps_table.setItem(i, 4, att_item)

    def _show_details(self, event: Event):
        dlg = EventDetailDialog(event, self.volunteer, self)
        dlg.applied.connect(self.refresh)
        dlg.exec()

    def _apply(self, event: Event):
        if self.volunteer.apply_for_event(event):
            QMessageBox.information(self, "Success", "Applied successfully!")
            self.refresh()
        else:
            QMessageBox.warning(self, "Error", "Event is full!")
