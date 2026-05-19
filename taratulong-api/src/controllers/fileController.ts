import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { requireAuth } from "../middleware/auth";
import { UserService } from "../services/userService";

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".bmp", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (png, jpg, jpeg, bmp, webp)."));
    }
  },
});

const router = Router();
const userService = new UserService();

/**
 * POST /api/files/upload — Upload an image file
 * Returns the URL to access the uploaded file
 */
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ status: 400, message: "No file uploaded." });
        return;
      }
      const fileUrl = `/api/files/${req.file.filename}`;
      res.json({ url: fileUrl, filename: req.file.filename });
    } catch (err: any) {
      res.status(400).json({ status: 400, message: err.message });
    }
  }
);

/**
 * POST /api/files/profile-pic — Upload and set profile picture
 */
router.post(
  "/profile-pic",
  requireAuth,
  upload.single("file"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ status: 400, message: "No file uploaded." });
        return;
      }
      const fileUrl = `/api/files/${req.file.filename}`;
      const updated = userService.updateProfilePic(req.auth!.id, fileUrl);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ status: 400, message: err.message });
    }
  }
);

/**
 * GET /api/files/:filename — Serve an uploaded file
 */
router.get("/:filename", (req: Request, res: Response) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ status: 404, message: "File not found." });
    return;
  }
  res.sendFile(filePath);
});

export default router;
