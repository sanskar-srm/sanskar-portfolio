import {ProjectCard} from '@/components/project-card';

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
      'Railमित्र is a conceptual web application I built to simplify access to reliable train information in India. What began as a learning project soon grew into a complete platform, showcasing my ability to design user-friendly, impactful solutions. While it remains a project, Railमित्र reflects my passion for technology, problem-solving, and building tools that address real-world challenges.',
    imageUrl: '/projectCover/railMitra.jpg',
    imageHint: 'train app',
    githubUrl: '#',
    liveUrl: '#',
    tech: ['ReactJS', 'TypeScript', 'TailwindCSS', 'Node.js', 'Express.js', 'Firebase', 'IR APIs'],
    objectives: 'Grow the contributor community and increase library adoption by developers.',
    projectType: 'open-source project',
  },
  {
    title: 'Marketing Analytics Dashboard',
    role: 'Frontend Engineer',
    description:
      'Built an internal dashboard for the marketing team to track campaign performance and user metrics in real-time.',
    imageUrl: 'https://picsum.photos/seed/dashboard/600/400',
    imageHint: 'data dashboard',
    githubUrl: '#',
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
