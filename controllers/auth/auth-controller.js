require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
// REFISTER
const secretKey = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.json({
        success: false,
        message: "Email Already exists! Please try again",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });
    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration succssfuly",
    });
    console.log(
      "🚀 ~ file: auth-controller.js:5 ~ registerUser ~ req.body:",
      secretKey,
    );
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Somthing was wrong",
    });
  }
};
// LOGIN

const loginUser = async (req, res) => {
  console.log(process.env.JWT_SECRET);
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists!",
      });

    const chekPassowrdMatch = await bcrypt.compare(
      password,
      checkUser.password,
    );
    if (!chekPassowrdMatch)
      return res.json({
        success: false,
        message: "Incorret password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true, // ضروري جداً لأن سيرفر Vercel شغال على بروتوكول HTTPS
        sameSite: "none", // ضروري جداً عشان المتصفح يسمح بإرسال الـ Cookie بين الـ localhost وسيرفر Vercel
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Logged in successfully",
        user: {
          email: checkUser.email,
          role: checkUser.role,
          id: checkUser._id, // 🌟 غيرناها لـ _id عشان تقرأ صح من الـ MongoDB
          userName: checkUser.userName,
        },
      });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Somthing was wrong",
    });
  }
};
//LOGUT
const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out succssfuly",
  });
};
// AUTH MIDDLEWARE
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user! Please login.",
    });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // بنخزن بياناته (Id, role) جوه الـ req
    next(); // عدي، طالما مسجل دخول اخل جوه
  } catch (error) {
    res.clearCookie("token").status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

const isAdminMiddleware = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user! Please login.",
    });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // بنخزن بياناته (Id, role) جوه الـ req
    if (req.user.role !== "admin") {
      res.clearCookie("token").status(401).json({
        success: false,
        message: "Unauthorised user! Only admin can access",
      });
      return;
    }
    next(); // عدي، طالما مسجل دخول اخل جوه
  } catch (error) {
    res.clearCookie("token").status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  isAdminMiddleware,
};
