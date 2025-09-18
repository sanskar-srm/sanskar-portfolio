import {
  CppIcon,
  FirebaseIcon,
  JavaIcon,
  MySqlIcon,
  NodeJsIcon,
  PythonIcon,
  ReactJsIcon,
  TailwindCssIcon,
  TypeScriptIcon,
} from '@/components/icons';

const skills = [
  {name: 'ReactJS', icon: ReactJsIcon},
  {name: 'TypeScript', icon: TypeScriptIcon},
  {name: 'TailwindCSS', icon: TailwindCssIcon},
  {name: 'Node.js', icon: NodeJsIcon},
  {name: 'MySQL', icon: MySqlIcon},
  {name: 'C++', icon: CppIcon},
  {name: 'Java', icon: JavaIcon},
  {name: 'Firebase', icon: FirebaseIcon},
  {name: 'Python', icon: PythonIcon},
];

export default function TechStack() {
  return (
    <section id="skills" className="py-20 sm:py-28">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center md:text-4xl font-headline mb-12 text-glow">
          My Tech Arsenal
        </h2>
        <div className="relative w-full overflow-hidden">
          <div className="flex w-max sliding-icons">
            {[...skills, ...skills].map((skill, index) => (
              <div key={`${skill.name}-${index}`} className="flex flex-col items-center gap-4 group mx-8">
                <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 transition-all duration-300 border-2 rounded-full bg-card border-primary/20 group-hover:scale-110 group-hover:border-accent group-hover:accent-glow">
                  <skill.icon className="w-10 h-10 md:w-12 md:h-12 text-primary group-hover:text-accent transition-colors duration-300" />
                </div>
                <p className="font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {skill.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
