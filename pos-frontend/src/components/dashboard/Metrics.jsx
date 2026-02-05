import React, { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getDashboardStats } from "../../https";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Metrics = () => {
  const [period, setPeriod] = useState('day');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Construct a stable query key that only changes when we actually apply a filter
  const queryKey = useCustomRange
    ? ['dashboardStats', 'custom', customRange.start, customRange.end]
    : ['dashboardStats', period];

  const { data: statsData, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => {
      if (useCustomRange && customRange.start && customRange.end) {
        return getDashboardStats('custom', customRange.start, customRange.end);
      }
      return getDashboardStats(period);
    },
    enabled: true,
    retry: 1,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  if (error) {
    console.error("Dashboard Stats Error:", error);
  }

  // Safe data extraction
  const kpi = statsData?.data?.data?.kpi || { revenue: 0, orders: 0, aov: 0, netProfit: 0 };
  const trend = Array.isArray(statsData?.data?.data?.trend) ? statsData.data.data.trend : [];

  const handleCustomRangeApply = () => {
    if (customRange.start && customRange.end) {
      setUseCustomRange(true);
      // Determine if we should switch period to 'custom' explicitly if needed, 
      // but current logic uses 'custom' via useCustomRange flag in queryFn.
      // We might want to reset 'period' state to avoid confusion or keep it as fallback.
    }
  };

  const handlePresetPeriod = (p) => {
    setPeriod(p);
    setUseCustomRange(false);
    setCustomRange({ start: '', end: '' });
  };

  // Custom Tooltip for detailed hover info
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      return (
        <div className="bg-black/95 border border-orange-500/50 rounded-lg p-3 shadow-2xl">
          <p className="text-white text-xs font-bold mb-2">{payload[0].payload._id}</p>
          <p className="text-orange-500 font-mono text-sm font-bold">
            Revenue: PKR {payload[0].value?.toLocaleString()}
          </p>
          {payload[1] && (
            <p className="text-blue-400 font-mono text-sm font-bold">
              Orders: {payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // if (isLoading) return <div className="p-8 text-white">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="bg-[#1c1c1c] p-6 rounded-2xl border border-white/10 space-y-4 relative z-50">
        <div>
          <h2 className="font-black text-white text-2xl tracking-tight">
            Sales Overview
          </h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">
            PERFORMANCE METRICS
          </p>
        </div>

        {/* Time Filter Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Preset Buttons */}
          <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-white/10">
            {['day', 'week', 'month', 'year'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => handlePresetPeriod(p)}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${!useCustomRange && period === p ? 'bg-white text-black shadow-lg transform scale-105' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="flex items-center gap-2 bg-[#0a0a0a] p-2 rounded-xl border border-white/10">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
              className="bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
            />
            <span className="text-gray-500 text-xs font-bold">to</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
              className="bg-[#1c1c1c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500 cursor-pointer"
            />
            <button
              type="button"
              onClick={handleCustomRangeApply}
              disabled={!customRange.start || !customRange.end}
              className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards - 3 Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10 h-32 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Revenue */}
          <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-orange-500/30 transition-all">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
              TOTAL REVENUE
            </p>
            <p className="text-4xl font-black text-orange-500 tracking-tight mb-4">
              PKR {kpi.revenue.toLocaleString()}
            </p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-full"></div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-blue-500/30 transition-all">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
              TOTAL ORDERS
            </p>
            <p className="text-4xl font-black text-white tracking-tight mb-4">
              {kpi.orders}
            </p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-full"></div>
            </div>
          </div>

          {/* Avg Order Value */}
          <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-green-500/30 transition-all">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">
              AVG. ORDER VALUE
            </p>
            <p className="text-4xl font-black text-white tracking-tight mb-4">
              PKR {kpi.aov}
            </p>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-full"></div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Granular Chart */}
      <div className="bg-[#1c1c1c] rounded-2xl p-6 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">PERFORMANCE TREND</h3>
          <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-400 text-xs">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-400 text-xs">Orders</span>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs animate-pulse uppercase tracking-widest">Loading Chart data...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
                <XAxis
                  dataKey="_id"
                  stroke="#666"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#333' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#f97316"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#333' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#3b82f6"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#333' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Bar yAxisId="left" dataKey="sales" fill="#f97316" radius={[6, 6, 0, 0]} barSize={50} />
                <Bar yAxisId="right" dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default Metrics;
