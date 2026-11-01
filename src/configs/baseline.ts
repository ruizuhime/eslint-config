import type BaselinePlugin from 'eslint-plugin-baseline-js'
import type { OptionsBaseline, TypedFlatConfigItem } from '../types'

import { ensurePackages, interopDefault } from '../utils'

export async function baseline(
  options: OptionsBaseline = {},
): Promise<TypedFlatConfigItem[]> {
  const {
    available = 'widely',
    level = 'error',
    overrides = {},
  } = options

  await ensurePackages([
    'eslint-plugin-baseline-js',
  ])

  const pluginBaseline: BaselinePlugin = await interopDefault(import('eslint-plugin-baseline-js'))
  const preset = { available, level }
  const js = pluginBaseline.configs.recommended(preset)
  const ts = pluginBaseline.configs['recommended-ts'](preset)

  return [
    {
      ...js,
      name: 'antfu/baseline/js',
      plugins: {
        'baseline-js': pluginBaseline,
      },
      rules: {
        ...js.rules,
        ...overrides,
      },
    },
    {
      ...ts,
      name: 'antfu/baseline/ts',
      plugins: {
        'baseline-js': pluginBaseline,
      },
      rules: {
        ...ts.rules,
        ...overrides,
      },
    },
  ]
}
