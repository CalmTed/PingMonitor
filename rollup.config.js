import rollup_tsc from '@rollup/plugin-typescript';
import rollup_nre from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';

export default [
  {
    input: 'src-ui/src/index.tsx',
    output: {
      file: 'dist/js/index.js',
      format: 'cjs',
      name: 'bundle',
      sourcemap: true
    },
    plugins: [
      rollup_nre(),
      rollup_tsc({
        tsconfig: 'src-ui/tsconfig.json',
        compilerOptions: {
          declaration: false,
          declarationDir: null
        }
      }),
      eslint(),
      replace({
          "process.env.NODE_ENV": JSON.stringify("development"),
          preventAssignment: true
      }),
      commonjs({
        include: /node_modules/
    })
    ]
  }
]