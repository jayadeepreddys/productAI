import { projectStore } from '../store/projects';
import { transpileModule } from './transpiler';

export async function loadProjectComponents(projectId: string, content: string) {
  try {
    // Extract component imports from content
    const importMatches = content.match(/import\s+{([^}]+)}\s+from/g) || [];
    const componentNames = importMatches
      .flatMap(match => 
        match
          .replace(/import\s*{\s*/, '')
          .replace(/\s*}\s*from.*/, '')
          .split(',')
          .map(name => name.trim())
      )
      .filter(Boolean);

    console.log('Loading components:', componentNames);

    // Get components from project store
    const components = projectStore.getProjectComponents(projectId);
    
    // Create a map of component name to transpiled code
    const componentMap = new Map();
    
    for (const name of componentNames) {
      const component = components.find(c => c.name === name);
      if (!component) {
        console.warn(`Component not found: ${name}`);
        continue;
      }

      try {
        const transpiled = await transpileModule(component.code);
        componentMap.set(name, transpiled);
      } catch (err) {
        console.error(`Failed to transpile component ${name}:`, err);
        throw new Error(`Failed to transpile component ${name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return componentMap;
  } catch (error) {
    console.error('Error loading components:', error);
    throw error;
  }
} 