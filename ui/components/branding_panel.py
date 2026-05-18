from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPainter, QColor, QBrush, QLinearGradient
from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel

class BrandingPanel(QWidget):
    """Custom-painted 2/3 branding panel for auth pages."""
    def __init__(self):
        super().__init__()
        self.setObjectName("BrandingPanel")
        self.setMinimumWidth(420)

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)
        w, h = self.width(), self.height()
        
        # Gradient background
        grad = QLinearGradient(0, 0, w * 0.5, h)
        grad.setColorAt(0.0, QColor("#1B8388"))
        grad.setColorAt(0.4, QColor("#2DA3A9"))
        grad.setColorAt(1.0, QColor("#36BCC3"))
        painter.fillRect(0, 0, w, h, QBrush(grad))
        
        # Decorative circles
        painter.setPen(Qt.PenStyle.NoPen)
        circles = [
            (w * 0.75, h * 0.10, 220),
            (w * 0.10, h * 0.80, 160),
            (w * 0.85, h * 0.75, 100),
            (w * 0.30, h * 0.25, 80),
        ]
        for cx, cy, r in circles:
            painter.setBrush(QBrush(QColor(255, 255, 255, 15)))
            painter.drawEllipse(int(cx - r/2), int(cy - r/2), r, r)

        # Inner lighter circle layer
        painter.setBrush(QBrush(QColor(255, 255, 255, 8)))
        painter.drawEllipse(int(w * 0.60 - 140), int(h * 0.45 - 140), 280, 280)
        
        painter.end()


def make_branding_content() -> QVBoxLayout:
    """Build the text content for the branding panel."""
    layout = QVBoxLayout()
    layout.setContentsMargins(48, 48, 48, 48)
    layout.setSpacing(16)
    
    layout.addSpacing(16)
    
    tagline = QLabel("Connecting hearts,\nbuilding communities.")
    tagline.setObjectName("BrandingTagline")
    tagline.setWordWrap(True)
    tagline.setStyleSheet("background: transparent;")
    layout.addWidget(tagline)

    subtext = QLabel("Join thousands of volunteers making a difference across the Philippines.")
    subtext.setObjectName("BrandingSubtext")
    subtext.setWordWrap(True)
    subtext.setStyleSheet("background: transparent;")
    layout.addWidget(subtext)
    
    layout.addSpacing(24)
    
    # Value propositions
    bullets = [
        "🤝  Find meaningful volunteer events near you",
        "📋  Track your impact and attendance history",
        "🏢  Organizations can manage events effortlessly",
    ]
    for b in bullets:
        lbl = QLabel(b)
        lbl.setObjectName("BrandingBullet")
        lbl.setWordWrap(True)
        lbl.setStyleSheet("background: transparent;")
        layout.addWidget(lbl)

    layout.addStretch(1)
    return layout
