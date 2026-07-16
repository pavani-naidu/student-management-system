import { Users, GraduationCap, Building2, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const admissionsData = [
  { month: 'Jan', admissions: 32 }, { month: 'Feb', admissions: 41 }, { month: 'Mar', admissions: 28 },
  { month: 'Apr', admissions: 55 }, { month: 'May', admissions: 47 }, { month: 'Jun', admissions: 63 },
];

const departmentData = [
  { name: 'Computer Science', value: 420 },
  { name: 'Electronics', value: 280 },
  { name: 'Business Admin', value: 310 },
  { name: 'Mechanical', value: 190 },
];

const attendanceTrend = [
  { day: 'Mon', pct: 92 }, { day: 'Tue', pct: 89 }, { day: 'Wed', pct: 94 },
  { day: 'Thu', pct: 87 }, { day: 'Fri', pct: 90 },
];

const COLORS = ['#2B3470', '#E3A008', '#4C58A6', '#F0B429'];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
        <p className="text-sm text-ink/60 dark:text-paper/60 mt-1">Here's what's happening across your institution today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="1,240" icon={Users} accent="indigo" delay={0} />
        <StatCard label="Total Teachers" value="86" icon={GraduationCap} accent="amber" delay={0.05} />
        <StatCard label="Departments" value="12" icon={Building2} accent="indigo" delay={0.1} />
        <StatCard label="Fee Collected (MTD)" value="$184,200" icon={Wallet} accent="amber" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5">
          <h3 className="font-semibold mb-4">Monthly admissions</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={admissionsData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="admissions" fill="#2B3470" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5">
          <h3 className="font-semibold mb-4">Students by department</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={departmentData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {departmentData.map((entry, i) => (
                  <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-badge p-5 shadow-card border border-ink/5 dark:border-white/5">
        <h3 className="font-semibold mb-4">This week's attendance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={attendanceTrend}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis domain={[70, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="pct" stroke="#E3A008" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
