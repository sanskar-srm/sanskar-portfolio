import Certifications from '@/components/certifications';
import Contact from '@/components/contact';
import Header from '@/components/header';
import Hero from '@/components/hero';
import InteractiveBackground from '@/components/interactive-background';
import Projects from '@/components/projects';
import TechStack from '@/components/tech-stack';
import {Separator} from '@/components/ui/separator';

export default function Home() {
  return (
    <>
      <InteractiveBackground />
      <Header />
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Hero />
        <TechStack />
        <SectionSeparator />
        <Projects />
        <SectionSeparator />
        <Certifications />
        <SectionSeparator />
        <Contact />
      </main>
      <footer className="relative z-10 py-10 text-center text-sm text-muted-foreground">
        <p>Made with ❤️ by Sanskar.</p>
      </footer>
    </>
  );
}

function SectionSeparator() {
  return <Separator className="my-20 md:my-28 bg-white/10" />;
}
