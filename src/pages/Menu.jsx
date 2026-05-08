import { useEffect, useMemo, useRef, useState } from 'react'
import { menu } from '../content/index.js'
import './Menu.css'

/**
 * Menu page — scroll-driven selection.
 *
 * As the user scrolls, the item closest to the viewport mid-line becomes the
 * "active" item, and its photo + description swap into the sticky detail panel
 * on the right. Click an item to jump to it.
 */
export default function Menu() {
  const [activeIdx, setActiveIdx] = useState(0)
  const itemRefs = useRef([])
  const containerRef = useRef(null)

  // Sort items so all `food` items appear first, then all `drink` items,
  // each group respecting their own `order` field.
  const sorted = useMemo(() => {
    const food = menu.filter(m => (m.category || 'food') === 'food')
    const drink = menu.filter(m => m.category === 'drink')
    return [...food, ...drink]
  }, [])

  const firstDrinkIdx = useMemo(
    () => sorted.findIndex(m => m.category === 'drink'),
    [sorted]
  )

  // Track the active item as the user scrolls.
  useEffect(() => {
    if (!sorted.length) return
    const handler = () => {
      const targetY = window.innerHeight * 0.4
      let bestIdx = 0
      let bestDist = Infinity
      itemRefs.current.forEach((el, i) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const center = rect.top + rect.height / 2
        const dist = Math.abs(center - targetY)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      })
      setActiveIdx(bestIdx)
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('scroll', handler)
      window.removeEventListener('resize', handler)
    }
  }, [sorted.length])

  const handleItemClick = (i) => {
    const el = itemRefs.current[i]
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const active = sorted[activeIdx]

  if (!sorted.length) {
    return (
      <main className="menu menu--empty">
        <div className="placeholder">add menu items in the CMS to populate this page</div>
      </main>
    )
  }

  return (
    <main className="menu" ref={containerRef}>
      <ol className="menu__list" id="food">
        {sorted.map((item, i) => {
          const isActive = i === activeIdx
          const idAttr = i === firstDrinkIdx ? 'drink' : undefined
          return (
            <li
              key={item.id || `${item.name}-${i}`}
              ref={el => (itemRefs.current[i] = el)}
              id={idAttr}
            >
              <button
                type="button"
                onClick={() => handleItemClick(i)}
                className={`menu__item${isActive ? ' is-active' : ''}`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <span className="menu__item-marker" aria-hidden="true">
                  {isActive ? '✦' : ''}
                </span>
                <span className="menu__item-name">{item.name}</span>
                <sup className="menu__item-price">${item.price}</sup>
              </button>
            </li>
          )
        })}
      </ol>

      <aside className="menu__detail" aria-live="polite">
        <figure className="menu__photo">
          {active.image ? (
            <img src={active.image} alt={active.name} />
          ) : (
            <div className="placeholder">no photo yet</div>
          )}
          <figcaption>
            {active.description || active.name}
          </figcaption>
        </figure>
      </aside>
    </main>
  )
}
