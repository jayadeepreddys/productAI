import { PageData } from './projects';

export const sampleTemplates = {
  basic: {
    name: 'Basic Website',
    pages: [
      {
        name: 'Home',
        path: '/',
        description: 'Landing page with hero section and features',
        components: [],
        apis: [],
        content: `"use client";

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
}`
      },
      {
        name: 'About',
        path: '/about',
        description: 'About page with company information',
        components: [],
        apis: [],
        content: `"use client";

import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About</h1>
          <div className="prose prose-lg">
            <p>Welcome to our project! Share your story here.</p>
            <h2>Our Mission</h2>
            <p>Describe your mission and goals.</p>
          </div>
        </div>
      </div>
    </div>
  );
}`
      },
      {
        name: 'Contact',
        path: '/contact',
        description: 'Contact form page',
        components: [],
        apis: [],
        content: `"use client";

import React, { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}`
      }
    ]
  }
}; 