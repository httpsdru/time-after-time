import { Link, useLocation } from 'react-router-dom'
import './Header.css'

export default function Header({ variant = 'home' }) {
  const location = useLocation()
  const onMenu = location.pathname.startsWith('/menu')

  if (onMenu) {
    return (
      <header className="site-header site-header--menu">
        <a href="#food" className="site-header__nav site-header__nav--left">food</a>
        <Link to="/" className="site-header__brand">time after time</Link>
        <a href="#drink" className="site-header__nav site-header__nav--right">drink</a>
      </header>
    )
  }

  return (
    <header className="site-header site-header--home">
      <Link to="/" className="site-header__brand">time after time</Link>
      <nav className="site-header__nav site-header__nav--stack">
        <Link to="/menu#food">food</Link>
        <Link to="/menu#drink">drink</Link>
      </nav>
    </header>
  )
}
