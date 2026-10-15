<?php
/**
 * Page deadlines.
 *
 * A page can hold one deadline, the meta `tekseries_deadline`: a moment
 * written "Y-m-d\TH:i:s" and read in Nigerian time, like event dates
 * (tekseries_blocks_event_timezone()). The Deadline Countdown block
 * (src/deadline-countdown) counts down to it. Blocks with the class
 * `ts-when-open` show only before it and blocks with `ts-when-closed` only
 * after it: the server picks when it makes the page, and on a page made
 * before the deadline the script swaps them at zero.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the deadline meta on pages, editable over REST.
 */
function tekseries_blocks_register_deadline(): void {
	register_post_meta(
		'page',
		'tekseries_deadline',
		array(
			'type'              => 'string',
			'description'       => __( 'When the page’s applications close, in Nigerian time (Y-m-d\TH:i:s). Empty: no deadline.', 'tekseries-blocks' ),
			'single'            => true,
			'default'           => '',
			'sanitize_callback' => 'tekseries_blocks_sanitize_deadline',
			'auth_callback'     => 'tekseries_blocks_can_edit_meta',
			'show_in_rest'      => true,
		)
	);

	$asset_file = dirname( __DIR__ ) . '/build/deadline-countdown/view.asset.php';
	if ( file_exists( $asset_file ) ) {
		$asset = require $asset_file;
		wp_register_script_module( 'tekseries-blocks-deadline-countdown', plugins_url( 'build/deadline-countdown/view.js', __DIR__ ), $asset['dependencies'], $asset['version'] );
	}
}
add_action( 'init', 'tekseries_blocks_register_deadline' );

/**
 * Reads a deadline as a moment in Nigerian time.
 *
 * @param string $value "Y-m-d\TH:i:s", or without the seconds.
 * @return DateTimeImmutable|null Null when the value isn't a valid moment.
 */
function tekseries_blocks_parse_deadline( string $value ): ?DateTimeImmutable {
	if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/', $value ) ) {
		return null;
	}
	$value = 16 === strlen( $value ) ? $value . ':00' : $value;
	$at    = DateTimeImmutable::createFromFormat( '!Y-m-d\TH:i:s', $value, tekseries_blocks_event_timezone() );
	return $at && $at->format( 'Y-m-d\TH:i:s' ) === $value ? $at : null;
}

/**
 * Keeps a valid deadline, with its seconds, and stores nothing otherwise.
 *
 * @param mixed $value Submitted value.
 * @return string
 */
function tekseries_blocks_sanitize_deadline( $value ): string {
	$at = is_string( $value ) ? tekseries_blocks_parse_deadline( trim( $value ) ) : null;
	return $at ? $at->format( 'Y-m-d\TH:i:s' ) : '';
}

/**
 * Works out what a page's deadline shows at a moment: the days, hours,
 * minutes and seconds left, as a clock shows them. The script does the same
 * in the browser (src/deadline-countdown/time.ts): keep the two alike.
 *
 * @param int      $post_id Page ID.
 * @param int|null $now     The moment as a Unix time. Default: now.
 * @return array{deadline: int, closed: bool, days: int, hours: int, minutes: int, seconds: int}|null
 *         `deadline` in milliseconds, for the script. Null for a page without a deadline.
 */
function tekseries_blocks_deadline_view( int $post_id, ?int $now = null ): ?array {
	$at = tekseries_blocks_parse_deadline( (string) get_post_meta( $post_id, 'tekseries_deadline', true ) );
	if ( ! $at ) {
		return null;
	}

	$left = max( 0, $at->getTimestamp() - ( $now ?? time() ) );
	return array(
		'deadline' => $at->getTimestamp() * 1000,
		'closed'   => 0 === $left,
		'days'     => intdiv( $left, DAY_IN_SECONDS ),
		'hours'    => intdiv( $left % DAY_IN_SECONDS, HOUR_IN_SECONDS ),
		'minutes'  => intdiv( $left % HOUR_IN_SECONDS, MINUTE_IN_SECONDS ),
		'seconds'  => $left % MINUTE_IN_SECONDS,
	);
}

/**
 * Returns the deadline's words. The script gets them too, so each count
 * comes as [ one, many ] rather than through _n().
 *
 * @return array{left: string[], lastDay: string, closeIn: string, soon: string, closed: string, days: string[], hours: string[], minutes: string[], two: string, three: string}
 */
function tekseries_blocks_deadline_words(): array {
	return array(
		/* translators: %d: number of days, 1. */
		'left'    => array( __( '%d day left to apply', 'tekseries-blocks' ), /* translators: %d: number of days. */ __( '%d days left to apply', 'tekseries-blocks' ) ),
		'lastDay' => __( 'Last day to apply', 'tekseries-blocks' ),
		/* translators: %s: the time left, e.g. "3 days, 4 hours and 12 minutes". */
		'closeIn' => __( 'Applications close in %s.', 'tekseries-blocks' ),
		'soon'    => __( 'Applications close in less than a day.', 'tekseries-blocks' ),
		'closed'  => __( 'Applications are closed.', 'tekseries-blocks' ),
		/* translators: %d: number of days, 1. */
		'days'    => array( __( '%d day', 'tekseries-blocks' ), /* translators: %d: number of days. */ __( '%d days', 'tekseries-blocks' ) ),
		/* translators: %d: number of hours, 1. */
		'hours'   => array( __( '%d hour', 'tekseries-blocks' ), /* translators: %d: number of hours. */ __( '%d hours', 'tekseries-blocks' ) ),
		/* translators: %d: number of minutes, 1. */
		'minutes' => array( __( '%d minute', 'tekseries-blocks' ), /* translators: %d: number of minutes. */ __( '%d minutes', 'tekseries-blocks' ) ),
		/* translators: 1: hours, e.g. "4 hours", 2: minutes, e.g. "12 minutes". */
		'two'     => __( '%1$s and %2$s', 'tekseries-blocks' ),
		/* translators: 1: days, e.g. "3 days", 2: hours, 3: minutes. */
		'three'   => __( '%1$s, %2$s and %3$s', 'tekseries-blocks' ),
	);
}

/**
 * Says the days left for the plum band: "12 days left to apply", or "Last
 * day to apply" in the last 24 hours. Empty once closed.
 *
 * @param array $view  From tekseries_blocks_deadline_view().
 * @param array $words From tekseries_blocks_deadline_words().
 * @return string
 */
function tekseries_blocks_deadline_days_line( array $view, array $words ): string {
	if ( $view['closed'] ) {
		return '';
	}
	return $view['days'] > 0 ? sprintf( $words['left'][ 1 === $view['days'] ? 0 : 1 ], $view['days'] ) : $words['lastDay'];
}

/**
 * Says the time left for screen readers, as the server can keep it right:
 * by whole days ("Applications close in 12 days."), or "Applications close
 * in less than a day." The script adds the hours and minutes once it runs.
 *
 * @param array $view  From tekseries_blocks_deadline_view().
 * @param array $words From tekseries_blocks_deadline_words().
 * @return string
 */
function tekseries_blocks_deadline_line( array $view, array $words ): string {
	if ( $view['closed'] ) {
		return $words['closed'];
	}
	if ( 0 === $view['days'] ) {
		return $words['soon'];
	}
	return sprintf( $words['closeIn'], sprintf( $words['days'][ 1 === $view['days'] ? 0 : 1 ], $view['days'] ) );
}

/**
 * Shows a block marked `ts-when-open` only before the page's deadline and one
 * marked `ts-when-closed` only after it.
 *
 * Runs before the survey links (priority 10), so a closed page prints no
 * Apply link and loads no Formbricks script. A page without a deadline is
 * always open. On a page made before the deadline the closed blocks are
 * printed hidden, and the script swaps both kinds at zero.
 *
 * @param string $content Rendered block.
 * @param array  $block   Parsed block.
 * @return string
 */
function tekseries_blocks_deadline_phase( $content, $block ) {
	$class = $block['attrs']['className'] ?? '';
	if ( ! is_string( $class ) || ! preg_match( '/(?:^|\s)ts-when-(open|closed)(?:\s|$)/', $class, $found ) ) {
		return $content;
	}

	$when = $found[1];
	// The page being shown: its content is rendered with it as the current post.
	$view = 'page' === get_post_type() ? tekseries_blocks_deadline_view( (int) get_the_ID() ) : null;
	if ( ! $view ) {
		return 'open' === $when ? $content : '';
	}
	if ( $view['closed'] ) {
		return 'closed' === $when ? $content : '';
	}

	$tags = new WP_HTML_Tag_Processor( (string) $content );
	if ( ! $tags->next_tag( array( 'class_name' => "ts-when-$when" ) ) ) {
		return $content;
	}

	wp_enqueue_script_module( 'tekseries-blocks-deadline-countdown' );
	$tags->set_attribute( 'data-wp-interactive', 'tekseries/deadline-countdown' );
	$tags->set_attribute(
		'data-wp-context',
		(string) wp_json_encode(
			array(
				'deadline' => $view['deadline'],
				'when'     => $when,
			)
		)
	);
	$tags->set_attribute( 'data-wp-init', 'callbacks.run' );
	$tags->set_attribute( 'data-wp-watch', 'callbacks.phase' );
	if ( 'closed' === $when ) {
		$tags->set_attribute( 'hidden', true );
	}
	return $tags->get_updated_html();
}
add_filter( 'render_block', 'tekseries_blocks_deadline_phase', 5, 2 );

/**
 * Makes a Button set to be a `<button>` (not a link) with the class
 * `ts-disabled` a disabled button: "Applications closed".
 *
 * @param string $content Rendered Button block.
 * @param array  $block   Parsed block.
 * @return string
 */
function tekseries_blocks_disabled_button( $content, $block ) {
	$class = $block['attrs']['className'] ?? '';
	if ( 'button' !== ( $block['attrs']['tagName'] ?? '' ) || ! is_string( $class ) || ! in_array( 'ts-disabled', explode( ' ', $class ), true ) ) {
		return $content;
	}

	$tags = new WP_HTML_Tag_Processor( (string) $content );
	if ( ! $tags->next_tag( 'button' ) ) {
		return $content;
	}
	$tags->set_attribute( 'disabled', true );
	return $tags->get_updated_html();
}
add_filter( 'render_block_core/button', 'tekseries_blocks_disabled_button', 10, 2 );
