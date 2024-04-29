import { Layout } from "antd";
import { Content } from "../_components/Layout";
import HeaderMenu from "./_components/HeaderMenu";

export const dynamic = "force-dynamic";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout style={{ minHeight: "100vh", height: "100%" }}>
      <HeaderMenu />
      <Content style={{ margin: "12px 32px 0" }}>{children}</Content>
    </Layout>
  );
}
