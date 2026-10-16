/** Posição na quadra em %: x da esquerda para a direita, y do ataque (0) para o próprio gol (100). */
export interface Point {
  x: number
  y: number
}

export type Spot = Point | null

export const FORMATIONS: Record<string, number[]> = {
  '2-2-2': [2, 2, 2],
  '3-2-1': [3, 2, 1],
  '2-3-1': [2, 3, 1],
  '3-1-2': [3, 1, 2],
  '1-2-2-1': [1, 2, 2, 1],
}

export const GK_POINT: Point = { x: 50, y: 91 }

const BACK_LINE_Y = 72
const FRONT_LINE_Y = 22

/** Posições de um esquema, da defesa para o ataque e da esquerda para a direita. */
export function formationPoints(lines: number[]): Point[] {
  return lines.flatMap((count, i) => {
    const y =
      lines.length === 1
        ? 50
        : BACK_LINE_Y - (i * (BACK_LINE_Y - FRONT_LINE_Y)) / (lines.length - 1)
    const spread = Math.min(64, (count - 1) * 30)
    return Array.from({ length: count }, (_, k) => ({
      x: count === 1 ? 50 : 50 - spread / 2 + (k * spread) / (count - 1),
      y,
    }))
  })
}

export function clampToPitch({ x, y }: Point): Point {
  return {
    x: Math.min(93, Math.max(7, x)),
    y: Math.min(86, Math.max(6, y)),
  }
}

export type LineName = 'Defesa' | 'Meio' | 'Ataque'

export function lineOf(point: Point): LineName {
  if (point.y >= 62) return 'Defesa'
  if (point.y >= 38) return 'Meio'
  return 'Ataque'
}

/** Agrupa quem está na quadra por setor, cada setor da esquerda para a direita. */
export function groupByLine(spots: Record<string, Spot>) {
  const groups: Record<LineName, string[]> = { Defesa: [], Meio: [], Ataque: [] }
  Object.entries(spots)
    .filter((entry): entry is [string, Point] => entry[1] !== null)
    .sort((a, b) => a[1].x - b[1].x)
    .forEach(([name, point]) => groups[lineOf(point)].push(name))
  return groups
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)
  return letters.toUpperCase()
}
