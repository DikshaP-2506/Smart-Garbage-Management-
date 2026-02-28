'use client';

export default function Profile() {
  const profileData = {
    fullName: 'Sarah Anderson',
    email: 'sarah.anderson@example.com',
    phone: '+1 (555) 123-4567',
    username: 'sarahdesigns',
    role: 'Product Designer',
    joinedDate: 'January 15, 2024',
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-12 text-4xl font-bold text-foreground text-center">
          Profile
        </h1>

        {/* Profile Card */}
        <div className="rounded-2xl bg-card p-8 border border-border shadow-sm">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="mt-2 text-lg text-card-foreground">
                {profileData.fullName}
              </p>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="mt-2 text-lg text-card-foreground">
                {profileData.email}
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Phone Number
              </label>
              <p className="mt-2 text-lg text-card-foreground">
                {profileData.phone}
              </p>
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Username
              </label>
              <p className="mt-2 text-lg text-card-foreground">
                {profileData.username}
              </p>
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <p className="mt-2 text-lg text-card-foreground">
                {profileData.role}
              </p>
            </div>

            {/* Joined Date */}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Joined Date
              </label>
              <p className="mt-2 text-lg text-card-foreground">
                {profileData.joinedDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
