<?php
/**
 * Server render for the Event Search block.
 *
 * "form": a GET form to the list on show, so a search works without
 * JavaScript; the script runs it in place as the visitor types. It sits
 * outside the parts it swaps, so what is typed is never overwritten.
 * "status": while searching, how many events match, or a card when none do.
 * It sits inside the swapped results (includes/event-search.php).
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Inner content (unused).
 * @var WP_Block $block      Block instance.
 */

$tekseries_search = tekseries_blocks_event_search();
$tekseries_base   = tekseries_blocks_event_search_base();
$tekseries_asc    = 'asc' === tekseries_blocks_list_order();
$tekseries_clear  = $tekseries_asc ? add_query_arg( 'order', 'asc', $tekseries_base ) : $tekseries_base;

if ( 'status' !== ( $attributes['part'] ?? 'form' ) ) :
	$tekseries_field = wp_unique_id( 'ts-event-search-' );
	?>
<div <?php echo get_block_wrapper_attributes( array( 'data-wp-interactive' => 'tekseries/event-search' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<form
		class="ts-event-search__form"
		method="get"
		action="<?php echo esc_url( $tekseries_base ); ?>"
		role="search"
		data-wp-on--submit="actions.submit"
		data-wp-on--input="actions.type"
		data-wp-on-window--popstate="actions.restore"
	>
		<label class="screen-reader-text" for="<?php echo esc_attr( $tekseries_field ); ?>"><?php esc_html_e( 'Search events', 'tekseries-blocks' ); ?></label>
		<?php echo tekseries_blocks_icon_svg( 'search' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
		<input
			id="<?php echo esc_attr( $tekseries_field ); ?>"
			type="search"
			name="q"
			value="<?php echo esc_attr( $tekseries_search ); ?>"
			placeholder="<?php esc_attr_e( 'Search events by name', 'tekseries-blocks' ); ?>"
			autocomplete="off"
			enterkeyhint="search"
			maxlength="100"
		>
		<a
			class="ts-event-search__clear"
			href="<?php echo esc_url( $tekseries_clear ); ?>"
			aria-label="<?php esc_attr_e( 'Clear search', 'tekseries-blocks' ); ?>"
			data-wp-on--click="actions.clear"
			<?php echo '' === $tekseries_search ? 'hidden' : ''; ?>
		><?php echo tekseries_blocks_icon_svg( 'close' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></a>
		<?php if ( $tekseries_asc ) : ?>
			<input type="hidden" name="order" value="asc">
		<?php endif; ?>
	</form>
</div>
	<?php
	return;
endif;

if ( '' === $tekseries_search ) {
	return;
}

$tekseries_found = tekseries_blocks_event_search_count();
$tekseries_term  = get_queried_object();
$tekseries_term  = $tekseries_term instanceof WP_Term && 'event_type' === $tekseries_term->taxonomy ? $tekseries_term : null;
$tekseries_query = esc_html( $tekseries_search );

if ( $tekseries_found ) :
	$tekseries_count = '<strong>' . esc_html(
		/* translators: %s: number of events. */
		sprintf( _n( '%s event', '%s events', $tekseries_found, 'tekseries-blocks' ), number_format_i18n( $tekseries_found ) )
	) . '</strong>';
	$tekseries_line = $tekseries_term
		/* translators: 1: "3 events", 2: what was searched for, 3: an event type, e.g. "Webinar". */
		? sprintf( __( '%1$s for “%2$s” among %3$s events', 'tekseries-blocks' ), $tekseries_count, $tekseries_query, esc_html( $tekseries_term->name ) )
		/* translators: 1: "3 events", 2: what was searched for. */
		: sprintf( __( '%1$s for “%2$s” across all events', 'tekseries-blocks' ), $tekseries_count, $tekseries_query );
	?>
<div <?php echo get_block_wrapper_attributes( array( 'class' => 'is-found' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<p class="ts-event-search__count" role="status"><?php echo wp_kses( $tekseries_line, array( 'strong' => array() ) ); ?></p>
	<a class="ts-event-search__reset" href="<?php echo esc_url( $tekseries_clear ); ?>"><?php echo tekseries_blocks_icon_svg( 'close' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?><?php esc_html_e( 'Clear search', 'tekseries-blocks' ); ?></a>
</div>
	<?php
	return;
endif;

$tekseries_all = $tekseries_term ? add_query_arg( 'q', rawurlencode( $tekseries_search ), (string) get_post_type_archive_link( 'event' ) ) : '';
?>
<div <?php echo get_block_wrapper_attributes( array( 'class' => 'is-empty' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?> role="status">
	<span class="ts-event-search__tile" aria-hidden="true"><?php echo tekseries_blocks_icon_svg( 'search_off' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></span>
	<h2 class="ts-event-search__title">
		<?php
		/* translators: %s: what was searched for. */
		printf( esc_html__( 'No events match “%s”', 'tekseries-blocks' ), $tekseries_query ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above.
		?>
	</h2>
	<p class="ts-event-search__hint">
		<?php
		echo $tekseries_term
			/* translators: %s: an event type, e.g. "Webinar". */
			? esc_html( sprintf( __( 'Nothing among %s events matches. Try another word, or search every event type.', 'tekseries-blocks' ), $tekseries_term->name ) )
			: esc_html__( 'Check the spelling, try a shorter word, or pick one of these.', 'tekseries-blocks' );
		?>
	</p>
	<div class="ts-event-search__try">
		<span class="ts-event-search__try-label"><?php esc_html_e( 'Try', 'tekseries-blocks' ); ?></span>
		<?php foreach ( tekseries_blocks_event_search_suggestions() as $tekseries_word ) : ?>
			<a class="ts-event-search__word" href="<?php echo esc_url( add_query_arg( 'q', rawurlencode( (string) $tekseries_word ), $tekseries_clear ) ); ?>"><?php echo esc_html( (string) $tekseries_word ); ?></a>
		<?php endforeach; ?>
	</div>
	<div class="ts-event-search__actions">
		<a class="ts-event-search__button" href="<?php echo esc_url( $tekseries_clear ); ?>"><?php esc_html_e( 'Clear search', 'tekseries-blocks' ); ?></a>
		<?php if ( $tekseries_all ) : ?>
			<a class="ts-event-search__button is-outline" href="<?php echo esc_url( $tekseries_all ); ?>"><?php esc_html_e( 'Search all event types', 'tekseries-blocks' ); ?></a>
		<?php endif; ?>
	</div>
</div>
