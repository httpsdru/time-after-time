/**
 * Content loader.
 *
 * The CMS writes JSON files into ./menu/, ./gallery/, and updates ./site.json.
 * Vite's import.meta.glob picks them all up at build time so adding a new
 * file in the CMS just requires a redeploy (which Netlify does automatically
 * on every commit).
 */

const menuModules = import.meta.glob('./menu/*.json', { eager: true })
const galleryModules = import.meta.glob('./gallery/*.json', { eager: true })

import siteData from './site.json'

function toArray(modules) {
  return Object.entries(modules)
    .map(([path, mod]) => ({ ...(mod.default || mod), _path: path }))
    .sort((a, b) => {
      const ao = a.order ?? 999
      const bo = b.order ?? 999
      if (ao !== bo) return ao - bo
      return (a._path || '').localeCompare(b._path || '')
    })
}

export const menu = toArray(menuModules)
export const gallery = toArray(galleryModules)
export const site = siteData
