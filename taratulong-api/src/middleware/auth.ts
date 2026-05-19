import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppUser } from "../types/entities";

const JWT_SECRET = process.env.JWT_SECRET || "taratulong-dev-secret-change-in-prod";
const JWT_EXPIRES_IN = "24h";

export function generateToken(user: AppUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export interface JwtPayload {
  id: string;
  email: string;
  role: "admin" | "volunteer" | "organization";
}

// Extend Express Request to carry authenticated user info
declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

/**
 * Middleware: Requires a valid JWT token in the Authorization header.
 * Attaches decoded payload to `req.auth`.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ status: 401, message: "Authentication required" });
    return;
  }

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.auth = decoded;
    next();
  } catch {
    res.status(401).json({ status: 401, message: "Invalid or expired token" });
  }
}

/**
 * Middleware factory: Restricts access to specific roles.
 * Must be used AFTER requireAuth.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ status: 403, message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
