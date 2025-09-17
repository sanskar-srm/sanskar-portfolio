import {Button} from '@/components/ui/button';
import {Download} from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section id="about" className="pt-32 pb-24 sm:pt-40 sm:pb-32 md:pt-48 md:pb-40">
      <div className="container mx-auto">
        <div className="grid items-center grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex justify-center md:order-2 md:justify-end image-wrapper-3d">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80">
              <div className="absolute inset-0 border-4 rounded-full border-primary/50 shadow-lg accent-glow"></div>
              <Image
                src="/profile.jpg"
                alt="Profile photo"
                fill
                className="object-cover rounded-full floating-image"
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
              I&apos;m a passionate full-stack developer with a knack for creating dynamic,
              user-friendly web experiences. I thrive on turning complex problems into beautiful,
              intuitive, and practical solutions. With hands-on experience in modern frontend and
              backend technologies, I design and build scalable applications, robust systems, and
              AI-driven features that enhance user experiences. Beyond coding, I am deeply
              interested in generative AI and its potential to create intelligent, adaptive
              solutions. I bring strong leadership, management, and collaboration skills to every
              project, ensuring effective teamwork and real-world impact. Whether it’s a hackathon
              challenge or a production-ready application, I focus on innovation, usability, and
              delivering results that make a difference.
            </p>
            <p className="text-xl font-semibold text-center text-primary md:text-left">
              Software Engineer at Innovate LLC
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
