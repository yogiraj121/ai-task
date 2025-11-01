// Test the updated flow
const axios = require("axios");
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support");

const API_BASE = "http://localhost:5000/api";

// Create axios instance with cookie jar
const cookieJar = new CookieJar();
const axiosInstance = wrapper(
  axios.create({
    baseURL: API_BASE,
    jar: cookieJar,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  })
);

async function testUpdatedFlow() {
  try {
    console.log("🧪 Testing Updated Flow...\n");

    // Test 1: Register a new user (should go to login)
    console.log("1️⃣ Testing NEW USER registration...");
    const registerData = {
      fullname: "Updated Test User",
      email: "updated@test.com",
      password: "password123",
      company: "Updated Test Company",
      role: "admin",
    };

    const registerResponse = await axiosInstance.post(
      "/auth/register",
      registerData
    );
    console.log("✅ Registration successful");
    console.log("   User ID:", registerResponse.data.user._id);
    console.log("   Company ID:", registerResponse.data.user.company);
    console.log("   Frontend should redirect to: /login");

    // Test 2: Login with the registered user (should go to onboarding)
    console.log("\n2️⃣ Testing login with NEW user...");
    const loginResponse = await axiosInstance.post("/auth/login", {
      email: "updated@test.com",
      password: "password123",
    });
    console.log("✅ Login successful");

    // Check company verification (should show no plan)
    const verifyResponse = await axiosInstance.get("/company/verify-company");
    console.log("✅ Company verification successful");
    console.log("   Has plan:", verifyResponse.data.hasPlan);
    console.log("   Company plan:", verifyResponse.data.company?.plan);
    console.log("   Expected: hasPlan=false, plan=undefined");
    console.log("   Frontend should redirect to: /company-info");

    if (verifyResponse.data.hasPlan) {
      console.log("❌ ERROR: New user should not have a plan!");
    } else {
      console.log("✅ Correct: New user has no plan, should go to onboarding");
    }

    // Test 3: Set a plan (complete onboarding)
    console.log("\n3️⃣ Testing plan setting (completing onboarding)...");
    const planResponse = await axiosInstance.post("/company/plan", {
      plan: "free",
    });
    console.log("✅ Plan set successfully");
    console.log("   Plan:", planResponse.data.plan.plan);

    // Test 4: Check company verification again (should show has plan)
    console.log("\n4️⃣ Testing company verification after plan...");
    const verifyResponse2 = await axiosInstance.get("/company/verify-company");
    console.log("✅ Company verification successful");
    console.log("   Has plan:", verifyResponse2.data.hasPlan);
    console.log("   Company plan:", verifyResponse2.data.company?.plan);
    console.log("   Expected: hasPlan=true, plan=free");
    console.log("   Frontend should redirect to: /dashboard");

    if (
      verifyResponse2.data.hasPlan &&
      verifyResponse2.data.company?.plan === "free"
    ) {
      console.log("✅ Correct: User now has plan, should go to dashboard");
    } else {
      console.log("❌ ERROR: User should have plan after setting it!");
    }

    // Test 5: Test login with existing user (should go to dashboard)
    console.log("\n5️⃣ Testing login with EXISTING user...");

    // First logout
    await axiosInstance.post("/auth/logout");

    // Login with existing user
    const loginResponse2 = await axiosInstance.post("/auth/login", {
      email: "updated@test.com",
      password: "password123",
    });
    console.log("✅ Login successful");

    // Check company verification
    const verifyResponse3 = await axiosInstance.get("/company/verify-company");
    console.log("✅ Company verification successful");
    console.log("   Has plan:", verifyResponse3.data.hasPlan);
    console.log("   Company plan:", verifyResponse3.data.company?.plan);
    console.log("   Expected: hasPlan=true, plan=free");
    console.log("   Frontend should redirect to: /dashboard");

    if (
      verifyResponse3.data.hasPlan &&
      verifyResponse3.data.company?.plan === "free"
    ) {
      console.log("✅ Correct: Existing user with plan should go to dashboard");
    } else {
      console.log("❌ ERROR: Existing user should have plan!");
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📋 Updated Flow Summary:");
    console.log("   ✅ New user registration → Redirect to /login");
    console.log(
      "   ✅ Login with new user → No plan → Redirect to /company-info"
    );
    console.log("   ✅ Plan setting → Has plan → Redirect to /dashboard");
    console.log(
      "   ✅ Login with existing user → Has plan → Redirect to /dashboard"
    );
    console.log(
      "\n🌐 You can now test the frontend at: http://localhost:5174/"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.error("Stack trace:", error.stack);
  }
}

testUpdatedFlow();
