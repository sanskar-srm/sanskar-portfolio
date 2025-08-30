import {ProjectCard} from '@/components/project-card';

const projectsData = [
  {
    title: 'E-commerce Platform',
    role: 'Lead Frontend Developer',
    description:
      'Developed a fully responsive e-commerce website from scratch, leading to a 40% increase in user engagement.',
    imageUrl: 'https://picsum.photos/600/400?random=1',
    imageHint: 'online store',
    githubUrl: '#',
    liveUrl: '#',
    tech: ['ReactJS', 'Node.js', 'MySQL', 'TailwindCSS'],
    objectives: 'Increase online sales and improve user experience for a retail client.',
    projectType: 'e-commerce implementation',
  },
  {
    title: 'Open Source UI Library',
    role: 'Core Contributor',
    description:
      'Contributed to a popular open-source component library, focusing on accessibility and performance improvements.',
    imageUrl: 'https://picsum.photos/600/400?random=2',
    imageHint: 'code library',
    githubUrl: '#',
    tech: ['ReactJS', 'TypeScript', 'Storybook'],
    objectives: 'Grow the contributor community and increase library adoption by developers.',
    projectType: 'open-source project',
  },
  {
    title: 'Marketing Analytics Dashboard',
    role: 'Frontend Engineer',
    description:
      'Built an internal dashboard for the marketing team to track campaign performance and user metrics in real-time.',
    imageUrl: 'https://picsum.photos/600/400?random=3',
    imageHint: 'data dashboard',
    liveUrl: '#',
    tech: ['ReactJS', 'D3.js', 'Redux'],
    objectives: 'Provide actionable insights to the marketing team to optimize ad spend and strategy.',
    projectType: 'marketing site',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-20 sm:py-28">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center md:text-4xl font-headline mb-12 text-glow">
          Featured Projects
        </h2>
        <div className="space-y-24">
          {projectsData.map((project, index) => (
            <ProjectCard key={project.title} project={project} reverse={index % 2 !== 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
