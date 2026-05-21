import { Router } from "express";
import { identify_user, login, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.route("/register").post(registerUser)
router.route("/login").post(login)
router.route("/role").post(verifyJWT,identify_user)
export default router