<?php
/**
 * Media Gallery: the photos and videos in albums, newest year first, with
 * type and year filters and a "Load more" link. The filters and Load more are
 * plain links and each tile links to its full file, so the gallery works
 * without JavaScript. With it (view.ts), a tile opens in the viewer below (a
 * <dialog> that steps through the tiles on the page), and the filters and
 * Load more fetch their page and swap this block's content in place: the
 * block is a router region, so the server stays the one place that builds it.
 *
 * URL parameters: media_type (photo or video), media_year (a year an album
 * carries), media_shown (how many items are loaded). `type` and `year` are
 * taken: WordPress reads `year` as a date archive.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

$tekseries_items = tekseries_blocks_gallery_items();
$tekseries_years = array_values( array_unique( array_filter( array_column( $tekseries_items, 'year' ) ) ) );
$tekseries_kinds = array_unique( array_column( $tekseries_items, 'kind' ) );

// phpcs:disable WordPress.Security.NonceVerification.Recommended -- public filter links; they only narrow a read-only list.
$tekseries_type  = isset( $_GET['media_type'] ) && is_string( $_GET['media_type'] ) ? sanitize_key( wp_unslash( $_GET['media_type'] ) ) : '';
$tekseries_year  = isset( $_GET['media_year'] ) ? absint( $_GET['media_year'] ) : 0;
$tekseries_shown = isset( $_GET['media_shown'] ) ? absint( $_GET['media_shown'] ) : 0;
// phpcs:enable WordPress.Security.NonceVerification.Recommended

$tekseries_type = in_array( $tekseries_type, array( 'photo', 'video' ), true ) ? $tekseries_type : '';
$tekseries_year = in_array( $tekseries_year, $tekseries_years, true ) ? $tekseries_year : 0;

// The items of a type ('' for both) from a year (0 for every year).
$tekseries_match = static fn( string $type, int $year ): array => array_values(
	array_filter(
		$tekseries_items,
		static fn( array $item ): bool => ( '' === $type || $type === $item['kind'] ) && ( 0 === $year || $year === $item['year'] )
	)
);

$tekseries_list     = $tekseries_match( $tekseries_type, $tekseries_year );
$tekseries_total    = count( $tekseries_list );
$tekseries_per_page = max( 1, (int) ( $attributes['perPage'] ?? 12 ) );
$tekseries_shown    = min( $tekseries_total, max( $tekseries_per_page, $tekseries_shown ) );
$tekseries_base     = (string) get_permalink();

// Links land on the gallery (#media), not the top of the page.
$tekseries_url = static fn( string $type, int $year, int $shown = 0, string $target = 'media' ): string => add_query_arg(
	array_filter(
		array(
			'media_type'  => $type,
			'media_year'  => $year,
			'media_shown' => $shown,
		)
	),
	$tekseries_base
) . '#' . $target;

$tekseries_types = array(
	''      => array( __( 'All', 'tekseries-blocks' ), tekseries_blocks_icon_svg( 'grid_view' ) ),
	'photo' => array( __( 'Photos', 'tekseries-blocks' ), tekseries_blocks_icon_svg( 'photo_library' ) ),
	'video' => array( __( 'Videos', 'tekseries-blocks' ), tekseries_blocks_icon_svg( 'smart_display' ) ),
);

// A filter group is worth showing only when it has something to tell apart.
$tekseries_by_type = count( $tekseries_kinds ) > 1;
$tekseries_by_year = count( $tekseries_years ) > 1;

// What the chosen filters give: "Showing 12 of 32", or why there is nothing.
if ( $tekseries_total ) {
	/* translators: 1: number of items shown, 2: number of items in all. */
	$tekseries_summary = sprintf( __( 'Showing %1$s of %2$s', 'tekseries-blocks' ), number_format_i18n( $tekseries_shown ), number_format_i18n( $tekseries_total ) );
} elseif ( 'video' === $tekseries_type ) {
	/* translators: %s: a year. */
	$tekseries_summary = $tekseries_year ? sprintf( __( 'No videos from %s yet', 'tekseries-blocks' ), $tekseries_year ) : __( 'No videos yet', 'tekseries-blocks' );
} elseif ( 'photo' === $tekseries_type ) {
	/* translators: %s: a year. */
	$tekseries_summary = $tekseries_year ? sprintf( __( 'No photos from %s yet', 'tekseries-blocks' ), $tekseries_year ) : __( 'No photos yet', 'tekseries-blocks' );
} else {
	$tekseries_summary = __( 'No media yet', 'tekseries-blocks' );
}

// For the script: text the viewer fills in as it steps, and the summary, which
// it reads out after an in-place update. The empty caption keeps `alt` on the
// viewer's image until the script takes over.
wp_interactivity_config(
	'tekseries/media-gallery',
	array(
		/* translators: 1: position of the item on show, 2: number of items loaded. */
		'position' => __( '%1$s of %2$s', 'tekseries-blocks' ),
		/* translators: %s: position of an item among the loaded ones. */
		'thumb'    => __( 'Show item %s', 'tekseries-blocks' ),
	)
);
wp_interactivity_state(
	'tekseries/media-gallery',
	array(
		'caption' => '',
		'summary' => $tekseries_summary,
	)
);

$tekseries_wrapper = array(
	'id'                    => 'media',
	'data-wp-interactive'   => 'tekseries/media-gallery',
	'data-wp-router-region' => 'tekseries/media-gallery',
);
?>
<div <?php echo get_block_wrapper_attributes( $tekseries_wrapper ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<?php // The summary again, once the script has updated the block in place: assistive technology reads it out. ?>
	<p class="screen-reader-text" role="status" data-wp-text="state.status"></p>
	<?php if ( $tekseries_items ) : ?>
		<div class="ts-media__bar">
			<?php if ( $tekseries_by_type || $tekseries_by_year ) : ?>
				<nav class="ts-media__filters" aria-label="<?php esc_attr_e( 'Filter media', 'tekseries-blocks' ); ?>">
					<?php if ( $tekseries_by_type ) : ?>
						<div class="ts-media__types" role="group" aria-label="<?php esc_attr_e( 'Show', 'tekseries-blocks' ); ?>">
							<?php foreach ( $tekseries_types as $tekseries_slug => list( $tekseries_name, $tekseries_icon ) ) : ?>
								<a class="ts-media__type" href="<?php echo esc_url( $tekseries_url( $tekseries_slug, $tekseries_year ) ); ?>" data-wp-on--click="actions.navigate" <?php echo $tekseries_slug === $tekseries_type ? 'aria-current="true"' : ''; ?>>
									<?php echo $tekseries_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
									<?php echo esc_html( $tekseries_name ); ?>
									<span class="ts-media__count"><?php echo esc_html( number_format_i18n( count( $tekseries_match( $tekseries_slug, $tekseries_year ) ) ) ); ?></span>
								</a>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>
					<?php if ( $tekseries_by_year ) : ?>
						<div class="ts-media__years" role="group" aria-label="<?php esc_attr_e( 'Filter by year', 'tekseries-blocks' ); ?>">
							<?php foreach ( array_merge( array( 0 ), $tekseries_years ) as $tekseries_option ) : ?>
								<a class="ts-media__year" href="<?php echo esc_url( $tekseries_url( $tekseries_type, $tekseries_option ) ); ?>" data-wp-on--click="actions.navigate" <?php echo $tekseries_option === $tekseries_year ? 'aria-current="true"' : ''; ?>>
									<?php echo $tekseries_option ? esc_html( (string) $tekseries_option ) : esc_html__( 'All years', 'tekseries-blocks' ); ?>
									<span class="ts-media__count"><?php echo esc_html( number_format_i18n( count( $tekseries_match( $tekseries_type, $tekseries_option ) ) ) ); ?></span>
								</a>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>
				</nav>
			<?php endif; ?>
			<?php if ( $tekseries_total ) : ?>
				<p class="ts-media__hint">
					<?php echo tekseries_blocks_icon_svg( 'zoom_in' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
					<?php esc_html_e( 'Select any photo to view it full screen', 'tekseries-blocks' ); ?>
				</p>
			<?php endif; ?>
		</div>
	<?php endif; ?>

	<?php if ( $tekseries_total ) : ?>
		<ul class="ts-media__grid" data-wp-on--click="actions.open">
			<?php
			foreach ( array_slice( $tekseries_list, 0, $tekseries_shown ) as $tekseries_item ) :
				$tekseries_media = $tekseries_item['post'];
				$tekseries_video = 'video' === $tekseries_item['kind'];
				$tekseries_label = tekseries_blocks_media_label( $tekseries_media );
				$tekseries_meta  = wp_get_attachment_metadata( $tekseries_media->ID );
				$tekseries_wide  = (int) ( $tekseries_meta['width'] ?? 0 );
				$tekseries_high  = (int) ( $tekseries_meta['height'] ?? 0 );
				if ( ! $tekseries_wide || ! $tekseries_high ) {
					list( $tekseries_wide, $tekseries_high ) = $tekseries_video ? array( 16, 9 ) : array( 4, 3 );
				}
				$tekseries_ratio = $tekseries_wide . ' / ' . $tekseries_high;
				// Masonry rows the tile takes (style.scss): 40 to a column's width, and 2 for the gap under it.
				$tekseries_rows = max( 1, (int) round( 40 * $tekseries_high / $tekseries_wide ) ) + 2;
				// A video shows its featured image, if it has one, as the poster.
				$tekseries_image = wp_get_attachment_image(
					$tekseries_video ? (int) get_post_thumbnail_id( $tekseries_media ) : $tekseries_media->ID,
					'large',
					false,
					array(
						'alt'   => '',
						'sizes' => '(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw',
					)
				);
				if ( $tekseries_video ) {
					/* translators: %s: the video's caption or title. */
					$tekseries_name = '' !== $tekseries_label ? sprintf( __( 'Play video: %s', 'tekseries-blocks' ), $tekseries_label ) : __( 'Play video', 'tekseries-blocks' );
				} else {
					/* translators: %s: the photo's caption or alt text. */
					$tekseries_name = '' !== $tekseries_label ? sprintf( __( 'View photo: %s', 'tekseries-blocks' ), $tekseries_label ) : __( 'View photo', 'tekseries-blocks' );
				}
				?>
				<li class="ts-media__item" id="media-<?php echo esc_attr( (string) $tekseries_media->ID ); ?>" data-wp-key="media-<?php echo esc_attr( (string) $tekseries_media->ID ); ?>" style="<?php echo esc_attr( '--ts-media-rows:' . $tekseries_rows ); ?>">
					<a class="ts-media__tile<?php echo $tekseries_video ? ' ts-media__tile--video' : ''; ?>" href="<?php echo esc_url( (string) wp_get_attachment_url( $tekseries_media->ID ) ); ?>" aria-label="<?php echo esc_attr( $tekseries_name ); ?>" style="<?php echo esc_attr( 'aspect-ratio:' . $tekseries_ratio ); ?>">
						<?php echo $tekseries_image; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by core's wp_get_attachment_image(). ?>
						<?php if ( $tekseries_video ) : ?>
							<span class="ts-media__play" aria-hidden="true"><?php echo tekseries_blocks_icon_svg( 'play_arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></span>
							<span class="ts-media__badge" aria-hidden="true">
								<?php echo tekseries_blocks_icon_svg( 'smart_display' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
								<?php esc_html_e( 'Video', 'tekseries-blocks' ); ?>
							</span>
						<?php endif; ?>
						<span class="ts-media__veil" aria-hidden="true">
							<span class="ts-media__caption"><?php echo esc_html( $tekseries_label ); ?></span>
							<span class="ts-media__zoom"><?php echo $tekseries_video ? tekseries_blocks_icon_svg( 'play_arrow' ) : tekseries_blocks_icon_svg( 'zoom_in' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></span>
						</span>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>

		<div class="ts-media__more">
			<p class="ts-media__showing"><?php echo esc_html( $tekseries_summary ); ?></p>
			<?php if ( $tekseries_shown < $tekseries_total ) : ?>
				<?php // Lands on the first newly loaded item. ?>
				<a class="ts-media__load" href="<?php echo esc_url( $tekseries_url( $tekseries_type, $tekseries_year, $tekseries_shown + $tekseries_per_page, 'media-' . $tekseries_list[ $tekseries_shown ]['post']->ID ) ); ?>" data-wp-on--click="actions.navigate">
					<?php esc_html_e( 'Load more', 'tekseries-blocks' ); ?>
					<?php echo tekseries_blocks_icon_svg( 'expand_more' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				</a>
			<?php endif; ?>
		</div>

		<?php // The viewer. Closed, a <dialog> is not rendered, so it changes nothing without JavaScript. ?>
		<dialog
			class="ts-lightbox"
			aria-label="<?php esc_attr_e( 'Media viewer', 'tekseries-blocks' ); ?>"
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
						<img class="ts-lightbox__photo" alt="" sizes="(max-width: 640px) 100vw, 1100px" data-wp-bind--alt="state.caption" data-wp-bind--src="state.photoSrc" data-wp-bind--srcset="state.photoSrcset" data-wp-bind--hidden="state.isVideo">
						<video class="ts-lightbox__video" controls playsinline preload="metadata" data-wp-bind--src="state.videoSrc" data-wp-bind--poster="state.poster" data-wp-bind--hidden="!state.isVideo" data-wp-watch="callbacks.stopVideo"></video>
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
	<?php else : ?>
		<div class="ts-media__empty">
			<?php echo tekseries_blocks_icon_svg( 'photo_library' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			<p class="ts-media__empty-title"><?php echo esc_html( $tekseries_summary ); ?></p>
			<?php if ( $tekseries_items ) : ?>
				<a class="ts-media__reset" href="<?php echo esc_url( $tekseries_url( '', 0 ) ); ?>" data-wp-on--click="actions.navigate"><?php esc_html_e( 'Show all media', 'tekseries-blocks' ); ?></a>
			<?php endif; ?>
		</div>
	<?php endif; ?>
</div>
