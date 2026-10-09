<?php
/**
 * Company on a single job (WP Job Manager template override): the logo or
 * initials tile, "Company" and the name, then the tagline and links the
 * employer gave, if any.
 *
 * @package TekSeries
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

global $post;

$tekseries_company = get_the_company_name();
if ( ! $tekseries_company ) {
	return;
}

// [ URL, label, icon ] for each link the employer filled in.
$tekseries_links   = array();
$tekseries_website = get_the_company_website();
$tekseries_video   = get_the_company_video();
$tekseries_twitter = get_the_company_twitter();
if ( $tekseries_website ) {
	$tekseries_links[] = array( $tekseries_website, __( 'Website', 'tekseries-blocks' ), tekseries_blocks_icon_svg( 'language' ) );
}
if ( $tekseries_twitter ) {
	$tekseries_links[] = array( 'https://x.com/' . $tekseries_twitter, '@' . $tekseries_twitter, tekseries_blocks_icon_svg( 'alternate_email' ) );
}
if ( $tekseries_video ) {
	$tekseries_links[] = array( $tekseries_video, __( 'Company video', 'tekseries-blocks' ), tekseries_blocks_icon_svg( 'smart_display' ) );
}
?>
<div class="company ts-job-company">
	<div class="ts-job-company__head">
		<?php echo tekseries_blocks_company_tile( $post ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped by the helper. ?>
		<p class="ts-job-company__name">
			<span class="ts-job-eyebrow"><?php esc_html_e( 'Company', 'tekseries-blocks' ); ?></span>
			<strong class="name"><?php echo esc_html( $tekseries_company ); ?></strong>
		</p>
	</div>
	<?php the_company_tagline( '<p class="tagline">', '</p>' ); ?>
	<?php if ( $tekseries_links ) : ?>
		<ul class="ts-job-company__links">
			<?php foreach ( $tekseries_links as [ $tekseries_url, $tekseries_label, $tekseries_icon ] ) : ?>
				<li>
					<a href="<?php echo esc_url( $tekseries_url ); ?>" rel="nofollow noopener" target="_blank">
						<?php echo $tekseries_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG from the plugin's icon collection. ?>
						<?php echo esc_html( $tekseries_label ); ?>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	<?php endif; ?>
</div>
