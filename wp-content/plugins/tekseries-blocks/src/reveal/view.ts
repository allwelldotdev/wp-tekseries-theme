import { getElement, store } from '@wordpress/interactivity';

// A block plays once this share of it is on screen, as on the design's boards;
// one taller than the screen, once it fills that share of the screen.
const SHARE = 0.18;
// The classes the stylesheets read: waiting below the screen, then in view.
const PENDING = 'is-reveal-pending';
const REVEALED = 'is-revealed';

let observer: IntersectionObserver | undefined;

// Blocks that come into view together play one after another: each gets its
// place among them, which the stylesheets turn into a delay.
const reveal: IntersectionObserverCallback = ( entries ) => {
	let place = 0;
	for ( const { target, intersectionRatio, intersectionRect } of entries ) {
		if (
			intersectionRatio < SHARE &&
			intersectionRect.height < window.innerHeight * SHARE
		) {
			continue;
		}
		observer?.unobserve( target );
		( target as HTMLElement ).style.setProperty(
			'--ts-reveal-place',
			String( place++ )
		);
		target.classList.replace( PENDING, REVEALED );
	}
};

store( 'tekseries/reveal', {
	callbacks: {
		// Only a block still below the screen waits. One the visitor can
		// already see stays as it is, and so does every block for visitors
		// who ask for less motion.
		watch() {
			const { ref } = getElement();
			if (
				! ref ||
				! ( 'IntersectionObserver' in window ) ||
				window.matchMedia( '(prefers-reduced-motion: reduce)' )
					.matches ||
				ref.getBoundingClientRect().top < window.innerHeight
			) {
				return;
			}
			// Told at several shares on the way in, so a tall block is
			// measured against the screen more than once.
			observer ??= new window.IntersectionObserver( reveal, {
				threshold: [ 0.03, 0.06, 0.09, 0.12, 0.15, SHARE ],
			} );
			ref.classList.add( PENDING );
			observer.observe( ref );
			return () => observer?.unobserve( ref );
		},
	},
} );
