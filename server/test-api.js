const http = require("http");

console.log("🚀 Testing IoT Motor Protection API...");

const testData = JSON.stringify({
  temperature: 45.2,
  voltage: 235,
  current: 3.8,
  motorStatus: "ON",
  fault: "NORMAL",
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/sensor-data",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(testData),
  },
};

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log(`\n✅ Status Code: ${res.statusCode}`);
    console.log("📩 Server Response:");
    try {
      console.log(JSON.stringify(JSON.parse(body), null, 2));
    } catch (e) {
      console.log(body);
    }
  });
});

req.on("error", (error) => {
  console.error("❌ Error connecting to server:", error.message);
  console.log("👉 Make sure your server is running using: node server.js");
});

req.write(testData);
req.end();
