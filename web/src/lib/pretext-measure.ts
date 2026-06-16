import type { PrepareOptions } from '@chenglou/pretext';

export type PretextWhiteSpace = NonNullable<PrepareOptions['whiteSpace']>;

export function canvasFontFromComputedStyle(style: CSSStyleDeclaration) {
	const fontStyle = style.fontStyle || 'normal';
	const fontWeight = style.fontWeight || '400';
	const fontSize = style.fontSize || '16px';
	const fontFamily = safeFontFamily(style.fontFamily);

	return `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
}

export function lineHeightFromComputedStyle(style: CSSStyleDeclaration) {
	const lineHeight = pxNumber(style.lineHeight);
	if (lineHeight !== null) return lineHeight;

	const fontSize = pxNumber(style.fontSize);
	return fontSize === null ? 16 * 1.2 : fontSize * 1.2;
}

export function pxNumber(value: string) {
	const number = Number.parseFloat(value);
	return Number.isFinite(number) ? number : null;
}

function safeFontFamily(fontFamily: string) {
	if (!fontFamily || /\bsystem-ui\b/.test(fontFamily)) return 'Inter';
	return fontFamily;
}
