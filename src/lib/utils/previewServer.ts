import fs from 'fs/promises';
import path from 'path';
import { projectStore } from '../store/projects';

export async function copyProjectToPreview(projectId: string) {
  try {
    const project = projectStore.getProjects().find(p => p.id === projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const pages = projectStore.getProjectPages(projectId);
    const components = projectStore.getProjectComponents(projectId);

    // Create directories
    const previewDir = path.join(process.cwd(), '../preview-server/src/app');
    const componentsDir = path.join(process.cwd(), '../preview-server/src/components');

    await fs.mkdir(previewDir, { recursive: true });
    await fs.mkdir(componentsDir, { recursive: true });

    // Copy pages
    for (const page of pages || []) {
      if (page.path && page.content) {
        const pagePath = path.join(previewDir, page.path);
        await fs.mkdir(path.dirname(pagePath), { recursive: true });
        await fs.writeFile(pagePath, page.content);
      }
    }

    // Copy components
    for (const component of components || []) {
      if (component.name && component.content) {
        const componentPath = path.join(componentsDir, `${component.name}.tsx`);
        await fs.writeFile(componentPath, component.content);
      }
    }

    return true;
  } catch (error) {
    console.error('Failed to copy project to preview:', error);
    return false;
  }
} 