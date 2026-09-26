import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Zap,
  Activity,
  Cpu,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Play,
  Square,
  RotateCcw,
  Power,
} from 'lucide-react';
import MetricCard from './components/MetricCard';
import StatusBadge from './components/StatusBadge';
import TelemetryChart from './components/TelemetryChart';
import HistoryTable from './components/HistoryTable';

export default function App() {
  const [latestData, setLatestData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeCommand, setActiveCommand] = useState('AUTO');
  const [commandLoading, setCommandLoading] = useState(false);

  const fetchTelemetryData = async () => {
    try {
      // Fetch Latest Sensor Data
      const latestRes = await fetch('/api/sensor-data/latest');
      if (latestRes.ok) {
        const latestJson = await latestRes.json();
        if (latestJson) {
          setLatestData(latestJson);
          if (latestJson.activeCommand) setActiveCommand(latestJson.activeCommand);
          setIsLive(true);
          setErrorMsg(null);
        }
      } else {
        const errJson = await latestRes.json().catch(() => ({}));
        if (errJson.message) setErrorMsg(errJson.message);
      }

      // Fetch History Data
      const historyRes = await fetch('/api/sensor-data');
      if (historyRes.ok) {
        const historyJson = await historyRes.json();
        if (Array.isArray(historyJson)) {
          setHistory(historyJson);
        }
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('API Connection Error:', err);
      setIsLive(false);
      setErrorMsg('Unable to connect to backend server at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  const sendRemoteCommand = async (cmd) => {
    setCommandLoading(true);
    try {
      const res = await fetch('/api/motor-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveCommand(data.command);
        fetchTelemetryData();
      }
    } catch (err) {
      console.error('Command Error:', err);
    } finally {
      setCommandLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetryData();
    const interval = setInterval(fetchTelemetryData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              IoT Motor Protection System
            </h1>
            <p className="text-xs text-gray-400">ESP32 Telemetry Monitor & Remote Control Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Badge */}
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
            isLive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}>
            {isLive ? <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
            <span>{isLive ? 'SYSTEM LIVE' : 'SERVER DISCONNECTED'}</span>
          </div>

          <button
            onClick={fetchTelemetryData}
            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition-colors border border-gray-700 flex items-center gap-2 text-xs font-medium"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      {/* Connection / Database Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <span className="font-mono text-[10px] text-amber-400/80">Make sure server & MongoDB are active</span>
        </div>
      )}

      {/* Main Motor Status Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-800/80 border border-gray-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Current Protection Status</div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <StatusBadge type="motor" value={latestData?.motorStatus || 'OFF'} />
            <StatusBadge type="fault" value={latestData?.fault || 'NORMAL'} />
          </div>
        </div>

        <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-8 text-xs text-gray-400 space-y-1">
          <div><span className="text-gray-500">Target Device:</span> <span className="font-mono text-gray-300">ESP32 WROOM</span></div>
          <div><span className="text-gray-500">Active Mode:</span> <span className="font-mono text-blue-400 font-bold">{activeCommand}</span></div>
          <div><span className="text-gray-500">Last Telemetry:</span> <span className="font-mono text-gray-300">{lastUpdated || 'Waiting...'}</span></div>
        </div>
      </div>

      {/* Interactive Hardware Remote Control Panel */}
      <div className="p-6 rounded-3xl bg-gray-900/60 backdrop-blur-md border border-gray-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Power className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">ESP32 Hardware Remote Control Panel</h2>
          </div>
          <span className="text-xs text-gray-400 font-mono">Controls Relay Pin (GPIO 26)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Force Start Button */}
          <button
            onClick={() => sendRemoteCommand('ON')}
            disabled={commandLoading}
            className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold text-sm transition-all shadow-lg ${
              activeCommand === 'ON'
                ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START MOTOR (FORCE ON)</span>
          </button>

          {/* Emergency Stop Button */}
          <button
            onClick={() => sendRemoteCommand('OFF')}
            disabled={commandLoading}
            className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold text-sm transition-all shadow-lg ${
              activeCommand === 'OFF'
                ? 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <Square className="w-5 h-5 fill-current" />
            <span>EMERGENCY STOP (FORCE OFF)</span>
          </button>

          {/* Auto Mode Button */}
          <button
            onClick={() => sendRemoteCommand('AUTO')}
            disabled={commandLoading}
            className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold text-sm transition-all shadow-lg ${
              activeCommand === 'AUTO'
                ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/30'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            <span>AUTO SENSOR PROTECTION</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <MetricCard
          title="Motor Temperature"
          value={latestData?.temperature}
          unit="°C"
          icon={Thermometer}
          colorTheme="orange"
          thresholdText="Safety Limit: < 65°C"
          status={{
            isOk: (latestData?.temperature || 0) <= 65,
            text: (latestData?.temperature || 0) > 65 ? 'OVERHEAT FAULT' : 'NORMAL',
          }}
        />

        <MetricCard
          title="AC Supply Voltage"
          value={latestData?.voltage}
          unit="V"
          icon={Zap}
          colorTheme="blue"
          thresholdText="Normal Range: 180V - 260V"
          status={{
            isOk: (latestData?.voltage || 230) >= 180 && (latestData?.voltage || 230) <= 260,
            text: (latestData?.voltage || 230) > 260 ? 'HIGH VOLTAGE' : (latestData?.voltage || 230) < 180 ? 'LOW VOLTAGE' : 'STABLE',
          }}
        />

        <MetricCard
          title="Load Current"
          value={latestData?.current}
          unit="A"
          icon={Activity}
          colorTheme="purple"
          thresholdText="Max Trip Rating: 10.0 A"
          status={{
            isOk: (latestData?.current || 0) <= 10,
            text: (latestData?.current || 0) > 10 ? 'OVERCURRENT' : 'NORMAL LOAD',
          }}
        />
      </div>

      {/* Realtime Chart */}
      <TelemetryChart history={history} />

      {/* Recent History Table */}
      <HistoryTable history={history} />

      {/* Footer */}
      <footer className="pt-6 border-t border-gray-800/80 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>IoT Motor Protection System — Real-time ESP32 Monitoring & Hardware Remote Control</span>
        <span className="font-mono text-gray-600">Built with React, Tailwind CSS, Chart.js & Node.js</span>
      </footer>
    </div>
  );
}
