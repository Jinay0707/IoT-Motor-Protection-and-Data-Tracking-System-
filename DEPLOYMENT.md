# IoT Motor Protection System - Free Deployment Guide

This guide details how to deploy the **IoT Motor Protection System** for free using **Render.com** (Backend API) and **Vercel** (Frontend React Dashboard).

---

## 🚀 1. Deploy Backend API (Render.com)

1. Sign up at [Render.com](https://render.com) using your GitHub account.
2. Click **New +** -> **Web Service**.
3. Connect your repository: `Jinay0707/IoT-Motor-Protection-and-Data-Tracking-System-`.
4. Fill in the deployment details:
   - **Name**: `iot-motor-protection-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Click **Environment Variables** and add:
   - `MONGODB_URI` = `mongodb+srv://mevadajinay07_db_user:sRft2juPngVsUl1T@cluster0.vzm6xyz.mongodb.net/iot-motor-protection?retryWrites=true&w=majority`
   - `PORT` = `5000`
6. Click **Create Web Service**.
7. Once deployed, Render will generate a live HTTPS URL (e.g. `https://iot-motor-protection-api.onrender.com`).

---

## 🎨 2. Deploy Frontend Dashboard (Vercel)

1. Sign up at [Vercel.com](https://vercel.com) with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Jinay0707/IoT-Motor-Protection-and-Data-Tracking-System-`.
4. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
5. Click **Deploy**.
6. Your live web dashboard will be accessible via a free URL (e.g., `https://iot-motor-protection.vercel.app`).

---

## 📟 3. Connect ESP32 / Wokwi to Live Production Backend

Update lines 18-20 in `esp32/esp32_motor_protection.ino` with your Render backend URL:

```cpp
// Production Live Backend URL
const char* API_URL = "https://iot-motor-protection-api.onrender.com/api/sensor-data";
```

Now your ESP32 hardware and Wokwi simulator can transmit telemetry 24/7 from anywhere in the world!
