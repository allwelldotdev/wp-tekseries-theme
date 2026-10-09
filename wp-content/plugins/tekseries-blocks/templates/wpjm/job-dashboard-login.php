<?php
/**
 * Job dashboard for visitors (WP Job Manager template override). There is no
 * board for this state; it reuses the submission page's sign-in card.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

wp_enqueue_style( 'tekseries-blocks-job-submit' );
?>
<div id="job-manager-job-dashboard" class="ts-signin ts-signin--single">
	<div class="account-sign-in ts-signin__card">
		<span class="ts-submit-card__icon" aria-hidden="true"><?php echo tekseries_blocks_icon_svg( 'key' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?></span>
		<h2><?php esc_html_e( 'Sign in to manage your jobs', 'tekseries-blocks' ); ?></h2>
		<p><?php esc_html_e( 'You need to be signed in to manage your listings.', 'tekseries-blocks' ); ?></p>
		<a class="ts-job-button" href="<?php echo esc_url( apply_filters( 'job_manager_job_dashboard_login_url', wp_login_url( get_permalink() ) ) ); ?>">
			<?php echo tekseries_blocks_icon_svg( 'login' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
			<?php esc_html_e( 'Sign in', 'tekseries-blocks' ); ?>
		</a>
		<p class="ts-signin__help">
			<?php
			/* translators: %s: link to the contact page. */
			echo wp_kses_post( sprintf( __( 'No account yet? %s to get an employer account.', 'tekseries-blocks' ), '<a href="' . esc_url( home_url( '/contact/#contact-form' ) ) . '">' . esc_html__( 'Contact us', 'tekseries-blocks' ) . '</a>' ) );
			?>
		</p>
	</div>
</div>
