<?php
/**
 * Title: Single job
 * Slug: tekseries/template-single-job
 * Inserter: no
 * Description: Content of the single-job template.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"align":"wide","className":"is-style-hero-plum ts-hero\u002d\u002djob","style":{"spacing":{"blockGap":"var:preset|spacing|16"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group alignwide is-style-hero-plum ts-hero--job"><!-- wp:breadcrumbs /-->

<!-- wp:post-title {"level":1,"className":"ts-job-title","style":{"typography":{"lineHeight":"1.08"}},"textColor":"white","fontSize":"heading-2"} /-->

<!-- wp:group {"className":"ts-job-chips","style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group ts-job-chips"><!-- wp:group {"className":"ts-job-chip ts-job-chip\u002d\u002dtype","style":{"spacing":{"blockGap":"6px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-job-chip ts-job-chip--type"><!-- wp:icon {"icon":"tekseries/work","className":"ts-job-type-icon","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/job-field","args":{"key":"type"}}}},"className":"ts-job-value"} -->
<p class="ts-job-value"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-job-chip","style":{"spacing":{"blockGap":"6px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-job-chip"><!-- wp:icon {"icon":"tekseries/location_on","className":"ts-job-location-icon","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/job-field","args":{"key":"location"}}}},"className":"ts-job-value"} -->
<p class="ts-job-value"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-job-chip","style":{"spacing":{"blockGap":"6px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-job-chip"><!-- wp:icon {"icon":"tekseries/calendar_month","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/job-field","args":{"key":"posted"}}}},"className":"ts-job-value"} -->
<p class="ts-job-value"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:icon {"icon":"tekseries/work","className":"ts-hero-watermark"} /--></div>
<!-- /wp:group -->

<!-- wp:post-content {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}},"layout":{"type":"default"}} /-->

<!-- wp:group {"tagName":"section","align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|56"},"blockGap":"var:preset|spacing|16"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<section class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--56)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|16"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:heading {"fontSize":"heading-3"} -->
<h2 class="wp-block-heading has-heading-3-font-size"><?php echo esc_html__( 'More jobs', 'tekseries' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-soft"} -->
<div class="wp-block-button is-style-soft"><a class="wp-block-button__link wp-element-button" href="/jobs/"><?php echo esc_html__( 'View all', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:query {"queryId":6,"query":{"perPage":3,"pages":0,"offset":0,"postType":"job_listing","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false,"taxQuery":null,"parents":[],"format":[],"excludeCurrent":true},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-query alignwide"><!-- wp:group {"className":"ts-card-grid","style":{"spacing":{"blockGap":"var:preset|spacing|12"},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group ts-card-grid"><!-- wp:post-template {"className":"ts-contents"} -->
<!-- wp:group {"className":"is-style-card ts-job-card","style":{"spacing":{"blockGap":"6px","padding":{"top":"18px","right":"18px","bottom":"18px","left":"18px"}},"border":{"radius":"var:preset|border-radius|md"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group is-style-card ts-job-card" style="border-radius:var(--wp--preset--border-radius--md);padding-top:18px;padding-right:18px;padding-bottom:18px;padding-left:18px"><!-- wp:post-title {"level":3,"isLink":true,"style":{"typography":{"fontWeight":"700","lineHeight":"1.3"}},"fontSize":"body-l"} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/job-field","args":{"key":"company"}}}},"className":"ts-job-value","style":{"typography":{"fontWeight":"600"}},"textColor":"muted","fontSize":"caption"} -->
<p class="ts-job-value has-muted-color has-text-color has-caption-font-size" style="font-weight:600"></p>
<!-- /wp:paragraph -->

<!-- wp:group {"className":"ts-job-card__meta","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|4","left":"var:preset|spacing|12"},"margin":{"top":"var:preset|spacing|4"}}},"fontSize":"caption","layout":{"type":"flex","flexWrap":"wrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-job-card__meta has-caption-font-size" style="margin-top:var(--wp--preset--spacing--4)"><!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/job-field","args":{"key":"type"}}}},"className":"ts-job-value ts-job-type-chip"} -->
<p class="ts-job-value ts-job-type-chip"></p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/location_on","className":"ts-job-location-icon","style":{"dimensions":{"width":"16px"}},"textColor":"coral"} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"tekseries/job-field","args":{"key":"location"}}}},"className":"ts-job-value"} -->
<p class="ts-job-value"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:post-template --></div>
<!-- /wp:group --></div>
<!-- /wp:query --></section>
<!-- /wp:group -->
