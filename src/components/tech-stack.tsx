import {
  CppIcon,
  FirebaseIcon,
  JavaIcon,
  MySqlIcon,
  NodeJsIcon,
  ReactJsIcon,
  TailwindCssIcon,
} from '@/components/icons';

const skills = [
  {name: 'ReactJS', icon: ReactJsIcon},
  {name: 'TailwindCSS', icon: TailwindCssIcon},
  {name: 'Node.js', icon: NodeJsIcon},
  {name: 'MySQL', icon: MySqlIcon},
  {name: 'C++', icon: CppIcon},
  {name: 'Java', icon: JavaIcon},
  {name: 'Firebase', icon: FirebaseIcon},
];

export default function TechStack() {
  return (
    <section id="skills" className="py-20 sm:py-28">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center md:text-4xl font-headline mb-12 text-glow">
          My Tech Arsenal
        </h2>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-7">
          {skills.map(skill => (
            <div key={skill.name} className="flex flex-col items-center gap-4 group">
              <div className="flex items-center justify-center w-24 h-24 transition-all duration-300 border-2 rounded-full bg-card border-primary/20 group-hover:scale-110 group-hover:border-accent group-hover:accent-glow">
                <skill.icon className="w-12 h-12 text-primary group-hover:text-accent transition-colors duration-300" />
              </div>
              <p className="font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {skill.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
