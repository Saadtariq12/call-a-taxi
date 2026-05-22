import { Router } from "express";
import { propose_fair } from "../controllers/driver.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all driver routes
router.use(verifyJWT);

// Route for a driver to submit a fare offer
router.route("/propose-fare").post(propose_fair);

export default router;
