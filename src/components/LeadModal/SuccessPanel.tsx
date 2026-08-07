import './SuccessPanel.css';

type SuccessPanelProps = {
  onClose: () => void;
};

export function SuccessPanel({ onClose }: SuccessPanelProps) {
  return (
    <div className="success-panel" role="status">
      <p className="success-panel__message">
        Recebemos sua mensagem! Entraremos em contato em até 24 horas.
      </p>
      <button
        type="button"
        className="success-panel__close"
        onClick={onClose}
      >
        Fechar
      </button>
    </div>
  );
}
