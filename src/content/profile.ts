export const profile = {
  firstName: 'Sanskar',
  lastName: 'Bhadani',
  role: 'Software Engineer',
  tagline: 'Full-stack developer building scalable, user-friendly applications — and exploring generative AI.',
  bio: 'I’m a full-stack developer passionate about building scalable, user-friendly applications and exploring generative AI. I turn complex problems into intuitive solutions, combining modern technologies with creativity, leadership, and practical impact.',
  photo: '/profile.jpg',
  resume: '/resume.pdf',
  email: 'sanskarbhadani0810@gmail.com',
  contactBlurb:
    'Have a project in mind or just want to say hi? Feel free to reach out. I’m always open to discussing new opportunities and collaborations.',
  socials: [
    {label: 'LinkedIn', href: 'https://www.linkedin.com/in/sanskar-bhadani-1a4810290'},
    {label: 'GitHub', href: 'https://github.com/sanskar-srm'},
    {label: 'Instagram', href: 'https://www.instagram.com/sanskarbhadani08'},
  ],
} as const;

export const chapters = [
  {id: 'top', label: 'Intro'},
  {id: 'about', label: 'About'},
  {id: 'skills', label: 'Skills'},
  {id: 'projects', label: 'Work'},
  {id: 'journey', label: 'Journey'},
  {id: 'contact', label: 'Contact'},
] as const;
