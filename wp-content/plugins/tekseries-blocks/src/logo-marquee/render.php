<?php
/**
 * Logo Marquee: the logos (Image blocks) as a strip that moves sideways.
 *
 * The movement is CSS only, and only for visitors who haven't asked for less
 * motion; everyone else gets the logos as a still row. The pause control is a
 * checkbox, so it works without JavaScript. The strip repeats the logos to
 * stay full while it moves; the repeats are hidden from assistive technology.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Rendered inner blocks.
 * @var WP_Block $block      Block instance.
 */

$tekseries_count = count( $block->inner_blocks );
if ( ! $tekseries_count ) {
	return;
}

// The repeats are decoration: no alt text, and no ids to clash with the originals.
$tekseries_copy = new WP_HTML_Tag_Processor( $content );
while ( $tekseries_copy->next_tag() ) {
	if ( 'IMG' === $tekseries_copy->get_tag() ) {
		$tekseries_copy->set_attribute( 'alt', '' );
	}
	$tekseries_copy->remove_attribute( 'id' );
}

// The strip slides by half its length and starts over, so each half must be
// wider than the widest container: at least eight logos.
$tekseries_copies = 2 * (int) ceil( 8 / $tekseries_count ) - 1;

$tekseries_extra = array( 'role' => 'region' );
if ( empty( $attributes['ariaLabel'] ) ) {
	$tekseries_extra['aria-label'] = __( 'Logos', 'tekseries-blocks' );
}
?>
<div <?php echo get_block_wrapper_attributes( $tekseries_extra ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<label class="ts-marquee__pause">
		<input type="checkbox" class="ts-marquee__toggle">
		<?php echo tekseries_blocks_icon_svg( 'pause' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
		<?php echo tekseries_blocks_icon_svg( 'play_arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
		<span class="screen-reader-text"><?php esc_html_e( 'Pause the moving logos', 'tekseries-blocks' ); ?></span>
	</label>
	<div class="ts-marquee__viewport">
		<div class="ts-marquee__strip">
			<div class="ts-marquee__set">
				<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inner blocks are already rendered and escaped. ?>
			</div>
			<?php
			echo str_repeat( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- the same rendered inner blocks.
				'<div class="ts-marquee__set" aria-hidden="true" inert>' . $tekseries_copy->get_updated_html() . '</div>',
				$tekseries_copies
			);
			?>
		</div>
	</div>
</div>
