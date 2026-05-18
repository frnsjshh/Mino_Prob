from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import (
    QWidget, QHBoxLayout, QVBoxLayout, QFrame, QLabel, QLineEdit,
    QPushButton, QComboBox, QScrollArea
)
from services.auth_service import AuthService
from models.user import User
from ui.components.branding_panel import BrandingPanel, make_branding_content


class LoginPage(QWidget):
    signup_requested = pyqtSignal()
    login_successful = pyqtSignal(User)

    def __init__(self, auth_service: AuthService):
        super().__init__()
        self.auth_service = auth_service
        self.setObjectName("AuthPage")
        
        outer = QHBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)
        
        # ---- Left: Branding (2/3) ----
        brand_panel = BrandingPanel()
        brand_layout = make_branding_content()
        brand_panel.setLayout(brand_layout)
        outer.addWidget(brand_panel, stretch=2)
        
        # ---- Right: Form (1/3) ----
        form_wrapper = QWidget()
        form_wrapper.setObjectName("AuthFormWrapper")
        form_wrapper.setStyleSheet("#AuthFormWrapper { background: #FFFFFF; }")
        form_outer = QVBoxLayout(form_wrapper)
        form_outer.setContentsMargins(0, 0, 0, 0)
        form_outer.addStretch(1)
        
        card = QFrame()
        card.setObjectName("AuthCard")
        card.setMaximumWidth(400)
        card.setStyleSheet("#AuthCard { border: none; }")
        c_layout = QVBoxLayout(card)
        c_layout.setSpacing(12)
        c_layout.setContentsMargins(40, 32, 40, 32)
        
        title = QLabel("Welcome back")
        title.setObjectName("AuthTitle")
        c_layout.addWidget(title)
        
        subtitle = QLabel("Sign in to continue your volunteer journey")
        subtitle.setObjectName("AuthSubtitle")
        subtitle.setWordWrap(True)
        c_layout.addWidget(subtitle)
        
        c_layout.addSpacing(8)
        
        email_label = QLabel("Email")
        email_label.setObjectName("FieldLabel")
        c_layout.addWidget(email_label)
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("your@email.com")
        c_layout.addWidget(self.email_input)
        
        pass_label = QLabel("Password")
        pass_label.setObjectName("FieldLabel")
        c_layout.addWidget(pass_label)
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Enter your password")
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        c_layout.addWidget(self.password_input)
        
        self.msg_label = QLabel()
        self.msg_label.setObjectName("AuthMessage")
        c_layout.addWidget(self.msg_label)
        
        c_layout.addSpacing(4)
        
        login_btn = QPushButton("Sign In")
        login_btn.setObjectName("AuthPrimaryButton")
        login_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        login_btn.clicked.connect(self._submit)
        c_layout.addWidget(login_btn)

        switch_lay = QHBoxLayout()
        switch_lay.setAlignment(Qt.AlignmentFlag.AlignCenter)
        switch_text = QLabel("Don't have an account?")
        switch_text.setObjectName("AuthSwitchText")
        signup_btn = QPushButton("Sign Up")
        signup_btn.setObjectName("AuthLinkButton")
        signup_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        signup_btn.clicked.connect(self.signup_requested.emit)
        switch_lay.addWidget(switch_text)
        switch_lay.addWidget(signup_btn)
        c_layout.addLayout(switch_lay)
        
        form_outer.addWidget(card, alignment=Qt.AlignmentFlag.AlignCenter)
        form_outer.addStretch(1)
        outer.addWidget(form_wrapper, stretch=1)

    def _submit(self):
        res = self.auth_service.login_user(self.email_input.text(), self.password_input.text())
        self.msg_label.setText(res.message)
        if res.success and res.user:
            self.login_successful.emit(res.user)


class SignupPage(QWidget):
    login_requested = pyqtSignal()
    signup_successful = pyqtSignal(User)

    def __init__(self, auth_service: AuthService):
        super().__init__()
        self.auth_service = auth_service
        self.setObjectName("AuthPage")
        
        outer = QHBoxLayout(self)
        outer.setContentsMargins(0, 0, 0, 0)
        outer.setSpacing(0)
        
        # ---- Left: Branding (2/3) ----
        brand_panel = BrandingPanel()
        brand_layout = make_branding_content()
        brand_panel.setLayout(brand_layout)
        outer.addWidget(brand_panel, stretch=2)
        
        # ---- Right: Form (1/3) ----
        form_wrapper = QWidget()
        form_wrapper.setObjectName("AuthFormWrapper")
        form_wrapper.setStyleSheet("#AuthFormWrapper { background: #FFFFFF; }")
        form_outer = QVBoxLayout(form_wrapper)
        form_outer.setContentsMargins(0, 0, 0, 0)
        
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        scroll.setStyleSheet("QScrollArea { background: #FFFFFF; }")
        
        scroll_content = QWidget()
        scroll_content.setObjectName("AuthScrollContent")
        scroll_content.setStyleSheet("#AuthScrollContent { background: #FFFFFF; }")
        scroll_lay = QVBoxLayout(scroll_content)
        scroll_lay.addStretch(1)
        
        card = QFrame()
        card.setObjectName("AuthCard")
        card.setMaximumWidth(400)
        card.setStyleSheet("#AuthCard { border: none; }")
        c_layout = QVBoxLayout(card)
        c_layout.setSpacing(10)
        c_layout.setContentsMargins(40, 32, 40, 32)
        
        title = QLabel("Create Account")
        title.setObjectName("AuthTitle")
        c_layout.addWidget(title)
        
        subtitle = QLabel("Start your volunteer journey today")
        subtitle.setObjectName("AuthSubtitle")
        subtitle.setWordWrap(True)
        c_layout.addWidget(subtitle)
        
        c_layout.addSpacing(4)
        
        role_label = QLabel("I am a...")
        role_label.setObjectName("FieldLabel")
        c_layout.addWidget(role_label)
        self.role_combo = QComboBox()
        self.role_combo.addItems(["Volunteer", "Organization"])
        self.role_combo.currentTextChanged.connect(self._toggle_fields)
        c_layout.addWidget(self.role_combo)
        
        email_label = QLabel("Email")
        email_label.setObjectName("FieldLabel")
        c_layout.addWidget(email_label)
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("your@email.com")
        c_layout.addWidget(self.email_input)
        
        pass_label = QLabel("Password")
        pass_label.setObjectName("FieldLabel")
        c_layout.addWidget(pass_label)
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Create a password")
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        c_layout.addWidget(self.password_input)
        
        confirm_label = QLabel("Confirm Password")
        confirm_label.setObjectName("FieldLabel")
        c_layout.addWidget(confirm_label)
        self.confirm_input = QLineEdit()
        self.confirm_input.setPlaceholderText("Re-enter your password")
        self.confirm_input.setEchoMode(QLineEdit.EchoMode.Password)
        c_layout.addWidget(self.confirm_input)
        
        # Vol fields
        self.vol_widget = QWidget()
        v_layout = QVBoxLayout(self.vol_widget)
        v_layout.setContentsMargins(0, 0, 0, 0)
        v_layout.setSpacing(8)
        fn_label = QLabel("First Name")
        fn_label.setObjectName("FieldLabel")
        v_layout.addWidget(fn_label)
        self.fname_input = QLineEdit()
        self.fname_input.setPlaceholderText("Juan")
        v_layout.addWidget(self.fname_input)
        ln_label = QLabel("Last Name")
        ln_label.setObjectName("FieldLabel")
        v_layout.addWidget(ln_label)
        self.lname_input = QLineEdit()
        self.lname_input.setPlaceholderText("Dela Cruz")
        v_layout.addWidget(self.lname_input)
        c_layout.addWidget(self.vol_widget)
        
        # Org fields
        self.org_widget = QWidget()
        o_layout = QVBoxLayout(self.org_widget)
        o_layout.setContentsMargins(0, 0, 0, 0)
        o_layout.setSpacing(8)
        on_label = QLabel("Organization Name")
        on_label.setObjectName("FieldLabel")
        o_layout.addWidget(on_label)
        self.orgname_input = QLineEdit()
        self.orgname_input.setPlaceholderText("e.g. Bayanihan Foundation")
        o_layout.addWidget(self.orgname_input)
        ol_label = QLabel("Location")
        ol_label.setObjectName("FieldLabel")
        o_layout.addWidget(ol_label)
        self.orgloc_input = QLineEdit()
        self.orgloc_input.setPlaceholderText("e.g. Quezon City")
        o_layout.addWidget(self.orgloc_input)
        
        # Since we cannot easily import QTextEdit without changing imports, we'll import it above and use it here.
        from PyQt6.QtWidgets import QTextEdit
        od_label = QLabel("Description")
        od_label.setObjectName("FieldLabel")
        o_layout.addWidget(od_label)
        self.orgdesc_input = QTextEdit()
        self.orgdesc_input.setPlaceholderText("Tell us about your organization...")
        self.orgdesc_input.setMaximumHeight(80)
        o_layout.addWidget(self.orgdesc_input)
        c_layout.addWidget(self.org_widget)
        
        self.msg_label = QLabel()
        self.msg_label.setObjectName("AuthMessage")
        c_layout.addWidget(self.msg_label)
        
        c_layout.addSpacing(4)
        
        signup_btn = QPushButton("Create Account")
        signup_btn.setObjectName("CTAButton")
        signup_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        signup_btn.clicked.connect(self._submit)
        c_layout.addWidget(signup_btn)

        switch_lay = QHBoxLayout()
        switch_lay.setAlignment(Qt.AlignmentFlag.AlignCenter)
        switch_text = QLabel("Already have an account?")
        switch_text.setObjectName("AuthSwitchText")
        login_btn = QPushButton("Sign In")
        login_btn.setObjectName("AuthLinkButton")
        login_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        login_btn.clicked.connect(self.login_requested.emit)
        switch_lay.addWidget(switch_text)
        switch_lay.addWidget(login_btn)
        c_layout.addLayout(switch_lay)
        
        scroll_lay.addWidget(card, alignment=Qt.AlignmentFlag.AlignCenter)
        scroll_lay.addStretch(1)
        scroll.setWidget(scroll_content)
        form_outer.addWidget(scroll)
        outer.addWidget(form_wrapper, stretch=1)
        self._toggle_fields()

    def _toggle_fields(self):
        role = self.role_combo.currentText()
        self.vol_widget.setVisible(role == "Volunteer")
        self.org_widget.setVisible(role == "Organization")

    def _submit(self):
        role = self.role_combo.currentText()
        if role == "Volunteer":
            res = self.auth_service.register_volunteer(
                self.email_input.text(), self.password_input.text(), self.confirm_input.text(),
                self.fname_input.text(), self.lname_input.text()
            )
        else:
            res = self.auth_service.register_organization(
                self.email_input.text(), self.password_input.text(), self.confirm_input.text(),
                self.orgname_input.text(), self.orgloc_input.text(), self.orgdesc_input.toPlainText()
            )
            
        self.msg_label.setText(res.message)
        if res.success and res.user:
            self.signup_successful.emit(res.user)
