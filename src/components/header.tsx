'use client';

import {cn} from '@/lib/utils';
import {useEffect, useState} from 'react';

const navLinks = [
  {name: 'Me', href: '#about'},
  {name: 'Skills', href: '#skills'},
  {name: 'Projects', href: '#projects'},
  {name: 'C&A', href: '#certs'},
  {name: 'Contact', href: '#contact'},
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);

      const sections = navLinks.map(link => document.getElementById(link.href.substring(1)));
      let currentSection = 'about';

      for (const section of sections) {
        if (section && section.getBoundingClientRect().top < window.innerHeight / 2) {
          currentSection = section.id;
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/80 backdrop-blur-sm border-b border-white/10' : 'bg-transparent'
      )}
    >
      <nav className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <div className="items-center hidden space-x-4 md:flex">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-all',
                  activeSection === link.href.substring(1)
                    ? 'text-accent text-glow-accent'
                    : 'text-foreground hover:text-accent hover:text-glow-accent'
                )}
              >
                {link.name}
              </a>
            ))}
          </div>
          {/* Mobile menu could be added here */}
        </div>
      </nav>
    </header>
  );
}
