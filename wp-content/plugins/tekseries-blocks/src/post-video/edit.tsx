import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

import './editor.scss';

// The canvas shows the card as visitors get it when the post has no
// thumbnail, with a note on where the video is set: the block has no
// settings of its own.
export default function Edit() {
	return (
		<div { ...useBlockProps() }>
			<div className="ts-post-video__card ts-post-video__card--plain">
				<span className="ts-post-video__play" aria-hidden="true">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 -960 960 960"
					>
						<path d="M320-273v-414q0-17 12-28.5t28-11.5q5 0 10.5 1.5T381-721l326 207q9 6 13.5 15t4.5 19q0 10-4.5 19T707-446L381-239q-5 3-10.5 4.5T360-233q-16 0-28-11.5T320-273Zm80-207Zm0 134 210-134-210-134v268Z" />
					</svg>
				</span>
				<span className="ts-post-video__label">
					{ __( 'Watch the video', 'tekseries-blocks' ) }
				</span>
			</div>
			<p className="ts-post-video__note">
				{ __(
					'Shows the video set in the post’s Video fields, under the editor: a file from the Media Library, or a YouTube or Vimeo link. Visitors see nothing here when a post has no video.',
					'tekseries-blocks'
				) }
			</p>
		</div>
	);
}
