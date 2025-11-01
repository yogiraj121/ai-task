// Simple test script to verify the authentication flow
const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

async function testAuthFlow() {
  try {
    console.log("Testing authentication flow...");

    // Test 1: Register a new user
    console.log("\n1. Testing user registration...");
    const registerData = {
      fullname: "Test User",
      email: "test@example.com",
      password: "password123",
      company: "Test Company",
      role: "admin",
    };

    const registerResponse = await axios.post(
      `${API_BASE}/auth/register`,
      registerData,
      {
        withCredentials: true,
      }
    );
    console.log("Registration response:", registerResponse.data);

    // Test 2: Check company verification
    console.log("\n2. Testing company verification...");
    const verifyResponse = await axios.get(
      `${API_BASE}/company/verify-company`,
      {
        withCredentials: true,
      }
    );
    console.log("Company verification response:", verifyResponse.data);
    console.log("Has plan:", verifyResponse.data.hasPlan);
    console.log("Company plan:", verifyResponse.data.company?.plan);

    // Test 3: Set a plan
    console.log("\n3. Testing plan setting...");
    const planResponse = await axios.post(
      `${API_BASE}/company/plan`,
      {
        plan: "free",
      },
      {
        withCredentials: true,
      }
    );
    console.log("Plan setting response:", planResponse.data);

    // Test 4: Check company verification again
    console.log("\n4. Testing company verification after plan...");
    const verifyResponse2 = await axios.get(
      `${API_BASE}/company/verify-company`,
      {
        withCredentials: true,
      }
    );
    console.log("Company verification response:", verifyResponse2.data);
    console.log("Has plan:", verifyResponse2.data.hasPlan);
    console.log("Company plan:", verifyResponse2.data.company?.plan);
  } catch (error) {
    console.error("Test failed:", error.response?.data || error.message);
  }
}

testAuthFlow();
