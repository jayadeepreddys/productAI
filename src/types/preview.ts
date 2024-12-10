export interface PreviewConfig {
  [componentName: string]: {
    props: Record<string, any>;
    description?: string;
  };
} 