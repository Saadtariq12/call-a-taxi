import { Router } from "express";
import {
  select_location,
  accept_ride,
  cancel_ride,
  reject_offer,
} from "../controllers/passenger.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Adjust path to your auth middleware

const router = Router();

// Secure all passenger routes with JWT authentication
router.use(verifyJWT);

// 1. Route for requesting a ride
router.route("/select-location").post(select_location);

// 2. Route for accepting a driver's fare offer
router.route("/accept-ride").patch(accept_ride);

// 3. Route for cancelling a ride request
router.route("/cancel-ride").patch(cancel_ride);

router.route("/reject-offer").patch(reject_offer);

export default router;
