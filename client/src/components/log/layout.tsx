import NavTabs from './components/NavTabs';

export default async function LogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavTabs />
      {children}
    </>
  );
}
