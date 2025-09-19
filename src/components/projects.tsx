'use client';
import {ProjectCard} from '@/components/project-card';
import {useScrollAnimation} from '@/hooks/use-scroll-animation';
import {useState} from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {Button} from './ui/button';
import {ChevronDown} from 'lucide-react';
import {cn} from '@/lib/utils';

const projectsData = [
  {
    title: 'Schedura',
    role: 'Lead Frontend Developer',
    description:
      'A feature-rich, responsive web application for appointment booking and scheduling, designed with a clean and intuitive interface. The platform allows users to easily view available slots, book appointments through a calendar-based system, and manage their schedules effortlessly.',
    imageUrl: '/projectCover/schedura.jpg',
    imageHint: 'scheduling app',
    githubUrl: '#',
    liveUrl: 'https://schedura-new.vercel.app/',
    tech: ['ReactJS', 'Node.js', 'MongoDB', 'TailwindCSS'],
    objectives: 'Increase online sales and improve user experience for a retail client.',
    projectType: 'e-commerce implementation',
  },
  {
    title: 'Railमित्र',
    role: 'Core Developer',
    description:
      'Railमित्र is a conceptual web application I built to simplify access to reliable train information in India. What began as a learning project soon grew into a complete platform, showcasing my ability to design user-friendly, impactful solutions. While it remains a project, Railमित्र reflects my passion for technology, problem-solving, and building tools that addresses real-world challenges.',
    imageUrl: '/projectCover/railMitra.jpg',
    imageHint: 'train app',
    githubUrl: 'https://github.com/sanskar-srm/RailMitra',
    liveUrl: '#',
    tech: ['ReactJS', 'TypeScript', 'TailwindCSS', 'Node.js', 'Express.js', 'Firebase', 'IR APIs'],
    objectives: 'Grow the contributor community and increase library adoption by developers.',
    projectType: 'open-source project',
  },
  {
    title: 'BiasGuard',
    role: 'Hybrid Developer',
    description:
      'BiasGuard is a conceptual hackathon project I built to promote equity and inclusivity in workplaces. What started as an experimental idea during a hackathon quickly evolved into a platform that scans job postings, workplace communication, and conversations for bias, providing actionable alternatives. While it remains a project, BiasGuard reflects my drive to leverage technology for creating fair, respectful, and impactful work environments.',
    imageUrl: '/projectCover/biasGuard.jpg',
    imageHint: 'data dashboard',
    githubUrl: '#',
    liveUrl: '#',
    tech: [
      'ReactJS',
      'TypeScript',
      'TailwindCSS',
      'Node.js',
      'Express.js',
      'Firebase',
      'Gemini API',
      'Machine Learning',
    ],
    objectives:
      'Provide actionable insights to the marketing team to optimize ad spend and strategy.',
    projectType: 'marketing site',
  },
  {
    title: 'Uploading Soon',
    role: 'Solo Developer',
    description: 'uploading soon',
    imageUrl: 'https://picsum.photos/seed/4/600/400',
    imageHint: 'portfolio website',
    githubUrl: '#',
    liveUrl: '#',
    tech: ['HTML', 'CSS', 'JavaScript'],
    objectives: 'Learn web development fundamentals.',
    projectType: 'personal project',
  },
];

const AnimatedProjectCard = ({
  project,
  reverse,
}: {
  project: (typeof projectsData)[0];
  reverse: boolean;
}) => {
  const {ref, inView} = useScrollAnimation();
  const animationClass = reverse ? 'animate-slide-in-right' : 'animate-slide-in-left';

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-700 ${
        inView ? `opacity-100 ${animationClass}` : 'opacity-0'
      }`}
    >
      <ProjectCard project={project} reverse={reverse} />
    </div>
  );
};

export default function Projects() {
  const [showAllProjects, setShowAllProjects] = useState(false);

  return (
    <section id="projects" className="py-20 sm:py-28">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center md:text-4xl font-headline mb-12 text-glow">
          Featured Projects
        </h2>
        <Collapsible open={showAllProjects} onOpenChange={setShowAllProjects}>
          <div className="space-y-24">
            {projectsData.slice(0, 3).map((project, index) => (
              <AnimatedProjectCard
                key={project.title}
                project={project}
                reverse={index % 2 !== 0}
              />
            ))}
          </div>

          <CollapsibleContent className="space-y-24 mt-24">
            {projectsData.slice(3).map((project, index) => (
              <AnimatedProjectCard
                key={project.title}
                project={project}
                reverse={(index + 3) % 2 !== 0}
              />
            ))}
          </CollapsibleContent>

          {projectsData.length > 3 && (
            <div className="mt-16 text-center">
              <CollapsibleTrigger asChild>
                <Button variant="outline">
                  {showAllProjects ? 'Show Less' : 'Show More'}
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 ml-2 transition-transform',
                      showAllProjects && 'rotate-180'
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          )}
        </Collapsible>
      </div>
    </section>
  );
}
