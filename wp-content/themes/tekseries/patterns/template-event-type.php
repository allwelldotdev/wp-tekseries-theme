<?php
/**
 * Title: Event type listing
 * Slug: tekseries/template-event-type
 * Inserter: no
 * Description: Content of the event-type template.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"align":"wide","className":"is-style-hero-plum","style":{"spacing":{"blockGap":"var:preset|spacing|40"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group alignwide is-style-hero-plum"><!-- wp:group {"style":{"spacing":{"blockGap":"18px"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"top"}} -->
<div class="wp-block-group"><!-- wp:breadcrumbs /-->

<!-- wp:query-title {"type":"archive","showPrefix":false,"textColor":"white"} /-->

<!-- wp:term-description {"textColor":"lilac-deep","fontSize":"lead"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-card","style":{"spacing":{"blockGap":"var:preset|spacing|12","padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"center"}} -->
<div class="wp-block-group is-style-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--28);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--28);padding-left:var(--wp--preset--spacing--28)"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Stay in the loop', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","lineHeight":"1.25"}},"textColor":"plum","fontSize":"name","fontFamily":"display"} -->
<p class="has-plum-color has-text-color has-display-font-family has-name-font-size" style="font-weight:700;line-height:1.25"><?php echo esc_html__( 'New sessions are announced on our socials first.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:social-links {"className":"ts-social ts-social\u002d\u002dlight","layout":{"type":"flex","flexWrap":"nowrap"}} -->
<ul class="wp-block-social-links ts-social ts-social--light"><!-- wp:social-link {"url":"https://www.linkedin.com/company/tekseries/","service":"linkedin","label":"LinkedIn"} /-->

<!-- wp:social-link {"url":"https://www.facebook.com/share/18AH7UBXue/","service":"facebook","label":"Facebook"} /-->

<!-- wp:social-link {"url":"https://instagram.com/tekseries","service":"instagram","label":"Instagram"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|24","margin":{"top":"var:preset|spacing|40"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--40)"><!-- wp:navigation {"overlayMenu":"never","className":"ts-nav-chips","layout":{"type":"flex","flexWrap":"wrap"},"ariaLabel":"<?php echo esc_attr__( 'Filter events', 'tekseries' ); ?>"} -->
<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'All events', 'tekseries' ); ?>","url":"/events/","kind":"custom","isTopLevelLink":true,"className":"ts-type-chip"} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Webinars', 'tekseries' ); ?>","url":"/event_type/webinar/","kind":"custom","isTopLevelLink":true,"className":"ts-type-chip"} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Workshops', 'tekseries' ); ?>","url":"/event_type/workshop/","kind":"custom","isTopLevelLink":true,"className":"ts-type-chip"} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Makers’ Prize', 'tekseries' ); ?>","url":"/event_type/makers-prize/","kind":"custom","isTopLevelLink":true,"className":"ts-type-chip"} /-->
<!-- /wp:navigation -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"metadata":{"bindings":{"text":{"source":"tekseries/list-order","args":{"key":"label"}},"url":{"source":"tekseries/list-order","args":{"key":"url"}}}},"className":"ts-sort ts-icon-swap_vert"} -->
<div class="wp-block-button ts-sort ts-icon-swap_vert"><a class="wp-block-button__link wp-element-button" href="?order=asc"><?php echo esc_html__( 'Newest first', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:query {"queryId":3,"query":{"perPage":5,"pages":0,"offset":0,"postType":"event","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":true,"taxQuery":null,"parents":[],"format":[]},"align":"wide","layout":{"type":"default"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|24"}}}} -->
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
<!-- /wp:group -->

<!-- wp:query-pagination {"paginationArrow":"chevron","showLabel":false,"className":"ts-pagination","layout":{"type":"flex","justifyContent":"center"}} -->
<!-- wp:query-pagination-previous /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- wp:query-no-results -->
<!-- wp:paragraph -->
<p><?php echo esc_html__( 'No events of this type yet.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:query -->
