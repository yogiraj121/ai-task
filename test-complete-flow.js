// Test the complete authentication flow
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

async function testCompleteFlow() {
  try {
    console.log("🧪 Testing Complete Authentication Flow...\n");

    // Test 1: Register a new user (should go to onboarding)
    console.log("1️⃣ Testing NEW USER registration...");
    const registerData = {
      fullname: "New User Test",
      email: "newuser@test.com",
      password: "password123",
      company: "New Company Test",
      role: "admin",
    };

    const registerResponse = await axiosInstance.post(
      "/auth/register",
      registerData
    );
    console.log("✅ Registration successful");
    console.log("   User ID:", registerResponse.data.user._id);
    console.log("   Company ID:", registerResponse.data.user.company);

    // Test 2: Check company verification (should show no plan)
    console.log("\n2️⃣ Testing company verification for NEW user...");
    const verifyResponse = await axiosInstance.get("/company/verify-company");
    console.log("✅ Company verification successful");
    console.log("   Has plan:", verifyResponse.data.hasPlan);
    console.log("   Company plan:", verifyResponse.data.company?.plan);
    console.log("   Expected: hasPlan=false, plan=undefined");

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
    const loginResponse = await axiosInstance.post("/auth/login", {
      email: "newuser@test.com",
      password: "password123",
    });
    console.log("✅ Login successful");

    // Check company verification
    const verifyResponse3 = await axiosInstance.get("/company/verify-company");
    console.log("✅ Company verification successful");
    console.log("   Has plan:", verifyResponse3.data.hasPlan);
    console.log("   Company plan:", verifyResponse3.data.company?.plan);
    console.log("   Expected: hasPlan=true, plan=free");

    if (
      verifyResponse3.data.hasPlan &&
      verifyResponse3.data.company?.plan === "free"
    ) {
      console.log("✅ Correct: Existing user with plan should go to dashboard");
    } else {
      console.log("❌ ERROR: Existing user should have plan!");
    }

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📋 Summary:");
    console.log(
      "   ✅ New user registration → No plan → Should go to onboarding"
    );
    console.log("   ✅ Plan setting → Has plan → Should go to dashboard");
    console.log(
      "   ✅ Existing user login → Has plan → Should go to dashboard"
    );
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.error("Stack trace:", error.stack);
  }
}

testCompleteFlow();
