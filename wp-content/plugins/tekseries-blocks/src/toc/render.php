<?php
/**
 * Table of Contents: a numbered list of links to the post's H2 headings that
 * have an HTML anchor, read from the saved content. It sits in a <details>
 * element, open by default, so readers can fold it away without JavaScript.
 * With it (view.ts) the list starts folded on phones and the link of the
 * section being read is marked.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

$tekseries_post_id = (int) ( $block->context['postId'] ?? get_the_ID() );
$tekseries_content = $tekseries_post_id ? (string) get_post_field( 'post_content', $tekseries_post_id ) : '';

// Heading anchor => text, in document order.
$tekseries_items   = array();
$tekseries_anchor  = null;
$tekseries_text    = '';
$tekseries_heading = new WP_HTML_Tag_Processor( $tekseries_content );
while ( $tekseries_heading->next_token() ) {
	$tekseries_token = $tekseries_heading->get_token_name();
	if ( 'H2' === $tekseries_token && ! $tekseries_heading->is_tag_closer() ) {
		$tekseries_id     = $tekseries_heading->get_attribute( 'id' );
		$tekseries_anchor = is_string( $tekseries_id ) && '' !== $tekseries_id ? $tekseries_id : null;
		$tekseries_text   = '';
	} elseif ( 'H2' === $tekseries_token && null !== $tekseries_anchor ) {
		$tekseries_text = trim( (string) preg_replace( '/\s+/', ' ', $tekseries_text ) );
		if ( '' !== $tekseries_text ) {
			$tekseries_items[ $tekseries_anchor ] = $tekseries_text;
		}
		$tekseries_anchor = null;
	} elseif ( '#text' === $tekseries_token && null !== $tekseries_anchor ) {
		$tekseries_text .= $tekseries_heading->get_modifiable_text();
	}
}

if ( ! $tekseries_items ) {
	return;
}

$tekseries_label = __( 'On this page', 'tekseries-blocks' );
$tekseries_index = 0;

// For the script: the section being read, how long a picked link keeps the
// mark, and whether the script has taken over.
$tekseries_wrapper = array(
	'aria-label'          => $tekseries_label,
	'data-wp-interactive' => 'tekseries/toc',
	'data-wp-context'     => wp_json_encode(
		array(
			'current'   => '',
			'heldUntil' => 0,
			'ready'     => false,
		)
	),
	'data-wp-init'        => 'callbacks.watch',
);
?>
<nav <?php echo get_block_wrapper_attributes( $tekseries_wrapper ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<details class="ts-toc" open data-wp-init="callbacks.fold" data-wp-class--is-ready="context.ready">
		<summary class="ts-toc__summary">
			<span class="ts-toc__title"><?php echo tekseries_blocks_icon_svg( 'toc' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?><?php echo esc_html( $tekseries_label ); ?></span>
			<?php echo tekseries_blocks_icon_svg( 'expand_more' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
		</summary>
		<ol class="ts-toc__list">
			<?php foreach ( $tekseries_items as $tekseries_id => $tekseries_title ) : ?>
				<li <?php echo wp_interactivity_data_wp_context( array( 'id' => (string) $tekseries_id ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the context attribute. ?>><a href="#<?php echo esc_attr( (string) $tekseries_id ); ?>" data-wp-bind--aria-current="state.isCurrent" data-wp-on--click="actions.pick"><span class="ts-toc__number" aria-hidden="true"><?php echo esc_html( sprintf( '%02d', ++$tekseries_index ) ); ?></span><span><?php echo esc_html( $tekseries_title ); ?></span></a></li>
			<?php endforeach; ?>
		</ol>
	</details>
</nav>
