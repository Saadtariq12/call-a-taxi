import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get token from cookies OR Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new APIError(401, "Unauthorized request - No token found");
    }

    // 2. Decode the token using your Secret Key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // 3. Find user in DB (excluding sensitive data like password)
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new APIError(401, "Invalid Access Token");
    }

    // 4. ATTACH USER TO REQ OBJECT
    req.user = user;

    // 5. Pass control to the next function (the controller)
    next();
  } catch (error) {
    throw new APIError(401, error?.message || "Invalid access token");
  }
});