import { Router, Request, Response } from "express";
import { AuthService } from "../services/authService";

const router = Router();
const authService = new AuthService();

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ status: 400, message: err.message });
  }
});

/**
 * POST /api/auth/register/volunteer
 * Body: { email, password, confirmPassword, firstName, lastName }
 */
router.post("/register/volunteer", async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, firstName, lastName } = req.body;
    const result = await authService.registerVolunteer(
      email, password, confirmPassword, firstName, lastName
    );
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ status: 400, message: err.message });
  }
});

/**
 * POST /api/auth/register/organization
 * Body: { email, password, confirmPassword, orgName, location, description }
 */
router.post("/register/organization", async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, orgName, location, description } = req.body;
    const result = await authService.registerOrganization(
      email, password, confirmPassword, orgName, location, description
    );
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ status: 400, message: err.message });
  }
});

export default router;
