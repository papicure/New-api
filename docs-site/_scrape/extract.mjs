// One-off scraper: pull `nav` + `pages` data out of the reference site's app.js
// and emit VitePress markdown files (zh + en) plus a nav manifest.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import TurndownService from 'turndown'

const src = fs.readFileSync(path.join(import.meta.dirname, 'app.js'), 'utf8')

// The data lives in the first ~900 lines (labels/nav/pages). Everything after
// the first real function declaration is runtime/DOM glue we don't need.
const cutoff = src.indexOf('function getLangFromPath')
const dataSrc = src.slice(0, cutoff)

// Evaluate the data block in a sandbox. The page bodies contain ${BASE_URL}
// interpolation, so we provide those constants; nothing touches the DOM here.
const sandbox = {}
vm.createContext(sandbox)
vm.runInContext(dataSrc + '\nthis.__nav = nav; this.__pages = pages;', sandbox)

const nav = sandbox.__nav
const pages = sandbox.__pages

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
})
// Preserve fenced code language when present as <pre><code class="language-x">
td.addRule('fencedCodeLang', {
  filter: (node) =>
    node.nodeName === 'PRE' && node.firstChild?.nodeName === 'CODE',
  replacement: (_content, node) => {
    const code = node.firstChild
    const cls = code.getAttribute('class') || ''
    const lang = (cls.match(/language-(\w+)/) || [, ''])[1]
    const text = code.textContent.replace(/\n$/, '')
    return `\n\n\`\`\`${lang}\n${text}\n\`\`\`\n\n`
  },
})

const outRoot = path.resolve(import.meta.dirname, '..')

function slugToFile(lang, slug) {
  // slug like "/guide/quickstart" -> "<lang>/guide/quickstart.md"
  const clean = slug.replace(/^\//, '')
  return path.join(outRoot, lang, `${clean}.md`)
}

let count = 0
for (const lang of ['zh', 'en']) {
  const langPages = pages[lang] || {}
  for (const [slug, page] of Object.entries(langPages)) {
    const title = page.title || ''
    const lead = page.lead || page.eyebrow || ''
    let md = td.turndown(page.body || '')
    md = md.replace(/\$\{BASE_URL\}/g, 'https://www.papicure.de')
    md = md.replace(/\$\{API_BASE_URL\}/g, 'https://www.papicure.de/v1')

    const front = `---\ntitle: ${JSON.stringify(title)}\n---\n\n`
    const heading = `# ${title}\n\n`
    const leadBlock = lead ? `> ${lead}\n\n` : ''
    const file = slugToFile(lang, slug)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, front + heading + leadBlock + md + '\n')
    count++
  }
}

// Dump the nav tree for building VitePress sidebar config.
fs.writeFileSync(
  path.join(import.meta.dirname, 'nav.json'),
  JSON.stringify(nav, null, 2)
)

console.log(`wrote ${count} markdown files`)
console.log('zh slugs:', Object.keys(pages.zh || {}).length)
console.log('en slugs:', Object.keys(pages.en || {}).length)
