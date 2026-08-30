'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';

const PRIMARY = '#8b5cf6';
const ACCENT = '#22d3ee';
const WARNING = '#fbbf24';
const DANGER = '#f87171';
const MUTED = '#71717a';

const formatAbbreviated = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val}`;
};

export function PipelineBySectorChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // top 8

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={formatAbbreviated} stroke="#ffffff40" fontSize={11} tickMargin={8} />
          <YAxis dataKey="name" type="category" stroke="#ffffff40" fontSize={11} width={80} />
          <Tooltip 
            cursor={{ fill: '#ffffff05' }}
            contentStyle={{ backgroundColor: '#18181f', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
            formatter={(val: any) => [formatAbbreviated(val), 'Pipeline']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? PRIMARY : ACCENT} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExecutionStatusChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={[PRIMARY, ACCENT, WARNING, DANGER, MUTED][index % 5]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181f', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BillingCollectionChart({ billed, collected, receivable }: { billed: number, collected: number, receivable: number }) {
  const data = [
    { name: 'Billed', value: billed, fill: PRIMARY },
    { name: 'Collected', value: collected, fill: ACCENT },
    { name: 'Receivable', value: receivable, fill: WARNING }
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickMargin={8} />
          <YAxis tickFormatter={formatAbbreviated} stroke="#ffffff40" fontSize={11} />
          <Tooltip 
            cursor={{ fill: '#ffffff05' }}
            contentStyle={{ backgroundColor: '#18181f', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
            formatter={(val: any) => [formatAbbreviated(val), 'Value']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
