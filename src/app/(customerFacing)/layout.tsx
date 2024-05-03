import { varelaRound } from "@/lib/fonts";
import { Divider, Layout } from "antd";
import { Content } from "../_components/Layout";
import { Title } from "../_components/Typography";
import HeaderMenu from "./_components/HeaderMenu";

export const dynamic = "force-dynamic";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout style={{ minHeight: "100vh", height: "100%" }}>
      <HeaderMenu className="hidden sm:flex" />
      {/* Orca text header centered if on sm display */}
      <div className="sm:hidden">
        <Title
          className={`${varelaRound.className} text-center`}
          style={{
            margin: "12px 32px 0",
          }}
        >
          Orca
        </Title>
        <Divider />
      </div>

      <Content
        style={{
          margin: "12px 32px 0",
        }}
      >
        <div className="flex justify-center">
          <div className="w-full md:w-4/5 lg:w-3/5">{children}</div>
        </div>
      </Content>
      <HeaderMenu className="sm:hidden" />
    </Layout>
  );
}
