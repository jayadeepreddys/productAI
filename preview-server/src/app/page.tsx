import React from 'react';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { ServiceCard } from '../components/ServiceCard';
import { DoctorCard } from '../components/DoctorCard';
import { Footer } from '../components/Footer';

/**
 * HomePage component represents the main content of the hospital's home page.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              title="Emergency Care"
              description="24/7 emergency medical services for critical situations."
            />
            <ServiceCard
              title="Cardiology"
              description="Comprehensive care for heart and vascular conditions."
            />
            <ServiceCard
              title="Orthopedics"
              description="Treatment for musculoskeletal injuries and disorders."
            />
          </div>
        </section>
        <section className="bg-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Our Doctors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <DoctorCard name="Dr. John Doe" specialty="Cardiology" />
              <DoctorCard name="Dr. Jane Smith" specialty="Orthopedics" />
              <DoctorCard name="Dr. Michael Johnson" specialty="Neurology" />
              <DoctorCard name="Dr. Emily Davis" specialty="Pediatrics" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}