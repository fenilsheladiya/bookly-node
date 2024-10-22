import express from "express";
import {
  registerController,
  loginController,
  testController,
  forgotPasswordController_email,
  forgotPasswordController_otp,
  forgotPasswordController,
    updateProfileController,
    getOrdersController,
    getAllOrdersController,
    orderStatusController,
    getAlluserController,
    subscriberController,
    getAllsubscriberController,
    contactController,
    getAllcontactController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//routing

//subscriber || METHOD POST
router.post("/subscriber", subscriberController);
//all subscriber
router.get("/all-subscriber", requireSignIn, isAdmin, getAllsubscriberController);



//contact || METHOD POST
router.post("/contact", contactController);
//all contact
router.get("/all-contact", requireSignIn, isAdmin, getAllcontactController);





//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || METHOD POST
router.post("/login", loginController);

//all user
router.get("/all-user", requireSignIn, isAdmin, getAlluserController);
//test routes
router.get("/test", requireSignIn, isAdmin, testController); //controller pela middleware pass karave jo ready hoy to contoller work kare

//protected route auth user
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});

//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//Forgot Password email sent and otp || POST
router.post("/forgot-password", forgotPasswordController_email);

//Forgot Password otp matched || POST
router.post("/forgot-password-otp", forgotPasswordController_otp);

router.put("/forgot-password-newpassword", forgotPasswordController);



//update profile
router.put("/profile", requireSignIn, updateProfileController);


//orders
router.get("/orders", requireSignIn, getOrdersController);

//all orders
router.get("/all-orders", requireSignIn, isAdmin, getAllOrdersController);

// order status update
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
