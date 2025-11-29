import React, { useState, useEffect, useRef } from 'react';
import { Scene } from './components/Scene';
import { ImageEditor } from './components/ImageEditor';
import { PORTFOLIO_DATA } from './constants';
import { Mail, Phone, MapPin, Code, Briefcase, GraduationCap, Github, Linkedin, ChevronDown } from 'lucide-react';

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      const progress = Math.max(0, Math.min(1, currentScroll / totalHeight));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full min-h-[500vh] text-gray-200 font-sans selection:bg-ud-red selection:text-white" ref={containerRef}>
      
      {/* 3D Background */}
      <Scene scrollProgress={scrollProgress} />

      {/* Content Overlay */}
      <main className="relative z-10 flex flex-col items-center w-full">
        
        {/* Section 1: Hero */}
        <section className="h-screen w-full flex flex-col items-center justify-center p-6 text-center">
          <h1 className="font-serif text-5xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-b from-ud-red to-black stroke-white drop-shadow-[0_0_10px_rgba(255,0,51,0.8)] animate-pulse-slow mb-4 border-b-4 border-ud-dark-red pb-4">
            {PORTFOLIO_DATA.name}
          </h1>
          <h2 className="text-xl md:text-3xl text-gray-400 tracking-[0.2em] font-light uppercase glow-text">
            {PORTFOLIO_DATA.role}
          </h2>
          <div className="absolute bottom-10 animate-bounce text-ud-red">
            <ChevronDown size={40} />
          </div>
        </section>

        {/* Section 2: About & Summary */}
        <section className="min-h-screen w-full flex items-center justify-center p-6 max-w-4xl">
          <div className="bg-black/70 backdrop-blur-sm p-8 md:p-12 rounded-lg border-l-4 border-ud-red shadow-[0_0_30px_rgba(0,0,0,0.8)] transform transition-all duration-700 translate-y-0 opacity-100">
             <h3 className="font-serif text-4xl text-ud-red mb-6 border-b border-gray-800 pb-2">01. THE PROFILE</h3>
             <p className="text-lg md:text-xl leading-relaxed text-gray-300">
               {PORTFOLIO_DATA.summary}
             </p>
             <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2"><MapPin className="text-ud-red" size={16}/> {PORTFOLIO_DATA.contact.address}</span>
                <span className="flex items-center gap-2"><Mail className="text-ud-red" size={16}/> {PORTFOLIO_DATA.contact.email}</span>
                <span className="flex items-center gap-2"><Phone className="text-ud-red" size={16}/> {PORTFOLIO_DATA.contact.phone}</span>
             </div>
          </div>
        </section>

        {/* Section 3: Experience */}
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 max-w-5xl">
          <h3 className="font-serif text-4xl text-ud-red mb-12 self-start md:self-center border-b border-gray-800 pb-2">02. CHRONICLES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {PORTFOLIO_DATA.experience.map((exp, idx) => (
              <div key={idx} className="group relative bg-gray-900/80 p-6 rounded border border-gray-800 hover:border-ud-red transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,0,51,0.3)]">
                 <Briefcase className="absolute top-6 right-6 text-gray-700 group-hover:text-ud-red transition-colors" />
                 <h4 className="text-2xl font-bold text-white mb-1">{exp.role}</h4>
                 <h5 className="text-ud-red font-serif text-lg mb-4">{exp.company}</h5>
                 <p className="text-sm text-gray-500 mb-4 font-mono">{exp.period}</p>
                 <p className="text-gray-300 text-sm leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Projects */}
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 max-w-5xl">
           <h3 className="font-serif text-4xl text-ud-red mb-12 self-start md:self-center border-b border-gray-800 pb-2">03. CREATIONS</h3>
           <div className="w-full space-y-8">
             {PORTFOLIO_DATA.projects.map((proj, idx) => (
               <div key={idx} className="flex flex-col md:flex-row gap-6 bg-black/60 border border-gray-800 p-6 rounded hover:bg-black/80 transition-colors">
                  <div className="flex-1">
                    <h4 className="text-3xl font-serif text-white mb-2">{proj.name}</h4>
                    <div className="flex items-center gap-2 text-ud-red text-sm font-mono mb-4">
                      <Code size={14} /> {proj.tech}
                    </div>
                  </div>
                  <div className="flex-1 border-l border-gray-700 pl-0 md:pl-6 pt-4 md:pt-0">
                    <p className="text-gray-300">{proj.description}</p>
                  </div>
               </div>
             ))}
           </div>
        </section>

        {/* Section 5: Skills & Education */}
        <section className="min-h-screen w-full flex flex-col items-center justify-center p-6 max-w-4xl">
           <h3 className="font-serif text-4xl text-ud-red mb-12 border-b border-gray-800 pb-2">04. ABILITIES & LORE</h3>
           
           <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Code className="text-ud-red"/> Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {PORTFOLIO_DATA.skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-900 border border-gray-700 rounded-full text-sm text-gray-300 hover:border-ud-red hover:text-ud-red cursor-default transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><GraduationCap className="text-ud-red"/> Education</h4>
                <div className="bg-gray-900/50 p-4 border border-gray-800 rounded">
                  <p className="text-white text-lg">{PORTFOLIO_DATA.education}</p>
                  <p className="text-gray-500 text-sm mt-1">Bachelor of Arts & Master of Arts</p>
                </div>
              </div>
           </div>
        </section>

        {/* Section 7: Contact */}
        <section className="h-[50vh] w-full flex flex-col items-center justify-center p-6 bg-gradient-to-t from-ud-black to-transparent">
          <h3 className="font-serif text-5xl text-white mb-8">MAKE CONTACT</h3>
          <div className="flex gap-8">
            <a href={`mailto:${PORTFOLIO_DATA.contact.email}`} className="group flex flex-col items-center gap-2 text-gray-400 hover:text-ud-red transition-colors">
              <div className="p-4 bg-gray-900 rounded-full group-hover:bg-gray-800 transition-colors border border-gray-700 group-hover:border-ud-red">
                <Mail size={24} />
              </div>
              <span className="text-sm">Email Me</span>
            </a>
            <a href="#" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-ud-red transition-colors">
              <div className="p-4 bg-gray-900 rounded-full group-hover:bg-gray-800 transition-colors border border-gray-700 group-hover:border-ud-red">
                <Linkedin size={24} />
              </div>
              <span className="text-sm">LinkedIn</span>
            </a>
             <a href="#" className="group flex flex-col items-center gap-2 text-gray-400 hover:text-ud-red transition-colors">
              <div className="p-4 bg-gray-900 rounded-full group-hover:bg-gray-800 transition-colors border border-gray-700 group-hover:border-ud-red">
                <Github size={24} />
              </div>
              <span className="text-sm">GitHub</span>
            </a>
          </div>
          <footer className="absolute bottom-4 text-xs text-gray-600 font-mono">
             © {new Date().getFullYear()} HASAN HAFIZUR RAHMAN. ALL RIGHTS RESERVED.
          </footer>
        </section>

      </main>
    </div>
  );
}

export default App;