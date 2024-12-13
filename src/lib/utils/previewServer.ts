import { projectStore } from '../store/projects';

export async function deployToPreviewServer(projectId: string) {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Get all projects to check if the project exists
    const projects = projectStore.getProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      console.error('Available projects:', projects.map(p => ({ id: p.id, name: p.name })));
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const pages = projectStore.getProjectPages(projectId);
    const components = projectStore.getProjectComponents(projectId);

    if (!pages && !components) {
      throw new Error('No pages or components found for this project');
    }

    // Prepare the project data
    const projectData = {
      id: projectId,
      name: project.name,
      pages: pages?.map(page => ({
        path: page.path,
        content: page.content
      })) || [],
      components: components?.map(component => ({
        name: component.name,
        content: component.content || component.code
      })) || []
    };

    // Send to preview server
    const response = await fetch('http://localhost:3001/api/preview/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(projectData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Deploy failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.success;

  } catch (error) {
    console.error('Failed to deploy to preview:', error);
    throw error;
  }
} 