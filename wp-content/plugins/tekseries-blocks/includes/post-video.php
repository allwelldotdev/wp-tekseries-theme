<?php
/**
 * A news post's video: a file from the Media Library or a YouTube or Vimeo
 * link, set in the post's "Video" fields (includes/acf.php) and shown by the
 * Post Video block as a card that opens it in the viewer.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds the address of the embedded player for a YouTube or Vimeo link.
 *
 * Only these two services are embedded, from an address built here: the
 * video's ID is all that is taken from the link. YouTube is asked through
 * its no-cookie domain, Vimeo with "do not track".
 *
 * @param string $url The link an editor entered.
 * @return string|null The player's address; null for any other link.
 */
function tekseries_blocks_video_embed( string $url ): ?string {
	$parts = wp_parse_url( trim( $url ) );
	if ( ! is_array( $parts ) || ! in_array( $parts['scheme'] ?? '', array( 'http', 'https' ), true ) ) {
		return null;
	}

	$host = (string) preg_replace( '/^(www|m)\./', '', strtolower( (string) ( $parts['host'] ?? '' ) ) );
	$path = trim( (string) ( $parts['path'] ?? '' ), '/' );
	parse_str( (string) ( $parts['query'] ?? '' ), $query );

	$youtube = null;
	if ( 'youtu.be' === $host ) {
		$youtube = (string) strtok( $path, '/' );
	} elseif ( in_array( $host, array( 'youtube.com', 'youtube-nocookie.com' ), true ) ) {
		if ( 'watch' === $path ) {
			$youtube = is_string( $query['v'] ?? null ) ? $query['v'] : '';
		} elseif ( preg_match( '#^(?:embed|shorts|live)/([^/]+)$#', $path, $found ) ) {
			$youtube = $found[1];
		}
	}
	if ( null !== $youtube ) {
		return preg_match( '/^[A-Za-z0-9_-]{11}$/', $youtube ) ? "https://www.youtube-nocookie.com/embed/$youtube?autoplay=1&rel=0" : null;
	}

	// An unlisted Vimeo video carries a second, private part: vimeo.com/123456789/abcdef0123.
	$vimeo = array();
	if ( 'vimeo.com' === $host ) {
		preg_match( '#^(?:channels/[^/]+/|groups/[^/]+/videos/)?(\d+)(?:/([0-9a-f]+))?$#i', $path, $vimeo );
	} elseif ( 'player.vimeo.com' === $host && preg_match( '#^video/(\d+)$#', $path, $vimeo ) ) {
		if ( is_string( $query['h'] ?? null ) && ctype_xdigit( $query['h'] ) ) {
			$vimeo[2] = $query['h'];
		}
	}
	if ( $vimeo ) {
		return "https://player.vimeo.com/video/{$vimeo[1]}?autoplay=1&dnt=1" . ( isset( $vimeo[2] ) ? '&h=' . strtolower( $vimeo[2] ) : '' );
	}

	return null;
}

/**
 * Returns a post's video, as its card and the viewer need it.
 *
 * A file is used before a link when both are set. Nothing comes back unless
 * the "Show a video" switch is on and there is a video file, or a link to a
 * YouTube or Vimeo video.
 *
 * @param int $post_id The post.
 * @return array{item: array<string, mixed>, thumbnail: int}|null
 *         `item` is what the viewer opens (see tekseries_blocks_lightbox_item());
 *         `thumbnail` is the card's picture, 0 for none.
 */
function tekseries_blocks_post_video( int $post_id ): ?array {
	if ( ! function_exists( 'get_field' ) || ! get_field( 'tekseries_video', $post_id ) ) {
		return null;
	}

	$file  = absint( get_field( 'tekseries_video_file', $post_id, false ) );
	$link  = trim( (string) get_field( 'tekseries_video_link', $post_id, false ) );
	$thumb = absint( get_field( 'tekseries_video_thumbnail', $post_id, false ) );
	$thumb = $thumb && wp_attachment_is_image( $thumb ) ? $thumb : 0;

	$item = null;
	if ( $file && str_starts_with( (string) get_post_mime_type( $file ), 'video/' ) ) {
		$item = tekseries_blocks_lightbox_item( (string) wp_get_attachment_url( $file ), $file );
		// Without a thumbnail of its own, the card shows the file's poster.
		$thumb = $thumb ? $thumb : (int) get_post_thumbnail_id( $file );
	}
	if ( null === $item && '' !== $link ) {
		$embed = tekseries_blocks_video_embed( $link );
		if ( null === $embed ) {
			return null;
		}
		// Without JavaScript the card's link opens the video's own page.
		$item = array(
			'href'    => $link,
			'video'   => false,
			'embed'   => $embed,
			'caption' => '',
			'thumb'   => '',
			'srcset'  => '',
			'width'   => 16,
			'height'  => 9,
		);
	}
	if ( null === $item ) {
		return null;
	}

	if ( '' === $item['caption'] ) {
		$item['caption'] = wp_strip_all_tags( get_the_title( $post_id ) );
	}
	if ( $thumb ) {
		$item['thumb'] = (string) wp_get_attachment_image_url( $thumb, 'large' );
	}

	return array(
		'item'      => $item,
		'thumbnail' => $thumb,
	);
}
