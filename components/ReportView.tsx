
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { FleetState } from '../types';
import { Download } from 'lucide-react';

interface Props {
  data: FleetState;
}

const ReportView: React.FC<Props> = ({ data }) => {
  const expenseByCategory = useMemo(() => {
    const fuelTotal = data.fuelLogs.reduce((s, l) => s + l.cost, 0);
    const maintTotal = data.maintenanceLogs.reduce((s, l) => s + l.cost, 0);
    const repairTotal = data.repairLogs.reduce((s, l) => s + l.cost, 0);
    const insTotal = data.insuranceLogs.reduce((s, l) => s + l.cost, 0);

    return [
      { name: 'Fuel', value: fuelTotal, color: '#3b82f6' },
      { name: 'Maintenance', value: maintTotal, color: '#8b5cf6' },
      { name: 'Repairs', value: repairTotal, color: '#f59e0b' },
      { name: 'Insurance', value: insTotal, color: '#10b981' },
    ];
  }, [data]);

  const vehicleStats = useMemo(() => {
    const stats: Record<string, number> = {};
    data.vehicles.forEach(v => stats[v.id] = 0);
    [...data.fuelLogs, ...data.maintenanceLogs, ...data.repairLogs, ...data.insuranceLogs].forEach(log => {
      if (stats[log.vehicleId] !== undefined) stats[log.vehicleId] += log.cost;
    });

    return Object.entries(stats).map(([id, cost]) => ({ id, cost }))
      .sort((a, b) => b.cost - a.cost);
  }, [data]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <p className="text-slate-500">Consolidated financial overview of all assets.</p>
        <button className="flex items-center space-x-2 text-blue-600 font-semibold border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-50">
          <Download size={18} />
          <span>Export Monthly PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 md:mb-6">Expense Distribution</h4>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 mt-4">
            {expenseByCategory.map(item => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-slate-600">{item.name}: <b>Rs. {item.value.toLocaleString()}</b></span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 md:mb-6">Top Vehicle Expenses</h4>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleStats.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-3 md:p-6 bg-slate-800 border-b border-slate-700">
          <h4 className="text-white font-bold">Fleet Pivot Table Summary</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-slate-500">
                <th className="px-3 md:px-6 py-3 md:py-4">Vehicle ID</th>
                <th className="px-3 md:px-6 py-3 md:py-4">Fuel</th>
                <th className="px-3 md:px-6 py-3 md:py-4">Maint.</th>
                <th className="px-3 md:px-6 py-3 md:py-4">Repairs</th>
                <th className="px-3 md:px-6 py-3 md:py-4">Insurance</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-white">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {vehicleStats.map(stat => {
                const fuel = data.fuelLogs.filter(l => l.vehicleId === stat.id).reduce((s,l) => s+l.cost, 0);
                const maint = data.maintenanceLogs.filter(l => l.vehicleId === stat.id).reduce((s,l) => s+l.cost, 0);
                const repr = data.repairLogs.filter(l => l.vehicleId === stat.id).reduce((s,l) => s+l.cost, 0);
                const ins = data.insuranceLogs.filter(l => l.vehicleId === stat.id).reduce((s,l) => s+l.cost, 0);
                return (
                  <tr key={stat.id} className="hover:bg-slate-800/50">
                    <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-white">{stat.id}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">Rs. {fuel.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">Rs. {maint.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">Rs. {repr.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">Rs. {ins.toLocaleString()}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-blue-400">Rs. {stat.cost.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportView;
