import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import external from 'rollup-plugin-peer-deps-external';
import pkg from './package.json' with { type: 'json' };

export default [
  {
    external: [
      '@tanstack/react-table',
      'react',
      'react-dom',
      'clsx',
      'class-variance-authority',
      'tailwind-merge',
      'lucide-react'
    ],
    input: './src/index.ts',
    output: [
      { file: `./${pkg.main}`, format: 'cjs', sourcemap: true },
      { file: `./${pkg.module}`, format: 'esm', sourcemap: true }
    ],
    plugins: [external(), typescript({ rootDir: './src' })]
  },
  {
    input: './dist/types/index.d.ts',
    output: [{ file: `./${pkg.typings}`, format: 'esm' }],
    plugins: [dts()]
  }
];
