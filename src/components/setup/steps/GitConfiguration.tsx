"use client";

import React from 'react';
import { ProjectData, StepProps } from '@/types/project';

export function GitConfiguration({ data, onUpdate, onNext, onBack }: StepProps) {
  const gitProviders = ['GitHub', 'GitLab', 'Bitbucket'];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Git Provider
        </label>
        <select
          value={data.gitProvider}
          onChange={(e) => onUpdate({ ...data, gitProvider: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Select Git Provider</option>
          {gitProviders.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Repository Name
        </label>
        <input
          type="text"
          value={data.repoName}
          onChange={(e) => onUpdate({ ...data, repoName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          placeholder={data.name.toLowerCase().replace(/\s+/g, '-')}
        />
      </div>

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