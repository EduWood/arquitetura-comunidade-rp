import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070707]">
      <Navbar />

      <div className="max-w-[1700px] mx-auto flex">
        <Sidebar />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}