<?php
/**
 * Poster frame picker: a "Poster frame" row in a video's details in the Media
 * Library, where the editor picks one of three frames grabbed from the video.
 *
 * The frames are grabbed in the editor's browser (src/video-poster), because
 * the live host has no ffmpeg. The chosen frame is uploaded as a JPEG and set
 * as the video's featured image, which is the poster the Gallery, the viewer
 * and the Post Video card already show.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Marks a JPEG the picker made with the video it is the poster of, so that
 * choosing again deletes it, and never a poster added by hand.
 */
function tekseries_blocks_register_poster_meta(): void {
	register_post_meta(
		'attachment',
		'tekseries_poster_of',
		array(
			'type'              => 'integer',
			'description'       => __( 'The video this image was grabbed from, as its poster.', 'tekseries-blocks' ),
			'single'            => true,
			'default'           => 0,
			'sanitize_callback' => 'absint',
			'auth_callback'     => static fn( bool $allowed, string $key, int $post_id ): bool => current_user_can( 'edit_post', $post_id ),
			'show_in_rest'      => true,
		)
	);
}
add_action( 'init', 'tekseries_blocks_register_poster_meta' );

/**
 * Whether the current user may pick a poster for this video.
 *
 * @param WP_Post $post The attachment.
 */
function tekseries_blocks_can_pick_poster( WP_Post $post ): bool {
	return str_starts_with( (string) $post->post_mime_type, 'video/' )
		&& current_user_can( 'upload_files' )
		&& current_user_can( 'edit_post', $post->ID );
}

/**
 * Adds the "Poster frame" row to a video's details. The row holds only a
 * placeholder the script fills; it has no inputs, so core saves nothing from it.
 *
 * @param array<string, mixed> $fields Attachment fields.
 * @param WP_Post              $post   The attachment.
 * @return array<string, mixed>
 */
function tekseries_blocks_poster_field( array $fields, WP_Post $post ): array {
	if ( ! tekseries_blocks_can_pick_poster( $post ) ) {
		return $fields;
	}

	$poster   = (int) get_post_thumbnail_id( $post );
	$in_album = has_term( '', 'media_album', $post );

	$fields['tekseries_poster'] = array(
		'label' => __( 'Poster frame', 'tekseries-blocks' ),
		'input' => 'html',
		'html'  => sprintf(
			'<div class="ts-poster-picker" data-id="%1$d" data-src="%2$s" data-title="%3$s" data-poster="%4$d" data-poster-url="%5$s" data-in-album="%6$d"><p class="description">%7$s</p></div>',
			$post->ID,
			esc_url( (string) wp_get_attachment_url( $post->ID ) ),
			esc_attr( get_the_title( $post ) ),
			$poster,
			esc_url( $poster ? (string) wp_get_attachment_image_url( $poster, 'medium' ) : '' ),
			$in_album ? 1 : 0,
			esc_html__( 'Picking a frame needs JavaScript. You can still set a picture as the featured image.', 'tekseries-blocks' )
		),
	);

	return $fields;
}
add_filter( 'attachment_fields_to_edit', 'tekseries_blocks_poster_field', 10, 2 );

/**
 * Loads the picker wherever the Media Library's details can show: with the
 * media modal, and on a video's "Edit Media" screen. Admin only.
 */
function tekseries_blocks_enqueue_video_poster(): void {
	$asset_file = dirname( __DIR__ ) . '/build/video-poster/index.asset.php';
	if ( ! is_admin() || ! current_user_can( 'upload_files' ) || ! file_exists( $asset_file ) ) {
		return;
	}

	$asset = require $asset_file;
	$url   = plugins_url( 'build/video-poster/', __DIR__ );

	wp_enqueue_script( 'tekseries-video-poster', $url . 'index.js', $asset['dependencies'], $asset['version'], true );
	wp_set_script_translations( 'tekseries-video-poster', 'tekseries-blocks' );
	wp_enqueue_style( 'tekseries-video-poster', $url . 'index.css', array(), $asset['version'] );
}
add_action( 'wp_enqueue_media', 'tekseries_blocks_enqueue_video_poster' );

/**
 * The "Edit Media" screen draws the details without the media modal.
 *
 * @param string $hook_suffix The admin page.
 */
function tekseries_blocks_enqueue_video_poster_on_edit( string $hook_suffix ): void {
	if ( 'post.php' === $hook_suffix && 'attachment' === get_current_screen()?->post_type ) {
		tekseries_blocks_enqueue_video_poster();
	}
}
add_action( 'admin_enqueue_scripts', 'tekseries_blocks_enqueue_video_poster_on_edit' );
