<?php
/**
 * Stat: a figure that counts up to its number, e.g. "312+".
 *
 * The count is CSS only (style.scss), so it needs no JavaScript. The visible
 * figure is drawn by CSS and hidden from assistive technology, which reads
 * the plain text copy instead; that copy is also what shows without CSS.
 * With JavaScript, a figure below the screen when the page opens waits and
 * counts once it is scrolled to (the reveal script, src/reveal/view.ts).
 *
 * @package TekSeries
 *
 * @var array $attributes Block attributes.
 */

$tekseries_value  = max( 0, (int) ( $attributes['value'] ?? 0 ) );
$tekseries_suffix = (string) ( $attributes['suffix'] ?? '' );
$tekseries_extra  = array(
	'data-wp-interactive' => 'tekseries/reveal',
	'data-wp-init'        => 'callbacks.watch',
);
?>
<p <?php echo get_block_wrapper_attributes( $tekseries_extra ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<span aria-hidden="true"><span class="ts-stat__number" style="<?php echo esc_attr( '--ts-stat-to:' . $tekseries_value ); ?>"></span><span class="ts-stat__suffix"><?php echo esc_html( $tekseries_suffix ); ?></span></span>
	<span class="screen-reader-text"><?php echo esc_html( $tekseries_value . $tekseries_suffix ); ?></span>
</p>
