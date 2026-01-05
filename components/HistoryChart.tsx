
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { GameResult } from '../types';

interface HistoryChartProps {
  data: GameResult[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  const chartData = data.slice(-10).map((d, i) => ({
    session: i + 1,
    '反应时间 (ms)': d.avgResponseTime,
    '正确率 (%)': d.accuracy,
    '分数': d.score
  }));

  return (
    <div className="w-full h-64 mt-8 bg-white p-4 rounded-2xl shadow-sm">
      <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">进步曲线</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="session" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="反应时间 (ms)" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="正确率 (%)" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#10b981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
