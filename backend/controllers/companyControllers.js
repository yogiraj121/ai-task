const Company = require("../models/company");
const User = require("../models/users");

const companyCreate = async (req, res) => {
  try {
    const { name, domain, size } = req.body;
    const { userId } = req.user;
    if (!name) return res.status(400).json({ message: "Company name is required" });

    let company = await Company.findOneAndUpdate(
      { name },
      { $set: { ...(domain && { domain }), ...(size && { size }) } },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(userId, { company: company._id });
    res.status(200).json({ message: "Company saved", company });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

const companyPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const { userId } = req.user;
    const allowedPlans = ['free', 'pro', 'enterprise'];
    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ message: "Invalid plan. Allowed: free, pro, enterprise" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const updatedCompany = await Company.findByIdAndUpdate(
      user.company,
      { $set: { plan }, owner: userId },
      { new: true }
    );

    return res.json({ message: "Plan updated", plan: updatedCompany});
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { companyCreate, companyPlan };
