<?php
/**
 * Title: Job Series page
 * Slug: tekseries/page-job-series
 * Categories: tekseries-pages
 * Description: Job Series hero, the third-party note, the job listings and the employer card.
 * Block Types: core/post-content
 * Post Types: page
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:pattern {"slug":"tekseries/job-series-hero"} /-->

<!-- wp:group {"align":"wide","className":"is-style-card-lilac","style":{"spacing":{"blockGap":"var:preset|spacing|12","margin":{"top":"var:preset|spacing|24"},"padding":{"top":"var:preset|spacing|16","right":"var:preset|spacing|20","bottom":"var:preset|spacing|16","left":"var:preset|spacing|20"}},"border":{"radius":"var:preset|border-radius|md"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group alignwide is-style-card-lilac" style="border-radius:var(--wp--preset--border-radius--md);margin-top:var(--wp--preset--spacing--24);padding-top:var(--wp--preset--spacing--16);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--16);padding-left:var(--wp--preset--spacing--20)"><!-- wp:icon {"icon":"tekseries/info","style":{"dimensions":{"width":"22px"}},"textColor":"coral"} /-->

<!-- wp:paragraph {"textColor":"plum","fontSize":"body-s"} -->
<p class="has-plum-color has-text-color has-body-s-font-size"><strong><?php echo esc_html__( 'Please note:', 'tekseries' ); ?></strong> <?php echo esc_html__( 'Job Series shares select job openings from third-party sources, who retain full rights and credits to their job listings.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:tekseries/job-listings {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} /-->

<!-- wp:pattern {"slug":"tekseries/job-series-cta"} /-->
