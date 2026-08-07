import type { ProcessAct } from '@/content/types';
import './ProcessCard.css';

type ProcessCardProps = {
  act: ProcessAct;
};

export function ProcessCard({ act }: ProcessCardProps) {
  const markers = '•'.repeat(act.index);

  return (
    <article className="process-card">
      <span className="sr-only">Ato {act.index} de 4</span>
      <div className="process-card__markers" aria-hidden="true">
        {markers}
      </div>
      <h3 className="process-card__title">{act.title}</h3>
      <p className="process-card__body">{act.body}</p>
    </article>
  );
}
