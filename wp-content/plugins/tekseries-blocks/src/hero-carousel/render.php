<?php
/**
 * Hero Carousel: its inner blocks (Covers) as slides, one in view at a time.
 *
 * The track scrolls sideways and snaps to each slide, so visitors can swipe
 * it; the dots are links to the slides' ids, so they work without JavaScript.
 * With it (view.ts) the dots follow the slide in view, a dot moves the slides
 * without moving the page, and the slides can change by themselves, with a
 * pause button. One slide alone renders as it is, with no dots.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

$tekseries_total = count( $block->inner_blocks );
if ( ! $tekseries_total ) {
	return;
}

// Each slide's outer tag gets an id for its dot and, with several slides, the
// carousel roles.
$tekseries_prefix = wp_unique_id( 'ts-slide-' );
$tekseries_slides = array();
foreach ( $block->inner_blocks as $tekseries_index => $tekseries_inner ) {
	$tekseries_tags = new WP_HTML_Tag_Processor( $tekseries_inner->render() );
	if ( ! $tekseries_tags->next_tag() ) {
		continue;
	}
	$tekseries_id = $tekseries_tags->get_attribute( 'id' );
	$tekseries_id = is_string( $tekseries_id ) && '' !== $tekseries_id ? $tekseries_id : $tekseries_prefix . '-' . ( $tekseries_index + 1 );
	$tekseries_tags->set_attribute( 'id', $tekseries_id );
	if ( $tekseries_total > 1 ) {
		$tekseries_tags->set_attribute( 'role', 'group' );
		$tekseries_tags->set_attribute( 'aria-roledescription', __( 'slide', 'tekseries-blocks' ) );
		/* translators: 1: this slide's number, 2: number of slides. */
		$tekseries_tags->set_attribute( 'aria-label', sprintf( __( '%1$d of %2$d', 'tekseries-blocks' ), $tekseries_index + 1, $tekseries_total ) );
	}
	// Only the first slide is in view at first: the photos of the others load
	// behind it, so they are there before their slide comes.
	if ( $tekseries_index > 0 ) {
		while ( $tekseries_tags->next_tag( array( 'class_name' => 'wp-block-cover__image-background' ) ) ) {
			$tekseries_tags->set_attribute( 'fetchpriority', 'low' );
		}
	}
	$tekseries_slides[ $tekseries_id ] = $tekseries_tags->get_updated_html();
}

$tekseries_many  = count( $tekseries_slides ) > 1;
$tekseries_auto  = $tekseries_many && ! empty( $attributes['autoplay'] );
$tekseries_extra = array();
$tekseries_track = '';
if ( $tekseries_total > 1 ) {
	$tekseries_extra = array(
		'role'                 => 'region',
		'aria-roledescription' => __( 'carousel', 'tekseries-blocks' ),
	);
	if ( empty( $attributes['ariaLabel'] ) ) {
		$tekseries_extra['aria-label'] = __( 'Highlights', 'tekseries-blocks' );
	}
}
if ( $tekseries_many ) {
	// For the script: the slide in view, whether the slides may change by
	// themselves here and are doing so, and how many waits were passed over.
	$tekseries_extra['data-wp-interactive'] = 'tekseries/hero-carousel';
	$tekseries_extra['data-wp-context']     = wp_json_encode(
		array(
			'current' => (string) array_key_first( $tekseries_slides ),
			'auto'    => false,
			'playing' => false,
			'waits'   => 0,
		)
	);
	if ( $tekseries_auto ) {
		$tekseries_extra['data-wp-init']  = 'callbacks.start';
		$tekseries_extra['data-wp-watch'] = 'callbacks.rotate';
	}
	$tekseries_track = ' data-wp-init="actions.follow" data-wp-on--scroll="actions.follow"';
}
?>
<div <?php echo get_block_wrapper_attributes( $tekseries_extra ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<div class="ts-carousel__track"<?php echo $tekseries_track; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- fixed directive attributes. ?>>
		<?php echo implode( '', $tekseries_slides ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inner blocks are already rendered and escaped. ?>
	</div>
	<?php if ( $tekseries_many ) : ?>
		<div class="ts-carousel__controls">
			<?php if ( $tekseries_auto ) : ?>
				<?php // Shown by the script, which is what changes the slides. ?>
				<button type="button" class="ts-carousel__pause" hidden data-wp-bind--hidden="!context.auto" data-wp-on--click="actions.toggle">
					<span data-wp-bind--hidden="!context.playing">
						<?php echo tekseries_blocks_icon_svg( 'pause' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
						<span class="screen-reader-text"><?php esc_html_e( 'Pause the slides', 'tekseries-blocks' ); ?></span>
					</span>
					<span data-wp-bind--hidden="context.playing">
						<?php echo tekseries_blocks_icon_svg( 'play_arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
						<span class="screen-reader-text"><?php esc_html_e( 'Play the slides', 'tekseries-blocks' ); ?></span>
					</span>
				</button>
			<?php endif; ?>
			<nav class="ts-carousel__dots" aria-label="<?php esc_attr_e( 'Slides', 'tekseries-blocks' ); ?>">
				<?php foreach ( array_keys( $tekseries_slides ) as $tekseries_index => $tekseries_id ) : ?>
					<a href="#<?php echo esc_attr( $tekseries_id ); ?>" <?php echo wp_interactivity_data_wp_context( array( 'id' => (string) $tekseries_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the context attribute. ?> data-wp-bind--aria-current="state.isCurrent" data-wp-on--click="actions.show">
						<span class="screen-reader-text">
							<?php
							/* translators: %d: slide number. */
							echo esc_html( sprintf( __( 'Slide %d', 'tekseries-blocks' ), $tekseries_index + 1 ) );
							?>
						</span>
					</a>
				<?php endforeach; ?>
			</nav>
		</div>
	<?php endif; ?>
</div>
