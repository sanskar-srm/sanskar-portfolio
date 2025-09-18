import {Button} from '@/components/ui/button';
import {Download} from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section id="about" className="pt-32 pb-24 sm:pt-40 sm:pb-32 md:pt-48 md:pb-40">
      <div className="container mx-auto">
        <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex justify-center md:order-2 md:justify-end">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 mt-8 md:mt-0">
              <div className="absolute inset-0 border-4 rounded-full border-primary/50 shadow-lg accent-glow"></div>
              <Image
                src="/pp.jpg"
                alt="Profile photo"
                fill
                className="object-cover rounded-full"
                sizes="(max-width: 768px) 256px, 320px"
                data-ai-hint="professional headshot"
                priority
              />
            </div>
          </div>
          <div className="space-y-6 md:order-1">
            <h1 className="text-4xl font-bold text-center md:text-6xl md:text-left font-headline text-glow">
              Sanskar Bhadani
            </h1>
            <p className="max-w-lg mx-auto text-lg text-center text-muted-foreground md:text-left md:mx-0">
              I’m a full-stack developer passionate about building scalable, user-friendly
              applications and exploring generative AI. I turn complex problems into intuitive
              solutions, combining modern technologies with creativity, leadership, and practical
              impact.
            </p>
            <p className="text-xl font-semibold text-center text-primary md:text-left">
              Software Engineer
            </p>
            <div className="flex justify-center gap-4 md:justify-start">
              <Button asChild size="lg" className="accent-glow">
                <a href="#contact">Contact Me</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/resume.pdf" download>
                  <Download className="w-4 h-4 mr-2" />
                  My Resume
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
