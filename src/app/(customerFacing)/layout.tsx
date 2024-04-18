import { Nav, NavLink } from "@/components/Nav";
import SessionButton from "./_components/SessionButton";

export const dynamic = "force-dynamic";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/goals">Goals</NavLink>
        <NavLink href="/savings">My Savings</NavLink>
        <SessionButton />
      </Nav>
      <div className="container my-6">{children}</div>
    </>
  );
}
