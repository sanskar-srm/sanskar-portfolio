export type Project = {
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
  /** Placeholder entries stay in the data but are hidden from the UI. */
  hidden?: boolean;
};

export const projectsData: Project[] = [
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
    imageUrl: '/projectCover/rail.jpg',
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
    objectives: 'Provide actionable insights to the marketing team to optimize ad spend and strategy.',
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
    hidden: true,
  },
];

export const projects = projectsData.filter(p => !p.hidden);

/** A link of '#' means "not available" in the original data. */
export const realLink = (url?: string) => (url && url !== '#' ? url : undefined);

/* ── App Dev ─────────────────────────────────────────────────────── */

export type AppProject = {
  title: string;
  role: string;
  tagline: string;
  description: string;
  icon: string;
  githubUrl?: string;
  platforms: string[];
  tech: string[];
  /** Each screenshot is paired with the feature it demonstrates. */
  screens: {src: string; title: string; caption: string}[];
};

export const appProjects: AppProject[] = [
  {
    title: 'Hopeloop',
    role: 'Mobile Developer',
    tagline: 'An offline-first emergency companion.',
    description:
      'Hopeloop keeps people informed and connected when networks fail — live location with local disaster alerts, Bluetooth peer-to-peer messaging with nearby devices, and an AI guide that works without a signal.',
    icon: '/appDev/Hopeloop/Logo/icon.png',
    githubUrl: 'https://github.com/sanskar-srm/Hopeloop',
    platforms: ['Android', 'iOS'],
    tech: ['React Native', 'Expo', 'TypeScript', 'Expo Router', 'NativeWind', 'Reanimated', 'BLE', 'Expo Location'],
    screens: [
      {
        src: '/appDev/Hopeloop/Screenshots/ss2.jpeg',
        title: 'Live dashboard',
        caption: 'GPS location with nearby seismic (USGS) and harsh-weather (Open-Meteo) alerts.',
      },
      {
        src: '/appDev/Hopeloop/Screenshots/ss1.jpeg',
        title: 'P2P radar',
        caption: 'Discovers nearby devices over Bluetooth to message with no internet at all.',
      },
      {
        src: '/appDev/Hopeloop/Screenshots/ss3.jpeg',
        title: 'Asha — offline AI',
        caption: 'Step-by-step emergency guidance for water, fire, bleeding and more — offline.',
      },
    ],
  },
];
