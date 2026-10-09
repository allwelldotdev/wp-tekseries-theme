<?php
/**
 * A job in the Job Listings block (WP Job Manager template override): the
 * company tile, title and company, location, then the type and when it was
 * posted. The whole row is the link; `li.job_listing` with its post class is
 * what WP Job Manager counts search impressions on.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $post;

if ( post_password_required( $post ) || ! job_manager_user_can_view_job_listing( $post->ID ) ) {
	return;
}

$tekseries_type = get_option( 'job_manager_enable_types' ) ? tekseries_blocks_job_type( $post ) : null;
?>
<li <?php job_listing_class( 'ts-job-row' ); ?>>
	<a class="ts-job-row__link" href="<?php the_job_permalink(); ?>">
		<?php echo tekseries_blocks_company_tile( $post ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper. ?>
		<span class="position">
			<h3 class="ts-job-row__title"><?php wpjm_the_job_title(); ?></h3>
			<span class="company"><?php echo esc_html( (string) get_the_company_name() ); ?></span>
		</span>
		<span class="meta">
			<span class="location">
				<?php echo $post->_remote_position ? tekseries_blocks_icon_svg( 'public' ) : tekseries_blocks_icon_svg( 'location_on' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<?php echo esc_html( tekseries_blocks_job_location( $post ) ); ?>
			</span>
			<span class="ts-job-row__end">
				<?php if ( $tekseries_type ) : ?>
					<span class="job-type ts-job-type ts-job-type--<?php echo esc_attr( $tekseries_type->slug ); ?>"><?php echo esc_html( $tekseries_type->name ); ?></span>
				<?php endif; ?>
				<span class="date">
					<?php echo tekseries_blocks_icon_svg( 'schedule' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
					<?php echo esc_html( tekseries_blocks_job_posted( $post ) ); ?>
				</span>
			</span>
		</span>
	</a>
</li>
