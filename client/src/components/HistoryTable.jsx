import React from 'react';

export default function HistoryTable({ history }) {
  return (
    <div className="p-6 rounded-2xl bg-gray-900/60 backdrop-blur-md border border-gray-800 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Recent Data Log</h3>
          <p className="text-xs text-gray-400">Historical telemetry received from ESP32</p>
        </div>
        <span className="text-xs text-gray-500 font-mono">Showing last {history.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-800/60 text-xs uppercase font-semibold text-gray-400 tracking-wider">
            <tr>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Temp (°C)</th>
              <th className="py-3 px-4">Voltage (V)</th>
              <th className="py-3 px-4">Current (A)</th>
              <th className="py-3 px-4">Motor Relay</th>
              <th className="py-3 px-4">Fault Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-mono text-xs">
            {history.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-gray-500 font-sans">
                  No telemetry data available. Make sure ESP32 or simulator is running!
                </td>
              </tr>
            ) : (
              history.slice(0, 15).map((item, idx) => {
                const date = new Date(item.createdAt || Date.now());
                const timeStr = date.toLocaleTimeString();
                const isFault = item.fault && item.fault !== 'NORMAL';

                return (
                  <tr key={item._id || idx} className="hover:bg-gray-800/40 transition-colors">
                    <td className="py-3 px-4 text-gray-400">{timeStr}</td>
                    <td className="py-3 px-4 text-orange-400 font-bold">{item.temperature}°C</td>
                    <td className="py-3 px-4 text-blue-400 font-bold">{item.voltage} V</td>
                    <td className="py-3 px-4 text-purple-400 font-bold">{item.current} A</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.motorStatus === 'ON' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                        {item.motorStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isFault ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {item.fault || 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
