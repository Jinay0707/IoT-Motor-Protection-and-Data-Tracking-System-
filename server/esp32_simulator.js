const http = require("http");

console.log("=================================================");
console.log("🤖 Starting ESP32 Motor Telemetry Simulator...");
console.log("=================================================");

function generateSensorData() {
  const isFaultScenario = Math.random() < 0.2; // 20% chance of fault simulation

  let temperature = parseFloat((35.0 + Math.random() * 15).toFixed(1));
  let voltage = parseFloat((210.0 + Math.random() * 30).toFixed(1));
  let current = parseFloat((2.5 + Math.random() * 3).toFixed(2));
  let motorStatus = "ON";
  let fault = "NORMAL";

  if (isFaultScenario) {
    const faultTypes = ["OVERHEAT", "OVERVOLTAGE", "UNDERVOLTAGE", "OVERCURRENT"];
    fault = faultTypes[Math.floor(Math.random() * faultTypes.length)];
    motorStatus = "OFF";

    if (fault === "OVERHEAT") temperature = 72.5;
    if (fault === "OVERVOLTAGE") voltage = 275.0;
    if (fault === "UNDERVOLTAGE") voltage = 165.0;
    if (fault === "OVERCURRENT") current = 12.8;
  }

  return {
    temperature,
    voltage,
    current,
    motorStatus,
    fault,
  };
}

function sendTelemetry() {
  const data = generateSensorData();
  const payload = JSON.stringify(data);

  const options = {
    hostname: "localhost",
    port: 5000,
    path: "/api/sensor-data",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  };

  const req = http.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => (body += chunk));
    res.on("end", () => {
      console.log(`[${new Date().toLocaleTimeString()}] 📤 Sent Telemetry -> Status: ${res.statusCode}`);
      console.log(`   Data: Temp=${data.temperature}°C, Volt=${data.voltage}V, Curr=${data.current}A, Status=${data.motorStatus}, Fault=${data.fault}`);
      try {
        const parsed = JSON.parse(body);
        console.log(`   Response: ${parsed.message}`);
      } catch (e) {
        console.log(`   Response: ${body}`);
      }
      console.log("-------------------------------------------------");
    });
  });

  req.on("error", (error) => {
    console.error(`❌ Connection Error: ${error.message}`);
    console.log("👉 Please start the server using: cd server && node server.js");
  });

  req.write(payload);
  req.end();
}

// Send data immediately, then repeat every 5 seconds
sendTelemetry();
setInterval(sendTelemetry, 5000);
