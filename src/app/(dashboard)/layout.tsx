import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Sidebar />
      <Header />
      <main className="ml-[240px] pt-16 min-h-screen p-8 bg-background dark:bg-[#010415] transition-colors duration-500">
        {children}
      </main>
    </>
  );
}
