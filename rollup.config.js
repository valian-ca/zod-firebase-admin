import typescript from '@rollup/plugin-typescript'
import dts from 'rollup-plugin-dts'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.cjs',
        format: 'cjs',
      },
      {
        file: 'lib/index.mjs',
        format: 'esm',
      },
    ],
    external: ['firebase-admin/firestore'],
    plugins: [typescript({})],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.d.ts',
      },
    ],
    external: ['firebase-admin/firestore'],
    plugins: [dts()],
  },
]
