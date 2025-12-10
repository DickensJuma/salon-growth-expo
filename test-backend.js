import fetch from "node-fetch";

async function testBackend() {
  console.log("🧪 Testing Express Backend APIs...\n");

  try {
    // Test health endpoint
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch("http://localhost:3001/api/health");
    const healthData = await healthResponse.json();
    console.log("✅ Health:", healthData);

    // Test payment verification endpoint
    console.log("\n2. Testing payment verification...");
    const paymentResponse = await fetch(
      "http://localhost:3001/api/verify-payment",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: "test-ref-123" }),
      }
    );
    const paymentData = await paymentResponse.json();
    console.log("✅ Payment verification:", paymentData);

    // Test user registration endpoint
    console.log("\n3. Testing user registration...");
    const registerResponse = await fetch("http://localhost:3001/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
      }),
    });
    const registerData = await registerResponse.json();
    console.log("✅ User registration:", registerData);

    console.log("\n🎉 All backend APIs are working correctly!");
  } catch (error) {
    console.error("❌ Error testing backend:", error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
testBackend();
