<?php
/**
 * Title: Maker Prize page
 * Slug: tekseries/page-maker-prize
 * Categories: tekseries-pages
 * Description: The Maker’s Prize application page: a countdown to the page’s deadline, the eligibility criteria and a closing band. Blocks marked ts-when-open show until the deadline, ts-when-closed ones after it.
 * Block Types: core/post-content
 * Post Types: page
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"align":"wide","className":"is-style-card-saffron ts-prize-hero","style":{"border":{"radius":"var:preset|border-radius|xl"},"spacing":{"blockGap":"var:preset|spacing|56","padding":{"top":"var:preset|spacing|56","right":"var:preset|spacing|56","bottom":"var:preset|spacing|56","left":"var:preset|spacing|56"}},"@tablet":{"layout":{"columnCount":1},"spacing":{"blockGap":"var:preset|spacing|28","padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|32","bottom":"var:preset|spacing|40","left":"var:preset|spacing|32"}}},"@mobile":{"layout":{"columnCount":1},"spacing":{"blockGap":"var:preset|spacing|20","padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|20","bottom":"var:preset|spacing|28","left":"var:preset|spacing|20"}}}},"layout":{"type":"grid","columnCount":2,"minimumColumnWidth":null}} -->
<div class="wp-block-group alignwide is-style-card-saffron ts-prize-hero" style="border-radius:var(--wp--preset--border-radius--xl);padding-top:var(--wp--preset--spacing--56);padding-right:var(--wp--preset--spacing--56);padding-bottom:var(--wp--preset--spacing--56);padding-left:var(--wp--preset--spacing--56)"><!-- wp:icon {"icon":"tekseries/emoji_events","className":"is-style-deco-bottom"} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"left","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:breadcrumbs /-->

<!-- wp:group {"className":"ts-prize-chip","style":{"spacing":{"blockGap":"6px"}},"backgroundColor":"ink","textColor":"white","layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-prize-chip has-white-color has-ink-background-color has-text-color has-background"><!-- wp:icon {"icon":"tekseries/emoji_events","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'Pillar III · Maker’s Prize', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:heading {"level":1,"fontSize":"heading-2"} -->
<h1 class="wp-block-heading has-heading-2-font-size"><?php echo esc_html__( 'Annual Maker Prize Application', 'tekseries' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"ts-when-open","style":{"typography":{"lineHeight":"1.6"}},"fontSize":"body-l"} -->
<p class="ts-when-open has-body-l-font-size" style="line-height:1.6"><?php echo esc_html__( 'TekSeries is accepting applications for our Annual Maker Prize, designed to support students, recent graduates, and early-stage startups. We are awarding equity-free cash prizes, alongside an exclusive Accelerator Sponsorship that includes comprehensive legal and startup guidance to our first-place winner.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"ts-when-closed","style":{"typography":{"lineHeight":"1.6"}},"fontSize":"body-l"} -->
<p class="ts-when-closed has-body-l-font-size" style="line-height:1.6"><?php echo esc_html__( 'Applications are now closed for our Annual Maker Prize, designed to support students, recent graduates, and early-stage startups. We are awarding equity-free cash prizes, alongside an exclusive Accelerator Sponsorship that includes comprehensive legal and startup guidance to our first-place winner.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-prize-clock","style":{"spacing":{"blockGap":"var:preset|spacing|20","padding":{"top":"var:preset|spacing|32","right":"var:preset|spacing|32","bottom":"var:preset|spacing|32","left":"var:preset|spacing|32"}},"border":{"radius":"var:preset|border-radius|lg"},"@tablet":{"spacing":{"padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"}}},"@mobile":{"spacing":{"padding":{"top":"var:preset|spacing|20","right":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|16"}}},"backgroundColor":"ink","textColor":"white","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group ts-prize-clock has-white-color has-ink-background-color has-text-color has-background" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--32);padding-right:var(--wp--preset--spacing--32);padding-bottom:var(--wp--preset--spacing--32);padding-left:var(--wp--preset--spacing--32)"><!-- wp:group {"className":"ts-when-open","style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-when-open"><!-- wp:icon {"icon":"tekseries/timer","style":{"dimensions":{"width":"20px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"className":"is-style-eyebrow","textColor":"saffron"} -->
<p class="is-style-eyebrow has-saffron-color has-text-color"><?php echo esc_html__( 'Applications close in', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-when-closed","style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-when-closed"><!-- wp:icon {"icon":"tekseries/event_busy","style":{"dimensions":{"width":"20px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"className":"is-style-eyebrow","textColor":"saffron"} -->
<p class="is-style-eyebrow has-saffron-color has-text-color"><?php echo esc_html__( 'Applications are closed', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:tekseries/deadline-countdown /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/event","style":{"dimensions":{"width":"20px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"textColor":"lilac-deep","fontSize":"body-s"} -->
<p class="has-lilac-deep-color has-text-color has-body-s-font-size"><strong><?php echo esc_html__( 'Submission Deadline:', 'tekseries' ); ?></strong> <?php echo esc_html__( 'December 1, 2026, 11:59 PM WAT', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-accent ts-icon-arrow_forward ts-icon-after ts-survey-makers-prize ts-entry-maker_prize_hero ts-when-open"} -->
<div class="wp-block-button is-style-accent ts-icon-arrow_forward ts-icon-after ts-survey-makers-prize ts-entry-maker_prize_hero ts-when-open"><a class="wp-block-button__link wp-element-button" href="#"><?php echo esc_html__( 'Apply now', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"tagName":"button","className":"ts-icon-lock ts-disabled ts-when-closed"} -->
<div class="wp-block-button ts-icon-lock ts-disabled ts-when-closed"><button type="button" class="wp-block-button__link wp-element-button"><?php echo esc_html__( 'Applications closed', 'tekseries' ); ?></button></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:paragraph {"className":"ts-when-closed","textColor":"lilac-deep","fontSize":"body-s"} -->
<p class="ts-when-closed has-lilac-deep-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'Winners are announced beginning the first quarter of the new year.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"section","align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|24","margin":{"top":"var:preset|spacing|56"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"},"anchor":"eligibility"} -->
<section class="wp-block-group alignwide" id="eligibility" style="margin-top:var(--wp--preset--spacing--56)"><!-- wp:group {"style":{"spacing":{"blockGap":"10px"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:heading -->
<h2 class="wp-block-heading"><?php echo esc_html__( 'Eligibility Criteria', 'tekseries' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.6"}},"textColor":"body","fontSize":"body-l"} -->
<p class="has-body-color has-text-color has-body-l-font-size" style="line-height:1.6"><?php echo esc_html__( 'Applicants must meet at least one of the following requirements:', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-prize-criteria","style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group ts-prize-criteria"><!-- wp:group {"className":"is-style-card","style":{"spacing":{"blockGap":"var:preset|spacing|16","padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} -->
<div class="wp-block-group is-style-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--28);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--28);padding-left:var(--wp--preset--spacing--28)"><!-- wp:icon {"icon":"tekseries/school","className":"is-style-tile"} /-->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","lineHeight":"1.5"}},"textColor":"ink","fontSize":"body-l"} -->
<p class="has-ink-color has-text-color has-body-l-font-size" style="font-weight:600;line-height:1.5"><?php echo esc_html__( 'Students currently enrolled in a secondary school, vocational institution, polytechnic or university program.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-card","style":{"spacing":{"blockGap":"var:preset|spacing|16","padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} -->
<div class="wp-block-group is-style-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--28);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--28);padding-left:var(--wp--preset--spacing--28)"><!-- wp:icon {"icon":"tekseries/workspace_premium","className":"is-style-tile"} /-->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","lineHeight":"1.5"}},"textColor":"ink","fontSize":"body-l"} -->
<p class="has-ink-color has-text-color has-body-l-font-size" style="font-weight:600;line-height:1.5"><?php echo esc_html__( 'Recent graduates who completed their degree within the last 24 months.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-card","style":{"spacing":{"blockGap":"var:preset|spacing|16","padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} -->
<div class="wp-block-group is-style-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--28);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--28);padding-left:var(--wp--preset--spacing--28)"><!-- wp:icon {"icon":"tekseries/rocket_launch","className":"is-style-tile"} /-->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","lineHeight":"1.5"}},"textColor":"ink","fontSize":"body-l"} -->
<p class="has-ink-color has-text-color has-body-l-font-size" style="font-weight:600;line-height:1.5"><?php echo esc_html__( 'Startups with less than $10,000 in lifetime funding or revenue.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-card-lilac","style":{"spacing":{"blockGap":"var:preset|spacing|12","padding":{"top":"var:preset|spacing|20","right":"var:preset|spacing|24","bottom":"var:preset|spacing|20","left":"var:preset|spacing|24"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group is-style-card-lilac" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--24);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--24)"><!-- wp:icon {"icon":"tekseries/info","style":{"dimensions":{"width":"22px"}},"textColor":"plum"} /-->

<!-- wp:paragraph {"textColor":"ink","fontSize":"body-l"} -->
<p class="has-ink-color has-text-color has-body-l-font-size"><strong><?php echo esc_html__( 'Note:', 'tekseries' ); ?></strong> <?php echo esc_html__( 'All projects must feature an original, functional prototype, product, service or application.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->

<!-- wp:group {"tagName":"section","align":"wide","className":"is-style-card-plum ts-prize-band","style":{"spacing":{"blockGap":"var:preset|spacing|32","margin":{"top":"var:preset|spacing|56"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<section class="wp-block-group alignwide is-style-card-plum ts-prize-band" style="margin-top:var(--wp--preset--spacing--56)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:tekseries/deadline-countdown {"view":"days"} /-->

<!-- wp:paragraph {"className":"ts-when-closed"} -->
<p class="ts-when-closed"><?php echo esc_html__( 'Applications are closed', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","lineHeight":"1.2"}},"fontSize":"card-title","fontFamily":"display"} -->
<p class="has-display-font-family has-card-title-font-size" style="font-weight:700;line-height:1.2"><?php echo esc_html__( 'Submission Deadline: December 1, 2026.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-accent ts-icon-arrow_forward ts-icon-after ts-survey-makers-prize ts-entry-maker_prize_cta ts-when-open"} -->
<div class="wp-block-button is-style-accent ts-icon-arrow_forward ts-icon-after ts-survey-makers-prize ts-entry-maker_prize_cta ts-when-open"><a class="wp-block-button__link wp-element-button" href="#"><?php echo esc_html__( 'Apply now', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"tagName":"button","className":"ts-icon-lock ts-disabled ts-when-closed"} -->
<div class="wp-block-button ts-icon-lock ts-disabled ts-when-closed"><button type="button" class="wp-block-button__link wp-element-button"><?php echo esc_html__( 'Applications closed', 'tekseries' ); ?></button></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></section>
<!-- /wp:group -->
