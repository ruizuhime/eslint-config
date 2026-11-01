import type { OptionsConfig } from '../src'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { antfu } from '../src'

const CODE = 'Promise.withResolvers()\n'

async function lintBaseline(options: OptionsConfig) {
  const configs = await antfu({
    formatters: false,
    stylistic: false,
    typescript: false,
    vue: false,
    ...options,
  })

  const eslint = new ESLint({
    overrideConfig: configs as any,
    overrideConfigFile: true,
  })
  const results = await eslint.lintText(CODE, { filePath: 'fixture.js' })
  return results[0]?.messages.filter(message => message.ruleId === 'baseline-js/use-baseline') ?? []
}

describe('baseline option', () => {
  it('reports nothing unless baseline is enabled', async () => {
    const messages = await lintBaseline({})
    expect(messages).toEqual([])
  })

  it('reports Promise.withResolvers when the target year is 2023', async () => {
    const messages = await lintBaseline({
      baseline: {
        available: 2023,
      },
    })
    expect(messages.length).toBeGreaterThan(0)
  })

  it('reports nothing for Promise.withResolvers at widely', async () => {
    const messages = await lintBaseline({
      baseline: true,
    })
    expect(messages).toEqual([])
  })

  it('adds the JavaScript and TypeScript configs only when enabled', async () => {
    const off = await antfu({
      formatters: false,
      stylistic: false,
      typescript: false,
      vue: false,
    })
    const on = await antfu({
      baseline: true,
      formatters: false,
      stylistic: false,
      typescript: false,
      vue: false,
    })
    const names = (configs: { name?: string }[]) => configs.map(config => config.name)

    expect(names(off)).not.toContain('antfu/baseline/js')
    expect(names(off)).not.toContain('antfu/baseline/ts')
    expect(names(on)).toContain('antfu/baseline/js')
    expect(names(on)).toContain('antfu/baseline/ts')
  })
})
