import { ProcessActSchema, type ProcessAct } from './types';

export const processTitle = 'Jornada do projeto';
export const processSubtitle =
  'Desenvolvimento de todo projeto de arquitetura e interiores ocorre em quatro atos principais. Um processo simples, claro e seguro.';
export const processClosing =
  'Por que assim? Porque assim sabemos que o pensamento evolui e vai aos poucos maturando e detalhando o projeto com um raciocínio único do início ao fim, até resultar em uma obra pronta onde tudo se encaixa.';
export const processCta = 'QUERO ENTENDER MELHOR O PROCESSO';

const processActsRaw: ProcessAct[] = [
  {
    index: 1,
    title: 'RECONHECIMENTO',
    body: 'Conhecer o local e as pessoas para quem iremos projetar, entendendo as ideias, expectativas e os desejos espaciais e visuais para a arquitetura',
  },
  {
    index: 2,
    title: 'CONCEPÇÃO',
    body: 'Dividido em duas fases, o projeto é conduzido com o intuito de construir com detalhes e realismo a solução de arquitetura proposta',
  },
  {
    index: 3,
    title: 'ALINHAMENTO',
    body: 'Entender os custos da obra é fundamental para que o projeto se torne real. Nesse ponto as informações de projeto viram orçamentos que orientarão a decisão final sobre o investimento a ser feito',
  },
  {
    index: 4,
    title: 'IMPLANTAÇÃO',
    body: 'Por fim, a entrega do Projeto Executivo de arquitetura e o início do acompanhamento das execuções desde as obras até mobiliário, decoração e produção de todo o projeto que foi pensado até aqui.',
  },
];

export const processActs = processActsRaw.map((act) => ProcessActSchema.parse(act));
