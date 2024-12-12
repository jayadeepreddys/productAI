export const commonImports = {
  icons: `import { 
    HomeIcon, 
    UserIcon, 
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon
  } from '@heroicons/react/24/outline';`,
  
  utilities: `import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';`,

  // Helper function to merge Tailwind classes
  cn: `export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,
};

export function getRequiredImports(content: string): string[] {
  const imports = [];
  
  // Check for icon usage
  if (content.includes('Icon')) {
    imports.push(commonImports.icons);
  }
  
  // Check for utility usage
  if (content.includes('clsx') || content.includes('cn(')) {
    imports.push(commonImports.utilities);
    imports.push(commonImports.cn);
  }
  
  return imports;
} 