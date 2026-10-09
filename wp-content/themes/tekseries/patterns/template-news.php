<?php
/**
 * Title: News listing
 * Slug: tekseries/template-news
 * Inserter: no
 * Description: Content of the news template.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"align":"wide","className":"is-style-hero-plum","style":{"spacing":{"blockGap":"var:preset|spacing|40"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group alignwide is-style-hero-plum"><!-- wp:group {"style":{"spacing":{"blockGap":"18px"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:breadcrumbs /-->

<!-- wp:heading {"level":1,"textColor":"white"} -->
<h1 class="wp-block-heading has-white-color has-text-color"><?php echo esc_html__( 'News', 'tekseries' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"style":{"typography":{"lineHeight":"1.5"}},"textColor":"lilac-deep","fontSize":"lead"} -->
<p class="has-lilac-deep-color has-text-color has-lead-font-size" style="line-height:1.5"><?php echo esc_html__( 'Updates, highlights and thank-yous from the TekSeries community.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-card","style":{"spacing":{"blockGap":"var:preset|spacing|12","padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"center"}} -->
<div class="wp-block-group is-style-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--28);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--28);padding-left:var(--wp--preset--spacing--28)"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Stay in the loop', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","lineHeight":"1.25"}},"textColor":"plum","fontSize":"name","fontFamily":"display"} -->
<p class="has-plum-color has-text-color has-display-font-family has-name-font-size" style="font-weight:700;line-height:1.25"><?php echo esc_html__( 'Follow TekSeries for news as it happens.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:social-links {"className":"ts-social ts-social\u002d\u002dlight","layout":{"type":"flex","flexWrap":"nowrap"}} -->
<ul class="wp-block-social-links ts-social ts-social--light"><!-- wp:social-link {"url":"https://www.linkedin.com/company/tekseries/","service":"linkedin","label":"LinkedIn"} /-->

<!-- wp:social-link {"url":"https://www.facebook.com/share/18AH7UBXue/","service":"facebook","label":"Facebook"} /-->

<!-- wp:social-link {"url":"https://instagram.com/tekseries","service":"instagram","label":"Instagram"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}},"layout":{"type":"default"}} -->
<div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--40)"><!-- wp:query {"queryId":1,"query":{"perPage":1,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false,"taxQuery":null,"parents":[],"format":[]},"align":"wide","layout":{"type":"default"}} -->
<div class="wp-block-query alignwide"><!-- wp:post-template -->
<!-- wp:group {"className":"is-style-card ts-post-card","style":{"spacing":{"blockGap":"var:preset|spacing|16","padding":{"top":"var:preset|spacing|16","right":"var:preset|spacing|16","bottom":"var:preset|spacing|16","left":"var:preset|spacing|16"}},"border":{"radius":"var:preset|border-radius|xl"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":2,"minimumColumnWidth":null}} -->
<div class="wp-block-group is-style-card ts-post-card" style="border-radius:var(--wp--preset--border-radius--xl);padding-top:var(--wp--preset--spacing--16);padding-right:var(--wp--preset--spacing--16);padding-bottom:var(--wp--preset--spacing--16);padding-left:var(--wp--preset--spacing--16)"><!-- wp:tekseries/post-tone {"className":"ts-card-media ts-card-media\u002d\u002dlatest","style":{"border":{"radius":"var:preset|border-radius|md"},"spacing":{"padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"},"blockGap":"var:preset|spacing|12"},"dimensions":{"minHeight":"400px"},"@tablet":{"dimensions":{"minHeight":"0px","aspectRatio":"16/9"}},"@mobile":{"dimensions":{"minHeight":"0px","aspectRatio":"16/9"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"left","verticalAlignment":"space-between","flexWrap":"nowrap"}} -->
<!-- wp:post-featured-image {"sizeSlug":"large"} /-->

<!-- wp:paragraph {"className":"is-style-chip ts-badge","fontSize":"caption"} -->
<p class="is-style-chip ts-badge has-caption-font-size"><?php echo esc_html__( 'News', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"className":"ts-card-date","layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"bottom"}} -->
<div class="wp-block-group ts-card-date"><!-- wp:post-date {"format":"j","className":"ts-card-date__day"} /-->

<!-- wp:post-date {"format":"M Y","className":"ts-card-date__month"} /--></div>
<!-- /wp:group -->
<!-- /wp:tekseries/post-tone -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|16","padding":{"top":"var:preset|spacing|24","right":"var:preset|spacing|28","bottom":"var:preset|spacing|24","left":"var:preset|spacing|16"}},"@tablet":{"spacing":{"padding":{"top":"var:preset|spacing|8","right":"var:preset|spacing|12","bottom":"var:preset|spacing|12","left":"var:preset|spacing|12"}}},"@mobile":{"spacing":{"padding":{"top":"var:preset|spacing|8","right":"var:preset|spacing|12","bottom":"var:preset|spacing|12","left":"var:preset|spacing|12"}}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"center"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--24);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--24);padding-left:var(--wp--preset--spacing--16)"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Latest news', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:post-title {"isLink":true,"style":{"typography":{"fontWeight":"800"}},"fontSize":"heading-3"} /-->

<!-- wp:group {"className":"ts-card-meta","style":{"spacing":{"blockGap":{"0":"v","1":"a","2":"r","3":":","4":"p","5":"r","6":"e","7":"s","8":"e","9":"t","10":"|","11":"s","12":"p","13":"a","14":"c","15":"i","16":"n","17":"g","18":"|","19":"1","20":"6","top":"var:preset|spacing|4","left":"var:preset|spacing|16"}},"typography":{"fontWeight":"600"}},"textColor":"muted","fontSize":"body-s","layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group ts-card-meta has-muted-color has-text-color has-body-s-font-size" style="font-weight:600"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/calendar_month","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:post-date {"format":"F j, Y"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:post-excerpt {"excerptLength":40,"fontSize":"body-l"} /-->

<!-- wp:read-more {"content":"<?php echo esc_html__( 'Read more', 'tekseries' ); ?>","className":"ts-read-more ts-read-more\u002d\u002dbutton"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:post-template --></div>
<!-- /wp:query -->

<!-- wp:query {"queryId":2,"query":{"perPage":5,"pages":0,"offset":1,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false,"taxQuery":null,"parents":[],"format":[]},"align":"wide","layout":{"type":"default"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
<div class="wp-block-query alignwide"><!-- wp:group {"className":"ts-card-grid","style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@tablet":{"layout":{"columnCount":2}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group ts-card-grid"><!-- wp:post-template {"className":"ts-contents"} -->
<!-- wp:group {"className":"is-style-card ts-post-card","style":{"spacing":{"blockGap":"var:preset|spacing|16","padding":{"top":"var:preset|spacing|12","right":"var:preset|spacing|12","bottom":"var:preset|spacing|12","left":"var:preset|spacing|12"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-card ts-post-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--12);padding-right:var(--wp--preset--spacing--12);padding-bottom:var(--wp--preset--spacing--12);padding-left:var(--wp--preset--spacing--12)"><!-- wp:tekseries/post-tone {"className":"ts-card-media","style":{"border":{"radius":"var:preset|border-radius|md"},"spacing":{"padding":{"top":"var:preset|spacing|20","right":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20"},"blockGap":"var:preset|spacing|12"},"dimensions":{"aspectRatio":"16/10"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"left","verticalAlignment":"space-between","flexWrap":"nowrap"}} -->
<!-- wp:post-featured-image {"sizeSlug":"large"} /-->

<!-- wp:paragraph {"className":"is-style-chip ts-badge","fontSize":"caption"} -->
<p class="is-style-chip ts-badge has-caption-font-size"><?php echo esc_html__( 'News', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"className":"ts-card-date","layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"bottom"}} -->
<div class="wp-block-group ts-card-date"><!-- wp:post-date {"format":"j","className":"ts-card-date__day"} /-->

<!-- wp:post-date {"format":"M Y","className":"ts-card-date__month"} /--></div>
<!-- /wp:group -->
<!-- /wp:tekseries/post-tone -->

<!-- wp:group {"style":{"spacing":{"blockGap":"10px","padding":{"right":"var:preset|spacing|12","bottom":"var:preset|spacing|12","left":"var:preset|spacing|12"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group" style="padding-right:var(--wp--preset--spacing--12);padding-bottom:var(--wp--preset--spacing--12);padding-left:var(--wp--preset--spacing--12)"><!-- wp:post-title {"level":3,"isLink":true,"style":{"typography":{"fontWeight":"700","letterSpacing":"-0.01em","lineHeight":"1.25"}},"fontSize":"lead"} /-->

<!-- wp:group {"className":"ts-card-meta","style":{"spacing":{"blockGap":{"0":"v","1":"a","2":"r","3":":","4":"p","5":"r","6":"e","7":"s","8":"e","9":"t","10":"|","11":"s","12":"p","13":"a","14":"c","15":"i","16":"n","17":"g","18":"|","19":"1","20":"6","top":"var:preset|spacing|4","left":"var:preset|spacing|16"}},"typography":{"fontWeight":"600"}},"textColor":"muted","fontSize":"body-s","layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group ts-card-meta has-muted-color has-text-color has-body-s-font-size" style="font-weight:600"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/calendar_month","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:post-date {"format":"F j, Y"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:post-excerpt {"excerptLength":24,"className":"ts-clamp-3","fontSize":"body-s"} /-->

<!-- wp:read-more {"content":"<?php echo esc_html__( 'Read more', 'tekseries' ); ?>","className":"ts-read-more"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:post-template -->

<!-- wp:group {"className":"is-style-card-saffron","style":{"border":{"radius":"var:preset|border-radius|lg"},"spacing":{"padding":{"top":"var:preset|spacing|32","right":"var:preset|spacing|32","bottom":"var:preset|spacing|32","left":"var:preset|spacing|32"},"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"space-between"}} -->
<div class="wp-block-group is-style-card-saffron" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--32);padding-right:var(--wp--preset--spacing--32);padding-bottom:var(--wp--preset--spacing--32);padding-left:var(--wp--preset--spacing--32)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Get Involved', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","lineHeight":"1.2"}},"fontSize":"card-title","fontFamily":"display"} -->
<p class="has-display-font-family has-card-title-font-size" style="font-weight:700;line-height:1.2"><?php echo esc_html__( 'Help Grow Our Impact', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"fontSize":"body-s"} -->
<p class="has-body-s-font-size"><?php echo esc_html__( 'Every workshop, camp and session in these stories is free for the young people who attend.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/contact/#support"><?php echo esc_html__( 'Support our work', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:query-pagination {"paginationArrow":"chevron","showLabel":false,"className":"ts-pagination","layout":{"type":"flex","justifyContent":"center"}} -->
<!-- wp:query-pagination-previous /-->

<!-- wp:query-pagination-numbers /-->

<!-- wp:query-pagination-next /-->
<!-- /wp:query-pagination -->

<!-- wp:query-no-results -->
<!-- wp:paragraph -->
<p><?php echo esc_html__( 'No news yet.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->
<!-- /wp:query-no-results --></div>
<!-- /wp:query --></div>
<!-- /wp:group -->
