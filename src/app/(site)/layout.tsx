import Runtime from '@/components/providers/runtime';
import Cursor from '@/components/layout/cursor';
import Grain from '@/components/layout/grain';
import Nav from '@/components/layout/nav';
import Preloader from '@/components/layout/preloader';
import ScrollProgress from '@/components/layout/scroll-progress';
import Stage from '@/components/layout/stage';
import {getSettings} from '@/lib/settings-store';

export default async function SiteLayout({children}: {children: React.ReactNode}) {
  const {resumeUrl} = await getSettings();
  return (
    <>
      <Runtime />
      <Preloader />
      <Stage />
      <Nav hasResume={!!resumeUrl} />
      <ScrollProgress />
      {children}
      <Grain />
      <Cursor />
    </>
  );
}
