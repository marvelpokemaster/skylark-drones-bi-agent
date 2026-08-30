'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const PRIMARY = '#8b5cf6';
const ACCENT = '#22d3ee';
const WARNING = '#fbbf24';
const DANGER = '#f87171';
const MUTED = '#71717a';
const TEXT_PRIMARY = '#f0f0f5';
const TEXT_SECONDARY = '#a1a1aa';
const AXIS_COLOR = '#3f3f46';

const formatAbbreviated = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return `₹${val}`;
};

const tooltipContentStyle = {
  backgroundColor: 'rgba(17, 17, 22, 0.96)',
  border: '1px solid rgba(255, 255, 255, 0.10)',
  borderRadius: '12px',
  color: TEXT_PRIMARY,
  boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.15)',
  backdropFilter: 'blur(8px)',
  padding: '12px 16px',
};

const tooltipItemStyle = {
  color: TEXT_PRIMARY,
  fontWeight: 600,
  fontSize: '13px',
  fontFamily: 'Space Grotesk, sans-serif'
};

const tooltipLabelStyle = {
  color: TEXT_SECONDARY,
  fontSize: '11px',
  fontWeight: 500,
  marginBottom: '8px',
  fontFamily: 'Inter, sans-serif',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em'
};

export function PipelineBySectorChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // top 8

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" horizontal={true} vertical={false} />
          <XAxis type="number" tickFormatter={formatAbbreviated} stroke={AXIS_COLOR} tick={{ fill: TEXT_SECONDARY, fontSize: 11 }} tickMargin={8} tickLine={false} />
          <YAxis dataKey="name" type="category" stroke={AXIS_COLOR} tick={{ fill: TEXT_SECONDARY, fontSize: 11 }} width={80} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(val: any) => [formatAbbreviated(val), 'Pipeline Value']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 0 ? PRIMARY : ACCENT} fillOpacity={0.9} />
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
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            stroke="rgba(10,10,15,0.5)"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={[PRIMARY, ACCENT, WARNING, DANGER, MUTED][index % 5]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
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
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
          <XAxis dataKey="name" stroke={AXIS_COLOR} tick={{ fill: TEXT_SECONDARY, fontSize: 11 }} tickMargin={12} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={formatAbbreviated} stroke={AXIS_COLOR} tick={{ fill: TEXT_SECONDARY, fontSize: 11 }} tickMargin={8} tickLine={false} axisLine={false} />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
            contentStyle={tooltipContentStyle}
            itemStyle={tooltipItemStyle}
            labelStyle={tooltipLabelStyle}
            formatter={(val: any) => [formatAbbreviated(val), 'Amount']}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
