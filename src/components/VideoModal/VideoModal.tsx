'use client';

import * as Dialog from '@radix-ui/react-dialog';
import './VideoModal.css';

type VideoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function VideoModal({ open, onOpenChange }: VideoModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="video-modal__overlay" />
        <Dialog.Content className="video-modal__content">
          <Dialog.Title className="video-modal__title">
            Vídeo do processo
          </Dialog.Title>
          {/*
            Quando o arquivo do vídeo existir (TECH-DESIGN §7.4), substituir o
            estado "em breve" por:
            <video
              controls
              preload="none"
              controlsList="nodownload"
              disablePictureInPicture
            >
              <source src="/media/processo.mp4" type="video/mp4" />
              <track kind="captions" src="/media/processo.vtt" srcLang="pt-BR" label="Português" default />
            </video>
          */}
          <p className="video-modal__coming-soon">
            O vídeo explicando nosso processo está em produção — volte em breve.
          </p>
          <Dialog.Close asChild>
            <button type="button" className="video-modal__close">
              Fechar
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
