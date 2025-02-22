import { ApiError } from "../utils/ApiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { user } from "../Models/user.models.js";

export const verifyJWT = asynchandler(async (req, res, next) => {
    try {
        // Extract token from either cookies or Authorization header
        const token = req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];
        
        // Log extracted tokens for debugging
        console.log("Cookie Token:", req.cookies?.accessToken);
        console.log("Authorization Header:", req.headers?.authorization);
        console.log("Extracted Token:", token);

        if (!token) {
            throw new ApiError(401, "Access token not found");
        }

        // Verify the token
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded Token:", decode);

        // Check if the token contains _id
        if (!decode?._id) {
            throw new ApiError(400, "Invalid Token: _id not found");
        }

        // Find user by decoded _id
        const authenticatedUser = await user.findById(decode._id).select("-Password -RefreshTokens");
        if (!authenticatedUser) {
            throw new ApiError(404, "User not found");
        }

        // Attach user to request object
        req.user = authenticatedUser;
        console.log("Authenticated User:", req.user);  // Debugging

        next();
    } catch (error) {
        console.error("JWT Error:", error);
        if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid access token");
        } else if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Access token expired");
        } else {
            throw new ApiError(500, "Internal Server Error");
        }
    }
});
