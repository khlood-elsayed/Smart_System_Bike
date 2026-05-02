import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { usageData as initialUsage, revenueData as initialRevenue, activeAreas as initialAreas } from "../data/mockData.js";
import { TrendingUp, MapPin } from "lucide-react";

const RADIAN = Math.PI / 180;
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="#111" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
}

export default function ReportsPage() {
  const [usage, setUsage] = useState(initialUsage);
  const [revenue, setRevenue] = useState(initialRevenue);
  const [areas, setAreas] = useState(initialAreas);

  // ── BACKEND INTEGRATION PLACEHOLDER ──
  useEffect(() => {
    async function fetchAnalytics() {
      // console.log("[API] FETCH /api/admin/analytics");
      // const res = await fetch('/api/admin/analytics');
      // const data = await res.json();
      // setUsage(data.usage);
      // setRevenue(data.revenue);
      // setAreas(data.areas);
    }
    fetchAnalytics();
  }, []);

  const maxRides = (areas || []).length > 0 ? Math.max(...areas.map(a => a.rides || 0)) : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Weekly usage and revenue breakdown</p>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-5 gap-6">
        {/* Bar chart - 3/5 width */}
        <div className="col-span-3 bg-[#161616] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-[#CCFF00]" />
            <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm">Usage Overview — Last 7 Days</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={usage || []} margin={{ top: 4, right: 8, bottom: 0, left: -20 }} barSize={32}>
              <XAxis dataKey="day" tick={{ fill: '#666', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 12 }}
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              />
              <Bar dataKey="rides" fill="#CCFF00" radius={[6, 6, 0, 0]} label={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart - 2/5 width */}
        <div className="col-span-2 bg-[#161616] border border-white/5 rounded-2xl p-5">
          <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm mb-4">Revenue Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={revenue || []}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                labelLine={false}
                label={CustomLabel}
              >
                {(revenue || []).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: '#aaa', fontSize: 12 }}>{value}</span>}
              />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', fontSize: 12 }}
                formatter={(v) => [`${(v || 0).toLocaleString()} EGP`]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most Active Areas */}
      <div className="bg-[#161616] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <MapPin size={16} className="text-[#CCFF00]" />
          <h3 className="font-bold text-white font-['Space_Grotesk'] text-sm">Most Active Areas</h3>
        </div>
        <div className="space-y-4">
          {(areas || []).length > 0 ? areas.map((area, i) => (
            <div key={area.area} className="flex items-center gap-4">
              <span className="w-5 text-xs text-gray-600 font-bold font-['Space_Grotesk']">#{i + 1}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-gray-300">{area.area}</span>
                  <span className="text-sm text-white font-bold">{area.rides || 0} rides</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${((area.rides || 0) / maxRides) * 100}%`, background: i === 0 ? '#CCFF00' : '#3f3f3f' }}
                  />
                </div>
              </div>
            </div>
          )) : (
            <div className="py-10 text-center text-gray-500 text-sm">No usage data found to generate heatmaps.</div>
          )}
        </div>
      </div>
    </div>
  );
}
