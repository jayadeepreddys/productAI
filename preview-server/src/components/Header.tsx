"use client";

tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          HealthCare Co.
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link href="/health-plan" className="hover:underline">My Plan</Link></li>
            <li><Link href="/contact" className="hover:underline">Contact</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}