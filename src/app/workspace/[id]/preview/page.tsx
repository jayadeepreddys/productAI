"use client";

import { useState } from 'react';

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* This is where the actual product pages will be rendered */}
        <div className="p-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-500">
            Select a page from the workspace to preview it here
          </div>
        </div>
      </main>
    </div>
  );
} 