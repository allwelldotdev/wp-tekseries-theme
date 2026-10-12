<?php
/**
 * Title: Legal page
 * Slug: tekseries/template-legal
 * Inserter: no
 * Description: Content of the legal template.
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"align":"wide","className":"is-style-hero-plum","style":{"spacing":{"blockGap":"var:preset|spacing|16"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group alignwide is-style-hero-plum"><!-- wp:breadcrumbs /-->

<!-- wp:post-title {"level":1,"textColor":"white"} /-->

<!-- wp:post-excerpt {"className":"ts-legal-lead","style":{"typography":{"fontSize":"clamp(0.9375rem, 0.8214rem + 0.4762vw, 1.25rem)","lineHeight":"1.55"}},"textColor":"lilac-deep"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|56","margin":{"top":"var:preset|spacing|40"}},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group alignwide" style="margin-top:var(--wp--preset--spacing--40)"><!-- wp:group {"className":"ts-legal-aside","style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group ts-legal-aside"><!-- wp:tekseries/toc /-->

<!-- wp:group {"metadata":{"blockVisibility":{"viewport":{"tablet":false,"mobile":false}}},"className":"is-style-card-lilac","style":{"spacing":{"blockGap":"var:preset|spacing|12","padding":{"top":"var:preset|spacing|28","right":"var:preset|spacing|28","bottom":"var:preset|spacing|28","left":"var:preset|spacing|28"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group is-style-card-lilac" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--28);padding-right:var(--wp--preset--spacing--28);padding-bottom:var(--wp--preset--spacing--28);padding-left:var(--wp--preset--spacing--28)"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700","lineHeight":"1.25"}},"fontSize":"name","fontFamily":"display"} -->
<p class="has-display-font-family has-name-font-size" style="font-weight:700;line-height:1.25"><?php echo esc_html__( 'Questions about this page?', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'Email', 'tekseries' ); ?> <a href="mailto:series@tekseries.com">series@tekseries.com</a> <?php echo esc_html__( 'or use our', 'tekseries' ); ?> <a href="/contact/#contact-form"><?php echo esc_html__( 'contact form', 'tekseries' ); ?></a>.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:post-content {"className":"ts-article ts-legal","style":{"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"default"}} /--></div>
<!-- /wp:group -->
