interface ProjectPage {
  id: string;
  path: string;
  content: string;
}

interface ProjectComponent {
  id: string;
  name: string;
  content: string;
}

class ProjectStore {
  private pages: Map<string, ProjectPage> = new Map();
  private components: Map<string, ProjectComponent> = new Map();

  // Page methods
  addPage(page: ProjectPage) {
    this.pages.set(page.id, page);
  }

  getPage(id: string) {
    return this.pages.get(id);
  }

  getAllPages() {
    return Array.from(this.pages.values());
  }

  // Component methods
  addComponent(component: ProjectComponent) {
    this.components.set(component.id, component);
  }

  getComponent(id: string) {
    return this.components.get(id);
  }

  getAllComponents() {
    return Array.from(this.components.values());
  }

  // Project structure
  getProjectStructure() {
    return {
      pages: this.getAllPages(),
      components: this.getAllComponents()
    };
  }
}

export const projectStore = new ProjectStore();