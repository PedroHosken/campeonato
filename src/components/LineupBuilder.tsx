import { useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { GOALKEEPERS, TEAM_BY_ID, TEAMS, teamStyle, type Team, type TeamId } from '../data'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  clampToPitch,
  FORMATIONS,
  formationPoints,
  GK_POINT,
  groupByLine,
  initials,
  type Point,
  type Spot,
} from '../lib/lineup'
import { copyText, openWhatsApp, useFlash } from '../lib/share'
import { SectionHeader } from './ui'

interface Lineup {
  /** Esquema escolhido por último; null quando a pessoa moveu alguém na mão. */
  formation: string | null
  spots: Record<string, Spot>
}

type Lineups = Partial<Record<TeamId, Lineup>>

interface Drag {
  player: string
  startX: number
  startY: number
  x: number
  y: number
  moved: boolean
}

const DRAG_THRESHOLD = 6
const DEFAULT_FORMATION = '2-2-2'

function normalize(team: Team, stored: Lineup | undefined): Lineup {
  return {
    formation: stored?.formation ?? null,
    spots: Object.fromEntries(team.players.map((p) => [p, stored?.spots[p] ?? null])),
  }
}

function inside(el: HTMLElement | null, x: number, y: number) {
  if (!el) return false
  const r = el.getBoundingClientRect()
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
}

/** Reaplica um esquema mantendo quem estava mais atrás na defesa e quem estava à esquerda na esquerda. */
function applyFormation(team: Team, lineup: Lineup, name: string): Lineup {
  const points = formationPoints(FORMATIONS[name])
  const placed = team.players
    .filter((p) => lineup.spots[p])
    .sort((a, b) => {
      const pa = lineup.spots[a]!
      const pb = lineup.spots[b]!
      return pb.y - pa.y || pa.x - pb.x
    })
  const order = [...placed, ...team.players.filter((p) => !lineup.spots[p])]
  return {
    formation: name,
    spots: Object.fromEntries(order.map((p, i) => [p, points[i] ?? null])),
  }
}

/** Primeira posição livre do esquema atual, para quem toca num reserva sem arrastar. */
function freePoint(lineup: Lineup): Point {
  const taken = Object.values(lineup.spots).filter((s): s is Point => s !== null)
  const candidates = formationPoints(FORMATIONS[lineup.formation ?? DEFAULT_FORMATION])
  return (
    candidates.find((c) => taken.every((t) => Math.hypot(t.x - c.x, t.y - c.y) > 8)) ?? {
      x: 50,
      y: 50,
    }
  )
}

function shareText(team: Team, lineup: Lineup) {
  const groups = groupByLine(lineup.spots)
  const bench = team.players.filter((p) => !lineup.spots[p])
  const list = (names: string[]) => (names.length ? names.join(', ') : '—')
  const scheme =
    lineup.formation ?? [groups.Defesa, groups.Meio, groups.Ataque].map((g) => g.length).join('-')
  return [
    `⚽ Meu elenco ideal — ${team.emoji} ${team.name} (${team.colorName})`,
    `Esquema: ${scheme}`,
    '',
    `🎯 Ataque: ${list(groups.Ataque)}`,
    `⚙️ Meio: ${list(groups.Meio)}`,
    `🛡️ Defesa: ${list(groups.Defesa)}`,
    `🧤 Gol: ${GOALKEEPERS.join(' / ')}`,
    ...(bench.length ? [`🪑 Banco: ${bench.join(', ')}`] : []),
  ].join('\n')
}

export function LineupBuilder() {
  const [teamId, setTeamId] = useLocalStorage<TeamId>('pelada:elenco-time', 1)
  const [lineups, setLineups] = useLocalStorage<Lineups>('pelada:elencos', {})
  const [drag, setDrag] = useState<Drag | null>(null)
  // Os eventos de ponteiro chegam mais rápido que os renders: o ref guarda o arrasto atual.
  const dragRef = useRef<Drag | null>(null)
  const [flash, setFlash] = useFlash()
  const pitchRef = useRef<HTMLDivElement>(null)
  const benchRef = useRef<HTMLDivElement>(null)

  const team = TEAM_BY_ID[teamId] ?? TEAMS[0]
  const lineup = normalize(team, lineups[team.id])
  const onPitch = team.players.filter((p) => lineup.spots[p])
  const bench = team.players.filter((p) => !lineup.spots[p])
  const groups = groupByLine(lineup.spots)
  const schemeLabel =
    lineup.formation ??
    (onPitch.length ? [groups.Defesa, groups.Meio, groups.Ataque].map((g) => g.length).join('-') : '—')

  function save(next: Lineup) {
    setLineups((prev) => ({ ...prev, [team.id]: next }))
  }

  function place(player: string, spot: Spot, formation: string | null = null) {
    save({ formation, spots: { ...lineup.spots, [player]: spot } })
  }

  function updateDrag(next: Drag | null) {
    dragRef.current = next
    setDrag(next)
  }

  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>, player: string) {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    updateDrag({ player, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false })
  }

  function onPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    const current = dragRef.current
    if (!current) return
    const moved =
      current.moved || Math.hypot(e.clientX - current.startX, e.clientY - current.startY) > DRAG_THRESHOLD
    updateDrag({ ...current, x: e.clientX, y: e.clientY, moved })
  }

  function onPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    const current = dragRef.current
    if (!current) return
    const player = current.player
    const moved =
      current.moved || Math.hypot(e.clientX - current.startX, e.clientY - current.startY) > DRAG_THRESHOLD
    updateDrag(null)
    const wasOnPitch = Boolean(lineup.spots[player])

    if (!moved) {
      if (!wasOnPitch) place(player, freePoint(lineup), lineup.formation)
      return
    }
    if (inside(pitchRef.current, e.clientX, e.clientY)) {
      const r = pitchRef.current!.getBoundingClientRect()
      place(
        player,
        clampToPitch({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
        }),
      )
    } else if (inside(benchRef.current, e.clientX, e.clientY)) {
      place(player, null)
    }
  }

  function onKeyboardClick(e: ReactMouseEvent, player: string) {
    // Só teclado (detail 0): mouse e toque já são tratados no pointerup.
    if (e.detail !== 0) return
    place(player, lineup.spots[player] ? null : freePoint(lineup), lineup.formation)
  }

  async function copy() {
    setFlash((await copyText(shareText(team, lineup))) ? 'Copiado!' : 'Não deu para copiar')
  }

  const tokenProps = (player: string) => ({
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => onPointerDown(e, player),
    onPointerMove,
    onPointerUp,
    onPointerCancel: () => updateDrag(null),
    onClick: (e: ReactMouseEvent) => onKeyboardClick(e, player),
  })

  return (
    <section id="elenco" className="section section-alt">
      <div className="container">
        <SectionHeader index="02" title="Monte seu elenco ideal">
          Escolha um time e arraste os jogadores pela quadra. Como você escalaria essa galera?
        </SectionHeader>

        <div className="team-picker" role="radiogroup" aria-label="Escolha o time">
          {TEAMS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={t.id === team.id}
              className="team-option"
              style={teamStyle(t)}
              onClick={() => setTeamId(t.id)}
            >
              <span className="team-option-swatch" aria-hidden="true" />
              <span className="team-option-text">
                <strong>{t.name}</strong>
                <span>{t.colorName}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="builder" style={teamStyle(team)}>
          <div className="builder-formations">
            <span className="builder-label">Esquema</span>
            <div className="chips">
              {Object.keys(FORMATIONS).map((name) => (
                <button
                  key={name}
                  type="button"
                  className="chip"
                  aria-pressed={lineup.formation === name}
                  onClick={() => save(applyFormation(team, lineup, name))}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="builder-pitch">
            <div className="pitch" ref={pitchRef}>
              <PitchLines />
              <span className="pitch-direction" aria-hidden="true">
                Ataque ↑
              </span>
              <div className="token token-gk" style={{ left: `${GK_POINT.x}%`, top: `${GK_POINT.y}%` }}>
                <span className="token-ball" aria-hidden="true">
                  🧤
                </span>
                <span className="token-name">{GOALKEEPERS.join(' / ')}</span>
              </div>
              {onPitch.map((p) => {
                const spot = lineup.spots[p]!
                return (
                  <button
                    key={p}
                    type="button"
                    className="token"
                    data-dragging={drag?.player === p && drag.moved}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    aria-label={`${p}, na quadra. Arraste para mudar de posição ou Enter para mandar ao banco.`}
                    {...tokenProps(p)}
                  >
                    <span className="token-ball">{initials(p)}</span>
                    <span className="token-name">{p}</span>
                  </button>
                )
              })}
              {onPitch.length === 0 && (
                <p className="pitch-empty">
                  Escolha um esquema ou arraste
                  <br />
                  os jogadores do banco para cá
                </p>
              )}
            </div>
          </div>

          <div className="builder-side">
            <div className="bench" ref={benchRef} data-active={drag?.moved && Boolean(lineup.spots[drag.player])}>
              <span className="builder-label">
                Banco <span className="muted">· toque para entrar, arraste para cá para sair</span>
              </span>
              <div className="bench-slots">
                {bench.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="token token-bench"
                    data-dragging={drag?.player === p && drag.moved}
                    aria-label={`${p}, no banco. Enter para colocar na quadra.`}
                    {...tokenProps(p)}
                  >
                    <span className="token-ball">{initials(p)}</span>
                    <span className="token-name">{p}</span>
                  </button>
                ))}
                {bench.length === 0 && <span className="muted bench-empty">Todo mundo em campo 💪</span>}
              </div>
            </div>

            <div className="card lineup-summary">
              <div className="lineup-summary-head">
                <span className="builder-label">Sua escalação</span>
                <span className="scheme-pill">{schemeLabel}</span>
              </div>
              <dl>
                {(['Ataque', 'Meio', 'Defesa'] as const).map((line) => (
                  <div key={line}>
                    <dt>{line}</dt>
                    <dd>{groups[line].length ? groups[line].join(', ') : '—'}</dd>
                  </div>
                ))}
                <div>
                  <dt>Gol</dt>
                  <dd>{GOALKEEPERS.join(' / ')}</dd>
                </div>
              </dl>
            </div>

            <div className="actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={onPitch.length === 0}
                onClick={() => openWhatsApp(shareText(team, lineup))}
              >
                Mandar no WhatsApp
              </button>
              <button type="button" className="btn btn-ghost" disabled={onPitch.length === 0} onClick={copy}>
                Copiar
              </button>
              <button
                type="button"
                className="btn btn-text"
                disabled={onPitch.length === 0}
                onClick={() => save({ formation: null, spots: {} })}
              >
                Limpar
              </button>
              <span className="flash" role="status">
                {flash}
              </span>
            </div>
          </div>
        </div>
      </div>

      {drag?.moved && (
        <div className="token token-ghost" style={{ left: drag.x, top: drag.y, ...teamStyle(team) }} aria-hidden="true">
          <span className="token-ball">{initials(drag.player)}</span>
          <span className="token-name">{drag.player}</span>
        </div>
      )}
    </section>
  )
}

function PitchLines() {
  return (
    <svg className="pitch-lines" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
        <rect x="8" y="8" width="184" height="284" rx="3" vectorEffect="non-scaling-stroke" />
        <line x1="8" y1="150" x2="192" y2="150" vectorEffect="non-scaling-stroke" />
        <circle cx="100" cy="150" r="26" vectorEffect="non-scaling-stroke" />
        <rect x="52" y="8" width="96" height="42" vectorEffect="non-scaling-stroke" />
        <rect x="52" y="250" width="96" height="42" vectorEffect="non-scaling-stroke" />
        <rect x="80" y="2" width="40" height="6" vectorEffect="non-scaling-stroke" />
        <rect x="80" y="292" width="40" height="6" vectorEffect="non-scaling-stroke" />
      </g>
      <g fill="currentColor">
        <circle cx="100" cy="150" r="2.2" />
        <circle cx="100" cy="36" r="1.8" />
        <circle cx="100" cy="264" r="1.8" />
      </g>
    </svg>
  )
}
