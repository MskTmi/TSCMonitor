import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

// eslint-disable-next-line no-control-regex
// 匹配无效字符的正则表达式，用于过滤文件名中的无效字符
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;

export default defineConfig({
	plugins: [uni()],
	build: {
		rollupOptions: {
			output: {
				// https://github.com/rollup/rollup/blob/master/src/utils/sanitizeFileName.ts
				// 文件名清理函数，用于移除文件名中的无效字符
				sanitizeFileName(name) {
					const match = DRIVE_LETTER_REGEX.exec(name);
					const driveLetter = match ? match[0] : "";
					// 冒号只允许作为 Windows 盘符的一部分（例如：C:\foo）
					// 否则，避免使用冒号，因为它们可能引用 NTFS 的备用数据流。
					return (
						driveLetter +
						name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, "")
					);
				},
			},
		},
	},
});