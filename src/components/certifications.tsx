'use client';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Award, ExternalLink, Trophy, Calendar, BookOpen} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';

const hackathonData = [
  {
    title: 'Global AI Buildathon 2025',
    issuer: 'Girls Leading Tech',
    award: 'Participation',
    imageUrl: '/hackathonCert/buildathon.jpg',
  },
  {
    title: 'Web3 & Blockchain Hackfest',
    issuer: 'CryptoCoders',
    award: 'Best DApp Award',
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
];

export default function Certifications() {
  return (
    <section id="certs" className="py-20 sm:py-28">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center md:text-4xl font-headline mb-16 text-glow">
          Certifications &amp; Awards
        </h2>
        <div className="space-y-16">
          {/* Hackathons Section */}
          <div>
            <h3 className="flex items-center justify-center text-2xl font-semibold text-center font-headline mb-8 text-primary">
              <Trophy className="w-6 h-6 mr-3" />
              Hackathon Certifications
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {hackathonData.map(cert => (
                <Dialog key={cert.title}>
                  <DialogTrigger asChild>
                    <Card className="transition-colors duration-300 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 cursor-pointer">
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
              ))}
            </div>
          </div>

          {/* Bootcamps and Events Section */}
          <div>
            <h3 className="flex items-center justify-center text-2xl font-semibold text-center font-headline mb-8 text-primary">
              <Calendar className="w-6 h-6 mr-3" />
              Bootcamps and Events
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {bootcampData.map(cert => (
                <Dialog key={cert.title}>
                  <DialogTrigger asChild>
                    <Card className="transition-colors duration-300 border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 cursor-pointer">
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
              ))}
            </div>
          </div>

          {/* Courses Section */}
          <div>
            <h3 className="flex items-center justify-center text-2xl font-semibold text-center font-headline mb-8 text-primary">
              <BookOpen className="w-6 h-6 mr-3" />
              Courses
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {coursesData.map(cert => (
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
                    <h4 className="text-lg font-bold font-headline">{cert.title}</h4>
                    <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
