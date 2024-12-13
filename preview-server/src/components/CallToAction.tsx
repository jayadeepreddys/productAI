"use client";

tsx
import Link from 'next/link';

export default function CallToAction() {
  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Health?</h2>
        <p className="text-xl mb-8">Join our health plan today and experience the difference.</p>
        <Link href="/signup" className="bg-white text-blue-600 py-3 px-8 rounded-full font-semibold hover:bg-gray-100 transition duration-300">
          Sign Up Now
        </Link>
      </div>
    </section>
  );
}