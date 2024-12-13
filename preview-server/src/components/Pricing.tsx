"use client";

tsx
import React from 'react';

const plans = [
  { name: 'Basic', price: '$99/month', features: ['General check-ups', 'Emergency care', 'Prescription coverage'] },
  { name: 'Standard', price: '$199/month', features: ['Specialist visits', 'Mental health support', 'Dental coverage'] },
  { name: 'Premium', price: '$299/month', features: ['International coverage', 'Alternative therapies', 'Wellness programs'] },
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-8">Our Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
              <p className="text-3xl font-semibold text-blue-600 mb-6">{plan.price}</p>
              <ul className="mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="mb-2">{feature}</li>
                ))}
              </ul>
              <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;