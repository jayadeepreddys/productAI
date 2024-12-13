"use client";

tsx
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="bg-blue-600 text-white py-20">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Your Health, Our Priority</h1>
        <p className="text-xl mb-8">Comprehensive health coverage for you and your family</p>
        <button className="bg-white text-blue-600 font-bold py-2 px-4 rounded-full hover:bg-blue-100 transition duration-300">
          Get Started
        </button>
      </div>
    </section>
  );
};

export default Hero;