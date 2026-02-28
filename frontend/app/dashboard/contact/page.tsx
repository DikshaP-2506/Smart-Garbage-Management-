import DashboardNavbar from '@/components/dashboard-navbar';

export default function Contact() {
  return (
    <>
      <DashboardNavbar />
      <main className="min-h-screen">
        <div className="flex items-center justify-center py-20">
          <h1 className="text-4xl font-bold text-foreground">Contact</h1>
        </div>
      </main>
    </>
  );
}