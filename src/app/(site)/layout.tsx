import Runtime from '@/components/providers/runtime';
import Cursor from '@/components/layout/cursor';
import Grain from '@/components/layout/grain';
import Nav from '@/components/layout/nav';
import Preloader from '@/components/layout/preloader';
import ScrollProgress from '@/components/layout/scroll-progress';
import Stage from '@/components/layout/stage';

export default function SiteLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <Runtime />
      <Preloader />
      <Stage />
      <Nav />
      <ScrollProgress />
      {children}
      <Grain />
      <Cursor />
    </>
  );
}
