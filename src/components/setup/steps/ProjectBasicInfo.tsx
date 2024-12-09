"use client";

import React, { useState } from 'react';
import { ProjectData, StepProps } from '@/types/project';

export function ProjectBasicInfo({ data, onUpdate, onNext }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!data.name) newErrors.name = 'Project name is required';
    if (!data.description) newErrors.description = 'Description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => onUpdate({ ...data, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-error">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onUpdate({ ...data, description: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-error">{errors.description}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
        >
          Next
        </button>
      </div>
    </form>
  );
} 