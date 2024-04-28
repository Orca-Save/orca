import { Nav, NavLink } from "@/components/Nav";
import { Layout } from "antd";
import { Content } from "../_components/Layout";
import SessionButton from "./_components/SessionButton";

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
      <Content style={{ margin: "12px 16px 0" }}>{children}</Content>
    </Layout>
  );
}
