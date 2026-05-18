import sys
from pathlib import Path
from PyQt6.QtWidgets import QApplication

from app.core import MainWindow, init_dummy_data
from utils.constants import STYLE_QSS, APP_ICON

def load_stylesheet(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")

def main():
    app = QApplication(sys.argv)
    app.setApplicationName("TaraTulong")
    app.setStyleSheet(load_stylesheet(STYLE_QSS))
    
    from PyQt6.QtGui import QIcon
    if APP_ICON.exists():
        app.setWindowIcon(QIcon(str(APP_ICON)))
    
    init_dummy_data()

    window = MainWindow()
    window.show()
    return app.exec()

if __name__ == "__main__":
    sys.exit(main())
