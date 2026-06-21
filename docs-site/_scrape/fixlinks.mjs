import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    const rel = path.relative(root, full).split(path.sep).join('/')
    if (rel.startsWith('en') || rel.startsWith('_scrape')) continue
    if (e.isDirectory()) {
      walk(full)
    } else if (e.name.endsWith('.md')) {
      let s = fs.readFileSync(full, 'utf8')
      const o = s
      s = s.replaceAll('](/zh/', '](/').replaceAll('"/zh/', '"/').replaceAll("'/zh/", "'/")
      if (s !== o) {
        fs.writeFileSync(full, s)
        console.log('fixed', rel)
      }
    }
  }
}
walk(root)
console.log('done')
