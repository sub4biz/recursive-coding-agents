<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { PreparedText } from '@chenglou/pretext';
	import {
		canvasFontFromComputedStyle,
		lineHeightFromComputedStyle,
		pxNumber
	} from '$lib/pretext-measure';

	type PretextModule = typeof import('@chenglou/pretext');

	interface Takeaway {
		title: string;
		body: string;
	}

	interface PreparedRow {
		titleSignature: string;
		bodySignature: string;
		title: PreparedText;
		body: PreparedText;
	}

	interface RowMetric {
		rowHeight: number;
		titleHeight: number;
		bodyHeight: number;
		titleLines: number;
		bodyLines: number;
	}

	const takeaways: Takeaway[] = [
		{
			title: 'Trust is reliability',
			body: 'The next step is behavioral, not more model intelligence.'
		},
		{
			title: 'A new paradigm of inference-time compute',
			body: 'RLMs are the new reasoning models\u00a0→ recursive coding agents are the new coding agents.'
		},
		{
			title: 'Coding agents can be RLMs',
			body: 'Claude Code dynamic workflows and OpenProse show two concrete paths.'
		}
	];

	let root = $state<HTMLDivElement | null>(null);
	let pretext = $state<PretextModule | null>(null);
	let rowMetrics = $state<RowMetric[]>([]);
	let unsupportedReason = $state<string | null>(null);

	let preparedRows: PreparedRow[] = [];
	let resizeObserver: ResizeObserver | null = null;
	let frame = 0;
	let cancelled = false;

	const proofHeight = $derived(
		rowMetrics.length === takeaways.length
			? rowMetrics.reduce((sum, metric) => sum + metric.rowHeight, 0)
			: null
	);
	const rootStyle = $derived(
		proofHeight === null ? undefined : `--ftw-pretext-proof-height:${proofHeight}px;`
	);

	function rowStyle(index: number) {
		const metric = rowMetrics[index];
		return metric ? `--ftw-row-measured-height:${metric.rowHeight}px;` : undefined;
	}

	function scheduleMeasure() {
		if (frame) cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			frame = 0;
			measureRows();
		});
	}

	function prepareIfNeeded(index: number, titleFont: string, bodyFont: string) {
		if (!pretext) return null;

		const item = takeaways[index];
		const titleSignature = `${item.title}\n${titleFont}`;
		const bodySignature = `${item.body}\n${bodyFont}`;
		const existing = preparedRows[index];

		if (
			existing &&
			existing.titleSignature === titleSignature &&
			existing.bodySignature === bodySignature
		) {
			return existing;
		}

		const prepared = {
			titleSignature,
			bodySignature,
			title: pretext.prepare(item.title, titleFont),
			body: pretext.prepare(item.body, bodyFont)
		};
		preparedRows[index] = prepared;
		return prepared;
	}

	function measureRows() {
		if (!pretext || !root) return;
		const currentPretext = pretext;

		const rows = Array.from(root.querySelectorAll<HTMLElement>('.ftw-proof-row'));
		if (rows.length !== takeaways.length) return;

		const nextMetrics = rows.map((row, index) => {
			const title = row.querySelector<HTMLElement>('.ftw-proof-title');
			const body = row.querySelector<HTMLElement>('.ftw-proof-body');
			if (!title || !body) return null;

			const currentRowStyle = getComputedStyle(row);
			const titleStyle = getComputedStyle(title);
			const bodyStyle = getComputedStyle(body);
			const titleWidth = title.clientWidth;
			const bodyWidth = body.clientWidth;
			const titleRect = title.getBoundingClientRect();
			const bodyRect = body.getBoundingClientRect();
			const stacksText = bodyRect.top > titleRect.top + 1;

			if (!titleWidth || !bodyWidth) return null;

			const prepared = prepareIfNeeded(
				index,
				canvasFontFromComputedStyle(titleStyle),
				canvasFontFromComputedStyle(bodyStyle)
			);
			if (!prepared) return null;

			const titleResult = currentPretext.layout(
				prepared.title,
				titleWidth,
				lineHeightFromComputedStyle(titleStyle)
			);
			const bodyResult = currentPretext.layout(
				prepared.body,
				bodyWidth,
				lineHeightFromComputedStyle(bodyStyle)
			);
			const verticalBox =
				(pxNumber(currentRowStyle.paddingTop) ?? 0) +
				(pxNumber(currentRowStyle.paddingBottom) ?? 0) +
				(pxNumber(currentRowStyle.borderTopWidth) ?? 0) +
				(pxNumber(currentRowStyle.borderBottomWidth) ?? 0);
			const textHeight = stacksText
				? titleResult.height +
					bodyResult.height +
					(pxNumber(currentRowStyle.rowGap) ?? pxNumber(currentRowStyle.gap) ?? 0)
				: Math.max(titleResult.height, bodyResult.height);

			return {
				rowHeight: Math.ceil(textHeight + verticalBox),
				titleHeight: Math.ceil(titleResult.height),
				bodyHeight: Math.ceil(bodyResult.height),
				titleLines: titleResult.lineCount,
				bodyLines: bodyResult.lineCount
			};
		});

		if (nextMetrics.some((metric) => metric === null)) return;
		rowMetrics = nextMetrics as RowMetric[];
	}

	onMount(() => {
		async function init() {
			if (!('Segmenter' in Intl)) {
				unsupportedReason = 'Intl.Segmenter unavailable';
				return;
			}
			if (!document.createElement('canvas').getContext('2d')) {
				unsupportedReason = 'Canvas 2D unavailable';
				return;
			}

			await document.fonts?.ready;
			const mod = await import('@chenglou/pretext');
			if (cancelled) return;

			pretext = mod;
			await tick();
			measureRows();

			if (root) {
				resizeObserver = new ResizeObserver(scheduleMeasure);
				resizeObserver.observe(root);
				for (const row of root.querySelectorAll('.ftw-proof-row')) {
					resizeObserver.observe(row);
				}
			}
		}

		init();

		return () => {
			cancelled = true;
			if (frame) cancelAnimationFrame(frame);
			resizeObserver?.disconnect();
		};
	});
</script>

<div
	bind:this={root}
	class="ftw-takeaways"
	data-pretext-ready={rowMetrics.length === takeaways.length}
	data-pretext-unsupported={unsupportedReason}
	style={rootStyle}
>
	<div class="ftw-lockup">
		<h1><span>Recursive Coding Agents</span> <strong>FTW</strong></h1>
	</div>

	<div class="ftw-proof" aria-label="Takeaways">
		{#each takeaways as takeaway, i}
			<p
				class="ftw-proof-row"
				data-pretext-title-lines={rowMetrics[i]?.titleLines}
				data-pretext-body-lines={rowMetrics[i]?.bodyLines}
				data-pretext-title-height={rowMetrics[i]?.titleHeight}
				data-pretext-body-height={rowMetrics[i]?.bodyHeight}
				style={rowStyle(i)}
			>
				<strong class="ftw-proof-title">{takeaway.title}</strong>
				<span class="ftw-proof-body">{takeaway.body}</span>
			</p>
		{/each}
	</div>
</div>
