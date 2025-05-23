import typescript from '@rollup/plugin-typescript'
import { dts } from 'rollup-plugin-dts'

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
    external: ['firebase/firestore', '@firebase/firestore', 'type-fest', 'zod'],
    plugins: [typescript({})],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.d.ts',
      },
      {
        file: 'lib/index.d.cts',
      },
      {
        file: 'lib/index.d.mts',
      },
    ],
    external: ['firebase/firestore', '@firebase/firestore', 'type-fest', 'zod'],
    plugins: [
      dts({
        respectExternal: true,
        compilerOptions: {
          strict: false,
        },
      }),
    ],
  },
]
