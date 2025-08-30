import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Award, ExternalLink} from 'lucide-react';

const certificationsData = [
  {
    title: 'Certified Frontend Developer',
    issuer: 'Pro Certs Inc.',
    url: '#',
  },
  {
    title: 'Advanced React Specialist',
    issuer: 'React University',
    url: '#',
  },
  {
    title: 'Full-Stack Web Development',
    issuer: 'Code Academy',
    url: '#',
  },
];

export default function Certifications() {
  return (
    <section id="certs" className="py-20 sm:py-28">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center md:text-4xl font-headline mb-12 text-glow">
          Certifications &amp; Awards
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {certificationsData.map(cert => (
            <Card
              key={cert.title}
              className="transition-colors duration-300 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Award className="w-8 h-8 text-primary" />
                  <Button asChild variant="ghost" size="icon">
                    <a href={cert.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-bold font-headline">{cert.title}</h3>
                <p className="text-sm text-muted-foreground">{cert.issuer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
