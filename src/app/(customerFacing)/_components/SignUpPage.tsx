import { Button } from "antd";

export default async function SignUpPage() {
  return (
    <div className="bg-color-black mg-5 flex justify-center items-center h-screen">
      <h1 className="decoration-clone pb-3 text-6xl bg-clip-text text-transparent bg-gradient-to-r from-orca-blue to-orca-pink">
        Ready to save an extra $3,800 a year?
      </h1>
      <Button
        style={{ display: "block" }}
        type="primary"
        // onClick={() => signIn("azure-ad-b2c")}
      >
        <a href="https://orcanext.b2clogin.com/orcanext.onmicrosoft.com/b2c_1_orca_signin/oauth2/v2.0/authorize?client_id=3dd4e88e-63c3-49b3-af56-f2770cf498a8&scope=offline_access%20openid&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fazure-ad-b2c&state=AUwpUvWbqIRYKTlgIQ6LnrYpVQwob6tnGMSXe5RVHSI&option=signup">
          Sign Up
        </a>
      </Button>
    </div>
  );
}
