interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center text-orange">
          {icon}
        </div>
        <span className="text-sm text-navy/60 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-navy">{value}</p>
    </div>
  );
}
