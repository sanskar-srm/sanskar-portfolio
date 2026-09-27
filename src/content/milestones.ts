export type Milestone = {
  title: string;
  issuer: string;
  award?: string;
  url?: string;
  imageUrl?: string;
  hidden?: boolean;
};

export const hackathonData: Milestone[] = [
  {
    title: 'Global AI Buildathon 2025',
    issuer: 'Girls Leading Tech',
    award: 'Participation',
    imageUrl: '/hackathonCert/buildathon.jpg',
  },
  {
    title: 'Ctrl + Space Hackathon',
    issuer: 'NST ADYPU X LNMIIT JAIPUR',
    award: 'Qualified for Phase 2',
    url: '#',
  },
  {title: 'Uploading Soon', issuer: '', award: '', url: '#', hidden: true},
  {title: 'Uploading Soon', issuer: '', award: '', url: '#', hidden: true},
];

export const bootcampData: Milestone[] = [
  {
    title: 'Firebase Studio Bootcamp',
    issuer: 'Lets Upgrade',
    url: '#',
    imageUrl: '/bootcampCert/firebase.jpg',
  },
  {
    title: 'Solution Architecture Job Simulation',
    issuer: 'Amazon Web Services',
    url: '#',
    imageUrl: '/bootcampCert/AWS.jpg',
  },
  {title: 'Android Development Workshop', issuer: 'Appirates - SRM University', url: '#'},
];

export const coursesData: Milestone[] = [
  {title: 'OCI AI Foundations Associate', issuer: 'Oracle', url: '#', imageUrl: '/courseCert/OCIai.jpg'},
  {title: 'Advanced React JS Frontend', issuer: 'Udemy', url: '#', imageUrl: '/courseCert/react.jpg'},
  {title: 'Web Development', issuer: 'Udemy', url: '#', imageUrl: '/courseCert/WebDev.jpg'},
  {title: 'DSA using JAVA', issuer: 'YouTube - Kunal Kushwaha', url: '#'},
];

const visible = (list: Milestone[]) => list.filter(m => !m.hidden);

export const milestoneGroups = [
  {key: 'hackathons', label: 'Hackathons', items: visible(hackathonData)},
  {key: 'bootcamps', label: 'Bootcamps & Events', items: visible(bootcampData)},
  {key: 'courses', label: 'Courses', items: visible(coursesData)},
];
