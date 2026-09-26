const mongoose = require("mongoose");

const sensorDataSchema = new mongoose.Schema(
  {
    temperature: {
      type: Number,
      required: true,
    },

    voltage: {
      type: Number,
      required: true,
    },

    current: {
      type: Number,
      required: true,
    },

    motorStatus: {
      type: String,
      enum: ["ON", "OFF"],
      required: true,
    },

    fault: {
      type: String,
      default: "NORMAL",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SensorData", sensorDataSchema);