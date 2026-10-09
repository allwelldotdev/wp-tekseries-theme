<?php
/**
 * Share Links: one link per chosen service, to that service's share page for
 * the current post. Plain links, so they work without JavaScript; the icons
 * are core's Social Icons artwork.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

$tekseries_post_id = (int) ( $block->context['postId'] ?? get_the_ID() );
if ( ! $tekseries_post_id || ! function_exists( 'block_core_social_link_get_icon' ) ) {
	return;
}

$tekseries_url   = (string) get_permalink( $tekseries_post_id );
$tekseries_title = html_entity_decode( wp_strip_all_tags( get_the_title( $tekseries_post_id ) ), ENT_QUOTES, 'UTF-8' );

// Service => [ label, share URL, icon ].
$tekseries_services = array(
	'linkedin' => array(
		__( 'Share on LinkedIn', 'tekseries-blocks' ),
		'https://www.linkedin.com/sharing/share-offsite/?url=' . rawurlencode( $tekseries_url ),
		block_core_social_link_get_icon( 'linkedin' ),
	),
	'facebook' => array(
		__( 'Share on Facebook', 'tekseries-blocks' ),
		'https://www.facebook.com/sharer/sharer.php?u=' . rawurlencode( $tekseries_url ),
		block_core_social_link_get_icon( 'facebook' ),
	),
	'x'        => array(
		__( 'Share on X', 'tekseries-blocks' ),
		'https://x.com/intent/tweet?url=' . rawurlencode( $tekseries_url ) . '&text=' . rawurlencode( $tekseries_title ),
		block_core_social_link_get_icon( 'x' ),
	),
	'whatsapp' => array(
		__( 'Share on WhatsApp', 'tekseries-blocks' ),
		'https://wa.me/?text=' . rawurlencode( $tekseries_title . ' ' . $tekseries_url ),
		block_core_social_link_get_icon( 'whatsapp' ),
	),
	'link'     => array(
		__( 'Link to this page', 'tekseries-blocks' ),
		$tekseries_url,
		tekseries_blocks_icon_svg( 'link' ),
	),
);

$tekseries_chosen = array_intersect( (array) ( $attributes['services'] ?? array() ), array_keys( $tekseries_services ) );
if ( ! $tekseries_chosen ) {
	return;
}
?>
<ul <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<?php foreach ( $tekseries_chosen as $tekseries_service ) : ?>
		<?php [ $tekseries_label, $tekseries_href, $tekseries_icon ] = $tekseries_services[ $tekseries_service ]; ?>
		<li>
			<a
				class="ts-share__link ts-share__link--<?php echo esc_attr( $tekseries_service ); ?>"
				href="<?php echo esc_url( $tekseries_href ); ?>"
				aria-label="<?php echo esc_attr( $tekseries_label ); ?>"
				<?php if ( 'link' !== $tekseries_service ) : ?>
					target="_blank" rel="noopener noreferrer"
				<?php endif; ?>
			><?php echo $tekseries_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from core's social icons or the plugin's icon collection. ?></a>
		</li>
	<?php endforeach; ?>
</ul>
