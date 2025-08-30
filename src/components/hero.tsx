import {Button} from '@/components/ui/button';
import {Download} from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section id="about" className="py-24 sm:py-32 md:py-40">
      <div className="container mx-auto">
        <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold md:text-6xl font-headline text-glow">Your Name</h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              I&apos;m a passionate developer with a knack for creating dynamic, user-friendly web
              experiences. I thrive on turning complex problems into beautiful, intuitive designs.
            </p>
            <p className="text-xl font-semibold text-primary">Software Engineer at Innovate LLC</p>
            <div className="flex gap-4">
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
          <div className="flex justify-center md:justify-end image-wrapper-3d">
            <div className="relative">
                <div className="absolute inset-0 border-4 rounded-full border-primary/50 shadow-lg accent-glow"></div>
                <Image
                  src="/profile.jpg"
                  alt="Profile photo"
                  width={400}
                  height={400}
                  className="object-cover rounded-full floating-image"
                  data-ai-hint="professional headshot"
                  priority
                />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
