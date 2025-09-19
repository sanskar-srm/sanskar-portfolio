'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Award, ExternalLink, Trophy, Calendar, BookOpen, ChevronDown} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';
import {useScrollAnimation} from '@/hooks/use-scroll-animation';
import {useState} from 'react';
import {cn} from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const hackathonData = [
  {
    title: 'Global AI Buildathon 2025',
    issuer: 'Girls Leading Tech',
    award: 'Participation',
    imageUrl: '/hackathonCert/buildathon.jpg',
  },
  {
    title: 'Ctrl + Space Hackathon',
    issuer: 'NST ADYPU X LNMIIT JAIPUR',
    award: 'Best DApp Award',
    url: '#',
  },
  {
    title: 'Future of Fintech Challenge',
    issuer: 'DevPost',
    award: 'Finalist',
    url: '#',
  },
  {
    title: 'Sustainable Tech Jam',
    issuer: 'Green Code',
    award: 'Innovation Prize',
    url: '#',
  },
];

const bootcampData = [
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
  {
    title: 'Advanced Cloud Engineering',
    issuer: 'Cloud Gurus',
    url: '#',
  },
];

const coursesData = [
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
  {
    title: 'Data Structures & Algorithms',
    issuer: 'AlgoExpert',
    url: '#',
  },
];

const AnimatedCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const {ref, inView} = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={`${className} transition-opacity ${inView ? 'animate-down' : 'opacity-0'}`}
    >
      {children}
    </div>
  );
};

export default function Certifications() {
  const [showAllHackathons, setShowAllHackathons] = useState(false);
  const [showAllBootcamps, setShowAllBootcamps] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

  return (
    <section id="certs" className="py-20 sm:py-28">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center md:text-4xl font-headline mb-16 text-glow">
          Certifications &amp; Awards
        </h2>
        <div className="space-y-16">
          {/* Hackathons Section */}
          <Collapsible open={showAllHackathons} onOpenChange={setShowAllHackathons}>
            <div>
              <h3 className="flex items-center justify-center text-2xl font-semibold text-center font-headline mb-8 text-primary">
                <Trophy className="w-6 h-6 mr-3" />
                Hackathon Certifications
              </h3>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {hackathonData.slice(0, 2).map(cert => (
                  <AnimatedCard key={cert.title}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Card className="transition-colors duration-300 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 cursor-pointer h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <Award className="w-8 h-8 text-primary" />
                              {cert.url && (
                                <Button asChild variant="ghost" size="icon">
                                  <a
                                    href={cert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h4 className="text-lg font-bold font-headline">{cert.title}</h4>
                            <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                            <p className="mt-2 text-sm font-semibold text-accent">{cert.award}</p>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      {cert.imageUrl && (
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{cert.title}</DialogTitle>
                          </DialogHeader>
                          <div className="relative aspect-[1.414/1] w-full">
                            <Image
                              src={cert.imageUrl}
                              alt={`${cert.title} Certificate`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </AnimatedCard>
                ))}
              </div>

              <CollapsibleContent className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-8">
                {hackathonData.slice(2).map(cert => (
                  <AnimatedCard key={cert.title}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Card className="transition-colors duration-300 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 cursor-pointer h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <Award className="w-8 h-8 text-primary" />
                              {cert.url && (
                                <Button asChild variant="ghost" size="icon">
                                  <a
                                    href={cert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h4 className="text-lg font-bold font-headline">{cert.title}</h4>
                            <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                            <p className="mt-2 text-sm font-semibold text-accent">{cert.award}</p>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      {cert.imageUrl && (
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{cert.title}</DialogTitle>
                          </DialogHeader>
                          <div className="relative aspect-[1.414/1] w-full">
                            <Image
                              src={cert.imageUrl}
                              alt={`${cert.title} Certificate`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </AnimatedCard>
                ))}
              </CollapsibleContent>

              {hackathonData.length > 2 && (
                <div className="mt-8 text-center">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline">
                      {showAllHackathons ? 'Show Less' : 'Show More'}
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 ml-2 transition-transform',
                          showAllHackathons && 'rotate-180'
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              )}
            </div>
          </Collapsible>

          {/* Bootcamps and Events Section */}
          <Collapsible open={showAllBootcamps} onOpenChange={setShowAllBootcamps}>
            <div>
              <h3 className="flex items-center justify-center text-2xl font-semibold text-center font-headline mb-8 text-primary">
                <Calendar className="w-6 h-6 mr-3" />
                Bootcamps and Events
              </h3>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {bootcampData.slice(0, 2).map(cert => (
                  <AnimatedCard key={cert.title}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Card className="transition-colors duration-300 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 cursor-pointer h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <Award className="w-8 h-8 text-primary" />
                              {cert.url && (
                                <Button asChild variant="ghost" size="icon">
                                  <a
                                    href={cert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h4 className="text-lg font-bold font-headline">{cert.title}</h4>
                            <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      {cert.imageUrl && (
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{cert.title}</DialogTitle>
                          </DialogHeader>
                          <div className="relative aspect-video w-full">
                            <Image
                              src={cert.imageUrl}
                              alt={`${cert.title} Certificate`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </AnimatedCard>
                ))}
              </div>
              <CollapsibleContent className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-8">
                {bootcampData.slice(2).map(cert => (
                  <AnimatedCard key={cert.title}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Card className="transition-colors duration-300 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 cursor-pointer h-full">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <Award className="w-8 h-8 text-primary" />
                              {cert.url && (
                                <Button asChild variant="ghost" size="icon">
                                  <a
                                    href={cert.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <h4 className="text-lg font-bold font-headline">{cert.title}</h4>
                            <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      {cert.imageUrl && (
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{cert.title}</DialogTitle>
                          </DialogHeader>
                          <div className="relative aspect-video w-full">
                            <Image
                              src={cert.imageUrl}
                              alt={`${cert.title} Certificate`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </AnimatedCard>
                ))}
              </CollapsibleContent>
              {bootcampData.length > 2 && (
                <div className="mt-8 text-center">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline">
                      {showAllBootcamps ? 'Show Less' : 'Show More'}
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 ml-2 transition-transform',
                          showAllBootcamps && 'rotate-180'
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              )}
            </div>
          </Collapsible>

          {/* Courses Section */}
          <Collapsible open={showAllCourses} onOpenChange={setShowAllCourses}>
            <div>
              <h3 className="flex items-center justify-center text-2xl font-semibold text-center font-headline mb-8 text-primary">
                <BookOpen className="w-6 h-6 mr-3" />
                Courses
              </h3>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {coursesData.slice(0, 3).map(cert => (
                  <AnimatedCard key={cert.title}>
                    <Card
                      key={cert.title}
                      className="transition-colors duration-300 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 h-full"
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
                        <h4 className="text-lg font-bold font-headline">{cert.title}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                ))}
              </div>
              <CollapsibleContent className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
                {coursesData.slice(3).map(cert => (
                  <AnimatedCard key={cert.title}>
                    <Card
                      key={cert.title}
                      className="transition-colors duration-300 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 h-full"
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
                        <h4 className="text-lg font-bold font-headline">{cert.title}</h4>
                        <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                ))}
              </CollapsibleContent>
              {coursesData.length > 3 && (
                <div className="mt-8 text-center">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline">
                      {showAllCourses ? 'Show Less' : 'Show More'}
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 ml-2 transition-transform',
                          showAllCourses && 'rotate-180'
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                </div>
              )}
            </div>
          </Collapsible>
        </div>
      </div>
    </section>
  );
}
