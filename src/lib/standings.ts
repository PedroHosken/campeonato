import { GAMES, TEAMS, type TeamId } from '../data'

export type Score = number | null
export type Picks = Record<string, [Score, Score]>

export interface Row {
  team: TeamId
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

/** Tabela da primeira fase a partir dos palpites (3 pts vitória, 1 empate). */
export function standingsFromPicks(picks: Picks): Row[] {
  const rows = new Map<TeamId, Row>(
    TEAMS.map((t) => [
      t.id,
      { team: t.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ]),
  )

  for (const game of GAMES) {
    const [h, a] = picks[game.id] ?? [null, null]
    if (h === null || a === null) continue
    const home = rows.get(game.home.team)!
    const away = rows.get(game.away.team)!
    home.played++
    away.played++
    home.goalsFor += h
    home.goalsAgainst += a
    away.goalsFor += a
    away.goalsAgainst += h
    if (h > a) {
      home.wins++
      home.points += 3
      away.losses++
    } else if (h < a) {
      away.wins++
      away.points += 3
      home.losses++
    } else {
      home.draws++
      away.draws++
      home.points++
      away.points++
    }
  }

  return [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) ||
      b.goalsFor - a.goalsFor ||
      b.wins - a.wins ||
      a.team - b.team,
  )
}
