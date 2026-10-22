/**
 * Poster frame picker, in a video's details in the Media Library (the media
 * modal and the "Edit Media" screen). includes/video-poster.php draws a
 * placeholder; this fills it with three frames grabbed from the video in the
 * browser, and sets the one clicked as the video's poster (featured image).
 * A picture from the Media Library, or one uploaded there, can be the poster
 * instead.
 */
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';

import {
	clampTime,
	defaultTimes,
	formatTime,
	frameSize,
	otherTimes,
	posterFileName,
} from './frames';
import './picker.scss';

type Media = {
	id: number;
	source_url: string;
	media_details?: { sizes?: Record< string, { source_url: string } > };
	meta?: { tekseries_poster_of?: number };
};

type Frame = { time: number; blob: Blob; url: string };

type Chosen = {
	id: number;
	url: string;
	sizes?: Record< string, { url: string } >;
};

// The media frame core's wp.media() opens: the Library, with an upload tab.
type MediaFrame = {
	on: ( event: string, callback: () => void ) => void;
	open: () => void;
	state: () => {
		get: ( key: 'selection' ) => {
			first: () => { toJSON: () => Chosen } | undefined;
		};
	};
};

// The parts of core's wp.media this script touches, when the page has them.
type WpMedia = ( ( options: Record< string, unknown > ) => MediaFrame ) & {
	attachment?: ( id: number ) => { fetch: () => unknown };
	featuredImage?: { set: ( id: number ) => void };
	view?: { settings?: { post?: { id?: number } } };
};

const wpMedia = () => ( window as { wp?: { media?: WpMedia } } ).wp?.media;

const LOAD_TIMEOUT = 20000;
const SEEK_TIMEOUT = 15000;

// Videos given a poster automatically in this page view, so a re-drawn
// details panel doesn't do it twice.
const autoDone = new Set< number >();

class Picker {
	private readonly id: number;
	private readonly src: string;
	private readonly title: string;
	private poster: number;
	private video?: HTMLVideoElement;
	private duration = Infinity;
	private frames: Frame[] = [];
	private busy = false;
	// Seeks share one video element, so they run one after another.
	private queue: Promise< unknown > = Promise.resolve();

	private readonly current: HTMLImageElement;
	private readonly empty: HTMLParagraphElement;
	private readonly grid: HTMLDivElement;
	private readonly other: HTMLButtonElement;
	private readonly library: HTMLButtonElement;
	private frame?: MediaFrame;
	private readonly slider: HTMLInputElement;
	private readonly sliderTime: HTMLSpanElement;
	private readonly preview: HTMLImageElement;
	private readonly useMoment: HTMLButtonElement;
	private readonly status: HTMLParagraphElement;
	private moment?: Frame;
	private momentTimer = 0;

	constructor( private readonly root: HTMLElement ) {
		const { dataset } = root;
		this.id = Number( dataset.id );
		this.src = dataset.src ?? '';
		this.title = dataset.title ?? '';
		this.poster = Number( dataset.poster ) || 0;

		root.replaceChildren();
		root.innerHTML = `
			<div class="ts-poster-picker__current">
				<img alt="" hidden>
				<p class="description"></p>
			</div>
			<button type="button" class="button ts-poster-picker__library"></button>
			<p class="ts-poster-picker__status" role="status" aria-live="polite"></p>
			<div class="ts-poster-picker__frames" role="group"></div>
			<button type="button" class="button ts-poster-picker__other"></button>
			<div class="ts-poster-picker__moment">
				<label><span class="ts-poster-picker__label"></span> <span class="ts-poster-picker__time"></span>
					<input type="range" min="0" step="0.1" value="0">
				</label>
				<img alt="" hidden>
				<button type="button" class="button"></button>
			</div>`;

		const $ = < T extends Element >( selector: string ) =>
			root.querySelector( selector ) as T;
		this.current = $( '.ts-poster-picker__current img' );
		this.empty = $( '.ts-poster-picker__current p' );
		this.grid = $( '.ts-poster-picker__frames' );
		this.other = $( '.ts-poster-picker__other' );
		this.library = $( '.ts-poster-picker__library' );
		this.slider = $( '.ts-poster-picker__moment input' );
		this.sliderTime = $( '.ts-poster-picker__time' );
		this.preview = $( '.ts-poster-picker__moment img' );
		this.useMoment = $( '.ts-poster-picker__moment button' );
		this.status = $( '.ts-poster-picker__status' );

		this.grid.setAttribute(
			'aria-label',
			__( 'Frames from the video', 'tekseries-blocks' )
		);
		this.other.textContent = __( 'Show other frames', 'tekseries-blocks' );
		this.library.textContent = __(
			'Choose or upload a picture',
			'tekseries-blocks'
		);
		this.library.hidden = ! wpMedia();
		$( '.ts-poster-picker__label' ).textContent = __(
			'Or pick a moment:',
			'tekseries-blocks'
		);
		this.useMoment.textContent = __(
			'Use this moment',
			'tekseries-blocks'
		);
		this.showCurrent( dataset.posterUrl ?? '' );
		this.setDisabled( true );

		// Core saves the details on any change and re-draws them, and the
		// modal turns arrow keys into "next file": keep both to the picker.
		root.addEventListener( 'change', ( e ) => e.stopPropagation() );
		root.addEventListener( 'keydown', ( e ) => {
			if ( e.key.startsWith( 'Arrow' ) ) {
				e.stopPropagation();
			}
		} );
		this.other.addEventListener( 'click', () => this.showOther() );
		this.library.addEventListener( 'click', () => this.openLibrary() );
		this.slider.addEventListener( 'input', () => this.onSlide() );
		this.useMoment.addEventListener( 'click', () => {
			if ( this.moment ) {
				this.pick( this.moment );
			}
		} );

		this.start( dataset.inAlbum === '1' );
	}

	private async start( inAlbum: boolean ): Promise< void > {
		this.say( __( 'Getting frames from the video…', 'tekseries-blocks' ) );
		try {
			this.video = await this.load();
			const { duration } = this.video;
			this.duration = duration;
			this.slider.max = String( Math.max( 0, duration - 0.1 ) );
			this.slider.value = String( clampTime( duration / 2, duration ) );
			this.sliderTime.textContent = formatTime( duration / 2, duration );
			await this.showFrames( defaultTimes( duration ) );
			this.onSlide();
		} catch {
			this.say(
				__(
					'This browser can’t play this video, so no frames can be shown. You can still choose or upload a picture.',
					'tekseries-blocks'
				)
			);
			return;
		}

		const middle = this.frames[ 1 ];
		if ( inAlbum && ! this.poster && middle && ! autoDone.has( this.id ) ) {
			autoDone.add( this.id );
			await this.pick(
				middle,
				__(
					'The video had no poster, so the middle frame is now its poster. Pick another frame to change it.',
					'tekseries-blocks'
				)
			);
			return;
		}
		this.say( '' );
	}

	private load(): Promise< HTMLVideoElement > {
		const video = document.createElement( 'video' );
		video.muted = true;
		video.playsInline = true;
		video.preload = 'auto';
		video.crossOrigin = 'anonymous';
		return new Promise( ( resolve, reject ) => {
			const timer = window.setTimeout( reject, LOAD_TIMEOUT );
			video.addEventListener( 'error', () => reject(), { once: true } );
			video.addEventListener(
				'loadeddata',
				() => {
					window.clearTimeout( timer );
					if (
						Number.isFinite( video.duration ) &&
						video.duration > 0 &&
						video.videoWidth > 0
					) {
						resolve( video );
					} else {
						reject();
					}
				},
				{ once: true }
			);
			video.src = this.src;
		} );
	}

	private grab( time: number ): Promise< Frame > {
		const run = async (): Promise< Frame > => {
			const video = this.video;
			if ( ! video ) {
				throw new Error( 'no video' );
			}
			await new Promise< void >( ( resolve, reject ) => {
				const timer = window.setTimeout( reject, SEEK_TIMEOUT );
				video.addEventListener(
					'seeked',
					() => {
						window.clearTimeout( timer );
						resolve();
					},
					{ once: true }
				);
				video.currentTime = time;
			} );
			const size = frameSize( video.videoWidth, video.videoHeight );
			const canvas = document.createElement( 'canvas' );
			canvas.width = size.width;
			canvas.height = size.height;
			canvas
				.getContext( '2d' )
				?.drawImage( video, 0, 0, size.width, size.height );
			const blob = await new Promise< Blob | null >( ( resolve ) =>
				canvas.toBlob( resolve, 'image/jpeg', 0.85 )
			);
			if ( ! blob ) {
				throw new Error( 'no frame' );
			}
			return { time, blob, url: URL.createObjectURL( blob ) };
		};
		const next = this.queue.then( run, run );
		this.queue = next.catch( () => undefined );
		return next;
	}

	private async showFrames( times: number[] ): Promise< void > {
		this.setDisabled( true );
		const frames: Frame[] = [];
		for ( const time of times ) {
			frames.push( await this.grab( time ) );
		}
		this.frames.forEach( ( { url } ) => URL.revokeObjectURL( url ) );
		this.frames = frames;
		this.grid.replaceChildren(
			...frames.map( ( frame ) => {
				const button = document.createElement( 'button' );
				button.type = 'button';
				button.className = 'ts-poster-picker__frame';
				const label = sprintf(
					/* translators: %s: a moment in the video, e.g. 1:05. */
					__(
						'Use the frame at %s as the poster',
						'tekseries-blocks'
					),
					formatTime( frame.time, this.duration )
				);
				button.setAttribute( 'aria-label', label );
				const img = document.createElement( 'img' );
				img.src = frame.url;
				img.alt = '';
				const time = document.createElement( 'span' );
				time.textContent = formatTime( frame.time, this.duration );
				time.setAttribute( 'aria-hidden', 'true' );
				button.append( img, time );
				button.addEventListener( 'click', () => this.pick( frame ) );
				return button;
			} )
		);
		this.setDisabled( false );
	}

	private async showOther(): Promise< void > {
		if ( ! this.video || this.busy ) {
			return;
		}
		try {
			await this.showFrames( otherTimes( this.video.duration ) );
		} catch {
			this.setDisabled( false );
			this.say(
				__(
					'Those frames couldn’t be read. Try again.',
					'tekseries-blocks'
				)
			);
		}
	}

	private onSlide(): void {
		const time = Number( this.slider.value );
		this.sliderTime.textContent = formatTime( time, this.duration );
		this.useMoment.disabled = true;
		window.clearTimeout( this.momentTimer );
		this.momentTimer = window.setTimeout( async () => {
			try {
				const frame = await this.grab( time );
				if ( this.moment ) {
					URL.revokeObjectURL( this.moment.url );
				}
				this.moment = frame;
				this.preview.src = frame.url;
				this.preview.hidden = false;
				this.useMoment.disabled = this.busy;
			} catch {
				// A later slide tries again.
			}
		}, 250 );
	}

	private async pick( frame: Frame, done?: string ): Promise< void > {
		if ( this.busy ) {
			return;
		}
		this.busy = true;
		this.setDisabled( true );
		this.say( __( 'Setting the poster…', 'tekseries-blocks' ) );
		try {
			const body = new FormData();
			body.append( 'file', frame.blob, posterFileName( this.src ) );
			body.append(
				'title',
				sprintf(
					/* translators: %s: the video's title. */
					__( 'Poster for %s', 'tekseries-blocks' ),
					this.title
				)
			);
			body.append(
				'alt_text',
				sprintf(
					/* translators: %s: the video's title. */
					__( 'Poster for %s', 'tekseries-blocks' ),
					this.title
				)
			);
			body.append( 'meta[tekseries_poster_of]', String( this.id ) );
			const image = await apiFetch< Media >( {
				path: '/wp/v2/media',
				method: 'POST',
				body,
			} );
			await apiFetch( {
				path: `/wp/v2/media/${ this.id }`,
				method: 'POST',
				data: { featured_media: image.id },
			} );

			const old = this.poster;
			this.poster = image.id;
			this.root.dataset.poster = String( image.id );
			await this.removeMadePoster( old );
			this.showCurrent(
				image.media_details?.sizes?.medium?.source_url ??
					image.source_url
			);
			this.refreshCore( image.id );
			this.say( done ?? __( 'Poster set.', 'tekseries-blocks' ) );
		} catch {
			this.say(
				__(
					'The poster couldn’t be saved. Check your connection and try again.',
					'tekseries-blocks'
				)
			);
		} finally {
			this.busy = false;
			this.setDisabled( false );
		}
	}

	// Core's Library, on images, with its upload tab. Opened over the media
	// modal when the details are in one.
	private openLibrary(): void {
		const media = wpMedia();
		if ( this.busy || ! media ) {
			return;
		}
		if ( ! this.frame ) {
			this.frame = media( {
				title: __( 'Choose a poster', 'tekseries-blocks' ),
				library: { type: 'image' },
				multiple: false,
				button: { text: __( 'Use as poster', 'tekseries-blocks' ) },
			} );
			this.frame.on( 'select', () => {
				const chosen = this.frame
					?.state()
					.get( 'selection' )
					.first()
					?.toJSON();
				if ( chosen ) {
					this.usePicture( chosen );
				}
			} );
		}
		this.frame.open();
	}

	private async usePicture( picture: Chosen ): Promise< void > {
		if ( this.busy || picture.id === this.poster ) {
			return;
		}
		this.busy = true;
		this.setDisabled( true );
		this.say( __( 'Setting the poster…', 'tekseries-blocks' ) );
		try {
			await apiFetch( {
				path: `/wp/v2/media/${ this.id }`,
				method: 'POST',
				data: { featured_media: picture.id },
			} );
			const old = this.poster;
			this.poster = picture.id;
			this.root.dataset.poster = String( picture.id );
			await this.removeMadePoster( old );
			this.showCurrent( picture.sizes?.medium?.url ?? picture.url );
			this.refreshCore( picture.id );
			this.say( __( 'Poster set.', 'tekseries-blocks' ) );
		} catch {
			this.say(
				__(
					'The poster couldn’t be saved. Check your connection and try again.',
					'tekseries-blocks'
				)
			);
		} finally {
			this.busy = false;
			this.setDisabled( ! this.video );
		}
	}

	// Only a poster this picker made for this video is deleted; a picture
	// added by hand stays in the Media Library.
	private async removeMadePoster( id: number ): Promise< void > {
		if ( ! id ) {
			return;
		}
		try {
			const old = await apiFetch< Media >( {
				path: `/wp/v2/media/${ id }?context=edit&_fields=id,meta`,
			} );
			if ( old.meta?.tekseries_poster_of === this.id ) {
				await apiFetch( {
					path: `/wp/v2/media/${ id }?force=true`,
					method: 'DELETE',
				} );
			}
		} catch {
			// Leaving an old image behind is harmless.
		}
	}

	// Keeps core's own views in step: the Library's tile, and on "Edit Media"
	// the Featured Image box, whose hidden field is saved with the form.
	private refreshCore( poster: number ): void {
		const media = wpMedia();
		media?.attachment?.( this.id ).fetch();
		const field = document.getElementById( '_thumbnail_id' );
		if ( field instanceof HTMLInputElement ) {
			field.value = String( poster );
			if ( media?.view?.settings?.post?.id === this.id ) {
				media.featuredImage?.set( poster );
			}
		}
	}

	private showCurrent( url: string ): void {
		this.current.hidden = ! url;
		if ( url ) {
			this.current.src = url;
			this.current.alt = __( 'The current poster', 'tekseries-blocks' );
		}
		this.empty.textContent = url
			? __(
					'The current poster. Pick a frame, or choose a picture, to change it.',
					'tekseries-blocks'
				)
			: __(
					'No poster yet. Pick a frame, or choose a picture.',
					'tekseries-blocks'
				);
	}

	private setDisabled( disabled: boolean ): void {
		this.root
			.querySelectorAll< HTMLButtonElement | HTMLInputElement >(
				'button, input'
			)
			.forEach( ( control ) => {
				control.disabled = disabled;
			} );
		if ( ! disabled && ! this.moment ) {
			this.useMoment.disabled = true;
		}
		// The Library needs no frames: only a save in progress holds it.
		this.library.disabled = this.busy;
	}

	private say( message: string ): void {
		this.status.textContent = message;
	}
}

const mounted = new WeakSet< HTMLElement >();

function mountAll(): void {
	document
		.querySelectorAll< HTMLElement >( '.ts-poster-picker' )
		.forEach( ( root ) => {
			if ( ! mounted.has( root ) && root.dataset.id ) {
				mounted.add( root );
				new Picker( root );
			}
		} );
}

// The media modal draws a file's details whenever one is opened.
new MutationObserver( mountAll ).observe( document.body, {
	childList: true,
	subtree: true,
} );
mountAll();
