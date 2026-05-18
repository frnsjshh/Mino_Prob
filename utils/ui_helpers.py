from pathlib import Path
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap, QPainter, QBrush, QPainterPath
from PyQt6.QtWidgets import QWidget, QHBoxLayout, QLabel

def make_social_widget(icon_path: Path, text: str) -> QWidget:
    """Return a horizontal widget with a small icon + text label."""
    w = QWidget()
    lay = QHBoxLayout(w)
    lay.setContentsMargins(0, 2, 0, 2)
    lay.setSpacing(6)
    icon_lbl = QLabel()
    if icon_path.exists():
        icon_lbl.setPixmap(QPixmap(str(icon_path)).scaled(18, 18, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation))
    else:
        icon_lbl.setText("🔗")
    icon_lbl.setFixedSize(20, 20)
    lay.addWidget(icon_lbl)
    lay.addWidget(QLabel(text))
    lay.addStretch()
    return w

def get_cropped_pixmap(image_path: str, w: int, h: int) -> QPixmap:
    pixmap = QPixmap(image_path)
    if pixmap.isNull():
        return pixmap
    scaled = pixmap.scaled(w, h, Qt.AspectRatioMode.KeepAspectRatioByExpanding, Qt.TransformationMode.SmoothTransformation)
    x = max(0, (scaled.width() - w) // 2)
    y = max(0, (scaled.height() - h) // 2)
    return scaled.copy(x, y, w, h)

def get_circular_pixmap(image_path: str, size: int) -> QPixmap:
    """Return a circular QPixmap of the given size, cropped to fill (not stretch)."""
    square = get_cropped_pixmap(image_path, size, size)
    if square.isNull():
        return square
    result = QPixmap(size, size)
    result.fill(Qt.GlobalColor.transparent)
    painter = QPainter(result)
    painter.setRenderHint(QPainter.RenderHint.Antialiasing)
    path = QPainterPath()
    path.addEllipse(0, 0, size, size)
    painter.setClipPath(path)
    painter.drawPixmap(0, 0, square)
    painter.end()
    return result

def make_event_img(img_path: str, width: int = 320, height: int = 180) -> QLabel:
    """Return a QLabel with the exact cropped event image or a gradient placeholder."""
    lbl = QLabel()
    lbl.setFixedSize(width, height)
    lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
    lbl.setObjectName("ImagePlaceholder")
    if img_path and Path(img_path).exists():
        lbl.setPixmap(get_cropped_pixmap(img_path, width, height))
    else:
        lbl.setText("📷  Event Image")
    return lbl
