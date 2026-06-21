import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..', 'en')

// Map: relative file -> { badge text, variant }
const badges = {
  'guide/basics/introduction.md': { text: 'PaPiCode Docs', variant: 'brand' },
  'guide/quickstart.md': { text: 'Quickstart', variant: 'brand' },
  'guide/api-key.md': { text: 'API Key', variant: 'brand' },
  'guide/models-pricing.md': { text: 'Models', variant: 'info' },
  'guide/billing.md': { text: 'Billing', variant: 'info' },
  'guide/clients/openai-compatible.md': { text: 'SDK', variant: 'brand' },
  'guide/clients/cursor.md': { text: 'Client', variant: 'info' },
  'guide/clients/claude-code.md': { text: 'Client', variant: 'info' },
  'guide/clients/codex-cli.md': { text: 'Client', variant: 'info' },
  'guide/clients/cherry-studio.md': { text: 'Client', variant: 'info' },
  'guide/clients/chatbox.md': { text: 'Client', variant: 'info' },
  'guide/clients/open-webui.md': { text: 'Client', variant: 'info' },
  'guide/clients/codebuddy.md': { text: 'Client', variant: 'info' },
  'guide/clients/trae.md': { text: 'Client', variant: 'info' },
  'guide/clients/cc-switch.md': { text: 'Client', variant: 'info' },
  'guide/clients/sdk.md': { text: 'SDK', variant: 'brand' },
  'guide/account/redeem.md': { text: 'Top up', variant: 'info' },
  'guide/account/subscriptions.md': { text: 'Plans', variant: 'info' },
  'guide/account/groups.md': { text: 'Route', variant: 'success' },
  'guide/account/usage.md': { text: 'View', variant: 'info' },
  'faq.md': { text: 'FAQ', variant: 'info' },
  'troubleshooting.md': { text: 'Triage', variant: 'neutral' },
  'legal/terms.md': { text: 'Legal', variant: 'success' },
  'legal/privacy.md': { text: 'Legal', variant: 'success' },
}

let touched = 0
for (const [rel, { text, variant }] of Object.entries(badges)) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) continue
  let s = fs.readFileSync(file, 'utf8')
  if (s.includes('<PageBadge')) continue
  // Insert the badge after the frontmatter (---\n...---\n)
  const m = s.match(/^---\n[\s\S]*?\n---\n/)
  if (!m) continue
  const head = m[0]
  const tag = `\n<PageBadge${variant !== 'brand' ? ` variant="${variant}"` : ''}>${text}</PageBadge>\n`
  s = head + tag + s.slice(head.length)
  fs.writeFileSync(file, s)
  console.log('badged', rel)
  touched++
}
console.log(`total ${touched} files updated`)
