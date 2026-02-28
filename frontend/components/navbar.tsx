'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
              A
            </div>
            <span className="text-lg font-semibold text-foreground">AI App</span>
          </Link>

          {/* Right: Navigation items */}
          <div className="flex items-center gap-4">
            {/* Add other navigation items here if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
}
