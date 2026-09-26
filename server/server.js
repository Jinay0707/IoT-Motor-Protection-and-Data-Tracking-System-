const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const SensorData = require("./models/SensorData");

const app = express();

app.use(cors());
app.use(express.json());

// Remote Motor Command State (AUTO, FORCE_ON, FORCE_OFF, RESET)
let currentMotorCommand = "AUTO";

// In-memory fallback store when MongoDB Atlas connection is unavailable
const inMemoryStore = [];

// MongoDB connection with fallback warning
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 4000,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas Cloud Database!");
  })
  .catch((error) => {
    console.log("\n⚠️  MongoDB Atlas Connection Notice:");
    console.log("--------------------------------------------------");
    console.log("Your current IP address is not whitelisted on MongoDB Atlas.");
    console.log("👉 FIX STEP: Go to https://cloud.mongodb.com");
    console.log("   -> Network Access -> Add IP Address -> 'Allow Access From Anywhere' (0.0.0.0/0)");
    console.log("--------------------------------------------------");
    console.log("💡 [FALLBACK ENABLED]: Server is now using In-Memory Storage.");
    console.log("   All API endpoints and Dashboard will work seamlessly!\n");
  });

// Home
app.get("/", (req, res) => {
  res.send("Motor Protection IoT API Running");
});

// Remote Motor Control Endpoint (called by Web Dashboard buttons)
app.post("/api/motor-control", (req, res) => {
  const { command } = req.body; // "ON", "OFF", "RESET", "AUTO"
  if (!["ON", "OFF", "RESET", "AUTO"].includes(command)) {
    return res.status(400).json({ success: false, message: "Invalid command. Must be ON, OFF, RESET, or AUTO" });
  }

  currentMotorCommand = command;
  console.log(`🕹️ [Remote Command Set by Website]: ${command}`);

  res.json({
    success: true,
    message: `Motor command set to ${command}`,
    command: currentMotorCommand,
  });
});

// Get current motor command state
app.get("/api/motor-control", (req, res) => {
  res.json({ command: currentMotorCommand });
});

// Receive ESP32 telemetry data & return active command to ESP32
app.post("/api/sensor-data", async (req, res) => {
  try {
    const { temperature, voltage, current, motorStatus, fault } = req.body;

    // Validate required fields
    if (temperature === undefined || voltage === undefined || current === undefined || !motorStatus) {
      return res.status(400).json({
        success: false,
        message: "Missing required sensor fields: temperature, voltage, current, motorStatus",
      });
    }

    const newRecord = {
      _id: Date.now().toString(),
      temperature: Number(temperature),
      voltage: Number(voltage),
      current: Number(current),
      motorStatus,
      fault: fault || "NORMAL",
      createdAt: new Date(),
    };

    // If MongoDB is connected, save to DB
    if (mongoose.connection.readyState === 1) {
      const dbData = await SensorData.create({
        temperature,
        voltage,
        current,
        motorStatus,
        fault: fault || "NORMAL",
      });
      console.log(`✅ [Saved to MongoDB] Temp: ${temperature}°C | Volt: ${voltage}V | Curr: ${current}A | Motor: ${motorStatus} | Fault: ${fault || "NORMAL"} | Command Sent to ESP32: ${currentMotorCommand}`);
      return res.status(201).json({
        success: true,
        message: "Sensor data saved to MongoDB Atlas",
        data: dbData,
        command: currentMotorCommand, // Sends active command to ESP32
      });
    }

    // Fallback: Save to In-Memory Store
    inMemoryStore.unshift(newRecord);
    if (inMemoryStore.length > 200) inMemoryStore.pop(); // Keep last 200 items

    console.log(`⚡ [Saved to In-Memory Store] Temp: ${temperature}°C | Volt: ${voltage}V | Curr: ${current}A | Motor: ${motorStatus} | Fault: ${fault || "NORMAL"} | Command Sent to ESP32: ${currentMotorCommand}`);

    return res.status(201).json({
      success: true,
      message: "Sensor data saved to in-memory store",
      data: newRecord,
      command: currentMotorCommand, // Sends active command to ESP32
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get latest data
app.get("/api/sensor-data/latest", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const data = await SensorData.findOne().sort({ createdAt: -1 });
      const latest = data ? data.toObject() : (inMemoryStore[0] || null);
      if (latest) latest.activeCommand = currentMotorCommand;
      return res.json(latest);
    }
    const latest = inMemoryStore[0] || null;
    if (latest) latest.activeCommand = currentMotorCommand;
    return res.json(latest);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get history
app.get("/api/sensor-data", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const data = await SensorData.find().sort({ createdAt: -1 }).limit(100);
      return res.json(data);
    }
    return res.json(inMemoryStore);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📥 ESP32 Endpoint: http://localhost:${PORT}/api/sensor-data`);
});