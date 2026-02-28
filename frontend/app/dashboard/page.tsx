import DashboardNavbar from '@/components/dashboard-navbar';

export default function Dashboard() {
  return (
    <>
      <DashboardNavbar />
      <main className="min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-foreground">Welcome to Dashboard</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              You're now logged in! Explore our features using the navigation above.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}