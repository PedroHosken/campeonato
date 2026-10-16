# Campeonato de Pelada

Site de uma página para o campeonato de pelada, com três seções:

1. **Regras do campeonato**: formato, tempos de jogo, escala dos goleiros (Vitão e GG), elencos e ordem dos jogos.
2. **Monte seu elenco ideal**: escolha o time, um esquema e arraste os jogadores pela quadra.
3. **Bolão**: palpite de placar para cada jogo, com a classificação e a final previstas.

Os palpites e as escalações ficam salvos no navegador de cada pessoa e podem ser enviados pelo WhatsApp ou copiados.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # checagem de tipos + build de produção
npm run lint
```

Times, jogos e goleiros ficam em [`src/data.ts`](src/data.ts).
