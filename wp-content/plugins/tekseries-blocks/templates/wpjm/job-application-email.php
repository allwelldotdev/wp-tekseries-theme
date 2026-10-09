<?php
/**
 * Apply by email (WP Job Manager template override).
 *
 * @package TekSeries
 *
 * @var stdClass $apply Application method: type "email", email (obfuscated), subject.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$tekseries_link = sprintf(
	'<a class="job_application_email" href="mailto:%1$s?subject=%2$s">%1$s</a>',
	esc_html( $apply->email ),
	rawurlencode( wp_specialchars_decode( $apply->subject, ENT_QUOTES ) )
);
?>
<p>
	<?php
	/* translators: %s: email link to the employer. */
	echo wp_kses_post( sprintf( __( 'To apply for this job, email your details to %s.', 'tekseries-blocks' ), $tekseries_link ) );
	?>
</p>
