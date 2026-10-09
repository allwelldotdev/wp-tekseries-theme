<?php
/**
 * Server render for the Post Tone block.
 *
 * Wraps the inner blocks in the post's tone (stored meta, plum if none) and
 * adds its topic icon as decoration. Outside a post (no postId context) it
 * renders plum with no icon.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Rendered inner blocks.
 * @var WP_Block $block      Block instance.
 */

$tekseries_post_id = (int) ( $block->context['postId'] ?? 0 );
$tekseries_variant = 'banner' === ( $attributes['variant'] ?? '' ) ? 'banner' : 'card';
$tekseries_tone    = tekseries_blocks_get_tone( $tekseries_post_id );
$tekseries_icon    = $tekseries_post_id
	? wp_get_icon( 'tekseries/' . tekseries_blocks_get_icon( $tekseries_post_id ), array( 'size' => null ) )
	: '';

?>
<div <?php echo get_block_wrapper_attributes( array( 'class' => "ts-tone--{$tekseries_tone} ts-tone--{$tekseries_variant}" ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the attributes. ?>>
	<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- inner blocks are already rendered and escaped. ?>
	<?php if ( $tekseries_icon ) : ?>
		<span class="ts-tone__icon" aria-hidden="true"><?php echo $tekseries_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core sanitises registered icon SVGs. ?></span>
	<?php endif; ?>
</div>
