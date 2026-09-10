// src/components/admin/DashboardCard.jsx
export default function DashboardCard({ icon: Icon, label, value, accent = 'maroon' }) {
  const accentClasses = {
    maroon: 'bg-maroon/10 text-maroon',
    gold: 'bg-gold/20 text-gold',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="bg-white border border-beige-dark rounded-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${accentClasses[accent]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-brown-light">{label}</p>
        <p className="text-2xl font-display text-brown mt-0.5">{value}</p>
      </div>
    </div>
  );
}
