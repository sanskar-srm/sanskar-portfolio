'use client';

import {cn} from '@/lib/utils';
import {useEffect, useState} from 'react';

const navLinks = [
  {name: 'About', href: '#about'},
  {name: 'Skills', href: '#skills'},
  {name: 'Projects', href: '#projects'},
  {name: 'Certs', href: '#certs'},
  {name: 'Contact', href: '#contact'},
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
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
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-2xl font-bold font-headline text-glow">
            KineticFolio
          </a>
          <div className="items-center hidden space-x-4 md:flex">
            {navLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-2 text-sm font-medium rounded-md text-foreground hover:text-primary transition-colors"
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
