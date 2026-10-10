<?php
/**
 * Hero Carousel: its inner blocks (Covers) as slides, one in view at a time.
 *
 * The track scrolls sideways and snaps to each slide, so visitors can swipe
 * it; the dots are links to the slides' ids, so they work without JavaScript.
 * One slide alone renders as it is, with no dots.
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
	$tekseries_slides[ $tekseries_id ] = $tekseries_tags->get_updated_html();
}

$tekseries_extra = array();
if ( $tekseries_total > 1 ) {
	$tekseries_extra = array(
		'role'                 => 'region',
		'aria-roledescription' => __( 'carousel', 'tekseries-blocks' ),
	);
	if ( empty( $attributes['ariaLabel'] ) ) {
		$tekseries_extra['aria-label'] = __( 'Highlights', 'tekseries-blocks' );
	}
}
?>
<div <?php echo get_block_wrapper_attributes( $tekseries_extra ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<div class="ts-carousel__track">
		<?php echo implode( '', $tekseries_slides ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inner blocks are already rendered and escaped. ?>
	</div>
	<?php if ( count( $tekseries_slides ) > 1 ) : ?>
		<nav class="ts-carousel__dots" aria-label="<?php esc_attr_e( 'Slides', 'tekseries-blocks' ); ?>">
			<?php foreach ( array_keys( $tekseries_slides ) as $tekseries_index => $tekseries_id ) : ?>
				<a href="#<?php echo esc_attr( $tekseries_id ); ?>">
					<span class="screen-reader-text">
						<?php
						/* translators: %d: slide number. */
						echo esc_html( sprintf( __( 'Slide %d', 'tekseries-blocks' ), $tekseries_index + 1 ) );
						?>
					</span>
				</a>
			<?php endforeach; ?>
		</nav>
	<?php endif; ?>
</div>
