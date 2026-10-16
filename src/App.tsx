import { Bolao } from './components/Bolao'
import { Hero } from './components/Hero'
import { LineupBuilder } from './components/LineupBuilder'
import { Rules } from './components/Rules'

const nav = [
  { href: '#regras', label: 'Regras' },
  { href: '#elenco', label: 'Elenco' },
  { href: '#bolao', label: 'Bolão' },
]

export default function App() {
  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <a className="brand" href="#inicio">
            <span aria-hidden="true">⚽</span> Pelada
          </a>
          <nav aria-label="Seções">
            {nav.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <Hero />
        <Rules />
        <LineupBuilder />
        <Bolao />
      </main>

      <footer className="footer">
        <div className="container">Bom jogo pra todo mundo! ⚽</div>
      </footer>
    </>
  )
}
