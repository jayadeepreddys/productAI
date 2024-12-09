"use client";

import React from 'react';
import { ProjectData, StepProps } from '@/types/project';

export function ProjectSummary({ data, onUpdate, onNext, onBack }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Project Summary</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">Basic Information</h4>
          <p className="mt-2"><span className="font-medium">Name:</span> {data.name}</p>
          <p className="mt-1"><span className="font-medium">Description:</span> {data.description}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">Technology Stack</h4>
          <p className="mt-2"><span className="font-medium">UI Framework:</span> {data.techStack.ui}</p>
          <p className="mt-1"><span className="font-medium">State Management:</span> {data.techStack.state}</p>
          <p className="mt-1"><span className="font-medium">Form Validation:</span> {data.techStack.validation}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">Git Configuration</h4>
          <p className="mt-2"><span className="font-medium">Provider:</span> {data.gitProvider}</p>
          <p className="mt-1"><span className="font-medium">Repository Name:</span> {data.repoName}</p>
        </div>
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
          Create Project
        </button>
      </div>
    </div>
  );
} 