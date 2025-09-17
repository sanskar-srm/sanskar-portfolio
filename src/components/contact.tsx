'use client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useToast} from '@/hooks/use-toast';
import {Github, Linkedin, Mail} from 'lucide-react';
import type React from 'react';
import { sendEmailAction } from '@/app/actions';

export default function Contact() {
  const {toast} = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    const result = await sendEmailAction({ name, email, message });

    if (result.success) {
      toast({
        title: 'Message Sent!',
        description: "Thanks for reaching out. I'll get back to you soon.",
      });
      form.reset();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  };
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center md:text-4xl font-headline mb-12 text-glow">
          Get In Touch
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-muted-foreground">
                Have a project in mind or just want to say hi? Feel free to reach out. I&apos;m
                always open to discussing new opportunities and collaborations.
              </p>
              <div className="flex space-x-4">
                <Button asChild variant="outline" size="icon" className="rounded-full">
                  <a href="mailto:sanskarbhadani0810@gmail.com" aria-label="Email">
                    <Mail className="w-5 h-5" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="icon" className="rounded-full">
                  <a href="https://www.linkedin.com/in/sanskar-bhadani-1b48591a0/" aria-label="LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="icon" className="rounded-full">
                  <a href="https://github.com/SanskarBhadani" aria-label="GitHub">
                    <Github className="w-5 h-5" />
                  </a>
                </Button>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Your Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="your.email@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="Your message..." required />
              </div>
              <Button type="submit" className="w-full accent-glow">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
