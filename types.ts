export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface ProjectItem {
  name: string;
  tech: string;
  description: string;
}

export interface PortfolioData {
  name: string;
  role: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  summary: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: string[];
  education: string;
}

export interface ScrollProps {
  scrollProgress: number;
}