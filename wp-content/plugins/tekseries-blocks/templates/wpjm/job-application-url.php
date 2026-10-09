<?php
/**
 * Apply by URL (WP Job Manager template override).
 *
 * @package TekSeries
 *
 * @var stdClass $apply Application method: type "url", url.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$tekseries_link = sprintf(
	'<a href="%1$s" target="_blank" rel="nofollow noopener">%2$s</a>',
	esc_url( $apply->url ),
	esc_html( (string) wp_parse_url( $apply->url, PHP_URL_HOST ) )
);
?>
<p>
	<?php
	/* translators: %s: link to the employer's application page, shown as its domain. */
	echo wp_kses_post( sprintf( __( 'To apply for this job, visit %s.', 'tekseries-blocks' ), $tekseries_link ) );
	?>
</p>
