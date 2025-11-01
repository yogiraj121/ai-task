const express = require("express");
const router = express.Router();
const Company = require("../models/company");
const User = require("../models/users");
const {
  companyCreate,
  companyPlan,
} = require("../controllers/companyControllers");
const { protectedRoute } = require("../middlewares/protectedRoute");

router.post("/create", protectedRoute, companyCreate);
router.post("/plan", protectedRoute, companyPlan);

router.get("/verify-company", protectedRoute, async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) return res.status(400).json({ message: "User ID not found" });

    // Get user data with company reference
    const user = await User.findById(userId)
      .select("-password")
      .populate("company");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.company) {
      return res
        .status(400)
        .json({ message: "Company not found in user data" });
    }

    // Get company data
    const company = user.company;
    if (!company) return res.status(404).json({ message: "Company not found" });

    return res.json({
      success: true,
      user,
      company,
      hasPlan: !!company.plan,
    });
  } catch (err) {
    console.error("verifyCompany error:", err);
    return res
      .status(500)
      .json({ message: "Server error while verifying company" });
  }
});

module.exports = router;
