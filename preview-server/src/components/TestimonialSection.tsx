"use client";

tsx
import { Testimonial } from '@/types/testimonial';

const testimonials: Testimonial[] = [
  { name: 'John Doe', quote: 'This health plan has been a lifesaver. The coverage is excellent and the customer service is top-notch.' },
  { name: 'Jane Smith', quote: 'I love how easy it is to access care with this plan. The telemedicine option is incredibly convenient.' },
];

export default function TestimonialSection() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Members Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
              <p className="font-semibold">- {testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}