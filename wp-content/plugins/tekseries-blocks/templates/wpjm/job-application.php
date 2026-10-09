<?php
/**
 * How to apply (WP Job Manager template override): a native disclosure, so
 * "Apply for job" opens the details without JavaScript or jQuery.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$tekseries_apply = get_the_job_application_method();
if ( ! $tekseries_apply ) {
	return;
}
?>
<details class="job_application application ts-job-apply" id="apply">
	<summary class="application_button ts-job-button">
		<?php esc_html_e( 'Apply for job', 'tekseries-blocks' ); ?>
		<?php echo tekseries_blocks_icon_svg( 'arrow_outward' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
		<?php echo tekseries_blocks_icon_svg( 'expand_less' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
	</summary>
	<?php do_action( 'job_application_start', $tekseries_apply ); ?>
	<div class="application_details">
		<?php do_action( 'job_manager_application_details_' . $tekseries_apply->type, $tekseries_apply ); ?>
	</div>
	<?php do_action( 'job_application_end', $tekseries_apply ); ?>
</details>
