<?php
/**
 * Title: Contact: Message and visit
 * Slug: tekseries/contact-message
 * Categories: tekseries-pages
 * Description: Workshops card, map card and the contact form (anchor #contact-form).
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"tagName":"section","align":"wide","style":{"spacing":{"blockGap":"var:preset|spacing|24","margin":{"top":"var:preset|spacing|56"}},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":2,"minimumColumnWidth":null},"ariaLabel":"<?php echo esc_attr__( 'Message and visit', 'tekseries' ); ?>"} -->
<section class="wp-block-group alignwide" aria-label="<?php echo esc_attr__( 'Message and visit', 'tekseries' ); ?>" style="margin-top:var(--wp--preset--spacing--56)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@tablet":{"layout":{"rowStart":2}},"@mobile":{"layout":{"rowStart":2}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:group {"className":"is-style-card-lilac","style":{"spacing":{"blockGap":"14px","padding":{"top":"var:preset|spacing|32","right":"var:preset|spacing|32","bottom":"var:preset|spacing|32","left":"var:preset|spacing|32"}},"border":{"radius":"var:preset|border-radius|lg"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group is-style-card-lilac" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--32);padding-right:var(--wp--preset--spacing--32);padding-bottom:var(--wp--preset--spacing--32);padding-left:var(--wp--preset--spacing--32)"><!-- wp:icon {"icon":"tekseries/co_present","className":"is-style-deco-bottom"} /-->

<!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Workshops', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"fontSize":"heading-3"} -->
<h2 class="wp-block-heading has-heading-3-font-size"><?php echo esc_html__( 'Want to join our workshop?', 'tekseries' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"body"} -->
<p class="has-body-color has-text-color"><?php echo esc_html__( 'TekSeries would love to have you join our workshops to share your ideas with like-minded individuals. We encourage all students and techies to reach out and engage with us!', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|4"}}}} -->
<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--4)"><!-- wp:button {"className":"ts-icon-arrow_forward ts-icon-after"} -->
<div class="wp-block-button ts-icon-arrow_forward ts-icon-after"><a class="wp-block-button__link wp-element-button" href="/events/"><?php echo esc_html__( 'See upcoming events', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-chip"} -->
<div class="wp-block-button is-style-chip"><a class="wp-block-button__link wp-element-button" href="?topic=workshop#contact-form"><?php echo esc_html__( 'Ask about a workshop', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:tekseries/map {"src":"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.572480535527!2d-73.801149023883!3d40.70541233801876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c260dee879afd5%3A0x1ba35895e2168a65!2s89-44%20162nd%20St%2C%20Jamaica%2C%20NY%2011432%2C%20USA!5e0!3m2!1sen!2sng!4v1682183385833!5m2!1sen!2sng","title":"<?php echo esc_attr__( 'Map: TekSeries, 89-44 162nd Street, Queens, New York', 'tekseries' ); ?>","style":{"border":{"radius":"var:preset|border-radius|lg"}}} /-->

<!-- wp:group {"className":"is-style-card","style":{"spacing":{"blockGap":"var:preset|spacing|12","padding":{"top":"var:preset|spacing|20","right":"var:preset|spacing|20","bottom":"var:preset|spacing|20","left":"var:preset|spacing|20"}},"border":{"radius":"var:preset|border-radius|md"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
<div class="wp-block-group is-style-card" style="border-radius:var(--wp--preset--border-radius--md);padding-top:var(--wp--preset--spacing--20);padding-right:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20);padding-left:var(--wp--preset--spacing--20)"><!-- wp:group {"style":{"spacing":{"blockGap":"2px"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"plum","fontSize":"body-l","fontFamily":"display"} -->
<p class="has-plum-color has-text-color has-display-font-family has-body-l-font-size" style="font-weight:700">TekSeries</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"textColor":"body"} -->
<p class="has-body-color has-text-color"><?php echo esc_html__( '89-44 162nd Street, Queens, NY 11432', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-soft ts-icon-directions"} -->
<div class="wp-block-button is-style-soft ts-icon-directions"><a class="wp-block-button__link wp-element-button" href="https://www.google.com/maps/search/?api=1&amp;query=89-44+162nd+Street+Queens+NY+11432" target="_blank" rel="noreferrer noopener"><?php echo esc_html__( 'Get directions', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-card","style":{"spacing":{"blockGap":"22px","padding":{"top":"var:preset|spacing|32","right":"var:preset|spacing|32","bottom":"var:preset|spacing|32","left":"var:preset|spacing|32"}},"border":{"radius":"var:preset|border-radius|lg"},"@tablet":{"layout":{"rowStart":1}},"@mobile":{"layout":{"rowStart":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"},"anchor":"contact-form"} -->
<div id="contact-form" class="wp-block-group is-style-card" style="border-radius:var(--wp--preset--border-radius--lg);padding-top:var(--wp--preset--spacing--32);padding-right:var(--wp--preset--spacing--32);padding-bottom:var(--wp--preset--spacing--32);padding-left:var(--wp--preset--spacing--32)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-eyebrow"} -->
<p class="is-style-eyebrow"><?php echo esc_html__( 'Get in touch', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"fontSize":"heading-3"} -->
<h2 class="wp-block-heading has-heading-3-font-size"><?php echo esc_html__( 'Send us a message', 'tekseries' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"muted","fontSize":"body-s"} -->
<p class="has-muted-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'We usually reply within two working days. Fields marked * are required.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'Add the contact form here.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->
