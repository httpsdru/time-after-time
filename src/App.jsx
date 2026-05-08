import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Header from './components/Header.jsx'
import Marquee from './components/Marquee.jsx'

export default function App() {
  const location = useLocation()
  const variant = location.pathname.startsWith('/menu') ? 'menu' : 'home'

  return (
    <div className={`app app--${variant}`}>
      <Header variant={variant} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
      <Marquee variant={variant} />
    </div>
  )
}
