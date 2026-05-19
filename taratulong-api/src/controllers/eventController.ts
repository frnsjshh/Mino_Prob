import { Router, Request, Response } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import { EventService } from "../services/eventService";

const router = Router();
const eventService = new EventService();

/**
 * GET /api/events — List all events
 */
router.get("/", requireAuth, (_req: Request, res: Response) => {
  try {
    const events = eventService.getAllEvents();
    res.json(events);
  } catch (err: any) {
    res.status(400).json({ status: 400, message: err.message });
  }
});

/**
 * GET /api/events/my — Get events created by the current organization
 */
router.get(
  "/my",
  requireAuth,
  requireRole("organization"),
  (req: Request, res: Response) => {
    try {
      const events = eventService.getEventsByOrganizer(req.auth!.id);
      res.json(events);
    } catch (err: any) {
      res.status(400).json({ status: 400, message: err.message });
    }
  }
);

/**
 * GET /api/events/:id — Get a single event by ID
 */
router.get("/:id", requireAuth, (req: Request, res: Response) => {
  try {
    const event = eventService.getEventById(req.params.id);
    res.json(event);
  } catch (err: any) {
    const status = err.name === "NotFoundError" ? 404 : 400;
    res.status(status).json({ status, message: err.message });
  }
});

/**
 * POST /api/events — Create a new event (organization only)
 */
router.post(
  "/",
  requireAuth,
  requireRole("organization"),
  (req: Request, res: Response) => {
    try {
      const event = eventService.createEvent(req.auth!.id, req.body);
      res.status(201).json(event);
    } catch (err: any) {
      res.status(400).json({ status: 400, message: err.message });
    }
  }
);

export default router;
