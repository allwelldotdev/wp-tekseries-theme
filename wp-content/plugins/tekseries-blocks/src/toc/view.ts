import {
	getContext,
	getElement,
	store,
	withScope,
} from '@wordpress/interactivity';

// The block: the id of the section being read, when a picked link stops
// holding the mark, and whether the script has taken over.
type Context = { current: string; heldUntil: number; ready: boolean };
// One link: the id of the heading it leads to.
type LinkContext = Context & { id: string };

// A heading counts as reached once it is in the top part of the screen. A
// share of the height, so it holds under any header.
const REACHED = 0.3;
// How long a picked link keeps the mark while the page scrolls to it, in
// milliseconds.
const HOLD = 1000;
// The width up to which the list starts folded (the stylesheet's phone width).
const PHONE = '(max-width: 640px)';

store( 'tekseries/toc', {
	state: {
		get isCurrent(): boolean {
			const { id, current } = getContext< LinkContext >();
			return id === current;
		},
	},
	actions: {
		// A picked link takes the mark at once and keeps it while the page
		// scrolls there: near the end of a page a section can't reach the top.
		pick() {
			const context = getContext< LinkContext >();
			context.current = context.id;
			context.heldUntil = window.performance.now() + HOLD;
		},
	},
	callbacks: {
		// Phones start folded. The <details> arrives open, as it must be
		// without a script, and the stylesheet hides its list until this has
		// run, so nothing moves.
		fold() {
			const details = getElement().ref as HTMLDetailsElement | null;
			if ( details && window.matchMedia( PHONE ).matches ) {
				details.open = false;
			}
			getContext< Context >().ready = true;
		},
		// Marks the link of the section being read: the last heading to have
		// reached the top part of the screen.
		watch() {
			const nav = getElement().ref;
			const links = nav
				? [
						...nav.querySelectorAll< HTMLAnchorElement >(
							'a[href^="#"]'
						),
					]
				: [];
			const headings = links
				.map( ( link ) =>
					nav?.ownerDocument.getElementById(
						decodeURIComponent( link.hash.slice( 1 ) )
					)
				)
				.filter( ( heading ): heading is HTMLElement => !! heading );
			if ( ! headings.length || ! ( 'IntersectionObserver' in window ) ) {
				return;
			}

			const context = getContext< Context >();
			const observer = new window.IntersectionObserver(
				withScope( () => {
					if ( window.performance.now() < context.heldUntil ) {
						return;
					}
					const line = window.innerHeight * REACHED;
					const reached = headings.filter(
						( heading ) =>
							heading.getBoundingClientRect().top < line
					);
					context.current = reached.at( -1 )?.id ?? '';
				} ),
				// Tells of every heading crossing that line.
				{ rootMargin: `0px 0px -${ ( 1 - REACHED ) * 100 }% 0px` }
			);
			headings.forEach( ( heading ) => observer.observe( heading ) );
			return () => observer.disconnect();
		},
	},
} );
