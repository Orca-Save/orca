"use client";
import { Button, Space } from "antd";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const onClick = () => signIn("azure-ad-b2c");
  return (
    <div className="bg-color-black mg-5 flex justify-center items-center h-screen">
      <Space direction="vertical" size={50}>
        <h1 className="text-center decoration-clone pb-3 text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink font-bold">
          Ready to save an extra $3,800 a year?
        </h1>

        <div className="w-100 flex flex-col space-y-4">
          <Button
            type="primary"
            size="large"
            className="w-full"
            onClick={onClick}
          >
            {/* <a href="https://orcanext.b2clogin.com/orcanext.onmicrosoft.com/b2c_1_orca_signin/oauth2/v2.0/authorize?client_id=3dd4e88e-63c3-49b3-af56-f2770cf498a8&scope=offline_access%20openid&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fazure-ad-b2c&state=AUwpUvWbqIRYKTlgIQ6LnrYpVQwob6tnGMSXe5RVHSI&option=signup"> */}
            Sign Up / Login
            {/* </a> */}
          </Button>
          {/* <Button size="large" className="w-full " onClick={onClick}>
            Login
          </Button> */}
        </div>
      </Space>
    </div>
  );
}
