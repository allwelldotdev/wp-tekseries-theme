<?php
/**
 * Title: Job Series: Hero
 * Slug: tekseries/job-series-hero
 * Categories: tekseries-pages
 * Description: Job Series hero with the number of open jobs.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"align":"wide","className":"is-style-hero-plum","style":{"spacing":{"blockGap":"var:preset|spacing|40"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group alignwide is-style-hero-plum"><!-- wp:group {"style":{"spacing":{"blockGap":"18px"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"top"}} -->
<div class="wp-block-group"><!-- wp:breadcrumbs /-->

<!-- wp:heading {"level":1,"textColor":"white"} -->
<h1 class="wp-block-heading has-white-color has-text-color"><?php echo esc_html__( 'Job Series', 'tekseries' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"}},"textColor":"lilac-deep","fontSize":"lead"} -->
<p class="has-lilac-deep-color has-text-color has-lead-font-size" style="line-height:1.5"><?php echo esc_html__( 'A free, curated portal matching job-ready youth with employers seeking interns, entry-level and mid-level talent.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|4"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--4)"><!-- wp:button {"className":"is-style-accent ts-icon-add_business"} -->
<div class="wp-block-button is-style-accent ts-icon-add_business"><a class="wp-block-button__link wp-element-button" href="/submit-job/"><?php echo esc_html__( 'Post a job', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-glass ts-icon-upload_file"} -->
<div class="wp-block-button is-style-glass ts-icon-upload_file"><a class="wp-block-button__link wp-element-button" href="#"><?php echo esc_html__( 'Upload your CV', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-card","style":{"spacing":{"blockGap":"14px","padding":{"top":"var:preset|spacing|24","right":"26px","bottom":"var:preset|spacing|24","left":"26px"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"center"}} -->
<div class="wp-block-group is-style-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--24);padding-right:26px;padding-bottom:var(--wp--preset--spacing--24);padding-left:26px"><!-- wp:group {"style":{"spacing":{"blockGap":"10px"}},"layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"bottom"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/job-stats","args":{"key":"open"}}}},"className":"ts-job-stat","style":{"typography":{"fontWeight":"800","lineHeight":"1"}},"textColor":"plum","fontSize":"heading-2","fontFamily":"display"} -->
<p class="ts-job-stat has-plum-color has-text-color has-display-font-family has-heading-2-font-size" style="font-weight:800;line-height:1"></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"}}} -->
<p style="font-weight:600"><?php echo esc_html__( 'open jobs, curated and aggregated daily', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/search","style":{"dimensions":{"width":"20px"}},"textColor":"coral"} /-->

<!-- wp:paragraph {"fontSize":"body-s"} -->
<p class="has-body-s-font-size"><?php echo esc_html__( 'Free job searches', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/co_present","style":{"dimensions":{"width":"20px"}},"textColor":"coral"} /-->

<!-- wp:paragraph {"fontSize":"body-s"} -->
<p class="has-body-s-font-size"><?php echo esc_html__( 'Interviews, assessments & CV workshops', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
