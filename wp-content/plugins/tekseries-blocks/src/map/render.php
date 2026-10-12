<?php
/**
 * Map: a Google Maps embed in a frame.
 *
 * Only an address under Google Maps' own embed path is printed, so the block
 * can't be used to frame anything else. The frame loads lazily: nothing is
 * asked of Google until a visitor scrolls near the map.
 *
 * @package TekSeries
 *
 * @var array $attributes Block attributes.
 */

$tekseries_src = (string) ( $attributes['src'] ?? '' );
if ( ! preg_match( '#^https://www\.google\.com/maps/embed[?/]#', $tekseries_src ) ) {
	return;
}
$tekseries_title = trim( (string) ( $attributes['title'] ?? '' ) );
?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<iframe
		src="<?php echo esc_url( $tekseries_src ); ?>"
		title="<?php echo esc_attr( '' !== $tekseries_title ? $tekseries_title : __( 'Map', 'tekseries-blocks' ) ); ?>"
		loading="lazy"
		referrerpolicy="no-referrer-when-downgrade"
		allowfullscreen
	></iframe>
</div>
