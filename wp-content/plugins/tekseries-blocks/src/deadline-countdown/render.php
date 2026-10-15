<?php
/**
 * Deadline Countdown: how long until the deadline of the page it is placed
 * in (includes/deadline.php).
 *
 * The server prints what stays true for a while: the days, the days line and
 * a sentence for screen readers. Hours, minutes and seconds are shown only
 * once the script (view.ts) runs, as on the Event Countdown: a clock that
 * cannot tick, or comes from a page cache, would be wrong. After the
 * deadline the tiles show 00, dimmed, the days line is left out, and no
 * script loads.
 *
 * Nothing is printed on a page without a deadline, or outside a page.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

$tekseries_post_id = (int) ( $block->context['postId'] ?? get_the_ID() );
$tekseries_view    = 'page' === get_post_type( $tekseries_post_id ) ? tekseries_blocks_deadline_view( $tekseries_post_id ) : null;
$tekseries_days    = 'days' === ( $attributes['view'] ?? 'tiles' );
if ( ! $tekseries_view || ( $tekseries_days && $tekseries_view['closed'] ) ) {
	return;
}

$tekseries_words      = tekseries_blocks_deadline_words();
$tekseries_attributes = array( 'class' => ( $tekseries_days ? 'is-days' : 'is-tiles' ) . ( $tekseries_view['closed'] ? ' is-closed' : '' ) );
if ( ! $tekseries_view['closed'] ) {
	wp_interactivity_state( 'tekseries/deadline-countdown', array( 'words' => $tekseries_words ) );
	wp_enqueue_script_module( 'tekseries-blocks-deadline-countdown' );
	$tekseries_attributes += array(
		'data-wp-interactive' => 'tekseries/deadline-countdown',
		'data-wp-context'     => (string) wp_json_encode( array( 'deadline' => $tekseries_view['deadline'] ) ),
		'data-wp-init'        => 'callbacks.run',
		'data-wp-watch'       => 'callbacks.draw',
	);
}
$tekseries_wrapper = get_block_wrapper_attributes( $tekseries_attributes );

if ( $tekseries_days ) {
	printf(
		'<p %1$s><span data-part="days-line">%2$s</span></p>',
		$tekseries_wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes.
		esc_html( tekseries_blocks_deadline_days_line( $tekseries_view, $tekseries_words ) )
	);
	return;
}

// [ part, name, short name for phones ].
$tekseries_units = array(
	array( 'days', __( 'Days', 'tekseries-blocks' ), __( 'Days', 'tekseries-blocks' ) ),
	array( 'hours', __( 'Hours', 'tekseries-blocks' ), __( 'Hours', 'tekseries-blocks' ) ),
	array( 'minutes', __( 'Minutes', 'tekseries-blocks' ), __( 'Mins', 'tekseries-blocks' ) ),
	array( 'seconds', __( 'Seconds', 'tekseries-blocks' ), __( 'Secs', 'tekseries-blocks' ) ),
);
?>
<div <?php echo $tekseries_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<div class="ts-deadline__tiles" aria-hidden="true">
		<?php foreach ( $tekseries_units as [ $tekseries_part, $tekseries_name, $tekseries_short ] ) : ?>
			<span class="ts-deadline__tile<?php echo 'days' === $tekseries_part ? '' : ' ts-deadline__tile--clock'; ?>">
				<span class="ts-deadline__number" data-part="<?php echo esc_attr( $tekseries_part ); ?>"><?php echo esc_html( sprintf( '%02d', $tekseries_view[ $tekseries_part ] ) ); ?></span>
				<span class="ts-deadline__name"><span class="ts-deadline__long"><?php echo esc_html( $tekseries_name ); ?></span><span class="ts-deadline__short"><?php echo esc_html( $tekseries_short ); ?></span></span>
			</span>
		<?php endforeach; ?>
	</div>
	<p class="screen-reader-text" data-part="line"><?php echo esc_html( tekseries_blocks_deadline_line( $tekseries_view, $tekseries_words ) ); ?></p>
</div>
