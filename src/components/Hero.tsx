import { EVENT_DATE_LABEL, GAMES, GOALKEEPERS, TEAMS, teamStyle } from '../data'

const stats = [
  { label: 'Times', value: TEAMS.length },
  { label: 'Jogadores', value: TEAMS.reduce((sum, t) => sum + t.players.length, 0) },
  { label: 'Jogos', value: GAMES.length + 1 },
  { label: 'Goleiros', value: GOALKEEPERS.length },
]

export function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="hero-glow" aria-hidden="true" />
      <div className="container hero-inner">
        <p className="eyebrow">{EVENT_DATE_LABEL}</p>
        <h1 className="hero-title">
          Campeonato <span>de Pelada</span>
        </h1>
        <p className="hero-lead">
          Quatro times, seis jogos e uma final. Confira as regras, monte o seu time ideal e deixe o
          seu palpite para cada partida.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#bolao">
            Fazer meu bolão
          </a>
          <a className="btn btn-ghost" href="#elenco">
            Montar elenco
          </a>
        </div>

        <ul className="hero-teams" aria-label="Times">
          {TEAMS.map((t) => (
            <li key={t.id} style={teamStyle(t)}>
              <span className="team-dot" aria-hidden="true" />
              {t.name}
              <span className="hero-team-color">{t.colorName}</span>
            </li>
          ))}
        </ul>

        <dl className="hero-stats">
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
