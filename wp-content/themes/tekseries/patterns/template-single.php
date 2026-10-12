<?php
/**
 * Title: Single post
 * Slug: tekseries/template-single
 * Inserter: no
 * Description: Content of the single template.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:tekseries/post-tone {"variant":"banner","align":"wide","className":"ts-banner","style":{"border":{"radius":"var:preset|border-radius|xl"},"spacing":{"padding":{"top":"clamp(1.75rem, 1.2857rem + 1.9048vw, 3rem)","right":"var:preset|spacing|hero-x","bottom":"clamp(1.75rem, 1.2857rem + 1.9048vw, 3rem)","left":"var:preset|spacing|hero-x"}}}} -->
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"blockGap":"18px"},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","verticalAlignment":"top"}} -->
<div class="wp-block-group"><!-- wp:breadcrumbs /-->

<!-- wp:paragraph {"className":"is-style-chip ts-badge","fontSize":"caption"} -->
<p class="is-style-chip ts-badge has-caption-font-size"><?php echo esc_html__( 'News', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:post-title {"level":1,"style":{"typography":{"lineHeight":"1.05"}},"fontSize":"heading-2"} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"},"typography":{"fontWeight":"600"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group" style="font-weight:600"><!-- wp:icon {"icon":"tekseries/calendar_month","className":"ts-tone-accent","style":{"dimensions":{"width":"20px"}}} /-->

<!-- wp:post-date {"format":"F j, Y","metadata":{"bindings":{"datetime":{"source":"core/post-data","args":{"field":"modified"}}}},"className":"ts-updated"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"metadata":{"blockVisibility":{"viewport":{"tablet":false,"mobile":false}}},"className":"ts-card-date ts-banner__date","style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"right","verticalAlignment":"bottom"}} -->
<div class="wp-block-group ts-card-date ts-banner__date"><!-- wp:post-date {"format":"j","className":"ts-card-date__day"} /-->

<!-- wp:post-date {"format":"M Y","className":"ts-card-date__month"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:tekseries/post-tone -->

<!-- wp:group {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"},"blockGap":"var:preset|spacing|32"}},"layout":{"type":"constrained","contentSize":"720px"}} -->
<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--40)"><!-- wp:post-featured-image {"style":{"border":{"radius":"var:preset|border-radius|lg"}}} /-->

<!-- wp:post-content {"className":"ts-article","layout":{"type":"default"}} /-->

<!-- wp:tekseries/post-video /-->

<!-- wp:group {"className":"ts-share-row","style":{"spacing":{"blockGap":"var:preset|spacing|16","margin":{"top":"var:preset|spacing|8"},"padding":{"top":"var:preset|spacing|24"}},"border":{"top":{"color":"var:preset|color|line","style":"solid","width":"1px"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group ts-share-row" style="border-top-color:var(--wp--preset--color--line);border-top-style:solid;border-top-width:1px;margin-top:var(--wp--preset--spacing--8);padding-top:var(--wp--preset--spacing--24)"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Share this story', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:tekseries/share-links /--></div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"nav","style":{"spacing":{"blockGap":"var:preset|spacing|16"},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":2,"minimumColumnWidth":null},"ariaLabel":"<?php echo esc_attr__( 'More posts', 'tekseries' ); ?>"} -->
<nav aria-label="<?php echo esc_attr__( 'More posts', 'tekseries' ); ?>" class="wp-block-group"><!-- wp:post-navigation-link {"type":"previous","label":"<?php echo esc_html__( 'Previous post', 'tekseries' ); ?>","showTitle":true,"linkLabel":true,"className":"ts-post-nav"} /-->

<!-- wp:post-navigation-link {"label":"<?php echo esc_html__( 'Next post', 'tekseries' ); ?>","showTitle":true,"linkLabel":true,"className":"ts-post-nav ts-post-nav\u002d\u002dnext"} /--></nav>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"section","align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|56"},"blockGap":"var:preset|spacing|24"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<section class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--56)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|16"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:heading {"fontSize":"heading-3"} -->
<h2 class="wp-block-heading has-heading-3-font-size"><?php echo esc_html__( 'More news', 'tekseries' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-soft ts-icon-arrow_forward ts-icon-after"} -->
<div class="wp-block-button is-style-soft ts-icon-arrow_forward ts-icon-after"><a class="wp-block-button__link wp-element-button" href="/news/"><?php echo esc_html__( 'View all news', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:query {"queryId":5,"query":{"perPage":3,"pages":0,"offset":0,"postType":"post","order":"desc","orderBy":"date","author":"","search":"","exclude":[],"sticky":"","inherit":false,"taxQuery":null,"parents":[],"format":[],"excludeCurrent":true},"align":"wide","layout":{"type":"default"}} -->
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

<!-- wp:group {"className":"ts-card-meta","style":{"spacing":{"blockGap":{"top":"var:preset|spacing|4","left":"var:preset|spacing|16"}},"typography":{"fontWeight":"600"}},"textColor":"muted","fontSize":"body-s","layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group ts-card-meta has-muted-color has-text-color has-body-s-font-size" style="font-weight:600"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|4"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/calendar_month","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:post-date {"format":"F j, Y"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:post-excerpt {"excerptLength":24,"className":"ts-clamp-3","fontSize":"body-s"} /-->

<!-- wp:read-more {"content":"<?php echo esc_html__( 'Read more', 'tekseries' ); ?>","className":"ts-read-more"} /--></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
<!-- /wp:post-template --></div>
<!-- /wp:group --></div>
<!-- /wp:query --></section>
<!-- /wp:group -->
