import { useRef } from 'react'
import { GAMES, TEAM_BY_ID, teamStyle, type Game, type Side } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { copyText, openWhatsApp, useFlash } from '../lib/share'
import { standingsFromPicks, type Picks, type Score } from '../lib/standings'
import { GkTag, SectionHeader, TeamBadge } from './ui'

interface BolaoData {
  name: string
  picks: Picks
}

const MAX_GOALS = 99

function pickOf(picks: Picks, game: Game): [Score, Score] {
  return picks[game.id] ?? [null, null]
}

function verdict(game: Game, [h, a]: [Score, Score]) {
  if (h === null || a === null) return null
  if (h === a) return 'Empate'
  const winner = TEAM_BY_ID[h > a ? game.home.team : game.away.team]
  return `Vitória do ${winner.name}`
}

function shareText(data: BolaoData, finalists: string | null) {
  const lines = GAMES.map((g) => {
    const [h, a] = pickOf(data.picks, g)
    const home = TEAM_BY_ID[g.home.team]
    const away = TEAM_BY_ID[g.away.team]
    return `Jogo ${g.id}: ${home.emoji} ${home.name} ${h ?? '?'} x ${a ?? '?'} ${away.name} ${away.emoji}`
  })
  return [
    '⚽ Bolão do Campeonato de Pelada',
    `👤 ${data.name.trim()}`,
    '',
    ...lines,
    ...(finalists ? ['', `🏆 Final prevista: ${finalists}`] : []),
  ].join('\n')
}

export function Bolao() {
  const [data, setData] = useLocalStorage<BolaoData>('pelada:bolao', { name: '', picks: {} })
  const [flash, setFlash] = useFlash()
  const nameRef = useRef<HTMLInputElement>(null)

  const filled = GAMES.filter((g) => pickOf(data.picks, g).every((s) => s !== null)).length
  const complete = filled === GAMES.length
  const table = standingsFromPicks(data.picks)
  const finalists = complete
    ? table
        .slice(0, 2)
        .map((r) => `${TEAM_BY_ID[r.team].emoji} ${TEAM_BY_ID[r.team].name}`)
        .join(' x ')
    : null

  function setScore(game: Game, side: 0 | 1, value: Score) {
    setData((prev) => {
      const pick = [...pickOf(prev.picks, game)] as [Score, Score]
      pick[side] = value
      return { ...prev, picks: { ...prev.picks, [game.id]: pick } }
    })
  }

  function ensureName() {
    if (data.name.trim()) return true
    setFlash('Coloque seu nome antes de enviar')
    nameRef.current?.focus()
    return false
  }

  async function copy() {
    if (!ensureName()) return
    setFlash((await copyText(shareText(data, finalists))) ? 'Copiado!' : 'Não deu para copiar')
  }

  function clear() {
    if (window.confirm('Apagar todos os seus palpites?')) setData((prev) => ({ ...prev, picks: {} }))
  }

  return (
    <section id="bolao" className="section">
      <div className="container">
        <SectionHeader index="03" title="Bolão">
          Dê o seu palpite para o placar de cada jogo e mande para a galera. Seus palpites ficam salvos
          neste aparelho.
        </SectionHeader>

        <div className="bolao-top card">
          <label className="field">
            <span className="builder-label">Seu nome</span>
            <input
              ref={nameRef}
              type="text"
              value={data.name}
              placeholder="Ex.: Pedro"
              autoComplete="given-name"
              maxLength={40}
              onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </label>
          <div className="progress" aria-label={`${filled} de ${GAMES.length} palpites`}>
            <div className="progress-text">
              <strong>{filled}</strong>/{GAMES.length} palpites
            </div>
            <div className="progress-bar">
              <span style={{ width: `${(filled / GAMES.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="bolao-layout">
          <ol className="games">
            {GAMES.map((g) => {
              const pick = pickOf(data.picks, g)
              const result = verdict(g, pick)
              return (
                <li key={g.id} className="card game-card" data-done={Boolean(result)}>
                  <div className="game-head">
                    <span className="game-num">Jogo {g.id}</span>
                    <span className="game-result">{result ?? '12 min'}</span>
                  </div>
                  <ScoreRow game={g} side={g.home} value={pick[0]} onChange={(v) => setScore(g, 0, v)} />
                  <ScoreRow game={g} side={g.away} value={pick[1]} onChange={(v) => setScore(g, 1, v)} />
                </li>
              )
            })}
          </ol>

          <aside className="bolao-side">
            <div className="card standings">
              <h3 className="subheading">Classificação pelo seu palpite</h3>
              <table>
                <thead>
                  <tr>
                    <th scope="col" className="col-team">
                      Time
                    </th>
                    <th scope="col" title="Pontos">
                      P
                    </th>
                    <th scope="col" title="Jogos">
                      J
                    </th>
                    <th scope="col" title="Vitórias">
                      V
                    </th>
                    <th scope="col" title="Empates">
                      E
                    </th>
                    <th scope="col" title="Derrotas">
                      D
                    </th>
                    <th scope="col" title="Saldo de gols">
                      SG
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((r, i) => {
                    const sg = r.goalsFor - r.goalsAgainst
                    return (
                      <tr key={r.team} data-top={complete && i < 2} style={teamStyle(TEAM_BY_ID[r.team])}>
                        <th scope="row" className="col-team">
                          <span className="pos">{i + 1}</span>
                          <TeamBadge team={r.team} />
                        </th>
                        <td className="pts">{r.points}</td>
                        <td>{r.played}</td>
                        <td>{r.wins}</td>
                        <td>{r.draws}</td>
                        <td>{r.losses}</td>
                        <td>{sg > 0 ? `+${sg}` : sg}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="standings-note">
                {finalists ? (
                  <>
                    🏆 Final prevista: <strong>{finalists}</strong>
                  </>
                ) : (
                  'Preencha os 6 jogos para ver a final prevista.'
                )}
              </p>
              <p className="muted small">Vitória 3 pts, empate 1. Desempate: saldo, gols pró, vitórias.</p>
            </div>

            <div className="actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={filled === 0}
                onClick={() => ensureName() && openWhatsApp(shareText(data, finalists))}
              >
                Mandar no WhatsApp
              </button>
              <button type="button" className="btn btn-ghost" disabled={filled === 0} onClick={copy}>
                Copiar
              </button>
              <button type="button" className="btn btn-text" disabled={filled === 0} onClick={clear}>
                Limpar
              </button>
              <span className="flash" role="status">
                {flash}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

function ScoreRow({
  game,
  side,
  value,
  onChange,
}: {
  game: Game
  side: Side
  value: Score
  onChange: (value: Score) => void
}) {
  const team = TEAM_BY_ID[side.team]
  const label = `Gols do ${team.name} no jogo ${game.id}`
  return (
    <div className="score-row" style={teamStyle(team)}>
      <div className="score-team">
        <TeamBadge team={side.team} />
        <GkTag name={side.gk} />
      </div>
      <div className="stepper">
        <button
          type="button"
          aria-label={`Diminuir ${label}`}
          disabled={value === null || value === 0}
          onClick={() => onChange(Math.max(0, (value ?? 0) - 1))}
        >
          −
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label={label}
          placeholder="–"
          value={value ?? ''}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 2)
            onChange(digits === '' ? null : Math.min(MAX_GOALS, Number(digits)))
          }}
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          disabled={value === MAX_GOALS}
          onClick={() => onChange(value === null ? 0 : value + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
