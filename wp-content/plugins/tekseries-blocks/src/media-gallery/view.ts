import {
	getConfig,
	getContext,
	getElement,
	getServerState,
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
// A link elsewhere on the page that opens one file: what the server knows of
// the file (includes/lightbox.php).
type OpenerContext = {
	opener?: Pick<
		Item,
		'href' | 'video' | 'caption' | 'thumb' | 'srcset' | 'width' | 'height'
	>;
};
// Translated by render.php.
type Config = { position: string; thumb: string };
// From render.php, for the page the router last showed: "Showing 12 of 32".
type ServerState = { summary?: string };

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
		// The block has been updated in place; another update is on its way.
		isUpdated: false,
		isLoading: false,
		// The summary of what is now shown, for assistive technology. Empty on
		// arrival (the page says it already) and while loading, so that the
		// same words after another filter are still read out.
		get status(): string {
			const { summary = '' } = getServerState< ServerState >( NAMESPACE );
			return state.isUpdated && ! state.isLoading ? summary : '';
		},
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
		// One item: nothing to step through, so the viewer drops the
		// counter, the Previous and Next buttons and the thumbnails.
		get isSingle(): boolean {
			return state.items.length === 1;
		},
		get caption(): string {
			return state.current?.caption ?? '';
		},
		// Read out when the item changes: "3 of 12: A full hall of students".
		get announcement(): string {
			if ( ! state.isOpen || ! state.current ) {
				return '';
			}
			if ( state.isSingle ) {
				return state.caption;
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
		// A link elsewhere on the page ("View full size", "See video") opens
		// the viewer on its one file. A modified click still opens the file.
		openOne: withSyncEvent( ( event: MouseEvent ) => {
			const { opener } = getContext< OpenerContext >();
			if ( ! opener || ! isPlainClick( event ) ) {
				return;
			}
			event.preventDefault();
			state.items = [
				{ ...opener, id: 'opener', position: 0, label: '' },
			];
			state.index = 0;
			state.isOpen = true;
		} ),
		// The filters and Load more: fetches the link's page and swaps the
		// block's content in place, instead of loading the whole page. The
		// address still changes, so a filtered view can be shared and Back
		// works; if the fetch fails the router loads the page as the link would.
		navigate: withSyncEvent( function* ( event: MouseEvent ) {
			const link = getElement().ref as HTMLAnchorElement | null;
			if ( ! link || ! isPlainClick( event ) ) {
				return;
			}
			event.preventDefault();

			const block = link.closest< HTMLElement >(
				'.wp-block-tekseries-media-gallery'
			);
			// Without its fragment, so the page stays where it is scrolled.
			const { href } = link;
			const url = new URL( href );
			const target = url.hash;
			url.hash = '';

			state.isLoading = true;
			const router =
				( yield import( '@wordpress/interactivity-router' ) ) as typeof import( '@wordpress/interactivity-router' );
			yield router.actions.navigate( url.href, {
				screenReaderAnnouncement: false,
			} );
			// A later click has taken over.
			if ( ! block || window.location.href !== url.href ) {
				return;
			}

			// The fragment goes back on for reloads and shared links.
			window.history.replaceState( window.history.state, '', href );
			state.isUpdated = true;
			state.isLoading = false;

			// Load more names its first new tile: focus goes there. A link
			// that the new content no longer has hands focus to the filters.
			const first = target.startsWith( '#media-' )
				? block.querySelector< HTMLElement >( `${ target } a` )
				: null;
			if ( first ) {
				first.focus();
			} else if (
				! block.contains( block.ownerDocument.activeElement )
			) {
				block
					.querySelector< HTMLElement >(
						'.ts-media__filters [aria-current], .ts-media__tile'
					)
					?.focus();
			}
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
