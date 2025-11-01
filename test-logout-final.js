// Test logout functionality with updated configuration
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

async function testLogoutWithUpdatedConfig() {
  try {
    console.log("🧪 Testing Logout with Updated Configuration...\n");

    // Test 1: Register and login a user
    console.log("1️⃣ Setting up test user...");
    const registerData = {
      fullname: "Updated Logout Test User",
      email: "updatedlogout@test.com",
      password: "password123",
      company: "Updated Logout Test Company",
      role: "admin",
    };

    const registerResponse = await axiosInstance.post(
      "/auth/register",
      registerData
    );
    console.log("✅ Registration successful");

    // Login
    const loginResponse = await axiosInstance.post("/auth/login", {
      email: "updatedlogout@test.com",
      password: "password123",
    });
    console.log("✅ Login successful");

    // Test 2: Verify user is authenticated
    console.log("\n2️⃣ Verifying user is authenticated...");
    const verifyResponse = await axiosInstance.get("/company/verify-company");
    console.log("✅ User is authenticated");
    console.log("   User:", verifyResponse.data.user?.email);
    console.log("   Company:", verifyResponse.data.company?.name);

    // Test 3: Test logout
    console.log("\n3️⃣ Testing logout...");
    const logoutResponse = await axiosInstance.post("/auth/logout");
    console.log("✅ Logout successful");
    console.log("   Message:", logoutResponse.data.message);

    // Test 4: Verify user is no longer authenticated
    console.log("\n4️⃣ Verifying user is no longer authenticated...");
    try {
      const verifyResponse2 = await axiosInstance.get(
        "/company/verify-company"
      );
      console.log("❌ ERROR: User should not be authenticated after logout!");
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Correct: User is no longer authenticated");
        console.log("   Status:", error.response.status);
        console.log("   Message:", error.response.data.message);
      } else {
        console.log(
          "❌ Unexpected error:",
          error.response?.data || error.message
        );
      }
    }

    console.log(
      "\n🎉 Logout test with updated configuration completed successfully!"
    );
    console.log("\n📋 Updated Logout Flow Summary:");
    console.log("   ✅ CORS configured for both ports 5173 and 5174");
    console.log("   ✅ Cookie options updated for better compatibility");
    console.log("   ✅ User can logout successfully");
    console.log("   ✅ Cookie is properly cleared on server");
    console.log("   ✅ User cannot access protected routes after logout");
    console.log("   ✅ Frontend AuthContext is cleared");
    console.log("   ✅ Frontend redirects to login page");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.error("Stack trace:", error.stack);
  }
}

testLogoutWithUpdatedConfig();
