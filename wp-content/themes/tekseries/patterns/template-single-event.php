<?php
/**
 * Title: Single event
 * Slug: tekseries/template-single-event
 * Inserter: no
 * Description: Content of the single-event template.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:tekseries/post-tone {"variant":"banner","align":"wide","className":"ts-banner","style":{"border":{"radius":"var:preset|border-radius|xl"},"spacing":{"padding":{"top":"clamp(1.75rem, 1.2857rem + 1.9048vw, 3rem)","right":"var:preset|spacing|hero-x","bottom":"clamp(1.75rem, 1.2857rem + 1.9048vw, 3rem)","left":"var:preset|spacing|hero-x"}}}} -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"blockGap":"18px"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"top"}} -->
<div class="wp-block-group"><!-- wp:breadcrumbs /-->

<!-- wp:post-terms {"term":"event_type","separator":" ","className":"is-style-badge"} /-->

<!-- wp:post-title {"level":1,"style":{"typography":{"lineHeight":"1.05"}},"fontSize":"heading-2"} /-->

<!-- wp:group {"className":"ts-event-meta","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|8","left":"var:preset|spacing|20"}},"typography":{"fontWeight":"600"},"@mobile":{"layout":{"orientation":"vertical","justifyContent":"stretch"}}},"layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group ts-event-meta" style="font-weight:600"><!-- wp:group {"className":"ts-event-row","style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-event-row"><!-- wp:icon {"icon":"tekseries/calendar_month","className":"ts-tone-accent","style":{"dimensions":{"width":"20px"}}} /-->

<!-- wp:post-date {"format":"F j, Y","metadata":{"bindings":{"datetime":{"source":"acf/field","args":{"key":"event_date"}}}},"className":"ts-event-value"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-event-row","style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-event-row"><!-- wp:icon {"icon":"tekseries/schedule","className":"ts-tone-accent","style":{"dimensions":{"width":"20px"}}} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"acf/field","args":{"key":"time_label"}}}},"className":"ts-event-value"} -->
<p class="ts-event-value"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-event-row","style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-event-row"><!-- wp:icon {"icon":"tekseries/location_on","className":"ts-tone-accent","style":{"dimensions":{"width":"20px"}}} /-->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"acf/field","args":{"key":"venue"}}}},"className":"ts-event-value"} -->
<p class="ts-event-value"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:buttons {"className":"ts-banner__actions","style":{"spacing":{"margin":{"top":"var:preset|spacing|8"}}}} -->
<div class="wp-block-buttons ts-banner__actions" style="margin-top:var(--wp--preset--spacing--8)"><!-- wp:button {"metadata":{"bindings":{"url":{"source":"acf/field","args":{"key":"cta_link"}},"text":{"source":"acf/field","args":{"key":"cta_name"}}}},"className":"ts-register"} -->
<div class="wp-block-button ts-register"><a class="wp-block-button__link wp-element-button" href="" target="_blank" rel="noopener"><?php echo esc_html__( 'Register', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline ts-icon-arrow_back"} -->
<div class="wp-block-button is-style-outline ts-icon-arrow_back"><a class="wp-block-button__link wp-element-button" href="/events/"><?php echo esc_html__( 'All events', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"blockVisibility":{"viewport":{"tablet":false,"mobile":false}}},"className":"ts-card-date ts-banner__date","style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"right","verticalAlignment":"bottom"}} -->
<div class="wp-block-group ts-card-date ts-banner__date"><!-- wp:post-date {"format":"j","metadata":{"bindings":{"datetime":{"source":"acf/field","args":{"key":"event_date"}}}},"className":"ts-card-date__day"} /-->

<!-- wp:post-date {"format":"M Y","metadata":{"bindings":{"datetime":{"source":"acf/field","args":{"key":"event_date"}}}},"className":"ts-card-date__month"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:tekseries/post-tone -->

<!-- wp:group {"align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|56","margin":{"top":"var:preset|spacing|40"}},"@tablet":{"layout":{"columnCount":1},"spacing":{"blockGap":"var:preset|spacing|28"}},"@mobile":{"layout":{"columnCount":1},"spacing":{"blockGap":"var:preset|spacing|28"}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|16"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1,"rowStart":2}},"@mobile":{"layout":{"columnSpan":1,"rowStart":2}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'About this event', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:post-content {"className":"ts-article","layout":{"type":"default"}} /-->

<!-- wp:group {"className":"ts-share-row","style":{"spacing":{"blockGap":"var:preset|spacing|16","margin":{"top":"var:preset|spacing|8"},"padding":{"top":"var:preset|spacing|24"}},"border":{"top":{"color":"var:preset|color|line","style":"solid","width":"1px"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-share-row" style="border-top-color:var(--wp--preset--color--line);border-top-style:solid;border-top-width:1px;margin-top:var(--wp--preset--spacing--8);padding-top:var(--wp--preset--spacing--24)"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Share this event', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:tekseries/share-links /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-aside","style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@tablet":{"layout":{"rowStart":1}},"@mobile":{"layout":{"rowStart":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group ts-aside"><!-- wp:group {"className":"is-style-card-plum ts-details","style":{"spacing":{"blockGap":"14px","padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group is-style-card-plum ts-details" style="padding-top:var(--wp--preset--spacing--28);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--28);padding-left:var(--wp--preset--spacing--28)"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Event details', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"className":"ts-event-row","style":{"spacing":{"blockGap":"14px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-event-row"><!-- wp:icon {"icon":"tekseries/calendar_month","className":"is-style-tile","style":{"dimensions":{"width":"40px"},"spacing":{"padding":{"top":"10px","right":"10px","bottom":"10px","left":"10px"}}}} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"2px"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"ts-event-label","fontSize":"caption"} -->
<p class="ts-event-label has-caption-font-size"><?php echo esc_html__( 'Date', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:post-date {"format":"F j, Y","metadata":{"bindings":{"datetime":{"source":"acf/field","args":{"key":"event_date"}}}},"className":"ts-event-value"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-event-row","style":{"spacing":{"blockGap":"14px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-event-row"><!-- wp:icon {"icon":"tekseries/schedule","className":"is-style-tile","style":{"dimensions":{"width":"40px"},"spacing":{"padding":{"top":"10px","right":"10px","bottom":"10px","left":"10px"}}}} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"2px"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"ts-event-label","fontSize":"caption"} -->
<p class="ts-event-label has-caption-font-size"><?php echo esc_html__( 'Time', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"acf/field","args":{"key":"time_label"}}}},"className":"ts-event-value"} -->
<p class="ts-event-value"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-event-row","style":{"spacing":{"blockGap":"14px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-event-row"><!-- wp:icon {"icon":"tekseries/location_on","className":"is-style-tile","style":{"dimensions":{"width":"40px"},"spacing":{"padding":{"top":"10px","right":"10px","bottom":"10px","left":"10px"}}}} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"2px"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"ts-event-label","fontSize":"caption"} -->
<p class="ts-event-label has-caption-font-size"><?php echo esc_html__( 'Venue', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"acf/field","args":{"key":"venue"}}}},"className":"ts-event-value"} -->
<p class="ts-event-value"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-event-row","style":{"spacing":{"blockGap":"14px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-event-row"><!-- wp:icon {"icon":"tekseries/videocam","className":"is-style-tile ts-event-type-icon","style":{"dimensions":{"width":"40px"},"spacing":{"padding":{"top":"10px","right":"10px","bottom":"10px","left":"10px"}}}} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"2px"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"ts-event-label","fontSize":"caption"} -->
<p class="ts-event-label has-caption-font-size"><?php echo esc_html__( 'Event type', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:post-terms {"term":"event_type","className":"ts-event-value"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-event-row ts-register","style":{"spacing":{"blockGap":"14px"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-event-row ts-register"><!-- wp:icon {"icon":"tekseries/link","className":"is-style-tile","style":{"dimensions":{"width":"40px"},"spacing":{"padding":{"top":"10px","right":"10px","bottom":"10px","left":"10px"}}}} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"2px"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"ts-event-label","fontSize":"caption"} -->
<p class="ts-event-label has-caption-font-size"><?php echo esc_html__( 'Join here', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"acf/field","args":{"key":"cta_link"}}}},"className":"ts-event-value ts-event-link"} -->
<p class="ts-event-value ts-event-link"></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|8"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--8)"><!-- wp:button {"metadata":{"bindings":{"url":{"source":"acf/field","args":{"key":"cta_link"}},"text":{"source":"acf/field","args":{"key":"cta_name"}}}},"className":"ts-register is-style-accent","style":{"dimensions":{"width":"100%"}}} -->
<div class="wp-block-button ts-register is-style-accent"><a class="wp-block-button__link wp-element-button" href="" target="_blank" rel="noopener"><?php echo esc_html__( 'Register', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:paragraph {"className":"ts-details__note","fontSize":"body-s"} -->
<p class="ts-details__note has-body-s-font-size"><?php echo esc_html__( 'Questions? Email', 'tekseries' ); ?> <a href="mailto:team@tekseries.com">team@tekseries.com</a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-card ts-poster","style":{"border":{"radius":"var:preset|border-radius|lg"},"spacing":{"padding":{"top":"var:preset|spacing|12","right":"var:preset|spacing|12","bottom":"var:preset|spacing|12","left":"var:preset|spacing|12"},"blockGap":"var:preset|spacing|12"}},"layout":{"type":"default"}} -->
<div class="wp-block-group is-style-card ts-poster" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--12);padding-right:var(--wp--preset--spacing--12);padding-bottom:var(--wp--preset--spacing--12);padding-left:var(--wp--preset--spacing--12)"><!-- wp:post-featured-image {"aspectRatio":"1","className":"ts-lightbox-open","style":{"border":{"radius":"var:preset|border-radius|md"}}} /-->

<!-- wp:group {"className":"ts-poster__caption","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-poster__caption"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"600"}},"textColor":"muted"} -->
<p class="has-muted-color has-text-color" style="font-weight:600"><?php echo esc_html__( 'Event poster', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"metadata":{"bindings":{"url":{"source":"tekseries/featured-image","args":{"key":"url"}}}},"className":"ts-poster-link ts-lightbox-open ts-icon-open_in_full ts-icon-after ts-icon-small"} -->
<div class="wp-block-button ts-poster-link ts-lightbox-open ts-icon-open_in_full ts-icon-after ts-icon-small"><a class="wp-block-button__link wp-element-button" href=""><?php echo esc_html__( 'View full size', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"section","align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|56"},"blockGap":"var:preset|spacing|24"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<section class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--56)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|16"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:heading {"fontSize":"heading-3"} -->
<h2 class="wp-block-heading has-heading-3-font-size"><?php echo esc_html__( 'More events', 'tekseries' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-soft ts-icon-arrow_forward ts-icon-after"} -->
<div class="wp-block-button is-style-soft ts-icon-arrow_forward ts-icon-after"><a class="wp-block-button__link wp-element-button" href="/events/"><?php echo esc_html__( 'View all events', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:query {"queryId":5,"query":{"perPage":3,"pages":0,"offset":0,"postType":"event","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false,"taxQuery":null,"parents":[],"format":[],"excludeCurrent":true},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-query alignwide"><!-- wp:group {"className":"ts-card-grid","style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@tablet":{"layout":{"columnCount":2}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group ts-card-grid"><!-- wp:post-template {"className":"ts-contents"} -->
<!-- wp:group {"className":"is-style-card ts-post-card","style":{"spacing":{"blockGap":"var:preset|spacing|16","padding":{"top":"var:preset|spacing|12","right":"var:preset|spacing|12","bottom":"var:preset|spacing|12","left":"var:preset|spacing|12"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-card ts-post-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--12);padding-right:var(--wp--preset--spacing--12);padding-bottom:var(--wp--preset--spacing--12);padding-left:var(--wp--preset--spacing--12)"><!-- wp:tekseries/post-tone {"className":"ts-card-media","style":{"border":{"radius":"var:preset|border-radius|md"},"spacing":{"padding":{"top":"var:preset|spacing|20","right":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|12"},"dimensions":{"aspectRatio":"16/10"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"left","verticalAlignment":"space-between","flexWrap":"nowrap"}} -->
<!-- wp:post-featured-image {"sizeSlug":"large"} /-->

<!-- wp:post-terms {"term":"event_type","separator":" ","className":"is-style-badge"} /-->

<!-- wp:group {"className":"ts-card-date","layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"bottom"}} -->
<div class="wp-block-group ts-card-date"><!-- wp:post-date {"format":"j","metadata":{"bindings":{"datetime":{"source":"acf/field","args":{"key":"event_date"}}}},"className":"ts-card-date__day"} /-->

<!-- wp:post-date {"format":"M Y","metadata":{"bindings":{"datetime":{"source":"acf/field","args":{"key":"event_date"}}}},"className":"ts-card-date__month"} /--></div>
<!-- /wp:group -->
<!-- /wp:tekseries/post-tone -->

<!-- wp:group {"style":{"spacing":{"blockGap":"10px","padding":{"right":"var:preset|spacing|12","bottom":"var:preset|spacing|12","left":"var:preset|spacing|12"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group" style="padding-right:var(--wp--preset--spacing--12);padding-bottom:var(--wp--preset--spacing--12);padding-left:var(--wp--preset--spacing--12)"><!-- wp:post-title {"level":3,"isLink":true,"style":{"typography":{"fontWeight":"700","letterSpacing":"-0.01em","lineHeight":"1.25"}},"fontSize":"lead"} /-->

<!-- wp:group {"className":"ts-card-meta","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|4","left":"var:preset|spacing|16"}},"typography":{"fontWeight":"600"}},"textColor":"muted","fontSize":"body-s","layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group ts-card-meta has-muted-color has-text-color has-body-s-font-size" style="font-weight:600"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/calendar_month","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:post-date {"format":"F j, Y","metadata":{"bindings":{"datetime":{"source":"acf/field","args":{"key":"event_date"}}}}} /--></div>
<!-- /wp:group -->

<!-- wp:post-terms {"term":"event_type"} /--></div>
<!-- /wp:group -->

<!-- wp:post-excerpt {"excerptLength":24,"className":"ts-clamp-3","fontSize":"body-s"} /-->

<!-- wp:read-more {"content":"<?php echo esc_html__( 'Read more', 'tekseries' ); ?>","className":"ts-read-more"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:post-template --></div>
<!-- /wp:group --></div>
<!-- /wp:query --></section>
<!-- /wp:group -->
