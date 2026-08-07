import { MotionOrchestrator } from '@/components/MotionOrchestrator';
import { WhatsAppFab } from '@/components/WhatsAppFab/WhatsAppFab';
import { CookieBanner } from '@/components/CookieBanner/CookieBanner';

export default function Home() {
  return (
    <>
      <MotionOrchestrator />
      <WhatsAppFab />
      <CookieBanner />
    </>
  );
}
