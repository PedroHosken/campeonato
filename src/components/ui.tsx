import type { ReactNode } from 'react'
import { TEAM_BY_ID, teamStyle, type TeamId } from '../data'

export function SectionHeader({ index, title, children }: { index: string; title: string; children?: ReactNode }) {
  return (
    <header className="section-header">
      <span className="section-index">{index}</span>
      <h2 className="section-title">{title}</h2>
      {children && <p className="section-lead">{children}</p>}
    </header>
  )
}

export function TeamBadge({ team, showColor = false }: { team: TeamId; showColor?: boolean }) {
  const t = TEAM_BY_ID[team]
  return (
    <span className="team-badge" style={teamStyle(t)}>
      <span className="team-dot" aria-hidden="true" />
      <span className="team-badge-name">{t.name}</span>
      {showColor && <span className="team-badge-color">{t.colorName}</span>}
    </span>
  )
}

export function GkTag({ name }: { name: string }) {
  return (
    <span className="gk-tag" title={`Goleiro: ${name}`}>
      <span aria-hidden="true">🧤</span> {name}
    </span>
  )
}
