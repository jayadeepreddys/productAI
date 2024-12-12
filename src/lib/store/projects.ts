import { ProjectData } from '@/types/project';
import { samplePages } from './templates';
import { sampleTemplates } from './templates';
import { baseStylesTemplate } from '../templates/baseStyles';

interface ComponentData {
  id: string;
  name: string;
  type: 'ui' | 'layout' | 'form' | 'data';
  code?: string;
  preview?: string;
  createdAt: string;
  updatedAt?: string;
}

class ProjectStore {
  private static instance: ProjectStore;
  private projects: ProjectData[] = [];
  private pages: { [projectId: string]: PageData[] } = {};
  private components: { [projectId: string]: ComponentData[] } = {};

  private constructor() {
    if (typeof window !== 'undefined') {
      // Load projects from localStorage
      const storedProjects = localStorage.getItem('projects');
      const storedPages = localStorage.getItem('project_pages');
      const storedComponents = localStorage.getItem('project_components');
      
      if (storedProjects) {
        this.projects = JSON.parse(storedProjects);
      }
      if (storedPages) {
        this.pages = JSON.parse(storedPages);
      }
      if (storedComponents) {
        this.components = JSON.parse(storedComponents);
      }
    }
  }
  private addDefaultPages(projectId: string) {
    const template = sampleTemplates.basic;
    template.pages.forEach(page => {
      this.addPage(projectId, {
        name: page.name,
        path: page.path,
        description: page.description,
        components: page.components,
        apis: page.apis,
        content: page.content
      });
    });
  }
  static getInstance(): ProjectStore {
    if (!ProjectStore.instance) {
      ProjectStore.instance = new ProjectStore();
    }
    return ProjectStore.instance;
  }

  addProject(project: Omit<ProjectData, 'id' | 'createdAt'>): ProjectData {
    const newProject: ProjectData = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
  
    this.projects.push(newProject);
    this.pages[newProject.id] = [];
    this.components[newProject.id] = [];
    
    // Add default pages from template
    this.addDefaultPages(newProject.id);
    
    this.saveToStorage();
    return newProject;
    
    this.saveToStorage();
    return newProject;
  }

  addPage(projectId: string, page: Omit<PageData, 'id' | 'createdAt'>): PageData {
    const newPage: PageData = {
      ...page,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    if (!this.pages[projectId]) {
      this.pages[projectId] = [];
    }
    
    this.pages[projectId].push(newPage);
    this.saveToStorage();
    return newPage;
  }

  getProjects(): ProjectData[] {
    return [...this.projects];
  }

  getProjectById(id: string): ProjectData | undefined {
    return this.projects.find(project => project.id === id);
  }

  getProjectPages(projectId: string): PageData[] {
    return this.pages[projectId] || [];
  }

  getPageById(projectId: string, pageId: string): PageData | undefined {
    return this.pages[projectId]?.find(page => page.id === pageId);
  }

  updatePage(projectId: string, pageId: string, updates: Partial<PageData>): PageData | undefined {
    const pageIndex = this.pages[projectId]?.findIndex(page => page.id === pageId);
    
    if (pageIndex === undefined || pageIndex === -1) {
      return undefined;
    }

    const updatedPage = {
      ...this.pages[projectId][pageIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.pages[projectId][pageIndex] = updatedPage;
    this.saveToStorage();
    return updatedPage;
  }

  deletePage(projectId: string, pageId: string): boolean {
    const pages = this.pages[projectId];
    if (!pages) return false;

    const pageIndex = pages.findIndex(page => page.id === pageId);
    if (pageIndex === -1) return false;

    pages.splice(pageIndex, 1);
    this.saveToStorage();
    return true;
  }

  // Component methods
  getProjectComponents(projectId: string): ComponentData[] {
    return this.components[projectId] || [];
  }

  getComponentById(projectId: string, componentId: string): ComponentData | undefined {
    return this.components[projectId]?.find(component => component.id === componentId);
  }

  addComponent(projectId: string, component: Omit<ComponentData, 'id' | 'createdAt'>): ComponentData {
    const newComponent: ComponentData = {
      ...component,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    if (!this.components[projectId]) {
      this.components[projectId] = [];
    }
    
    this.components[projectId].push(newComponent);
    this.saveToStorage();
    return newComponent;
  }

  updateComponent(
    projectId: string,
    componentId: string,
    updates: Partial<ComponentData>
  ): ComponentData | undefined {
    const componentIndex = this.components[projectId]?.findIndex(
      component => component.id === componentId
    );
    
    if (componentIndex === undefined || componentIndex === -1) {
      return undefined;
    }

    const updatedComponent = {
      ...this.components[projectId][componentIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.components[projectId][componentIndex] = updatedComponent;
    this.saveToStorage();
    return updatedComponent;
  }

  deleteComponent(projectId: string, componentId: string): boolean {
    const components = this.components[projectId];
    if (!components) return false;

    const componentIndex = components.findIndex(component => component.id === componentId);
    if (componentIndex === -1) return false;

    components.splice(componentIndex, 1);
    this.saveToStorage();
    return true;
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('projects', JSON.stringify(this.projects));
      localStorage.setItem('project_pages', JSON.stringify(this.pages));
      localStorage.setItem('project_components', JSON.stringify(this.components));
    }
  }

  deleteProject(projectId: string) {
    const projects = this.getProjects();
    const updatedProjects = projects.filter(project => project.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  }

  createProject(name: string): string {
    const id = generateId();
    this.projects.set(id, {
      id,
      name,
      pages: new Map(),
      components: new Map(),
      styles: baseStylesTemplate, // Add base styles on project creation
      // ... other project properties
    });
    return id;
  }

  getProjectStyles(projectId: string): string | undefined {
    const project = this.projects.get(projectId);
    return project?.styles;
  }
}

export interface PageData {
  id: string;
  name: string;
  path: string;
  components: string[];
  apis: string[];
  description: string;
  content?: string;
  createdAt: string;
  updatedAt?: string;
  config?: {
    layout: string;
    sections: {
      type: string;
      content: any;
    }[];
  };
}

export interface ComponentItem extends ComponentData {}

export interface PageItem {
  id: string;
  name: string;
  layout?: string;
  content?: string;
}

export const projectStore = ProjectStore.getInstance(); 