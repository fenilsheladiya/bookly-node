import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import SubscribeModel from "../models/SubscribeModel.js";
import contactModel from "../models/contactModel.js";
import JWT from "jsonwebtoken";
import storage from "node-persist";
import nodemailer from "nodemailer";

storage.init(/* options ... */);

export const subscriberController = async (req, res) => {
  try {
    const { email } = req.body;
    //validations

    if (!email) {
      return res.send({ message: "Email is Required" });
    }

    //check user
    const exisitingUser = await SubscribeModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already subscriber",
      });
    }

    const user = await new SubscribeModel({
      email,
    }).save();

    res.status(201).send({
      success: true,
      message: "User subscribe Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in subscriber",
      error,
    });
  }
};

//user
export const getAllsubscriberController = async (req, res) => {
  try {
    const subscribe = await SubscribeModel.find({}).sort({ createdAt: -1 });
    // res.json(user)
    return res.status(200).send({
      success: true,
      counTotal: subscribe.length,
      message: "all Subscriber ",
      subscribe,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error WHile Geting Subscriber",
      error,
    });
  }
};

//post contact
export const contactController = async (req, res) => {
  try {
    const { name, surname, email, subject, message } = req.body;
    //validations

    if (!name) {
      return res.send({ message: "name is Required" });
    }
    if (!surname) {
      return res.send({ message: "surname is Required" });
    }
    if (!email) {
      return res.send({ message: "Email is Required" });
    }
    if (!subject) {
      return res.send({ message: "subject is Required" });
    }
    if (!message) {
      return res.send({ message: "message is Required" });
    }

    //check user
    const exisitingUser = await contactModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already contact",
      });
    }

    const contact = await new contactModel({
      name,
      surname,
      email,
      subject,
      message,
    }).save();

    res.status(201).send({
      success: true,
      message: "User contact Successfully",
      contact,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in contact",
      error,
    });
  }
};

//user
export const getAllcontactController = async (req, res) => {
  try {
    const contact = await contactModel.find({}).sort({ createdAt: -1 });
    // res.json(user)
    return res.status(200).send({
      success: true,
      counTotal: contact.length,
      message: "all contact ",
      contact,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error WHile Geting contact",
      error,
    });
  }
};

//post register
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address,answer} = req.body;
    //validations
    if (!name) {
      return res.status(400).send({ message: "Name is Required" });
    }
    if (!email) {
      return res.status(400).send({ message: "Email is Required" });
    }
    if (!password) {
      return res.status(400).send({ message: "Password is Required" });
    }
    if (!phone) {
      return res.status(400).send({ message: "Phone no is Required" });
    }
    if (!address) {
      return res.status(400).send({ message: "Address is Required" });
    }
    if (!answer) {
      return res.status(400).send({ message: "Answer is Required" });
    }
    //check user
    const exisitingUser = await userModel.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "Already Register please login",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Registeration",
      error,
    });
  }
};

//post login

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "invalid email or password",
      });
    }
    // Check user
    const user = await userModel.findOne({ email, role: { $in: ["0", "1"] } });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }

    //match password
    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(200).send({
        success: false,
        message: "invalid password",
      });
    }

    //token
    // const token = await JWT.sign({_id:user._id},process.env.JWT_SECRET,{  expiresIn: "7d",});
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token, // token create karavyu khali and middleware ma chek karavshe
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//user
export const getAlluserController = async (req, res) => {
  try {
    const user = await userModel.find({}).sort({ createdAt: -1 });
    // res.json(user)
    return res.status(200).send({
      success: true,
      counTotal: user.length,
      message: "all user ",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error WHile Geting user",
      error,
    });
  }
};

export const forgotPasswordController_email = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(200).send({ message: "Emai is required" });
    }

    // Check if email exists
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User with this email does not exist",
      });
    }
    const aa = await storage.setItem("user", user?._id);
    // console.log(aa);

    // Generate OTP and send email
    var set_otp = Math.floor(100000 + Math.random() * 900000);
    await storage.setItem("otp", set_otp);

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "abhidesai902@gmail.com",
        pass: "xnjhyqfjdxchibnz",
      },
    });

    var mailOptions = {
      from: "abhidesai902@gmail.com",
      to: email, // Use the extracted email here
      subject: "Sending Email using Node.js",
      text: "Your OTP is: " + set_otp,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(200).send({
          success: false,
          message: "Error in sending email",
          error,
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Email sent: " + info.response,
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const forgotPasswordController_otp = async (req, res) => {
  try {
    const otp = await storage.getItem("otp"); // Corrected declaration of otp variable

    const { otpp } = req.body;
    if (!otpp) {
      return res.status(200).send({ message: "Otp is required" });
    }

    if (otp == otpp) {
      // Used strict equality operator (===) for comparison
      res.status(200).send({
        success: true,
        message: "Otp has matched Successfully",
      });
    } else {
      res.status(200).send({
        success: false,
        message: "Otp has Not matched",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { Password, CPassword } = req.body;

    if (!Password) {
      return res.status(400).send({ message: "New Password is required" });
    }
    if (!CPassword) {
      return res.status(400).send({ message: "Confirm Password is required" });
    }
    if (Password == CPassword) {
      const email = await storage.getItem("user");

      if (!email) {
        return res.status(400).send({ message: "Email not found in storage" });
      }

      console.log(email);
      //check
      const user = await userModel.findById(email);

      const hashed = await hashPassword(CPassword);
      const neww = await userModel.findByIdAndUpdate(user._id, {
        password: hashed,
      });

      console.log(neww);
      await storage.clear();
      res.status(200).send({
        success: true,
        message: "Password Reset Successfully",
      });
    } else {
      res.status(200).send({
        success: false,
        message: "Password and Confirm Password Not Matched",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

//update prfole
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);
    //password
    if (password && password.length < 6) {
      return res.json({ error: "Passsword is required and 6 character long" }); //password male ke na male and pasword add kare to teni length 6 to hovi j joiye
    }
    const hashedPassword = password ? await hashPassword(password) : undefined; //passwrod male to hashed thay jay no male to old j password reshe
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name, // jo  input ma value new nakhe to update thay nakr old value get karshe
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Update profile",
      error,
    });
  }
};

//orders
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};
//orders
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Geting Orders",
      error,
    });
  }
};

//order status
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updateing Order",
      error,
    });
  }
};
