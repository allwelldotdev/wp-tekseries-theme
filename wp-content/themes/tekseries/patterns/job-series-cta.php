<?php
/**
 * Title: Job Series: For employers
 * Slug: tekseries/job-series-cta
 * Categories: tekseries-pages
 * Description: A saffron card inviting employers to post or manage jobs.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"tagName":"section","align":"wide","className":"is-style-card-saffron","style":{"spacing":{"blockGap":"var:preset|spacing|20","margin":{"top":"var:preset|spacing|48"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<section class="wp-block-group alignwide is-style-card-saffron" style="margin-top:var(--wp--preset--spacing--48)"><!-- wp:icon {"icon":"tekseries/work","className":"is-style-deco"} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'For employers', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","lineHeight":"1.2"}},"fontSize":"card-title","fontFamily":"display"} -->
<p class="has-display-font-family has-card-title-font-size" style="font-weight:700;line-height:1.2"><?php echo esc_html__( 'Hiring interns or entry-level talent?', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'Post your opening for free, or manage the jobs you’ve already posted.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-dark ts-icon-add_business"} -->
<div class="wp-block-button is-style-dark ts-icon-add_business"><a class="wp-block-button__link wp-element-button" href="/submit-job/"><?php echo esc_html__( 'Post a job', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline ts-icon-dashboard"} -->
<div class="wp-block-button is-style-outline ts-icon-dashboard"><a class="wp-block-button__link wp-element-button" href="/job-dashboard/"><?php echo esc_html__( 'Employer job view', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></section>
<!-- /wp:group -->
