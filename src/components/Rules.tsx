import {
  FINAL_HALF_MINUTES,
  FINAL_HALVES,
  GAME_MINUTES,
  GAMES,
  GOALKEEPERS,
  TEAMS,
  teamStyle,
} from '../data'
import { GkTag, SectionHeader, TeamBadge } from './ui'

const rules = [
  {
    icon: '🏟️',
    title: 'Formato',
    text: `${TEAMS.length} times, todos contra todos: são ${GAMES.length} jogos na primeira fase e, depois, a grande final.`,
  },
  {
    icon: '⏱️',
    title: 'Jogos',
    text: `Cada jogo da primeira fase tem ${GAME_MINUTES} minutos.`,
  },
  {
    icon: '🏆',
    title: 'Final',
    text: `A final é disputada em ${FINAL_HALVES} tempos de ${FINAL_HALF_MINUTES} minutos.`,
  },
  {
    icon: '🧤',
    title: 'Goleiros',
    text: `${GOALKEEPERS.join(' e ')} revezam no gol: a cada jogo, cada um defende um dos lados. Veja a escala abaixo.`,
  },
]

export function Rules() {
  return (
    <section id="regras" className="section">
      <div className="container">
        <SectionHeader index="01" title="Regras do campeonato">
          Tudo o que você precisa saber antes de a bola rolar.
        </SectionHeader>

        <ul className="rules-grid">
          {rules.map((r) => (
            <li key={r.title} className="card rule-card">
              <span className="rule-icon" aria-hidden="true">
                {r.icon}
              </span>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </li>
          ))}
        </ul>

        <div className="rules-split">
          <div>
            <h3 className="subheading">Os times</h3>
            <ul className="rosters">
              {TEAMS.map((t) => (
                <li key={t.id} className="card roster-card" style={teamStyle(t)}>
                  <div className="roster-head">
                    <TeamBadge team={t.id} showColor />
                  </div>
                  <ol>
                    {t.players.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ol>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="subheading">Ordem dos jogos</h3>
            <ol className="card schedule">
              {GAMES.map((g) => (
                <li key={g.id}>
                  <span className="schedule-num">{g.id}</span>
                  <span className="schedule-side">
                    <TeamBadge team={g.home.team} />
                    <GkTag name={g.home.gk} />
                  </span>
                  <span className="schedule-x" aria-label="contra">
                    ×
                  </span>
                  <span className="schedule-side schedule-side-away">
                    <TeamBadge team={g.away.team} />
                    <GkTag name={g.away.gk} />
                  </span>
                </li>
              ))}
              <li className="schedule-final">
                <span className="schedule-num">🏆</span>
                <span>
                  <strong>Final</strong> · {FINAL_HALVES} tempos de {FINAL_HALF_MINUTES} min
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
