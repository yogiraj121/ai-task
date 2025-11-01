const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Company = require("../models/company");

const registerUser = async (req, res) => {
  const { fullname, email, password, company, role } = req.body;
  console.log(req.body);
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const companyId = await new Company({ name: company }).save(); // Use the company variable from the request body
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const user = await User.create({
      fullname,
      email,
      password: hash,
      company: companyId._id,
      role,
    });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
      path: "/",
    });
    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (err) {
    console.error("There was an error!", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
      path: "/",
    });

    // return a sanitized user object (remove password) instead of user.company[1]
    const safeUser = user.toObject ? user.toObject() : { ...user };
    if (safeUser.password) delete safeUser.password;

    return res.json({ msg: "User logged in successfully", user: safeUser });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "No user with that email" });

    // Use a separate secret for reset tokens if available
    const resetSecret = process.env.JWT_RESET_SECRET || process.env.JWT_SECRET;
    const resetToken = jwt.sign({ userId: user._id }, resetSecret, {
      expiresIn: "15m",
    });

    // Construct a reset link for the client. In production you would email this link.
    const resetUrl = `${
      process.env.CLIENT_URL || ""
    }/reset-password/${resetToken}`;

    return res.json({
      message:
        "Password reset link generated. Send this link to the user via email.",
      resetUrl,
      // For development purposes you may return the token (remove in production)
      resetToken,
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    sameSite: "lax",
    path: "/",
  });
  return res.json({ message: "User logged out successfully" });
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  logoutUser,
};
