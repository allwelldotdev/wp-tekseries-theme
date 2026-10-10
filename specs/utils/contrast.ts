import type { Locator } from '@playwright/test';

type Shot = { png: string; color: string };

/**
 * How clearly a text stands out from what is really drawn behind it: the WCAG
 * contrast ratio that all but the worst twentieth of its letters' pixels
 * reach. For text over a photo, where a checker that reads the styles can't
 * tell.
 *
 * The text's box is captured twice, as drawn and with the letters' fill made
 * transparent (a text shadow stays: it is part of what sits behind them). The
 * pixels that differ are the letters; the text colour is compared with what
 * is behind them and one pixel around.
 *
 * @param text An element whose own text is to be measured.
 */
export async function textContrast( text: Locator ): Promise< number > {
	const page = text.page();
	const box = await text.evaluate( ( el ) => {
		// The middle of the screen is clear of the sticky header.
		el.scrollIntoView( { block: 'center', behavior: 'instant' } );
		const range = el.ownerDocument.createRange();
		range.selectNodeContents( el );
		const rects = [ ...range.getClientRects() ];
		const left = Math.min( ...rects.map( ( rect ) => rect.left ) ) - 2;
		const top = Math.min( ...rects.map( ( rect ) => rect.top ) ) - 2;
		return {
			x: Math.max( 0, left ),
			y: Math.max( 0, top ),
			width:
				Math.max( ...rects.map( ( rect ) => rect.right ) ) + 2 - left,
			height:
				Math.max( ...rects.map( ( rect ) => rect.bottom ) ) + 2 - top,
			color: el.ownerDocument.defaultView?.getComputedStyle( el ).color,
		};
	} );
	const { color = '', ...clip } = box;
	const capture = async () =>
		( await page.screenshot( { clip, animations: 'disabled' } ) ).toString(
			'base64'
		);

	const drawn = await capture();
	await text.evaluate( ( el: HTMLElement ) =>
		el.style.setProperty(
			'-webkit-text-fill-color',
			'transparent',
			'important'
		)
	);
	const behind = await capture();
	await text.evaluate( ( el: HTMLElement ) =>
		el.style.removeProperty( '-webkit-text-fill-color' )
	);

	return page.evaluate(
		async ( [ a, b ]: Shot[] ) => {
			const pixels = async ( { png }: Shot ) => {
				const image = new Image();
				image.src = `data:image/png;base64,${ png }`;
				await image.decode();
				const canvas = document.createElement( 'canvas' );
				canvas.width = image.width;
				canvas.height = image.height;
				const context = canvas.getContext( '2d' );
				context?.drawImage( image, 0, 0 );
				return context?.getImageData( 0, 0, image.width, image.height );
			};
			const [ shown, under ] = [ await pixels( a! ), await pixels( b! ) ];
			if ( ! shown || ! under ) {
				return 0;
			}
			const { width, height } = shown;
			const at = ( data: Uint8ClampedArray, i: number ) => [
				data[ i * 4 ] ?? 0,
				data[ i * 4 + 1 ] ?? 0,
				data[ i * 4 + 2 ] ?? 0,
			];
			// The letters, then one pixel around them.
			const letters = new Uint8Array( width * height );
			for ( let i = 0; i < width * height; i++ ) {
				const [ before, after ] = [
					at( shown.data, i ),
					at( under.data, i ),
				];
				letters[ i ] = before.some(
					( channel, k ) =>
						Math.abs( channel - ( after[ k ] ?? 0 ) ) > 20
				)
					? 1
					: 0;
			}
			const near = ( i: number ) =>
				letters[ i ] ||
				letters[ i - 1 ] ||
				letters[ i + 1 ] ||
				letters[ i - width ] ||
				letters[ i + width ];

			const luminance = ( rgb: number[] ) =>
				rgb
					.map( ( channel ) => channel / 255 )
					.map( ( channel ) =>
						channel <= 0.03928
							? channel / 12.92
							: ( ( channel + 0.055 ) / 1.055 ) ** 2.4
					)
					.reduce(
						( sum, channel, k ) =>
							sum +
							channel * ( [ 0.2126, 0.7152, 0.0722 ][ k ] ?? 0 ),
						0
					);
			const foreground = luminance(
				( a!.color.match( /[\d.]+/g ) ?? [] )
					.slice( 0, 3 )
					.map( Number )
			);
			const ratios: number[] = [];
			for ( let i = 0; i < width * height; i++ ) {
				if ( near( i ) ) {
					const background = luminance( at( under.data, i ) );
					ratios.push(
						( Math.max( foreground, background ) + 0.05 ) /
							( Math.min( foreground, background ) + 0.05 )
					);
				}
			}
			ratios.sort( ( x, y ) => x - y );
			return ratios[ Math.floor( ( ratios.length - 1 ) * 0.05 ) ] ?? 0;
		},
		[
			{ png: drawn, color },
			{ png: behind, color },
		]
	);
}
