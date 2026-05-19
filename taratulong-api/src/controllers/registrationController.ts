import { Router, Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { RegistrationService } from "../services/registrationService";

const router = Router();
const regService = new RegistrationService();

/**
 * POST /api/registrations — Volunteer applies for an event
 * Body: { eventId: string }
 */
router.post(
  "/",
  requireAuth,
  requireRole("volunteer"),
  (req: Request, res: Response) => {
    try {
      const reg = regService.applyForEvent(req.auth!.id, req.body.eventId);
      res.status(201).json(reg);
    } catch (err: any) {
      const status = err.name === "NotFoundError" ? 404 : 400;
      res.status(status).json({ status, message: err.message });
    }
  }
);

/**
 * GET /api/registrations/my — Volunteer's application history
 */
router.get(
  "/my",
  requireAuth,
  requireRole("volunteer"),
  (req: Request, res: Response) => {
    try {
      const regs = regService.getVolunteerHistory(req.auth!.id);
      res.json(regs);
    } catch (err: any) {
      res.status(400).json({ status: 400, message: err.message });
    }
  }
);

/**
 * GET /api/registrations/event/:eventId — Event applicants (org only)
 */
router.get(
  "/event/:eventId",
  requireAuth,
  requireRole("organization"),
  (req: Request, res: Response) => {
    try {
      const regs = regService.getEventApplicants(req.params.eventId, req.auth!.id);
      res.json(regs);
    } catch (err: any) {
      const status = err.name === "NotFoundError" ? 404 : 400;
      res.status(status).json({ status, message: err.message });
    }
  }
);

/**
 * PATCH /api/registrations/:id — Update registration (org only)
 * Body: { status?, participated?, rating? }
 */
router.patch(
  "/:id",
  requireAuth,
  requireRole("organization"),
  (req: Request, res: Response) => {
    try {
      const updated = regService.updateRegistration(
        req.params.id,
        req.auth!.id,
        req.body
      );
      res.json(updated);
    } catch (err: any) {
      const status = err.name === "NotFoundError" ? 404 : 400;
      res.status(status).json({ status, message: err.message });
    }
  }
);

export default router;
