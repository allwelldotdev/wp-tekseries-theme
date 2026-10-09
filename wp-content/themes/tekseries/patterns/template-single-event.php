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
<!-- wp:group {"align":"wide","className":"is-style-hero-plum ts-banner","style":{"dimensions":{"minHeight":"480px"},"spacing":{"blockGap":"var:preset|spacing|40"},"@tablet":{"layout":{"columnCount":1},"dimensions":{"minHeight":"0px"}},"@mobile":{"layout":{"columnCount":1},"dimensions":{"minHeight":"0px"}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group alignwide is-style-hero-plum ts-banner" style="min-height:480px"><!-- wp:group {"style":{"spacing":{"blockGap":"18px"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"bottom"}} -->
<div class="wp-block-group"><!-- wp:breadcrumbs /-->

<!-- wp:post-terms {"term":"event_type","separator":" ","className":"is-style-badge"} /-->

<!-- wp:post-title {"level":1,"style":{"typography":{"lineHeight":"1.05"}},"textColor":"white","fontSize":"heading-2"} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"typography":{"fontWeight":"600"}},"textColor":"white","layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group has-white-color has-text-color" style="font-weight:600"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/calendar_month","style":{"dimensions":{"width":"20px"}},"textColor":"saffron"} /-->

<!-- wp:post-date {"format":"F j, Y"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|8"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--8)"><!-- wp:button {"textColor":"white","className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link has-white-color has-text-color wp-element-button" href="/events/"><?php echo esc_html__( 'All events', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"blockVisibility":{"viewport":{"tablet":false,"mobile":false}}},"className":"ts-card-date ts-banner__date","style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"right","verticalAlignment":"bottom"}} -->
<div class="wp-block-group ts-card-date ts-banner__date"><!-- wp:post-date {"format":"j","className":"ts-card-date__day"} /-->

<!-- wp:post-date {"format":"M Y","className":"ts-card-date__month"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|56","margin":{"top":"var:preset|spacing|40"}},"@tablet":{"layout":{"columnCount":1},"spacing":{"blockGap":"var:preset|spacing|28"}},"@mobile":{"layout":{"columnCount":1},"spacing":{"blockGap":"var:preset|spacing|28"}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--40)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|16"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1,"rowStart":2}},"@mobile":{"layout":{"columnSpan":1,"rowStart":2}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'About this event', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:post-content {"className":"ts-article","layout":{"type":"default"}} /--></div>
<!-- /wp:group -->

<!-- wp:group {"className":"ts-aside","style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@tablet":{"layout":{"rowStart":1}},"@mobile":{"layout":{"rowStart":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group ts-aside"><!-- wp:group {"className":"is-style-card-plum ts-details","style":{"spacing":{"blockGap":"14px","padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group is-style-card-plum ts-details" style="padding-top:var(--wp--preset--spacing--28);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--28);padding-left:var(--wp--preset--spacing--28)"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Event details', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/calendar_month","className":"is-style-tile","style":{"dimensions":{"width":"40px"},"spacing":{"padding":{"top":"10px","right":"10px","bottom":"10px","left":"10px"}}}} /-->

<!-- wp:post-date {"format":"F j, Y"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/videocam","className":"is-style-tile","style":{"dimensions":{"width":"40px"},"spacing":{"padding":{"top":"10px","right":"10px","bottom":"10px","left":"10px"}}}} /-->

<!-- wp:post-terms {"term":"event_type"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:post-featured-image {"aspectRatio":"1","style":{"border":{"radius":"var:preset|border-radius|lg"}}} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"section","align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|56"},"blockGap":"var:preset|spacing|24"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<section class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--56)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|16"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:heading {"fontSize":"heading-3"} -->
<h2 class="wp-block-heading has-heading-3-font-size"><?php echo esc_html__( 'More events', 'tekseries' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-soft"} -->
<div class="wp-block-button is-style-soft"><a class="wp-block-button__link wp-element-button" href="/events/"><?php echo esc_html__( 'View all events', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:query {"queryId":5,"query":{"perPage":3,"pages":0,"offset":0,"postType":"event","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false,"taxQuery":null,"parents":[],"format":[],"excludeCurrent":true},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-query alignwide"><!-- wp:group {"className":"ts-card-grid","style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@tablet":{"layout":{"columnCount":2}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group ts-card-grid"><!-- wp:post-template {"className":"ts-contents"} -->
<!-- wp:group {"className":"is-style-card ts-post-card","style":{"spacing":{"blockGap":"var:preset|spacing|16","padding":{"top":"var:preset|spacing|12","right":"var:preset|spacing|12","bottom":"var:preset|spacing|12","left":"var:preset|spacing|12"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-card ts-post-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--12);padding-right:var(--wp--preset--spacing--12);padding-bottom:var(--wp--preset--spacing--12);padding-left:var(--wp--preset--spacing--12)"><!-- wp:cover {"useFeaturedImage":true,"gradient":"overlay-plum","contentPosition":"bottom left","className":"ts-card-media","style":{"border":{"radius":"var:preset|border-radius|md"},"spacing":{"padding":{"top":"var:preset|spacing|20","right":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20"}},"dimensions":{"aspectRatio":"16/10"}},"layout":{"type":"default"}} -->
<div class="wp-block-cover has-custom-content-position is-position-bottom-left ts-card-media" style="border-radius:var(--wp--preset--border-radius--md);padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-100 has-background-dim has-background-gradient has-overlay-plum-gradient-background"></span><div class="wp-block-cover__inner-container"><!-- wp:post-terms {"term":"event_type","separator":" ","className":"is-style-badge"} /-->

<!-- wp:group {"className":"ts-card-date","layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"bottom"}} -->
<div class="wp-block-group ts-card-date"><!-- wp:post-date {"format":"j","className":"ts-card-date__day"} /-->

<!-- wp:post-date {"format":"M Y","className":"ts-card-date__month"} /--></div>
<!-- /wp:group --></div></div>
<!-- /wp:cover -->

<!-- wp:group {"style":{"spacing":{"blockGap":"10px","padding":{"right":"var:preset|spacing|12","bottom":"var:preset|spacing|12","left":"var:preset|spacing|12"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group" style="padding-right:var(--wp--preset--spacing--12);padding-bottom:var(--wp--preset--spacing--12);padding-left:var(--wp--preset--spacing--12)"><!-- wp:post-title {"level":3,"isLink":true,"style":{"typography":{"fontWeight":"700","letterSpacing":"-0.01em","lineHeight":"1.25"}},"fontSize":"lead"} /-->

<!-- wp:group {"className":"ts-card-meta","style":{"spacing":{"blockGap":{"0":"v","1":"a","2":"r","3":":","4":"p","5":"r","6":"e","7":"s","8":"e","9":"t","10":"|","11":"s","12":"p","13":"a","14":"c","15":"i","16":"n","17":"g","18":"|","19":"1","20":"6","top":"var:preset|spacing|4","left":"var:preset|spacing|16"}},"typography":{"fontWeight":"600"}},"textColor":"muted","fontSize":"body-s","layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group ts-card-meta has-muted-color has-text-color has-body-s-font-size" style="font-weight:600"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/calendar_month","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:post-date {"format":"F j, Y"} /--></div>
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
