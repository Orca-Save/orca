import { Nav, NavLink } from "@/components/Nav";
import SessionButton from "./_components/SessionButton";
import { Layout } from "antd";

export const dynamic = "force-dynamic";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout style={{ minHeight: "100vh", height: "100%" }}>
      <Nav>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/goals">Goals</NavLink>
        <NavLink href="/savings">Savings</NavLink>
        <SessionButton />
      </Nav>
      <div className="container my-6">{children}</div>
    </Layout>
  );
}
