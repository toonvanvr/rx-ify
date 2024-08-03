#!/usr/bin/env node

import { build } from 'esbuild'

const buildMatrix = {
  bundle: [true, false],
  target: ['ES6', 'ESNext'],
  minify: [true, false]
}

const combinations = Object.entries(buildMatrix)
  .reduce(
    (combinations, [key, values]) =>
      combinations.flatMap((combination) =>
        values.map((value) => ({ ...combination, [key]: value }))
      ),
    [{}]
  )
  .map((combination) => {
    const filename = [
      combination.bundle ? 'bundle' : 'mod',
      combination.target.toLowerCase(),
      ...(combination.minify ? ['min'] : []),
      'js'
    ].join('.')

    /** @type {import('esbuild').BuildOptions} */
    const config = {
      ...combination,
      outfile: `dist/${filename}`,
    }

    return config
  })

console.log(combinations)

const builds = await Promise.all(
  combinations.map(config => build({
    ...config,
    entryPoints: ['src/mod.ts'],
    external: config.bundle ? ['rxjs'] : undefined,
  }))
)

console.log({builds})