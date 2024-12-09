"use client";

import { use } from 'react';
import { useState, useEffect } from 'react';
import { ProjectData } from '@/types/project';
import { projectStore } from '@/lib/store/projects';

interface Endpoint {
  method: string;
  path: string;
  description: string;
  requestBody?: string;
  responseBody?: string;
}

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function APIDocumentation({ params: paramsPromise }: PageProps) {
  const params = use(paramsPromise);
  const [project, setProject] = useState<ProjectData>();

  useEffect(() => {
    if (params?.id) {
      const foundProject = projectStore.getProjectById(params.id);
      setProject(foundProject);
    }
  }, [params?.id]);

  const endpoints: Endpoint[] = [
    {
      method: 'GET',
      path: `/api/workspace/${params.id}`,
      description: 'Get workspace overview including project, pages, and components',
      responseBody: `{
  "project": {
    "id": "string",
    "name": "string",
    "techStack": { ... },
    ...
  },
  "pages": [...],
  "components": [...]
}`
    },
    {
      method: 'GET',
      path: `/api/workspace/${params.id}/pages`,
      description: 'List all pages in the workspace',
      responseBody: `[
  {
    "id": "string",
    "name": "string",
    "layout": "string",
    ...
  }
]`
    },
    {
      method: 'POST',
      path: `/api/workspace/${params.id}/pages`,
      description: 'Create a new page',
      requestBody: `{
  "name": "string",
  "layout": "string",
  "content": "string"
}`,
      responseBody: `{
  "id": "string",
  "name": "string",
  "layout": "string",
  ...
}`
    },
    {
      method: 'GET',
      path: `/api/workspace/${params.id}/components`,
      description: 'List all components in the workspace',
      responseBody: `[
  {
    "id": "string",
    "name": "string",
    "type": "string",
    ...
  }
]`
    },
    {
      method: 'POST',
      path: `/api/workspace/${params.id}/components`,
      description: 'Create a new component',
      requestBody: `{
  "name": "string",
  "type": "string",
  "props": [],
  "code": "string"
}`,
      responseBody: `{
  "id": "string",
  "name": "string",
  "type": "string",
  ...
}`
    }
  ];

  if (!project) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
          <p className="mt-2 text-gray-600">
            API endpoints available for workspace: {project.name}
          </p>
        </div>

        <div className="space-y-8">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-2 py-1 text-sm font-medium rounded ${
                    endpoint.method === 'GET' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm text-gray-900">{endpoint.path}</code>
                </div>
                
                <p className="text-gray-600 mb-4">{endpoint.description}</p>

                {endpoint.requestBody && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Request Body</h3>
                    <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm text-gray-800">{endpoint.requestBody}</code>
                    </pre>
                  </div>
                )}

                {endpoint.responseBody && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Response</h3>
                    <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm text-gray-800">{endpoint.responseBody}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-sm font-medium text-gray-900 mb-2">Authentication</h2>
          <p className="text-sm text-gray-600">
            All API endpoints require authentication. Include your authentication token in the request headers:
          </p>
          <pre className="mt-2 bg-gray-100 rounded p-2">
            <code className="text-sm">
              Authorization: Bearer your-token-here
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
} 