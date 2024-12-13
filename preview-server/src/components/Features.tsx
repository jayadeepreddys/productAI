"use client";

tsx
import React from 'react';

const features = [
  { title: 'Wide Network', description: 'Access to a vast network of healthcare providers' },
  { title: 'Preventive Care', description: 'Free annual check-ups and vaccinations' },
  { title: '24/7 Support', description: 'Round-the-clock customer service' },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;