import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { Card } from "antd";

export default async function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
  );
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card title={title}>
      <h3>{subtitle}</h3>
      {body}
    </Card>
  );
}
