"use client";

"use client";

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Getting Started</h2>
              <p className="text-gray-600 mb-4">
                This is your new project homepage. Start by customizing this page or creating new components.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link 
                  href="/about" 
                  className="block p-6 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-medium text-gray-900">About</h3>
                  <p className="mt-2 text-gray-600">Learn more about our project</p>
                </Link>
                <Link 
                  href="/contact" 
                  className="block p-6 bg-white shadow rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-medium text-gray-900">Contact</h3>
                  <p className="mt-2 text-gray-600">Get in touch with our team</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}