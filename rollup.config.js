import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: true,
		format: 'cjs',
		name: 'app',
		file: 'build/index.js'
	},
	plugins: [
		resolve({
			browser: true,
		}),
		commonjs(),
		typescript({
			inlineSources: !production
		}),
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
