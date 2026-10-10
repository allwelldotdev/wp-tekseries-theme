<?php
/**
 * Job Listings: WP Job Manager's open jobs, newest first, with a search form
 * and page links. Searching submits the form (GET) and paging follows links,
 * so both work without JavaScript; each row is WP Job Manager's
 * content-job_listing.php (this plugin's override).
 *
 * With JavaScript (view.ts) the same addresses are fetched and only the
 * results are swapped in: they are a router region. The form stays outside
 * it, so an update never rewrites a field someone is typing in.
 *
 * URL parameters: search_keywords, search_location, search_category (slug),
 * filter_job_type[] (slugs; none means every type), remote_position, pg.
 *
 * @package TekSeries
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

if ( ! function_exists( 'get_job_listings' ) ) {
	return;
}

if ( ! job_manager_user_can_browse_job_listings() ) {
	get_job_manager_template_part( 'access-denied', 'browse-job_listings' );
	return;
}

// phpcs:disable WordPress.Security.NonceVerification.Recommended -- a public search form; the filters only narrow a read-only list.
$tekseries_keywords = isset( $_GET['search_keywords'] ) && is_string( $_GET['search_keywords'] ) ? sanitize_text_field( wp_unslash( $_GET['search_keywords'] ) ) : '';
$tekseries_location = isset( $_GET['search_location'] ) && is_string( $_GET['search_location'] ) ? sanitize_text_field( wp_unslash( $_GET['search_location'] ) ) : '';
$tekseries_category = isset( $_GET['search_category'] ) && is_string( $_GET['search_category'] ) ? sanitize_title( wp_unslash( $_GET['search_category'] ) ) : '';
$tekseries_chosen   = isset( $_GET['filter_job_type'] ) ? array_filter( (array) map_deep( wp_unslash( $_GET['filter_job_type'] ), 'sanitize_title' ), 'is_string' ) : array();
$tekseries_remote   = ! empty( $_GET['remote_position'] );
$tekseries_page     = isset( $_GET['pg'] ) ? max( 1, absint( $_GET['pg'] ) ) : 1;
// phpcs:enable WordPress.Security.NonceVerification.Recommended

$tekseries_types      = get_option( 'job_manager_enable_types' ) ? get_job_listing_types() : array();
$tekseries_type_slugs = wp_list_pluck( $tekseries_types, 'slug' );
$tekseries_chosen     = array_values( array_intersect( $tekseries_chosen, $tekseries_type_slugs ) );
$tekseries_categories = get_option( 'job_manager_enable_categories' ) ? get_terms(
	array(
		'taxonomy'   => 'job_listing_category',
		'hide_empty' => true,
	)
) : array();
$tekseries_categories = is_array( $tekseries_categories ) ? $tekseries_categories : array();

$tekseries_per_page = max( 1, (int) ( $attributes['perPage'] ?? 25 ) );
$tekseries_jobs     = get_job_listings(
	array(
		'search_keywords'   => $tekseries_keywords,
		'search_location'   => $tekseries_location,
		'search_categories' => $tekseries_category ? array( $tekseries_category ) : array(),
		'job_types'         => $tekseries_chosen,
		'remote_position'   => $tekseries_remote ? true : null,
		'posts_per_page'    => $tekseries_per_page,
		'offset'            => ( $tekseries_page - 1 ) * $tekseries_per_page,
		'orderby'           => 'date',
		'order'             => 'DESC',
	)
);

// The filters in use, carried by page links and dropped by "Clear filters".
$tekseries_filters  = array_filter(
	array(
		'search_keywords' => $tekseries_keywords,
		'search_location' => $tekseries_location,
		'search_category' => $tekseries_category,
		'filter_job_type' => $tekseries_chosen,
		'remote_position' => $tekseries_remote ? '1' : '',
	)
);
$tekseries_base     = (string) get_permalink();
$tekseries_found    = (int) $tekseries_jobs->found_posts;
$tekseries_listed   = $tekseries_jobs->have_posts();
$tekseries_filtered = (bool) $tekseries_filters;

// Also with nothing found: a search made in place from here can find jobs.
tekseries_blocks_track_job_search( (int) get_the_ID() );
?>
<div <?php echo get_block_wrapper_attributes( array( 'data-wp-interactive' => 'tekseries/job-listings' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapes the wrapper attributes. ?>>
	<form
		class="job_filters ts-job-filters"
		method="get"
		action="<?php echo esc_url( $tekseries_base ); ?>"
		role="search"
		aria-label="<?php esc_attr_e( 'Search jobs', 'tekseries-blocks' ); ?>"
		data-wp-on--submit="actions.submit"
		data-wp-on--input="actions.type"
		data-wp-on--change="actions.change"
		data-wp-on-window--popstate="actions.restore"
	>
		<div class="search_jobs">
			<label class="ts-job-field">
				<span class="screen-reader-text"><?php esc_html_e( 'Keywords', 'tekseries-blocks' ); ?></span>
				<?php echo tekseries_blocks_icon_svg( 'search' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<input type="search" name="search_keywords" placeholder="<?php esc_attr_e( 'Keywords', 'tekseries-blocks' ); ?>" value="<?php echo esc_attr( $tekseries_keywords ); ?>">
			</label>
			<label class="ts-job-field">
				<span class="screen-reader-text"><?php esc_html_e( 'Location', 'tekseries-blocks' ); ?></span>
				<?php echo tekseries_blocks_icon_svg( 'location_on' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<input type="search" name="search_location" placeholder="<?php esc_attr_e( 'Location', 'tekseries-blocks' ); ?>" value="<?php echo esc_attr( $tekseries_location ); ?>">
			</label>
			<?php if ( $tekseries_categories ) : ?>
				<label class="ts-job-field ts-job-field--select">
					<span class="screen-reader-text"><?php esc_html_e( 'Category', 'tekseries-blocks' ); ?></span>
					<?php echo tekseries_blocks_icon_svg( 'category' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
					<select name="search_category">
						<option value=""><?php esc_html_e( 'Choose a category…', 'tekseries-blocks' ); ?></option>
						<?php foreach ( $tekseries_categories as $tekseries_term ) : ?>
							<option value="<?php echo esc_attr( $tekseries_term->slug ); ?>" <?php selected( $tekseries_category, $tekseries_term->slug ); ?>><?php echo esc_html( $tekseries_term->name ); ?></option>
						<?php endforeach; ?>
					</select>
					<?php echo tekseries_blocks_icon_svg( 'expand_more' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				</label>
			<?php endif; ?>
			<button type="submit" class="ts-job-search">
				<?php echo tekseries_blocks_icon_svg( 'search' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<?php esc_html_e( 'Search jobs', 'tekseries-blocks' ); ?>
			</button>
		</div>

		<div class="ts-job-filters__more">
			<?php if ( $tekseries_types ) : ?>
				<fieldset class="job_types ts-job-types">
					<legend class="screen-reader-text"><?php esc_html_e( 'Job type', 'tekseries-blocks' ); ?></legend>
					<?php foreach ( $tekseries_types as $tekseries_type ) : ?>
						<label class="ts-job-type-toggle">
							<input type="checkbox" name="filter_job_type[]" value="<?php echo esc_attr( $tekseries_type->slug ); ?>" <?php checked( ! $tekseries_chosen || in_array( $tekseries_type->slug, $tekseries_chosen, true ) ); ?>>
							<?php echo tekseries_blocks_icon_svg( tekseries_blocks_job_type_icon( $tekseries_type ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
							<?php echo tekseries_blocks_icon_svg( 'check' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
							<?php echo esc_html( $tekseries_type->name ); ?>
						</label>
					<?php endforeach; ?>
				</fieldset>
			<?php endif; ?>
			<?php if ( get_option( 'job_manager_enable_remote_position' ) ) : ?>
				<label class="ts-job-switch">
					<input type="checkbox" role="switch" name="remote_position" value="1" <?php checked( $tekseries_remote ); ?>>
					<span class="ts-job-switch__track" aria-hidden="true"></span>
					<?php esc_html_e( 'Remote positions only', 'tekseries-blocks' ); ?>
				</label>
			<?php endif; ?>
		</div>
	</form>

	<?php // Focusable by the script, which sends focus here after a change of page. ?>
	<section
		class="ts-job-results"
		aria-label="<?php esc_attr_e( 'Job listings', 'tekseries-blocks' ); ?>"
		tabindex="-1"
		data-wp-interactive="tekseries/job-listings"
		data-wp-router-region="tekseries/job-listings"
	>
		<div class="ts-job-results__head">
			<?php // A status, so the new count is read out when the results change in place. ?>
			<p class="showing_jobs" role="status">
				<?php
				$tekseries_count = '<strong>' . esc_html( number_format_i18n( $tekseries_found ) ) . '</strong>';
				echo wp_kses_post(
					$tekseries_filtered
						/* translators: %s: number of jobs, in bold. */
						? sprintf( _n( '%s job matches your search', '%s jobs match your search', $tekseries_found, 'tekseries-blocks' ), $tekseries_count )
						/* translators: %s: number of jobs, in bold. */
						: sprintf( _n( '%s open job', '%s open jobs', $tekseries_found, 'tekseries-blocks' ), $tekseries_count )
				);
				?>
			</p>
			<p class="ts-job-results__order">
				<?php esc_html_e( 'Newest first', 'tekseries-blocks' ); ?>
				<?php echo tekseries_blocks_icon_svg( 'south' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			</p>
		</div>

		<?php // Always there, if empty: WP Job Manager counts impressions on the first list it finds, for as long as the page lives. ?>
		<ul class="job_listings" <?php echo $tekseries_listed ? '' : 'hidden'; ?>>
			<?php
			while ( $tekseries_jobs->have_posts() ) {
				$tekseries_jobs->the_post();
				get_job_manager_template_part( 'content', 'job_listing' );
			}
			wp_reset_postdata();
			?>
		</ul>
		<?php if ( $tekseries_listed ) : ?>
			<?php
			$tekseries_links = paginate_links(
				array(
					'base'      => add_query_arg( 'pg', '%#%', add_query_arg( $tekseries_filters, $tekseries_base ) ),
					'format'    => '',
					'current'   => $tekseries_page,
					'total'     => (int) $tekseries_jobs->max_num_pages,
					'end_size'  => 1,
					'mid_size'  => 2,
					'prev_text' => tekseries_blocks_icon_svg( 'arrow_back' ) . '<span class="screen-reader-text">' . esc_html__( 'Previous page', 'tekseries-blocks' ) . '</span>',
					'next_text' => tekseries_blocks_icon_svg( 'arrow_forward' ) . '<span class="screen-reader-text">' . esc_html__( 'Next page', 'tekseries-blocks' ) . '</span>',
				)
			);
			?>
			<?php if ( $tekseries_links ) : ?>
				<nav class="job-manager-pagination ts-job-pages" aria-label="<?php esc_attr_e( 'Job pages', 'tekseries-blocks' ); ?>" data-wp-on--click="actions.page">
					<?php echo $tekseries_links; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built by core's paginate_links(). ?>
				</nav>
			<?php endif; ?>
		<?php else : ?>
			<div class="ts-job-empty">
				<?php echo tekseries_blocks_icon_svg( 'work_off' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<?php if ( $tekseries_filtered ) : ?>
					<p class="ts-job-empty__title"><?php esc_html_e( 'No jobs match these filters', 'tekseries-blocks' ); ?></p>
					<a class="ts-job-empty__clear" href="<?php echo esc_url( $tekseries_base ); ?>" data-wp-on--click="actions.clear"><?php esc_html_e( 'Clear filters', 'tekseries-blocks' ); ?></a>
				<?php else : ?>
					<p class="ts-job-empty__title"><?php esc_html_e( 'There are no open jobs right now', 'tekseries-blocks' ); ?></p>
				<?php endif; ?>
			</div>
		<?php endif; ?>
	</section>
</div>
