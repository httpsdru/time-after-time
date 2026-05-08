import './Marquee.css'

export default function Marquee({ variant = 'home' }) {
  const phrase = 'time after time '
  // Repeat enough copies to fill any reasonable viewport width seamlessly.
  const copies = Array.from({ length: 16 })
  return (
    <div className={`marquee marquee--${variant}`} aria-hidden="true">
      <div className="marquee__track">
        {copies.map((_, i) => (
          <span key={i} className="marquee__item">{phrase}</span>
        ))}
      </div>
    </div>
  )
}
