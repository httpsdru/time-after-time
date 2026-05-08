import { gallery, site } from '../content/index.js'
import './Home.css'

export default function Home() {
  return (
    <main className="home">
      <div className="home__gallery">
        {gallery.length === 0 ? (
          <div className="home__empty">
            <div className="placeholder">add images in the CMS to populate the gallery</div>
          </div>
        ) : (
          gallery.map((item, i) => (
            <figure key={item.image || i} className="home__slide">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.alt || ''}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="placeholder">{item.alt || 'photo'}</div>
              )}
            </figure>
          ))
        )}
      </div>

      <div className="home__info" aria-label="cafe information">
        <p><span>{site.hours}</span></p>
        <p><span>{site.address}</span></p>
        <p><span>{site.instagram}</span></p>
      </div>
    </main>
  )
}
