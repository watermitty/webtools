#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const DIST_DIR = path.resolve(__dirname, '../dist')
const AD_TAG = `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2274290381465979" crossorigin="anonymous"></script>`

function walk(dir, cb) {
  const list = fs.readdirSync(dir, { withFileTypes: true })
  for (const d of list) {
    const full = path.join(dir, d.name)
    if (d.isDirectory()) walk(full, cb)
    else cb(full)
  }
}

function injectToFile(file) {
  if (!file.endsWith('.html')) return
  let content = fs.readFileSync(file, 'utf8')
  if (content.indexOf('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js') !== -1) {
    console.log(`[skip] already has ad script: ${file}`)
    return
  }

  const idx = content.toLowerCase().indexOf('</head>')
  if (idx === -1) {
    console.warn(`[warn] no </head> found in ${file}`)
    return
  }

  const before = content.slice(0, idx)
  const after = content.slice(idx)

  const newContent = before + '\n    ' + AD_TAG + '\n' + after
  fs.writeFileSync(file, newContent, 'utf8')
  console.log(`[inject] injected ad script into ${file}`)
}

if (!fs.existsSync(DIST_DIR)) {
  console.error(`dist directory not found: ${DIST_DIR}`)
  process.exit(1)
}

walk(DIST_DIR, injectToFile)

console.log('inject-ads.js done')
