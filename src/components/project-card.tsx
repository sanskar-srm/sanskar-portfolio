'use client';

import {refineDescriptionAction} from '@/app/actions';
import {Alert, AlertDescription, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
import {Copy, Github, Link as LinkIcon, Sparkles} from 'lucide-react';
import Image from 'next/image';
import {useState} from 'react';

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
  const {toast} = useToast();
  const [isRefining, setIsRefining] = useState(false);
  const [refinedDescription, setRefinedDescription] = useState<string | null>(null);

  const handleRefine = async () => {
    setIsRefining(true);
    setRefinedDescription(null);
    const result = await refineDescriptionAction({
      originalDescription: project.description,
      objectives: project.objectives,
      projectType: project.projectType,
      technologiesUsed: project.tech.join(', '),
    });
    setIsRefining(false);

    if (result.success && result.data) {
      setRefinedDescription(result.data.refinedDescription);
      toast({
        title: 'Description Refined!',
        description: 'The AI has suggested a new description for your project.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: result.error || 'There was a problem with the AI refinement.',
      });
    }
  };

  const handleCopy = () => {
    if (refinedDescription) {
      navigator.clipboard.writeText(refinedDescription);
      toast({
        title: 'Copied to clipboard!',
      });
    }
  };

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

        {refinedDescription && (
          <Alert className="relative border-primary/30 bg-card/50">
            <Sparkles className="w-4 h-4 text-primary" />
            <AlertTitle className="font-bold text-primary">AI-Refined Description</AlertTitle>
            <AlertDescription className="pr-8 text-foreground/90">
              {refinedDescription}
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute w-7 h-7 top-2 right-2"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </Alert>
        )}

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
          <Button onClick={handleRefine} disabled={isRefining} className="bg-primary/90 hover:bg-primary">
            <Sparkles className={`mr-2 h-4 w-4 ${isRefining ? 'animate-spin' : ''}`} />
            {isRefining ? 'Refining...' : 'Refine with AI'}
          </Button>
        </div>
      </div>
    </div>
  );
}
