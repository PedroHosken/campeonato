import type { CSSProperties } from 'react'

export type TeamId = 1 | 2 | 3 | 4

export interface Team {
  id: TeamId
  name: string
  colorName: string
  emoji: string
  color: string
  /** Cor do texto sobre a cor do time. */
  ink: string
  players: string[]
}

export const TEAMS: Team[] = [
  {
    id: 1,
    name: 'Time 1',
    colorName: 'Vermelho',
    emoji: '🔴',
    color: '#e5484d',
    ink: '#ffffff',
    players: ['Poubel', 'Caio', 'Biel', 'Gustavo', 'Japa', 'Careca'],
  },
  {
    id: 2,
    name: 'Time 2',
    colorName: 'Azul',
    emoji: '🔵',
    color: '#3e7bfa',
    ink: '#ffffff',
    players: ['Beto', 'Pedro', 'Danny', 'Malandro', 'Nick', 'Dan'],
  },
  {
    id: 3,
    name: 'Time 3',
    colorName: 'Verde',
    emoji: '🟢',
    color: '#2fc46b',
    ink: '#04210f',
    players: ['Léo Lage', 'Feijão', 'Lucas', 'Leandro', 'Drico', 'Marquinho'],
  },
  {
    id: 4,
    name: 'Time 4',
    colorName: 'Amarelo',
    emoji: '🟡',
    color: '#f5c518',
    ink: '#2a2200',
    players: ['Matheus', 'Daniel', 'Pd', 'William', 'Arthur', 'Filipe'],
  },
]

export const TEAM_BY_ID = Object.fromEntries(TEAMS.map((t) => [t.id, t])) as Record<TeamId, Team>

export const GOALKEEPERS = ['Vitão', 'GG'] as const
export type Goalkeeper = (typeof GOALKEEPERS)[number]

export interface Side {
  team: TeamId
  gk: Goalkeeper
}

export interface Game {
  id: number
  home: Side
  away: Side
}

export const GAMES: Game[] = [
  { id: 1, home: { team: 1, gk: 'Vitão' }, away: { team: 3, gk: 'GG' } },
  { id: 2, home: { team: 2, gk: 'Vitão' }, away: { team: 4, gk: 'GG' } },
  { id: 3, home: { team: 1, gk: 'GG' }, away: { team: 4, gk: 'Vitão' } },
  { id: 4, home: { team: 2, gk: 'GG' }, away: { team: 3, gk: 'Vitão' } },
  { id: 5, home: { team: 1, gk: 'Vitão' }, away: { team: 2, gk: 'GG' } },
  { id: 6, home: { team: 3, gk: 'GG' }, away: { team: 4, gk: 'Vitão' } },
]

export const GAME_MINUTES = 12
export const FINAL_HALVES = 2
export const FINAL_HALF_MINUTES = 10

export const EVENT_DATE_LABEL = 'Sábado, 17 de outubro'

/** Variáveis CSS com as cores do time, para usar em `style`. */
export function teamStyle(team: Team): CSSProperties {
  return { '--team': team.color, '--team-ink': team.ink } as CSSProperties
}
