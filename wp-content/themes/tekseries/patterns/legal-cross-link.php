<?php
/**
 * Title: Legal: Link to the other legal page
 * Slug: tekseries/legal-cross-link
 * Categories: tekseries-pages
 * Description: A saffron band for the end of a legal page, pointing to the other one.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"className":"is-style-card-saffron ts-legal-band","style":{"spacing":{"blockGap":"14px","padding":{"top":"var:preset|spacing|24","right":"var:preset|spacing|28","bottom":"var:preset|spacing|24","left":"var:preset|spacing|28"}},"border":{"radius":"clamp(1rem, 0.8143rem + 0.7619vw, 1.5rem)"},"@mobile":{"spacing":{"padding":{"top":"var:preset|spacing|20","right":"18px","bottom":"var:preset|spacing|20","left":"18px"}}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group is-style-card-saffron ts-legal-band" style="border-radius:clamp(1rem, 0.8143rem + 0.7619vw, 1.5rem);padding-top:var(--wp--preset--spacing--24);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--24);padding-left:var(--wp--preset--spacing--28)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontSize":"clamp(1.125rem, 1.0786rem + 0.1905vw, 1.25rem)","fontWeight":"800","lineHeight":"1.3"}},"fontFamily":"display"} -->
<p class="has-display-font-family" style="font-size:clamp(1.125rem, 1.0786rem + 0.1905vw, 1.25rem);font-weight:800;line-height:1.3"><?php echo esc_html__( 'Read our Terms and Conditions', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"}},"fontSize":"body-s"} -->
<p class="has-body-s-font-size" style="line-height:1.5"><?php echo esc_html__( 'This Privacy Policy applies in addition to the terms and conditions of our Site.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-dark ts-icon-arrow_forward ts-icon-after"} -->
<div class="wp-block-button is-style-dark ts-icon-arrow_forward ts-icon-after"><a class="wp-block-button__link wp-element-button" href="/terms/"><?php echo esc_html__( 'Terms and Conditions', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
