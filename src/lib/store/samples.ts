interface SampleComponent {
  id: string;
  name: string;
  type: 'ui' | 'layout' | 'form' | 'data';
  description: string;
  code: string;
  preview: string; // Base64 image
}

interface SamplePage {
  id: string;
  name: string;
  description: string;
  components: string[];
  preview: string; // Base64 image
  template: string;
}

class SamplesStore {
  private static instance: SamplesStore;
  private sampleComponents: SampleComponent[] = [
    {
      id: 'header-1',
      name: 'Modern Header',
      type: 'layout',
      description: 'A responsive header with navigation and user menu',
      code: `export function Header() {
        return (
          <header className="bg-white shadow">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              // Header implementation
            </nav>
          </header>
        );
      }`,
      preview: 'data:image/png;base64,...' // We'll add actual preview images
    },
    {
      id: 'hero-1',
      name: 'Hero Section',
      type: 'ui',
      description: 'A hero section with image and CTA',
      code: `export function Hero() {
        return (
          <div className="relative bg-white overflow-hidden">
            // Hero implementation
          </div>
        );
      }`,
      preview: 'data:image/png;base64,...'
    }
  ];

  private samplePages: SamplePage[] = [
    {
      id: 'landing-1',
      name: 'Modern Landing Page',
      description: 'A landing page with hero, features, and CTA sections',
      components: ['header-1', 'hero-1'],
      preview: 'data:image/png;base64,...',
      template: `export default function LandingPage() {
        return (
          <div>
            <Header />
            <Hero />
            // Other sections
          </div>
        );
      }`
    }
  ];

  private constructor() {}

  static getInstance(): SamplesStore {
    if (!SamplesStore.instance) {
      SamplesStore.instance = new SamplesStore();
    }
    return SamplesStore.instance;
  }

  getSampleComponents(): SampleComponent[] {
    return this.sampleComponents;
  }

  getSamplePages(): SamplePage[] {
    return this.samplePages;
  }

  getSampleComponent(id: string): SampleComponent | undefined {
    return this.sampleComponents.find(c => c.id === id);
  }

  getSamplePage(id: string): SamplePage | undefined {
    return this.samplePages.find(p => p.id === id);
  }
}

export const samplesStore = SamplesStore.getInstance(); 