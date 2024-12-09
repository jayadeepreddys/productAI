"use client";

import React from 'react';
import { allowedComponents } from '@/config/templateConfig';
import { ProjectData, StepProps } from '@/types/project';

export function TechStackSelection({ data, onUpdate, onNext, onBack }: StepProps) {
  const handleTechSelection = (category: keyof typeof data.techStack, value: string) => {
    onUpdate({
      ...data,
      techStack: {
        ...data.techStack,
        [category]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {Object.entries(allowedComponents).map(([category, options]) => (
        <div key={category}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {category.charAt(0).toUpperCase() + category.slice(1)} Framework
          </label>
          <select
            value={data.techStack[category as keyof typeof data.techStack]}
            onChange={(e) => handleTechSelection(category as keyof typeof data.techStack, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
            <option value="">Select {category}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
        >
          Next
        </button>
      </div>
    </div>
  );
} 