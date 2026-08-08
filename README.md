# site-saulo

Site institucional one-page scroll-driven para **Saulo Magno Arquitetos**. Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind CSS 4.

## 📚 Documentação (arquitetura e specs)

Documentação técnica, tech-designs e o backlog de tasks deste projeto **não ficam neste repositório** — vivem em `unum-people-docs`, repositório sibling deste no workspace:

- [`TECH-DESIGN-site-saulo.md`](../../unum-people-docs/tech-designs/site-saulo/TECH-DESIGN-site-saulo.md) — arquitetura, stack, contrato de CRM, pipeline de assets
- [`DESIGN-BLUEPRINT-site-saulo.md`](../../unum-people-docs/tech-designs/site-saulo/DESIGN-BLUEPRINT-site-saulo.md) — direção visual, tokens, componentes, acessibilidade
- [`spec/features/site-saulo/`](../../unum-people-docs/spec/features/site-saulo/) — as 5 features (`foundation` → `narrative-sections` → `lead-capture` → `scroll-motion` → `polish-and-launch`), cada uma com `spec.md` + `tasks.md`
- [`TESTING-STRATEGY.md`](../../unum-people-docs/spec/features/site-saulo/TESTING-STRATEGY.md) — divisão Vitest/Playwright

## Getting Started

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | serve o build de produção |
| `npm run lint` | ESLint |
| `npm test` | Vitest (lógica, componentes, jsdom) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:e2e` | Playwright interceptado (`tests/e2e/`) — 5 device projects |
| `npm run test:e2e:real` | Playwright **sem mock**, contra o CRM real (`tests/e2e/real/`) — opt-in, não roda no gate padrão |

Observação: a suíte padrão de Playwright sobe um servidor dedicado em `localhost:3100` com `NEXT_PUBLIC_E2E=1` e `next start`, evitando que overlays do `next dev` contaminem a ordem de tab/foco dos cenários de motion.

## Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_GATEWAY_URL` | Base URL do API Gateway do CRM Unum People |
| `CRM_API_KEY` | Chave de ingestão do CRM (`X-API-Key`). **Server-only** — nunca prefixar com `NEXT_PUBLIC_`, nunca acessar de Client Component. Usada por `src/lib/crm.ts`, que importa `server-only` para impedir isso em build |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Opcional. Override do número `wa.me`. Se omitido, usa o telefone público do escritório (`siteContacts` → `5511982864003`) |

## Fontes

Self-hosted via `next/font/local`, sem requisição a CDN externo em runtime:

- **Uncut Sans** — fonte da marca (`--font-sans`), fornecida pelo cliente (`resources-for-planing/Uncut-Sans-v1304/`), copiada para `public/fonts/uncut-sans/`. Corpo de texto e links usam o corte **Light** (pedido explícito do cliente, mais fino que o Regular/Book); Semibold/Bold seguem reservados para o wordmark.
- **Cormorant Garamond** — fonte serifada (`--font-serif`), licença SIL Open Font License, baixada do repositório [`google/fonts`](https://github.com/google/fonts) (`ofl/cormorantgaramond/`) para `public/fonts/cormorant-garamond/`. Substituiu a Tinos (removida) a pedido do cliente.

## Estado do projeto

**As 5 features do TLC 2.0 estão implementadas e verificadas** (`foundation`, `narrative-sections`, `lead-capture`, `scroll-motion`, `polish-and-launch`). Publicado em `github.com/unum-people-creative-solutions/site-saulo`; revisão visual iterativa em andamento pós-lançamento (tipografia, motion, footer, depoimentos, processo).

### Assets em `public/media/`

| Asset | Estado |
|---|---|
| `hero-video.mp4` | ✅ publicado (soft-loop; sem imagem estática de fallback — reduced-motion/saveData/erro de vídeo mostram só o backdrop de tinta) |
| `footer.jpg` | ✅ publicado |
| `processo.png` | ✅ publicado (scrim flat sem blur) |
| `galeria/` | pasta da galeria (placeholders até o grid final do cliente) |
| `depoimentos/` | pasta dos avatares de depoimento (placeholders) |

### Placeholders / pendências do cliente

Ver `TECH-DESIGN-site-saulo.md` §11; resumo:

- Imagens da galeria + frases de manifesto (`isPlaceholder: true` em `src/content/gallery.ts` → `public/media/galeria/`)
- Depoimentos (textos, nomes, fotos) — ainda placeholder (`public/media/depoimentos/`)
- Copy real de Hero e Sobre (hoje lorem / provisório)
- Vídeo do processo no modal (gravação + transcrição para legendas)
- Storyboard mobile
- Domínio e destino do e-mail de notificação de lead — **decisão bloqueada**, ver `lead-capture/spec.md` (`TASK-LEAD-013`)

### Decisões de polish (pós-revisão)

- Corpo de leitura: `--type-body-size: 13px` (storyboard; diverge do BLUEPRINT §2.5 que propunha 16px)
- `LeadModal`: viewport inteira, overlay ink 92%, formulário claro no escuro, select com `color-scheme: dark`, botão X `Fechar formulário`
- Depoimentos: barra de progresso reta, sem setas; Galeria: sem setas, cards `single`/`stack`/`quote`
- WhatsApp FAB: 56×56 / ícone 38px; CookieBanner: `#000`, título “Configuração de Cookies”, fechar com X

## Stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS 4 · GSAP + ScrollTrigger (scroll-driven motion, feature `scroll-motion`) · Radix UI (modais, feature `lead-capture`) · Vitest + Testing Library · Playwright (+ `@axe-core/playwright`) · react-hook-form + zod

## Motion orchestration

- As cenas de scroll continuam isoladas em `src/lib/animations/`.
- `src/components/MotionOrchestrator.tsx` é o único ponto da UI que importa `gsap` e `scenes/*`; as seções expõem apenas handles DOM via `forwardRef`/`useImperativeHandle`.
- `AboutSection` virou Client Component exclusivamente para suportar esse contrato imperativo; o markup visível das seções permaneceu o mesmo.
- `footerRise.ts` reforça a entrada por teclado no rodapé: ao focar um controle do footer antes do pin começar, a cena avança o scroll até o início real do range pinado e só então reafirma a visibilidade do alvo. Os E2Es `T45`/`T45b` cobrem a garantia visual na viewport, e `T45c` cobre a sincronização específica da aplicação.
- O mesmo `footerRise.ts` ignora sincronização iniciada por ponteiro dentro do rodapé, evitando que um clique nas âncoras mova o scroll entre `focusin` e `click` e faça o alvo real do evento sair do link.
- `ScrollArrow` é uma seta fixa persistente (fora de qualquer `<section>`, mesmo motivo do header — `overflow: hidden` nas seções corta descendentes `position: fixed`). `scrollArrow.ts` alterna sua posição/rotação (baixo → direita ao entrar na galeria → baixo → some no rodapé) e contraste (branco / tinta) via `ScrollTrigger`, só em full motion (`(min-width: 1024px) and (prefers-reduced-motion: no-preference)`); abaixo disso, a seta original dentro do Hero (`ScrollCue`) continua sendo o fallback.
