<?php
/**
 * WP Job Manager screens.
 *
 * WP Job Manager renders its screens from PHP templates. The ones the design
 * changes live in this plugin's templates/wpjm/ folder and replace WP Job
 * Manager's copies (the theme holds no PHP templates); their styles ship with
 * them, in assets/css/, in place of WP Job Manager's own.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Serves WP Job Manager templates from templates/wpjm/ when the plugin has one.
 *
 * Add-ons pass their own template path; their templates are left alone.
 *
 * @param string $template      Path WP Job Manager found.
 * @param string $template_name Template file, e.g. "content-single-job_listing.php".
 * @param string $template_path Folder the caller looks in, "job_manager" for WP Job Manager itself.
 * @return string
 */
function tekseries_blocks_locate_wpjm_template( $template, $template_name, $template_path ) {
	if ( 'job_manager' !== $template_path || 0 !== validate_file( $template_name ) ) {
		return $template;
	}
	$override = dirname( __DIR__ ) . '/templates/wpjm/' . $template_name;
	return is_file( $override ) ? $override : $template;
}
add_filter( 'job_manager_locate_template', 'tekseries_blocks_locate_wpjm_template', 10, 3 );

/**
 * Registers the styles of the overridden screens; each template enqueues its own.
 */
function tekseries_blocks_register_wpjm_styles(): void {
	$version = (string) filemtime( dirname( __DIR__ ) . '/assets/css/job.css' );
	wp_register_style( 'tekseries-blocks-job', plugins_url( 'assets/css/job.css', __DIR__ ), array(), $version );
}
add_action( 'init', 'tekseries_blocks_register_wpjm_styles' );

/**
 * Leaves out WP Job Manager's front-end stylesheet and its enhanced selects
 * (select2) on the screens this plugin styles in full: a single job, and a
 * page with the Job Listings block. The submission form keeps them.
 *
 * @param bool $enabled Whether WP Job Manager loads them on this page.
 * @return bool
 */
function tekseries_blocks_wpjm_frontend_assets( $enabled ) {
	return $enabled && ! is_singular( 'job_listing' ) && ! has_block( 'tekseries/job-listings' );
}
add_filter( 'job_manager_enqueue_frontend_style', 'tekseries_blocks_wpjm_frontend_assets' );
add_filter( 'job_manager_enhanced_select_enabled', 'tekseries_blocks_wpjm_frontend_assets' );

/**
 * Leaves out the stylesheet WP Job Manager loads on every other page, for its
 * widgets and a [jobs] shortcode placed elsewhere; the site uses neither.
 */
function tekseries_blocks_dequeue_wpjm_listing_style(): void {
	wp_dequeue_style( 'wp-job-manager-job-listings' );
}
add_action( 'wp_enqueue_scripts', 'tekseries_blocks_dequeue_wpjm_listing_style', 20 );

/**
 * Puts the company before the job details at the top of a single job (the
 * side card on the design).
 */
function tekseries_blocks_adjust_wpjm_single(): void {
	if ( has_action( 'single_job_listing_start', 'job_listing_company_display' ) ) {
		remove_action( 'single_job_listing_start', 'job_listing_company_display', 30 );
		add_action( 'single_job_listing_start', 'job_listing_company_display', 10 );
	}
}
add_action( 'init', 'tekseries_blocks_adjust_wpjm_single' );

/**
 * Counts apply clicks on the side card's "Apply for job" button, a `<summary>`
 * in this plugin's template where WP Job Manager listens for its own
 * `input.application_button` (its stats script binds the first match only).
 *
 * @param array $stats Stats WP Job Manager records, by name.
 * @return array
 */
function tekseries_blocks_wpjm_apply_click_stat( $stats ) {
	if ( isset( $stats['job_apply_click']['args']['element'] ) ) {
		$stats['job_apply_click']['args']['element'] = '.application_button';
	}
	return $stats;
}
add_filter( 'wpjm_get_registered_stats', 'tekseries_blocks_wpjm_apply_click_stat' );

/**
 * Records job search statistics for a page showing the Job Listings block, as
 * WP Job Manager does for a page with its [jobs] shortcode (search views, and
 * impressions of each `li.job_listing` scrolled into view). WP Job Manager
 * only looks for the shortcode in the page content, so its own private method
 * is called here, keeping its nonce, stat definitions and filters.
 *
 * @param int $page_id Page the listings are on.
 */
function tekseries_blocks_track_job_search( int $page_id ): void {
	static $tracked = false;
	if ( $tracked || ! $page_id ) {
		return;
	}
	$tracked = true;

	// After WP Job Manager registers its stats script (priority 10).
	add_action(
		'wp_enqueue_scripts',
		function () use ( $page_id ): void {
			$stats = '\WP_Job_Manager\Stats_Script';
			if ( ! class_exists( '\WP_Job_Manager\Stats' ) || ! \WP_Job_Manager\Stats::is_enabled() || ! method_exists( $stats, 'enqueue_stats_script' ) ) {
				return;
			}
			( fn() => $this->enqueue_stats_script( array( 'jobs' ), $page_id ) )->call( $stats::instance() ); // phpcs:ignore PHPCompatibility.FunctionDeclarations.NewClosure.ThisFoundOutsideClass -- bound to the instance by call().
		},
		20
	);
}

/**
 * Turns H1 headings in a job description into H2s: imported descriptions
 * often carry one, and the page already has the job title as its H1.
 *
 * @param string $description Job description HTML.
 * @return string
 */
function tekseries_blocks_demote_job_description_h1( $description ) {
	return (string) preg_replace( '#<(/?)h1\b#i', '<$1h2', (string) $description );
}
add_filter( 'wpjm_the_job_description', 'tekseries_blocks_demote_job_description_h1' );

/**
 * Gives single jobs the Home / Job Series / title breadcrumbs.
 *
 * Jobs have no archive; the Job Series page (WP Job Manager's job listings
 * page) stands in for it.
 *
 * @param array $items Breadcrumb items, home first and the current page last.
 * @return array
 */
function tekseries_blocks_job_breadcrumbs( array $items ): array {
	$listings = function_exists( 'job_manager_get_page_id' ) ? (int) job_manager_get_page_id( 'jobs' ) : 0;
	if ( ! is_singular( 'job_listing' ) || ! $listings || count( $items ) < 2 ) {
		return $items;
	}
	return array(
		$items[0],
		array(
			'label' => get_the_title( $listings ),
			'url'   => get_permalink( $listings ),
		),
		end( $items ),
	);
}
add_filter( 'block_core_breadcrumbs_items', 'tekseries_blocks_job_breadcrumbs' );

/**
 * Shows the job's own icons in template Icon blocks: the type's icon in one
 * with the `ts-job-type-icon` class, a globe for a remote job in one with
 * `ts-job-location-icon`.
 *
 * @param string $content Rendered block.
 * @param array  $parsed  Parsed block (attributes).
 * @return string
 */
function tekseries_blocks_render_job_icons( string $content, array $parsed ): string {
	$classes = explode( ' ', (string) ( $parsed['attrs']['className'] ?? '' ) );
	$type    = in_array( 'ts-job-type-icon', $classes, true );
	if ( ! $type && ! in_array( 'ts-job-location-icon', $classes, true ) ) {
		return $content;
	}

	// The current post: the single job, or the job a Query Loop is rendering.
	$job = get_post();
	if ( ! $job || 'job_listing' !== $job->post_type || ! function_exists( 'wpjm_get_the_job_types' ) ) {
		return $content;
	}
	if ( $type ) {
		return tekseries_blocks_swap_icon( $content, tekseries_blocks_job_type_icon( tekseries_blocks_job_type( $job ) ) );
	}
	return $job->_remote_position ? tekseries_blocks_swap_icon( $content, 'public' ) : $content;
}
add_filter( 'render_block_core/icon', 'tekseries_blocks_render_job_icons', 10, 2 );

/**
 * Leaves filled jobs out of job Query Loops (More jobs) when WP Job Manager
 * hides them from its own lists. Filled is post meta, not a status.
 *
 * @param array $query Query arguments built from the Query Loop block.
 * @return array
 */
function tekseries_blocks_hide_filled_jobs( array $query ): array {
	if ( 'job_listing' !== ( $query['post_type'] ?? '' ) || ! get_option( 'job_manager_hide_filled_positions' ) ) {
		return $query;
	}
	$not_filled = array(
		'relation' => 'OR',
		array(
			'key'     => '_filled',
			'value'   => '1',
			'compare' => '!=',
		),
		array(
			'key'     => '_filled',
			'compare' => 'NOT EXISTS',
		),
	);

	$query['meta_query'] = empty( $query['meta_query'] ) ? $not_filled : array( $query['meta_query'], $not_filled ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- WP Job Manager's own lists filter the same way.
	return $query;
}
add_filter( 'query_loop_block_query_vars', 'tekseries_blocks_hide_filled_jobs' );

/**
 * Returns the icon for each job type, by slug (the boards' type chips).
 *
 * @return array<string, string>
 */
function tekseries_blocks_job_type_icons(): array {
	return array(
		'contract'   => 'description',
		'freelance'  => 'person_play',
		'full-time'  => 'schedule',
		'hybrid'     => 'sync_alt',
		'internship' => 'school',
		'onsite'     => 'apartment',
		'part-time'  => 'timelapse',
		'temporary'  => 'hourglass_bottom',
	);
}

/**
 * Returns a job type's icon name; `work` for a type without one.
 *
 * @param WP_Term|null $type Job type.
 * @return string
 */
function tekseries_blocks_job_type_icon( ?WP_Term $type ): string {
	return tekseries_blocks_job_type_icons()[ $type->slug ?? '' ] ?? 'work';
}

/**
 * Returns the company tile: the uploaded logo, or else the company's initials
 * on one of four tones picked from the name (as on the boards).
 *
 * @param WP_Post $job Job listing.
 * @return string Tile HTML, decorative (the company name is shown beside it).
 */
function tekseries_blocks_company_tile( WP_Post $job ): string {
	$logo = get_the_company_logo( $job, 'thumbnail' );
	if ( $logo ) {
		return sprintf( '<span class="ts-job-tile ts-job-tile--logo" aria-hidden="true"><img src="%s" alt="" loading="lazy"></span>', esc_url( $logo ) );
	}

	$name  = (string) get_the_company_name( $job );
	$words = preg_split( '/\s+/', (string) preg_replace( '/\(.*?\)/', '', $name ), -1, PREG_SPLIT_NO_EMPTY );
	$words = array_filter( (array) $words, static fn( $word ) => (bool) preg_match( '/^[a-z]/i', $word ) );

	$initials = '';
	foreach ( array_slice( $words, 0, 2 ) as $word ) {
		$initials .= strtoupper( $word[0] );
	}

	$hash = 7;
	foreach ( mb_str_split( $name ) as $character ) {
		$hash = ( $hash * 31 + mb_ord( $character ) ) % 4294967296;
	}
	$tone = array( 'plum', 'saffron', 'lilac', 'ink' )[ $hash % 4 ];

	return sprintf( '<span class="ts-job-tile ts-job-tile--%1$s" aria-hidden="true">%2$s</span>', $tone, esc_html( $initials ) );
}
