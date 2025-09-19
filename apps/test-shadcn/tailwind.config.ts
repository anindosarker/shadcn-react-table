import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/shadcn-react-table/**/*.{js,ts,jsx,tsx}',
    '../../packages/shadcn-react-table/**/*.{ts,tsx,js,jsx}',
  ],
  safelist: [
    'w-full',
    'text-sm',
    'border-b',
    'h-10',
    'px-2',
    'text-left',
    'align-middle',
    'font-medium',
    'text-gray-500',
    'cursor-pointer',
    'select-none',
    'hover:bg-gray-50',
    'p-2',
  ],
  plugins: [tailwindcssAnimate],
} satisfies Config;
