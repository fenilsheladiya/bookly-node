import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// Protected routes token-based middleware
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    // If verification succeeds, you can proceed to the next middleware or route handler
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized" });
  }
};

//admin access
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id); // jeno role 1 hoy te admin hashe and token check karshe and by default role 0 hashe.

    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send({
      success: false,
      error,
      message: "Error in admin middelware",
    });
  }
};
