import Footer from '@/components/layout/footer';
import About from '@/components/sections/about';
import Contact from '@/components/sections/contact';
import Hero from '@/components/sections/hero';
import Journey from '@/components/sections/journey';
import Projects from '@/components/sections/projects';
import Skills from '@/components/sections/skills';
import {getExperience} from '@/lib/experience-store';

// Re-rendered on demand when the admin panel saves (revalidatePath), hourly otherwise.
export const revalidate = 3600;

export default async function Home() {
  const experience = await getExperience();
  return (
    <>
      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Journey experience={experience} />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
