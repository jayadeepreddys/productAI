"use client";

tsx
import { BenefitItem } from '@/types/benefit';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const benefits: BenefitItem[] = [
  { title: 'Comprehensive Coverage', description: 'Full range of medical services covered' },
  { title: 'Preventive Care', description: 'Regular check-ups and screenings at no extra cost' },
  { title: 'Prescription Drug Coverage', description: 'Access to a wide range of medications' },
  { title: '24/7 Telemedicine', description: 'Virtual consultations anytime, anywhere' },
  { title: 'Mental Health Support', description: 'Counseling and therapy services included' },
  { title: 'Wellness Programs', description: 'Fitness and nutrition resources to keep you healthy' },
];

export default function BenefitsList() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Health Plan Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start">
              <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}