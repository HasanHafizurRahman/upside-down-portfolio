import { PortfolioData } from './types';

export const PORTFOLIO_DATA: PortfolioData = {
  name: "HASAN HAFIZUR RAHMAN",
  role: "Frontend Developer",
  contact: {
    email: "hasanshanto922@gmail.com",
    phone: "+8801776249691",
    address: "Uttara-15, Dhaka"
  },
  summary: "Expert in TypeScript, ReactJs, and NextJs. Passionate about building scalable, high-performance web applications and solving complex problems.",
  experience: [
    {
      company: "Virleaf",
      role: "Frontend Engineer",
      period: "July 2024 - Present",
      description: "Built scalable single-vendor e-commerce platform and POS core modules (Sales, Purchase, Due Collection). Optimized system architecture."
    },
    {
      company: "HK IT Limited",
      role: "Junior Software Developer",
      period: "Nov 2023 - June 2024",
      description: "Built HRM modules (Attendance, Leave) and POS inventory logic."
    }
  ],
  projects: [
    {
      name: "Virleaf E-Commerce",
      tech: "Next.js, Tailwind, REST API",
      description: "Full checkout flow, SEO optimized, custom scroll snapping."
    },
    {
      name: "Smart POS",
      tech: "React.js, Redux Toolkit, Axios",
      description: "Feature-rich POS for SMEs with due tracking and inventory."
    }
  ],
  skills: [
    "JavaScript (ES6+)",
    "TypeScript",
    "React.js",
    "Next.js",
    "Redux Toolkit",
    "Tailwind CSS",
    "React-Native",
    "Vitest",
    "Jest"
  ],
  education: "Jagannath University (B.A. & M.A.)"
};