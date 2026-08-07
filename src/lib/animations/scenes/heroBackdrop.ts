import { ScrollTrigger } from '../gsap-context';

/**
 * Keeps the shared Hero/Sobre video backdrop alive from the top of the page
 * until the Journey (Processo) section has fully left the viewport.
 *
 * Why Processo — not Sobre: after the Sobre pin releases, part of Sobre can
 * still be on screen while Journey scrolls in. Releasing at the Sobre pin end
 * blanks the video under that remnant. Only once Journey itself has scrolled
 * fully past is it safe to hide the backdrop.
 */
export function heroBackdrop(
  backdropEl: HTMLElement,
  journeySectionEl: HTMLElement,
): () => void {
  const setReleased = (released: boolean) => {
    const isReleased = backdropEl.getAttribute('data-released') === 'true';
    if (released === isReleased) return;

    if (released) {
      backdropEl.setAttribute('data-released', 'true');
      pauseVideos(backdropEl);
    } else {
      backdropEl.removeAttribute('data-released');
      playVideos(backdropEl);
    }
  };

  const sync = () => {
    // Journey still in or below the viewport → keep the video.
    // Journey fully above the viewport → release.
    setReleased(journeySectionEl.getBoundingClientRect().bottom < 0);
  };

  const trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: sync,
    onRefresh: sync,
  });

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    sync();
  });

  return () => {
    trigger.kill();
    backdropEl.removeAttribute('data-released');
  };
}

function pauseVideos(root: HTMLElement) {
  for (const video of root.querySelectorAll('video')) {
    video.pause();
  }
}

function playVideos(root: HTMLElement) {
  for (const video of root.querySelectorAll('video')) {
    try {
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        void result.catch(() => {
          // Autoplay may be blocked after a pause — ignore; image remains.
        });
      }
    } catch {
      // jsdom / blocked autoplay — ignore.
    }
  }
}
