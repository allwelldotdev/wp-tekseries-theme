import {
	getConfig,
	getContext,
	getElement,
	store,
	withSyncEvent,
} from '@wordpress/interactivity';

// One tile, as the viewer needs it. Read from the tile's own markup, so the
// viewer always matches what is loaded on the page.
type Item = {
	id: string;
	// Place among the loaded tiles, from 0.
	position: number;
	href: string;
	video: boolean;
	caption: string;
	// The tile's picture, already downloaded: the thumbnail, a video's poster.
	thumb: string;
	srcset: string;
	width: number;
	height: number;
	// "Show item 3", for its thumbnail.
	label: string;
};
type ThumbContext = { thumb: Item };
// Translated by render.php.
type Config = { position: string; thumb: string };

const NAMESPACE = 'tekseries/media-gallery';
// A swipe is a mostly sideways drag of at least this many pixels.
const SWIPE_DISTANCE = 48;

const isPlainClick = ( event: MouseEvent ) =>
	event.button === 0 &&
	! event.metaKey &&
	! event.ctrlKey &&
	! event.shiftKey &&
	! event.altKey;

const toItem = ( tile: HTMLAnchorElement, index: number ): Item => {
	const image = tile.querySelector( 'img' );
	const [ width, height ] = tile.style.aspectRatio.split( '/' ).map( Number );
	return {
		id: tile.parentElement?.id ?? String( index ),
		position: index,
		href: tile.href,
		video: tile.classList.contains( 'ts-media__tile--video' ),
		caption: tile.querySelector( '.ts-media__caption' )?.textContent ?? '',
		thumb: image?.currentSrc || image?.src || '',
		srcset: image?.srcset ?? '',
		width: width || 4,
		height: height || 3,
		label: getConfig< Config >( NAMESPACE ).thumb.replace(
			'%s',
			String( index + 1 )
		),
	};
};

// Where a touch started, to tell a swipe from a tap.
let pressed: { x: number; y: number } | null = null;

// Moves the viewer on, wrapping around at both ends.
const step = ( by: number ) => {
	const { length } = state.items;
	if ( length ) {
		state.index = ( state.index + by + length ) % length;
	}
};

const { state } = store( NAMESPACE, {
	state: {
		isOpen: false,
		index: 0,
		items: [] as Item[],
		get current(): Item | undefined {
			return state.items[ state.index ];
		},
		get position(): string {
			return state.current ? String( state.index + 1 ) : '';
		},
		get count(): string {
			return state.current ? String( state.items.length ) : '';
		},
		get caption(): string {
			return state.current?.caption ?? '';
		},
		// Read out when the item changes: "3 of 12: A full hall of students".
		get announcement(): string {
			if ( ! state.isOpen || ! state.current ) {
				return '';
			}
			const position = getConfig< Config >( NAMESPACE )
				.position.replace( '%1$s', state.position )
				.replace( '%2$s', state.count );
			return state.caption
				? `${ position }: ${ state.caption }`
				: position;
		},
		get isVideo(): boolean {
			return !! state.current?.video;
		},
		get photoSrc(): string | null {
			const item = state.current;
			return item && ! item.video ? item.href : null;
		},
		// The sizes WordPress made of the photo, so a phone need not fetch
		// the original.
		get photoSrcset(): string | null {
			const item = state.current;
			return item && ! item.video && item.srcset ? item.srcset : null;
		},
		get videoSrc(): string | null {
			const item = state.current;
			return item?.video ? item.href : null;
		},
		get poster(): string | null {
			const item = state.current;
			return item?.video && item.thumb ? item.thumb : null;
		},
		// The frame takes the item's proportions; the stylesheet fits it.
		get frameStyle(): string {
			const { width = 4, height = 3 } = state.current ?? {};
			return `aspect-ratio:${ width } / ${ height };--ts-lightbox-ratio:${
				width / height
			}`;
		},
		get isThumbCurrent(): boolean {
			return getContext< ThumbContext >().thumb.position === state.index;
		},
	},
	actions: {
		// A plain click on a tile opens the viewer on it; a modified click
		// still opens the file, as the link would.
		open: withSyncEvent( ( event: MouseEvent ) => {
			const grid = getElement().ref;
			const tile =
				event.target instanceof Element
					? event.target.closest< HTMLAnchorElement >(
							'a.ts-media__tile'
						)
					: null;
			if ( ! grid || ! tile || ! isPlainClick( event ) ) {
				return;
			}
			event.preventDefault();

			const tiles = [
				...grid.querySelectorAll< HTMLAnchorElement >(
					'a.ts-media__tile'
				),
			];
			state.items = tiles.map( toItem );
			state.index = tiles.indexOf( tile );
			state.isOpen = true;
		} ),
		// Also runs on the dialog's own close event (the Escape key).
		close() {
			state.isOpen = false;
		},
		previous() {
			step( -1 );
		},
		next() {
			step( 1 );
		},
		show() {
			state.index = getContext< ThumbContext >().thumb.position;
		},
		// Arrow keys step, except in the video, where they seek.
		key( event: KeyboardEvent ) {
			if ( event.target instanceof HTMLVideoElement ) {
				return;
			}
			if ( event.key === 'ArrowLeft' ) {
				step( -1 );
			} else if ( event.key === 'ArrowRight' ) {
				step( 1 );
			}
		},
		press( event: PointerEvent ) {
			const swipeable =
				event.isPrimary &&
				event.pointerType !== 'mouse' &&
				! ( event.target instanceof HTMLVideoElement );
			pressed = swipeable ? { x: event.clientX, y: event.clientY } : null;
		},
		release( event: PointerEvent ) {
			if ( ! pressed || ! event.isPrimary ) {
				return;
			}
			const x = event.clientX - pressed.x;
			const y = event.clientY - pressed.y;
			pressed = null;
			if (
				Math.abs( x ) >= SWIPE_DISTANCE &&
				Math.abs( x ) > Math.abs( y )
			) {
				step( x < 0 ? 1 : -1 );
			}
		},
	},
	callbacks: {
		// The browser's modal dialog traps focus, closes on Escape and
		// returns focus to the tile.
		syncDialog() {
			const dialog = getElement().ref as HTMLDialogElement | null;
			if ( state.isOpen && dialog && ! dialog.open ) {
				dialog.showModal();
			} else if ( ! state.isOpen && dialog?.open ) {
				dialog.close();
			}
		},
		// Keeps the current thumbnail in view, once the strip has redrawn.
		revealThumb() {
			const strip = getElement().ref;
			if ( ! state.isOpen || ! state.current ) {
				return;
			}
			window.requestAnimationFrame( () =>
				strip
					?.querySelector( '[aria-current="true"]' )
					?.scrollIntoView( { block: 'nearest', inline: 'center' } )
			);
		},
		// A video plays only while the viewer is open on it.
		stopVideo() {
			const video = getElement().ref as HTMLVideoElement | null;
			if (
				video &&
				! ( state.isOpen && state.videoSrc === video.currentSrc )
			) {
				video.pause();
			}
		},
	},
} );
