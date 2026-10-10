import {
	getContext,
	getElement,
	store,
	withScope,
	withSyncEvent,
} from '@wordpress/interactivity';

// The block: the id of the slide in view, whether the slides may change by
// themselves here (the editor asked for it and the visitor accepts motion),
// whether they are doing so, and how many waits were passed over.
type Context = {
	current: string;
	auto: boolean;
	playing: boolean;
	waits: number;
};
// One dot: the id of its slide.
type DotContext = Context & { id: string };

// How long a slide stays before the next one comes by itself, in milliseconds.
const STAY = 7000;

const isPlainClick = ( event: MouseEvent ) =>
	event.button === 0 &&
	! event.metaKey &&
	! event.ctrlKey &&
	! event.shiftKey &&
	! event.altKey;

// Brings a slide into view by moving the track alone, never the page.
const reveal = ( slide: Element ) => {
	const track = slide.parentElement;
	track?.scrollBy( {
		left:
			slide.getBoundingClientRect().left -
			track.getBoundingClientRect().left,
	} );
};

store( 'tekseries/hero-carousel', {
	state: {
		get isCurrent(): boolean {
			const { id, current } = getContext< DotContext >();
			return id === current;
		},
	},
	actions: {
		// The track moved (a swipe, a dot, the keyboard, or by itself): the
		// slide nearest its start is the one in view.
		follow() {
			const track = getElement().ref;
			if ( ! track?.clientWidth ) {
				return;
			}
			const context = getContext< Context >();
			const index = Math.round(
				Math.abs( track.scrollLeft ) / track.clientWidth
			);
			context.current = track.children[ index ]?.id ?? context.current;
		},
		// A dot: its slide comes into view where it is. Left to the link, the
		// page would jump to the carousel and the address would change.
		show: withSyncEvent( ( event: MouseEvent ) => {
			const { id } = getContext< DotContext >();
			const slide = getElement().ref?.ownerDocument.getElementById( id );
			if ( slide && isPlainClick( event ) ) {
				event.preventDefault();
				reveal( slide );
			}
		} ),
		// The pause button.
		toggle() {
			const context = getContext< Context >();
			context.playing = ! context.playing;
		},
	},
	callbacks: {
		// The slides change by themselves only for visitors who accept motion.
		start() {
			const context = getContext< Context >();
			if (
				! window.matchMedia( '(prefers-reduced-motion: reduce)' )
					.matches
			) {
				context.auto = true;
				context.playing = true;
			}
		},
		// Brings the next slide once this one has stayed its time. Read here,
		// so the wait starts again: the slide in view, the pause button, and
		// the waits passed over.
		rotate() {
			const context = getContext< Context >();
			const { current, playing, waits } = context;
			const carousel = getElement().ref;
			if ( ! carousel || ! playing ) {
				return;
			}
			const timer = window.setTimeout(
				withScope( () => {
					const { ownerDocument } = carousel;
					// Not under the visitor's pointer or focus, nor in a
					// tab nobody is looking at.
					if (
						ownerDocument.hidden ||
						carousel.matches( ':hover' ) ||
						carousel.contains( ownerDocument.activeElement )
					) {
						context.waits = waits + 1;
						return;
					}
					const slides = [
						...carousel.querySelectorAll(
							'.ts-carousel__track > *'
						),
					];
					const next =
						slides[
							( slides.findIndex( ( { id } ) => id === current ) +
								1 ) %
								slides.length
						];
					if ( next ) {
						reveal( next );
					}
				} ),
				STAY
			);
			return () => window.clearTimeout( timer );
		},
	},
} );
