import React from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';

interface ProtocolData {
  protocol_name: string;
  protocol_id: string;
  total_usd_value: number;
  chain: string;
}

interface DefiChartsProps {
  positions: ProtocolData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const DefiCharts: React.FC<DefiChartsProps> = ({ positions }) => {
  // Calculate totals by protocol
  const protocolTotals = positions.reduce((acc, pos) => {
    const key = pos.protocol_name;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += pos.total_usd_value;
    return acc;
  }, {} as Record<string, number>);

  // Create data for pie chart
  const pieData = Object.entries(protocolTotals).map(([name, value]) => ({
    name,
    value
  }));

  // Calculate totals by chain
  const chainTotals = positions.reduce((acc, pos) => {
    const key = pos.chain;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += pos.total_usd_value;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(chainTotals).map(([chain, value]) => ({
    chain,
    value
  }));

  return (
    <div className="defi-charts">
      <div className="chart-container">
        <h3>Asset Allocation by Protocol</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'USD Value']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h3>Asset Allocation by Chain</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="chain" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, 'USD Value']} />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 