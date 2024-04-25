import ResetCache from "./_components/ResetCache";

export default function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ResetCache />
    </div>
  );
}
