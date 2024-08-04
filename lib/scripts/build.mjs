#!/usr/bin/env node

import { build } from 'esbuild'

const buildMatrix = {
  target: ['ES6', 'ESNext'],
  minify: [true],
  format: ['esm', 'cjs'],
}

const combinations = Object.entries(buildMatrix)
  .reduce(
    (combinations, [key, values]) =>
      combinations.flatMap((combination) =>
        values.map((value) => ({ ...combination, [key]: value }))
      ),
    [{}]
  )
  .concat([{ format: 'esm', target: 'ESNext', minify: false }])
  .map((combination) => {
    const filename = [
      combination.format === 'iife' ? 'browser' : 'node',
      combination.target.toLowerCase(),
      ...(combination.minify ? ['min'] : []),
      { esm: 'mjs', cjs: 'cjs' }[combination.format],
    ].join('.')

    /** @type {import('esbuild').BuildOptions} */
    const config = {
      ...combination,
      outfile: `dist/${filename}`,
    }

    return config
  })

await Promise.all(
  combinations.map((config) =>
    build({
      ...config,
      bundle: true,
      external: ['rxjs'],
      sourcemap: true,
      entryPoints: ['src/mod.ts'],
    })
  )
)
