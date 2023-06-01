import { typescript } from 'projen'
import { TypescriptConfigExtends } from 'projen/lib/javascript'
import { NodePackageManager, NpmAccess } from 'projen/lib/javascript/node-package'

const project = new typescript.TypeScriptProject({
  projenrcTs: true,
  name: 'zod-firebase-admin',
  packageName: 'zod-firebase-admin',
  description: 'zod firebase-admin',
  repository: 'git+https://github.com/valian-ca/zod-firebase-admin.git',

  minNodeVersion: '18.0.0',
  workflowNodeVersion: 'lts/hydrogen',

  authorName: 'Valian',
  authorUrl: 'https://valian.ca',
  authorOrganization: true,

  license: 'MIT',
  licensed: true,
  copyrightOwner: 'Valian',

  keywords: ['eslint'],

  gitignore: ['.idea'],

  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  defaultReleaseBranch: 'main',
  packageManager: NodePackageManager.NPM,

  prettier: true,
  prettierOptions: { settings: { semi: false, singleQuote: true, printWidth: 120 } },
  eslint: true,
  jest: true,

  tsconfig: {
    extends: TypescriptConfigExtends.fromPaths(['@tsconfig/node18/tsconfig.json']),
    compilerOptions: {
      alwaysStrict: undefined,
      declaration: undefined,
      esModuleInterop: undefined,
      experimentalDecorators: undefined,
      inlineSourceMap: undefined,
      inlineSources: undefined,
      lib: undefined,
      module: undefined,
      noEmitOnError: undefined,
      noFallthroughCasesInSwitch: undefined,
      noImplicitAny: undefined,
      noImplicitReturns: undefined,
      noImplicitThis: undefined,
      noUnusedLocals: undefined,
      noUnusedParameters: undefined,
      resolveJsonModule: undefined,
      strict: undefined,
      strictNullChecks: undefined,
      strictPropertyInitialization: undefined,
      stripInternal: undefined,
      target: undefined,
    },
  },

  peerDeps: ['firebase-admin@>=11.8.0'],
  deps: ['type-fest', 'zod'],

  devDeps: [
    '@valian/eslint-config',
    '@commitlint/cli',
    '@commitlint/config-conventional',
    '@tsconfig/node18',
    'husky',
    'markdownlint-cli',
    'prettier',
  ],
})

project.synth()
