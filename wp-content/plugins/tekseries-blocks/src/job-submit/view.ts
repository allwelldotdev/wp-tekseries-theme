import { getElement, store, withSyncEvent } from '@wordpress/interactivity';

// The part of WP Job Manager's description editor (TinyMCE) used here.
type Editor = {
	getContent: () => string;
	getContainer: () => HTMLElement;
	focus: () => void;
	on: ( events: string, listener: () => void ) => void;
};
type WithEditors = Window & {
	tinymce?: { get: ( id: string ) => Editor | null };
};

const FIELD = 'job_description';

const editor = () => ( window as WithEditors ).tinymce?.get( FIELD ) ?? null;

// The editor's plain text box, when a description is required.
const required = ( form: HTMLFormElement ) =>
	form.querySelector< HTMLTextAreaElement >(
		`.required-field textarea#${ FIELD }`
	);

// WP Job Manager owns the form and its editor, so the message is shown and
// hidden directly and nothing in the form is bound.
const say = ( form: HTMLFormElement, missing: boolean ) => {
	const message = form.querySelector< HTMLElement >( `#${ FIELD }-error` );
	if ( message ) {
		message.hidden = ! missing;
	}
};

// Editors whose typing already clears the message.
const watched = new WeakSet< Editor >();

store( 'tekseries/job-submit', {
	actions: {
		// "Preview" (or "Save changes") without a description: say so under
		// the editor and put the cursor in it. WP Job Manager's own check is
		// stopped: it reveals the editor's hidden text box for the browser's
		// message to point at, which shows as a stray empty box. "Save draft"
		// needs no description.
		check: withSyncEvent( ( event: SubmitEvent ) => {
			const { ref: form } = getElement();
			if ( ! ( form instanceof HTMLFormElement ) ) {
				return;
			}
			const box = required( form );
			const by = event.submitter;
			const draft =
				by instanceof HTMLButtonElement && by.name === 'save_draft';
			const rich = editor();
			const text = rich ? rich.getContent() : ( box?.value ?? '' );
			if ( ! box || draft || text.trim() !== '' ) {
				say( form, false );
				return;
			}

			event.preventDefault();
			event.stopPropagation();
			say( form, true );
			if ( ! rich ) {
				box.focus();
				return;
			}
			if ( ! watched.has( rich ) ) {
				watched.add( rich );
				rich.on( 'input keyup change', () => say( form, false ) );
			}
			rich.getContainer().scrollIntoView( { block: 'center' } );
			rich.focus();
		} ),
		// Typing in the plain text box (the editor's script did not load).
		typed( event: Event ) {
			const { ref: form } = getElement();
			if (
				form instanceof HTMLFormElement &&
				event.target instanceof HTMLTextAreaElement &&
				event.target.id === FIELD
			) {
				say( form, false );
			}
		},
	},
} );
