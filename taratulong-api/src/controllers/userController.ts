import { Router, Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { UserService } from "../services/userService";

const router = Router();
const userService = new UserService();

/**
 * GET /api/users/me — Get current user's profile
 */
router.get("/me", requireAuth, (req: Request, res: Response) => {
  try {
    const profile = userService.getProfile(req.auth!.id);
    res.json(profile);
  } catch (err: any) {
    res.status(400).json({ status: 400, message: err.message });
  }
});

/**
 * PUT /api/users/me — Update current user's profile
 */
router.put("/me", requireAuth, (req: Request, res: Response) => {
  try {
    const updated = userService.updateProfile(req.auth!.id, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ status: 400, message: err.message });
  }
});

/**
 * GET /api/users/organizations — List all organizations (admin only)
 */
router.get(
  "/organizations",
  requireAuth,
  requireRole("admin"),
  (_req: Request, res: Response) => {
    try {
      const orgs = userService.getAllOrganizations();
      res.json(orgs);
    } catch (err: any) {
      res.status(400).json({ status: 400, message: err.message });
    }
  }
);

/**
 * PATCH /api/users/:id/status — Approve or reject an organization (admin only)
 * Body: { status: "APPROVED" | "REJECTED" }
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("admin"),
  (req: Request, res: Response) => {
    try {
      const updated = userService.updateOrgStatus(req.params.id, req.body.status);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ status: 400, message: err.message });
    }
  }
);

/**
 * PATCH /api/users/:id/deactivate — Deactivate a user (admin only)
 * Body: { email: string }
 */
router.post(
  "/deactivate",
  requireAuth,
  requireRole("admin"),
  (req: Request, res: Response) => {
    try {
      userService.deactivateUser(req.auth!.id, req.body.email);
      res.json({ message: `User ${req.body.email} has been deactivated.` });
    } catch (err: any) {
      res.status(400).json({ status: 400, message: err.message });
    }
  }
);

export default router;
