<?php
/**
 * Event Countdown: how long until the event it is drawn for starts.
 *
 * The server prints the figures for the moment the page is made, and the
 * script (view.ts) keeps them right from then on. Hours, minutes and seconds
 * are shown only once the script runs: without it a clock would stand still,
 * and a page kept in a cache would show an old one. The days, the line for
 * screen readers and the compact line are right as printed.
 *
 * Nothing is printed for a post that is not an event, an event without a
 * date, and an event whose day is over.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

$tekseries_post_id = (int) ( $block->context['postId'] ?? get_the_ID() );
$tekseries_view    = 'event' === get_post_type( $tekseries_post_id ) ? tekseries_blocks_event_countdown( $tekseries_post_id ) : null;
if ( ! $tekseries_view ) {
	return;
}

$tekseries_words   = tekseries_blocks_event_countdown_words();
$tekseries_line    = tekseries_blocks_event_countdown_line( $tekseries_view, $tekseries_words );
$tekseries_compact = 'compact' === ( $attributes['size'] ?? 'full' );
$tekseries_started = 'before' !== $tekseries_view['phase'];

wp_interactivity_state( 'tekseries/event-countdown', array( 'words' => $tekseries_words ) );
wp_enqueue_script_module( 'tekseries-blocks-event-countdown' );

$tekseries_wrapper = get_block_wrapper_attributes(
	array(
		'class'               => ( $tekseries_compact ? 'is-compact' : 'is-full' ) . ( $tekseries_started ? ' is-started' : '' ),
		'data-wp-interactive' => 'tekseries/event-countdown',
		'data-wp-context'     => (string) wp_json_encode(
			array(
				'start' => $tekseries_view['start'],
				'end'   => $tekseries_view['end'],
				'timed' => $tekseries_view['timed'],
			)
		),
		'data-wp-init'        => 'callbacks.run',
		'data-wp-watch'       => 'callbacks.draw',
	)
);

if ( $tekseries_compact ) {
	printf(
		'<p %1$s><span data-part="line">%2$s</span></p>',
		$tekseries_wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes.
		esc_html( $tekseries_line )
	);
	return;
}

// [ part, figure, name ]: the days, then the clock.
$tekseries_units = array(
	array( 'days', (string) $tekseries_view['days'], $tekseries_words['day'][ 1 === $tekseries_view['days'] ? 0 : 1 ] ),
);
if ( $tekseries_view['timed'] ) {
	$tekseries_units[] = array( 'hours', sprintf( '%02d', $tekseries_view['hours'] ), __( 'hrs', 'tekseries-blocks' ) );
	$tekseries_units[] = array( 'minutes', sprintf( '%02d', $tekseries_view['minutes'] ), __( 'min', 'tekseries-blocks' ) );
	$tekseries_units[] = array( 'seconds', sprintf( '%02d', $tekseries_view['seconds'] ), __( 'sec', 'tekseries-blocks' ) );
}
?>
<div <?php echo $tekseries_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<div class="ts-countdown__show" aria-hidden="true">
		<span class="ts-countdown__label"><?php esc_html_e( 'Starts in', 'tekseries-blocks' ); ?></span>
		<span class="ts-countdown__units">
			<?php foreach ( $tekseries_units as [ $tekseries_part, $tekseries_figure, $tekseries_name ] ) : ?>
				<span class="ts-countdown__unit<?php echo 'days' === $tekseries_part ? '' : ' ts-countdown__unit--clock'; ?>">
					<span class="ts-countdown__number" data-part="<?php echo esc_attr( $tekseries_part ); ?>"><?php echo esc_html( $tekseries_figure ); ?></span>
					<span class="ts-countdown__name"<?php echo 'days' === $tekseries_part ? ' data-part="days-name"' : ''; ?>><?php echo esc_html( $tekseries_name ); ?></span>
				</span>
			<?php endforeach; ?>
		</span>
	</div>
	<p class="ts-countdown__status" aria-hidden="true"><?php echo esc_html( $tekseries_view['timed'] ? $tekseries_words['now'] : $tekseries_words['today'] ); ?></p>
	<p class="screen-reader-text"><span data-part="line"><?php echo esc_html( $tekseries_line ); ?></span>: <?php echo esc_html( tekseries_blocks_event_start_text( $tekseries_post_id ) ); ?></p>
</div>
