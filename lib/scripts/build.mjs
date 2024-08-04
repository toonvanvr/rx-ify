#!/usr/bin/env node

import { build } from 'esbuild'

import { rm } from 'node:fs/promises'

const buildMatrix = {
  entryPoints: [['src/mod.ts']],
  target: ['ES6', 'ES2023'],
  minify: [true],
  format: ['iife', 'esm', 'cjs'],
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
      combination.format === 'iife' ? 'browser' : 'node',
      combination.target.toLowerCase(),
      ...(combination.minify ? ['min'] : []),
      { iife: 'js', esm: 'mjs', cjs: 'cjs' }[combination.format],
    ].join('.')

    /** @type {import('esbuild').BuildOptions} */
    const config = {
      ...combination,
      outfile: `dist/${filename}`,
    }

    return config
  })

await rm('dist', { recursive: true })

await Promise.all(
  combinations.map((config) =>
    build({
      ...config,
      bundle: true,
      external: config.bundle ? ['rxjs'] : undefined,
      sourcemap: true,
    })
  )
)
