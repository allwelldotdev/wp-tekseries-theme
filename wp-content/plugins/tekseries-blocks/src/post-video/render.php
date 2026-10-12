<?php
/**
 * Post Video: a 16:9 card under a news post that opens the post's video in
 * the Gallery's viewer. The video comes from the post's "Video" fields
 * (includes/post-video.php): a file, or a YouTube or Vimeo link. Without
 * JavaScript the card's link opens the file, or the video's own page.
 *
 * Prints nothing unless the post's switch is on and it has a video.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

$tekseries_video = tekseries_blocks_post_video( (int) ( $block->context['postId'] ?? get_the_ID() ) );
if ( null === $tekseries_video ) {
	return;
}

$tekseries_item  = $tekseries_video['item'];
$tekseries_thumb = $tekseries_video['thumbnail'];
// What makes the link open the viewer; none of it when the viewer can't load.
$tekseries_opens = tekseries_blocks_lightbox_request() ? tekseries_blocks_lightbox_directives( $tekseries_item ) : array();
?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<a
		class="ts-post-video__card<?php echo $tekseries_thumb ? '' : ' ts-post-video__card--plain'; ?>"
		href="<?php echo esc_url( $tekseries_item['href'] ); ?>"
		<?php foreach ( $tekseries_opens as $tekseries_name => $tekseries_value ) : ?>
			<?php echo esc_attr( $tekseries_name ); ?>="<?php echo esc_attr( $tekseries_value ); ?>"
		<?php endforeach; ?>
	>
		<?php
		if ( $tekseries_thumb ) {
			echo wp_get_attachment_image(
				$tekseries_thumb,
				'large',
				false,
				array(
					'alt'   => '',
					'sizes' => '(max-width: 760px) 100vw, 720px',
				)
			);
		}
		?>
		<span class="ts-post-video__play" aria-hidden="true"><?php echo tekseries_blocks_icon_svg( 'play_arrow' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></span>
		<span class="ts-post-video__label">
			<?php echo tekseries_blocks_icon_svg( 'smart_display' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			<?php esc_html_e( 'Watch the video', 'tekseries-blocks' ); ?>
		</span>
	</a>
</div>
