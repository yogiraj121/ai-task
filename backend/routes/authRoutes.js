const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  logoutUser,
} = require("../controllers/authControllers");
const {
  registerValidators,
  loginValidators,
} = require("../middlewares/validators");
const { protectedRoute } = require("../middlewares/protectedRoute");
const User = require("../models/users");

router.post("/register", registerUser);
router.post("/login", loginValidators, loginUser);
router.get("/profile", protectedRoute, getProfile);
router.post("/forgot-password", protectedRoute, forgotPassword);
router.post("/logout", protectedRoute, logoutUser);
router.get("/verify", protectedRoute, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(400).json({ message: "User ID not found" });

    const user = await User.findById(userId)
      .select("-password")
      .populate("company");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
