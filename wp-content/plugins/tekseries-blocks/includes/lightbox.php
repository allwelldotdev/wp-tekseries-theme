<?php
/**
 * The viewer: the Gallery's full-screen dialog, and the links elsewhere on
 * the site that open one photo or video in it.
 *
 * A block with the class "ts-lightbox-open" is an opener. Its link to a photo
 * or a video file opens that file in the viewer; without JavaScript the link
 * opens the file itself. A Featured Image block with the class gets such a
 * link around its picture, to the full-size file.
 *
 * The viewer also plays a YouTube or Vimeo video in an embedded player (the
 * Post Video block, includes/post-video.php). The player's frame is on the
 * page only while the viewer shows it, so nothing is asked of those services
 * before a visitor opens the video, and closing the viewer stops it.
 *
 * The dialog is printed once per page: by the Gallery block where there is
 * one, otherwise in the footer of a page with an opener.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Remembers what this page has asked of the viewer and whether it is printed.
 *
 * @param string    $name "wanted" (an opener is on the page) or "printed".
 * @param bool|null $set  The new value; null only reads.
 * @return bool
 */
function tekseries_blocks_lightbox_flag( string $name, ?bool $set = null ): bool {
	static $flags = array(
		'wanted'  => false,
		'printed' => false,
	);
	if ( null !== $set ) {
		$flags[ $name ] = $set;
	}
	return $flags[ $name ] ?? false;
}

/**
 * Hands the viewer's script the texts it fills in as it steps. The empty
 * caption keeps `alt` on the viewer's image until the script takes over.
 */
function tekseries_blocks_lightbox_setup(): void {
	wp_interactivity_config(
		'tekseries/media-gallery',
		array(
			/* translators: 1: position of the item on show, 2: number of items loaded. */
			'position' => __( '%1$s of %2$s', 'tekseries-blocks' ),
			/* translators: %s: position of an item among the loaded ones. */
			'thumb'    => __( 'Show item %s', 'tekseries-blocks' ),
			// The title of an embedded player whose video has no caption.
			'player'   => __( 'Video player', 'tekseries-blocks' ),
		)
	);
	wp_interactivity_state( 'tekseries/media-gallery', array( 'caption' => '' ) );
}

/**
 * Returns the viewer, the first time it is asked for on a page. Closed, a
 * <dialog> is not rendered, so it changes nothing without JavaScript.
 *
 * @return string The dialog; empty when the page has it already.
 */
function tekseries_blocks_lightbox_markup(): string {
	if ( tekseries_blocks_lightbox_flag( 'printed' ) ) {
		return '';
	}
	tekseries_blocks_lightbox_flag( 'printed', true );
	tekseries_blocks_lightbox_setup();

	ob_start();
	?>
	<dialog
		class="ts-lightbox"
		aria-label="<?php esc_attr_e( 'Media viewer', 'tekseries-blocks' ); ?>"
		data-wp-class--is-single="state.isSingle"
		data-wp-watch="callbacks.syncDialog"
		data-wp-on--close="actions.close"
		data-wp-on--keydown="actions.key"
	>
		<div class="ts-lightbox__bar">
			<p class="ts-lightbox__brand">
				<?php echo tekseries_blocks_icon_svg( 'photo_library' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<?php esc_html_e( 'TekSeries Gallery', 'tekseries-blocks' ); ?>
			</p>
			<p class="ts-lightbox__counter">
				<span aria-hidden="true"><span data-wp-text="state.position"></span> <span class="ts-lightbox__of">/ <span data-wp-text="state.count"></span></span></span>
				<span class="screen-reader-text" aria-live="polite" data-wp-text="state.announcement"></span>
			</p>
			<button type="button" class="ts-lightbox__button ts-lightbox__close" aria-label="<?php esc_attr_e( 'Close viewer', 'tekseries-blocks' ); ?>" data-wp-on--click="actions.close">
				<?php echo tekseries_blocks_icon_svg( 'close' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			</button>
		</div>

		<div class="ts-lightbox__stage" data-wp-on--pointerdown="actions.press" data-wp-on--pointerup="actions.release">
			<figure class="ts-lightbox__figure">
				<div class="ts-lightbox__frame" data-wp-bind--style="state.frameStyle">
					<img class="ts-lightbox__photo" alt="" sizes="(max-width: 640px) 100vw, 1100px" data-wp-bind--alt="state.caption" data-wp-bind--src="state.photoSrc" data-wp-bind--srcset="state.photoSrcset" data-wp-bind--hidden="!state.isPhoto">
					<video class="ts-lightbox__video" controls playsinline preload="metadata" data-wp-bind--src="state.videoSrc" data-wp-bind--poster="state.poster" data-wp-bind--hidden="!state.isVideo" data-wp-watch="callbacks.stopVideo"></video>
					<?php // A YouTube or Vimeo player: made when the viewer opens on one, taken away when it closes. ?>
					<template data-wp-each--player="state.players" data-wp-each-key="context.player.src">
						<iframe class="ts-lightbox__embed" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" data-wp-bind--src="context.player.src" data-wp-bind--title="context.player.title"></iframe>
					</template>
				</div>
				<figcaption class="ts-lightbox__caption" data-wp-text="state.caption"></figcaption>
			</figure>
			<button type="button" class="ts-lightbox__button ts-lightbox__step ts-lightbox__step--previous" aria-label="<?php esc_attr_e( 'Previous', 'tekseries-blocks' ); ?>" data-wp-on--click="actions.previous">
				<?php echo tekseries_blocks_icon_svg( 'chevron_left' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			</button>
			<button type="button" class="ts-lightbox__button ts-lightbox__step ts-lightbox__step--next" aria-label="<?php esc_attr_e( 'Next', 'tekseries-blocks' ); ?>" data-wp-on--click="actions.next">
				<?php echo tekseries_blocks_icon_svg( 'chevron_right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			</button>
		</div>

		<?php // One thumbnail per loaded tile, built by the script. ?>
		<div class="ts-lightbox__thumbs" role="group" aria-label="<?php esc_attr_e( 'All items', 'tekseries-blocks' ); ?>" data-wp-watch="callbacks.revealThumb">
			<template data-wp-each--thumb="state.items" data-wp-each-key="context.thumb.id">
				<button type="button" class="ts-lightbox__thumb" data-wp-on--click="actions.show" data-wp-bind--aria-label="context.thumb.label" data-wp-bind--aria-current="state.isThumbCurrent">
					<img alt="" data-wp-bind--src="context.thumb.thumb" data-wp-bind--hidden="!context.thumb.thumb">
					<span class="ts-lightbox__thumb-play" data-wp-bind--hidden="!context.thumb.video"><?php echo tekseries_blocks_icon_svg( 'play_arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></span>
				</button>
			</template>
		</div>

		<?php // Phones: the side buttons give way to this bar. ?>
		<div class="ts-lightbox__foot">
			<button type="button" class="ts-lightbox__button" aria-label="<?php esc_attr_e( 'Previous', 'tekseries-blocks' ); ?>" data-wp-on--click="actions.previous">
				<?php echo tekseries_blocks_icon_svg( 'chevron_left' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			</button>
			<p class="ts-lightbox__hint">
				<?php echo tekseries_blocks_icon_svg( 'swipe' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<?php esc_html_e( 'Swipe to browse', 'tekseries-blocks' ); ?>
			</p>
			<button type="button" class="ts-lightbox__button ts-lightbox__button--next" aria-label="<?php esc_attr_e( 'Next', 'tekseries-blocks' ); ?>" data-wp-on--click="actions.next">
				<?php echo tekseries_blocks_icon_svg( 'chevron_right' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			</button>
		</div>
	</dialog>
	<?php
	return (string) ob_get_clean();
}

/**
 * Describes a photo or video file for the viewer.
 *
 * @param string $url The file's address.
 * @param int    $id  Its attachment, when the caller knows it.
 * @return array<string, mixed>|null Null when the address is not a photo or a video.
 */
function tekseries_blocks_lightbox_item( string $url, int $id = 0 ): ?array {
	if ( '' === $url || '#' === $url[0] ) {
		return null;
	}

	$id    = $id ? $id : attachment_url_to_postid( $url );
	$media = $id ? get_post( $id ) : null;
	$mime  = $media instanceof WP_Post ? (string) $media->post_mime_type : (string) wp_check_filetype( (string) wp_parse_url( $url, PHP_URL_PATH ) )['type'];
	$video = str_starts_with( $mime, 'video/' );
	if ( ! $video && ! str_starts_with( $mime, 'image/' ) ) {
		return null;
	}

	$item = array(
		'href'    => $url,
		'video'   => $video,
		'embed'   => '',
		'caption' => '',
		'thumb'   => '',
		'srcset'  => '',
		'width'   => $video ? 16 : 4,
		'height'  => $video ? 9 : 3,
	);
	if ( ! $media instanceof WP_Post ) {
		return $item;
	}

	$meta = wp_get_attachment_metadata( $media->ID );
	if ( ! empty( $meta['width'] ) && ! empty( $meta['height'] ) ) {
		$item['width']  = (int) $meta['width'];
		$item['height'] = (int) $meta['height'];
	}
	$item['caption'] = tekseries_blocks_media_label( $media );
	if ( $video ) {
		// A video shows its featured image, if it has one, as the poster.
		$item['thumb'] = (string) wp_get_attachment_image_url( (int) get_post_thumbnail_id( $media ), 'large' );
	} else {
		$item['srcset'] = (string) wp_get_attachment_image_srcset( $media->ID, 'full' );
	}
	return $item;
}

/**
 * Makes the link of a block with the class "ts-lightbox-open" open the
 * viewer, when it leads to a photo or a video file.
 *
 * @param string   $content  Rendered block.
 * @param array    $block    Parsed block.
 * @param WP_Block $instance The block.
 * @return string
 */
function tekseries_blocks_lightbox_opener( $content, $block, $instance ) {
	$class = (string) ( $block['attrs']['className'] ?? '' );
	if ( ! in_array( 'ts-lightbox-open', explode( ' ', $class ), true ) ) {
		return $content;
	}

	$content = (string) $content;
	$id      = 0;
	// A Featured Image block has no link to its file: it gets one here.
	if ( 'core/post-featured-image' === ( $block['blockName'] ?? '' ) && ! str_contains( $content, '<a ' ) ) {
		$id  = (int) get_post_thumbnail_id( $instance->context['postId'] ?? null );
		$url = $id ? (string) wp_get_attachment_url( $id ) : '';
		if ( '' === $url ) {
			return $content;
		}
		$alt = trim( (string) get_post_meta( $id, '_wp_attachment_image_alt', true ) );
		/* translators: %s: what the picture shows. */
		$name    = '' !== $alt ? sprintf( __( 'View full size: %s', 'tekseries-blocks' ), $alt ) : __( 'View the picture full size', 'tekseries-blocks' );
		$open    = '<a href="' . esc_url( $url ) . '" aria-label="' . esc_attr( $name ) . '">';
		$content = (string) preg_replace_callback( '#<img\b[^>]*>#', static fn( array $img ): string => $open . $img[0] . '</a>', $content, 1 );
	}

	$tags = new WP_HTML_Tag_Processor( $content );
	if ( ! $tags->next_tag( 'a' ) ) {
		return $content;
	}
	$item = tekseries_blocks_lightbox_item( (string) $tags->get_attribute( 'href' ), $id );
	if ( null === $item ) {
		return $content;
	}

	if ( ! tekseries_blocks_lightbox_request() ) {
		return $content;
	}
	foreach ( tekseries_blocks_lightbox_directives( $item ) as $name => $value ) {
		$tags->set_attribute( $name, $value );
	}

	return $tags->get_updated_html();
}
add_filter( 'render_block', 'tekseries_blocks_lightbox_opener', 10, 3 );

/**
 * Asks for the viewer on this page: loads its script and styles, which are
 * the Gallery block's, and has the dialog printed.
 *
 * @return bool False when the Gallery block is not registered (the plugin is not built).
 */
function tekseries_blocks_lightbox_request(): bool {
	$gallery = WP_Block_Type_Registry::get_instance()->get_registered( 'tekseries/media-gallery' );
	if ( ! $gallery ) {
		return false;
	}
	array_map( 'wp_enqueue_script_module', $gallery->view_script_module_ids );
	array_map( 'wp_enqueue_style', $gallery->style_handles );
	tekseries_blocks_lightbox_setup();
	tekseries_blocks_lightbox_flag( 'wanted', true );
	return true;
}

/**
 * The attributes that make a link open an item in the viewer.
 *
 * @param array<string, mixed> $item The item, as tekseries_blocks_lightbox_item() describes it.
 * @return array<string, string> Attribute values by name, not yet escaped.
 */
function tekseries_blocks_lightbox_directives( array $item ): array {
	return array(
		'data-wp-interactive' => 'tekseries/media-gallery',
		'data-wp-context'     => (string) wp_json_encode( array( 'opener' => $item ), JSON_HEX_TAG | JSON_HEX_AMP ),
		'data-wp-on--click'   => 'actions.openOne',
	);
}

/**
 * Prints the viewer in the footer of a page that has an opener and no
 * Gallery block (which prints it itself).
 */
function tekseries_blocks_lightbox_footer(): void {
	if ( ! tekseries_blocks_lightbox_flag( 'wanted' ) ) {
		return;
	}
	$dialog = tekseries_blocks_lightbox_markup();
	if ( '' === $dialog ) {
		return;
	}
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built above from escaped parts; directives are filled in by core.
	echo wp_interactivity_process_directives( '<div class="ts-lightbox-host" data-wp-interactive="tekseries/media-gallery">' . $dialog . '</div>' );
}
add_action( 'wp_footer', 'tekseries_blocks_lightbox_footer', 5 );

/**
 * Block binding callback for the `tekseries/featured-image` source.
 *
 * Key "url": the address of the post's featured image, full size.
 *
 * @param array    $args  Binding arguments: `key`.
 * @param WP_Block $block The bound block: its context names the post.
 * @return string|null Null for an unknown key.
 */
function tekseries_blocks_featured_image_value( array $args, WP_Block $block ): ?string {
	if ( 'url' !== ( $args['key'] ?? '' ) ) {
		return null;
	}
	$id = (int) get_post_thumbnail_id( $block->context['postId'] ?? null );
	return $id ? (string) wp_get_attachment_url( $id ) : '';
}

/**
 * Registers the `tekseries/featured-image` binding source.
 */
function tekseries_blocks_register_featured_image_source(): void {
	register_block_bindings_source(
		'tekseries/featured-image',
		array(
			'label'              => __( 'Featured image', 'tekseries-blocks' ),
			'get_value_callback' => 'tekseries_blocks_featured_image_value',
			'uses_context'       => array( 'postId' ),
		)
	);
}
add_action( 'init', 'tekseries_blocks_register_featured_image_source' );

/**
 * Leaves out the poster frame (a Group with the class "ts-poster") of a post
 * without a featured image: its caption and link would have nothing to show.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function tekseries_blocks_render_poster_frame( $content, $block ) {
	$class = (string) ( $block['attrs']['className'] ?? '' );
	if ( ! in_array( 'ts-poster', explode( ' ', $class ), true ) ) {
		return $content;
	}
	return has_post_thumbnail() ? $content : '';
}
add_filter( 'render_block_core/group', 'tekseries_blocks_render_poster_frame', 10, 2 );
