'use client';

import {Button} from '@/components/ui/button';
import {Github, Link as LinkIcon} from 'lucide-react';
import Image from 'next/image';

type Project = {
  title: string;
  role: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  githubUrl?: string;
  liveUrl?: string;
  tech: string[];
  objectives: string;
  projectType: string;
};

interface ProjectCardProps {
  project: Project;
  reverse?: boolean;
}

export function ProjectCard({project, reverse = false}: ProjectCardProps) {
  return (
    <div
      className={`grid grid-cols-1 items-center gap-8 lg:grid-cols-2 ${
        reverse ? 'lg:grid-flow-col-dense' : ''
      }`}
    >
      <div
        className={`overflow-hidden rounded-lg border-2 border-white/10 aspect-video ${
          reverse ? 'lg:col-start-2' : ''
        }`}
      >
        <Image
          src={project.imageUrl}
          alt={project.title}
          width={600}
          height={400}
          data-ai-hint={project.imageHint}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold font-headline text-primary">{project.title}</h3>
        <p className="font-semibold text-muted-foreground">{project.role}</p>
        <p className="text-foreground/80">{project.description}</p>

        <div className="flex flex-wrap gap-2">
          {project.tech.map(t => (
            <span
              key={t}
              className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4">
          {project.githubUrl && (
            <Button asChild variant="outline">
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" /> GitHub
              </a>
            </Button>
          )}
          {project.liveUrl && (
            <Button asChild variant="outline">
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <LinkIcon className="w-4 h-4 mr-2" /> Live Demo
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
