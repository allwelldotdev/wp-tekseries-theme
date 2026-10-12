<?php
/**
 * Single job body (WP Job Manager template override): the description card
 * with "Apply for job" and "All jobs" under it, beside a card with the
 * company, the job's details and how to apply. The submission preview shows
 * the same body.
 *
 * The side card comes first in the markup, so on tablet and mobile it sits
 * above the description (the boards' order) with no reordering.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $post;

if ( ( post_password_required( $post ) && ! is_super_admin() ) || ! job_manager_user_can_view_job_listing( $post->ID ) ) {
	get_job_manager_template_part( 'access-denied', 'single-job_listing' );
	return;
}

wp_enqueue_style( 'tekseries-blocks-job' );

if ( get_option( 'job_manager_hide_expired_content', 1 ) && 'expired' === $post->post_status ) {
	printf(
		'<p class="ts-job-note" role="note">%1$s<span>%2$s</span></p>',
		tekseries_blocks_icon_svg( 'event_busy' ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection.
		esc_html__( 'This listing has expired.', 'tekseries-blocks' )
	);
	return;
}

$tekseries_preview = 'preview' === $post->post_status;
$tekseries_apply   = candidates_can_apply() ? get_the_job_application_method() : false;
$tekseries_jobs    = $tekseries_preview ? false : job_manager_get_permalink( 'jobs' );
?>
<div class="single_job_listing ts-job">
	<div class="ts-job__aside">
		<div class="ts-job__card">
			<?php
			// Company (moved first by the plugin), then the job details.
			do_action( 'single_job_listing_start' );
			if ( $tekseries_apply ) {
				get_job_manager_template( 'job-application.php' );
			}
			?>
			<?php if ( ! $tekseries_preview ) : ?>
				<?php
				/**
				 * Filters where "Upload your CV to Job Series" leads.
				 *
				 * The site has no page for it yet, so the link is "#" until one
				 * is filtered in.
				 *
				 * @param string $url Link address.
				 */
				$tekseries_cv_url = (string) apply_filters( 'tekseries_blocks_cv_upload_url', '#' );
				?>
				<a class="ts-job-button ts-job-button--outline" href="<?php echo esc_url( $tekseries_cv_url ); ?>">
					<?php echo tekseries_blocks_icon_svg( 'upload_file' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
					<?php esc_html_e( 'Upload your CV to Job Series', 'tekseries-blocks' ); ?>
				</a>
			<?php endif; ?>
		</div>
		<?php if ( ! $tekseries_preview ) : ?>
			<p class="ts-job-note" role="note">
				<?php echo tekseries_blocks_icon_svg( 'info' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
				<span><?php esc_html_e( 'Job Series shares select job openings from third-party sources, who retain full rights and credits to their job listings.', 'tekseries-blocks' ); ?></span>
			</p>
		<?php endif; ?>
	</div>

	<div class="ts-job__main">
		<div class="job_description ts-job__description">
			<?php wpjm_the_job_description(); ?>
		</div>

		<?php if ( ( $tekseries_apply && ! $tekseries_preview ) || $tekseries_jobs ) : ?>
			<div class="ts-job__actions">
				<?php if ( $tekseries_apply && ! $tekseries_preview ) : ?>
					<?php
					// Goes straight to the application: the employer's page, or a new email
					// (the address is entity-encoded against spam bots, so esc_url() would break it).
					$tekseries_apply_href = 'email' === $tekseries_apply->type
						? esc_attr( 'mailto:' . $tekseries_apply->email . '?subject=' . rawurlencode( wp_specialchars_decode( $tekseries_apply->subject, ENT_QUOTES ) ) )
						: esc_url( $tekseries_apply->url );
					?>
					<a
						class="ts-job-button"
						href="<?php echo $tekseries_apply_href; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped above. ?>"
						<?php if ( 'url' === $tekseries_apply->type ) : ?>
							target="_blank" rel="nofollow noopener"
						<?php endif; ?>
					>
						<?php esc_html_e( 'Apply for job', 'tekseries-blocks' ); ?>
						<?php echo tekseries_blocks_icon_svg( 'arrow_outward' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
					</a>
				<?php endif; ?>
				<?php if ( $tekseries_jobs ) : ?>
					<a class="ts-job-button ts-job-button--soft" href="<?php echo esc_url( $tekseries_jobs ); ?>">
						<?php echo tekseries_blocks_icon_svg( 'arrow_back' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
						<?php esc_html_e( 'All jobs', 'tekseries-blocks' ); ?>
					</a>
				<?php endif; ?>
			</div>
		<?php endif; ?>

		<?php do_action( 'single_job_listing_end' ); ?>
	</div>
</div>
