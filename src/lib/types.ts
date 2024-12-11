export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  dependencies: {
    name: string;
    version: string;
  }[];
}

export interface ComponentData {
  id: string;
  name: string;
  type: 'ui' | 'layout' | 'form' | 'data';
  code: string;
  preview?: string;
  dependencies: string[];
  props: Array<{ name: string; type: string }>;
  style: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
}

export interface DependencyData {
  name: string;
  version: string;
  addedAt: string;
}

export interface PageData {
  id: string;
  name: string;
  content: string;
  components: string[];  // List of component names used in the page
  layout?: string;
  route: string;
  createdAt: string;
  updatedAt?: string;
  isPublic?: boolean;
  meta?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
} 