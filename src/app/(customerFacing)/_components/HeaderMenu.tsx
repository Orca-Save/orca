"use client";

import { baseURL } from "@/lib/utils";
import { Menu, Space, Typography } from "antd";
import { signIn, useSession } from "next-auth/react";
import { Varela_Round } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const { Text } = Typography;
const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-varelaround",
});
export default function HeaderMenu() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [current, setCurrent] = useState(pathname);
  const router = useRouter();
  useEffect(() => {
    setCurrent(pathname);
  }, [pathname]);

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[current]}
      onSelect={({ key }) => {
        if (key === "/session") {
          if (session) {
            router.push("/api/auth/signout");
          } else {
            signIn("azure-ad-b2c", { callbackUrl: baseURL + "/" });
          }
        } else {
          router.push(key);
        }
      }}
    >
      <Space
        style={{ width: "60px", marginLeft: "10px" }}
        align="center"
        size={0}
      >
        <Text className={`${varelaRound.className}`}>Orca</Text>
      </Space>
      <Space
        direction="horizontal"
        size="small"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <Menu.Item key="/" eventKey="/">
          Home
        </Menu.Item>
        <Menu.Item eventKey="/goals" key="/goals">
          Goals
        </Menu.Item>
        <Menu.Item eventKey="/savings" key="/savings">
          Savings
        </Menu.Item>
        <Menu.Item eventKey="/session" key="/session">
          {session ? "Sign Out" : "Sign In"}
        </Menu.Item>
      </Space>
    </Menu>
  );
}
