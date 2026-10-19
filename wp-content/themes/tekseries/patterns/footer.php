<?php
/**
 * Title: Footer
 * Slug: tekseries/footer
 * Inserter: no
 *
 * Content of the footer template part, kept in a pattern so its strings translate.
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"className":"ts-footer","style":{"spacing":{"padding":{"bottom":"var:preset|spacing|32"},"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group ts-footer" style="padding-bottom:var(--wp--preset--spacing--32)"><!-- wp:group {"align":"wide","className":"is-style-card-plum ts-footer__panel","style":{"border":{"radius":"var:preset|border-radius|footer"}},"textColor":"lilac-deep","layout":{"type":"grid","columnCount":4}} -->
<div class="wp-block-group alignwide is-style-card-plum ts-footer__panel has-lilac-deep-color has-text-color" style="border-radius:var(--wp--preset--border-radius--footer)"><!-- wp:group {"className":"ts-footer__brand","style":{"spacing":{"blockGap":"14px"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group ts-footer__brand"><!-- wp:image {"className":"ts-footer__logo"} -->
<figure class="wp-block-image ts-footer__logo"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/logo-stacked.png' ) ); ?>" alt="<?php echo esc_attr__( 'TekSeries', 'tekseries' ); ?>"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"800","lineHeight":"1.05","letterSpacing":"-0.02em"}},"textColor":"white","fontSize":"footer-display","fontFamily":"display"} -->
<p class="has-white-color has-text-color has-display-font-family has-footer-display-font-size" style="font-weight:800;letter-spacing:-0.02em;line-height:1.05"><?php echo esc_html__( 'Share. Create.', 'tekseries' ); ?> <mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-saffron-color"><?php echo esc_html__( 'Solve.', 'tekseries' ); ?></mark></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"ts-footer__about","style":{"typography":{"lineHeight":"1.6"}},"fontSize":"body-s"} -->
<p class="ts-footer__about has-body-s-font-size" style="line-height:1.6"><?php echo esc_html__( 'Equipping underserved youth with Digital, AI, and Creative Economy Skills.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"16px"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"white","fontSize":"body-s"} -->
<p class="has-white-color has-text-color has-body-s-font-size" style="font-weight:700"><?php echo esc_html__( 'Explore', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:navigation {"overlayMenu":"never","className":"ts-footer__menu","style":{"typography":{"fontWeight":"400"},"spacing":{"blockGap":"10px"}},"fontSize":"body-s","layout":{"type":"flex","orientation":"vertical"},"ariaLabel":"<?php echo esc_attr__( 'Explore', 'tekseries' ); ?>"} -->
<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Who We Are', 'tekseries' ); ?>","url":"/#about","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'What We Do', 'tekseries' ); ?>","url":"/#services","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'News', 'tekseries' ); ?>","url":"/news/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Events', 'tekseries' ); ?>","url":"/events/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Gallery', 'tekseries' ); ?>","url":"/gallery/","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"16px"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"white","fontSize":"body-s"} -->
<p class="has-white-color has-text-color has-body-s-font-size" style="font-weight:700"><?php echo esc_html__( 'Job Series', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:navigation {"overlayMenu":"never","className":"ts-footer__menu","style":{"typography":{"fontWeight":"400"},"spacing":{"blockGap":"10px"}},"fontSize":"body-s","layout":{"type":"flex","orientation":"vertical"},"ariaLabel":"<?php echo esc_attr__( 'Job Series', 'tekseries' ); ?>"} -->
<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Find a job', 'tekseries' ); ?>","url":"/jobs/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Post a job', 'tekseries' ); ?>","url":"/submit-job/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Support our work', 'tekseries' ); ?>","url":"/contact/#support","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Contact', 'tekseries' ); ?>","url":"/contact/","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"16px"}},"layout":{"type":"flex","orientation":"vertical"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}},"textColor":"white","fontSize":"body-s"} -->
<p class="has-white-color has-text-color has-body-s-font-size" style="font-weight:700"><?php echo esc_html__( 'Find us on social media', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:social-links {"iconColor":"white","iconColorValue":"#FFFFFF","className":"ts-social","style":{"spacing":{"blockGap":{"left":"10px"}}}} -->
<ul class="wp-block-social-links has-icon-color ts-social"><!-- wp:social-link {"url":"https://www.linkedin.com/company/tekseries/","service":"linkedin","label":"<?php echo esc_html__( 'LinkedIn', 'tekseries' ); ?>"} /-->

<!-- wp:social-link {"url":"https://www.facebook.com/share/18AH7UBXue/","service":"facebook","label":"<?php echo esc_html__( 'Facebook', 'tekseries' ); ?>"} /-->

<!-- wp:social-link {"url":"https://instagram.com/tekseries","service":"instagram","label":"<?php echo esc_html__( 'Instagram', 'tekseries' ); ?>"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"align":"wide","className":"ts-footer__legal","style":{"spacing":{"padding":{"left":"12px","right":"12px"}}},"textColor":"muted","fontSize":"caption","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
<div class="wp-block-group alignwide ts-footer__legal has-muted-color has-text-color has-caption-font-size" style="padding-right:12px;padding-left:12px"><!-- wp:group {"style":{"spacing":{"blockGap":{"top":"4px","left":"16px"}}},"layout":{"type":"flex","flexWrap":"wrap"}} -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p><?php /* translators: %s: current year. */ echo esc_html( sprintf( __( 'Copyright © TekSeries %s', 'tekseries' ), wp_date( 'Y' ) ) ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'CR No. 9920315.', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><?php /* translators: %s: link to the company that builds and maintains the site. */ echo wp_kses_post( sprintf( __( 'Built and maintained by %s', 'tekseries' ), '<a href="https://beekomm.com" target="_blank" rel="noreferrer noopener">Beekomm Technologies</a>' ) ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:navigation {"overlayMenu":"never","className":"ts-footer__menu","style":{"typography":{"fontWeight":"400"},"spacing":{"blockGap":"16px"}},"fontSize":"caption","ariaLabel":"<?php echo esc_attr__( 'Legal', 'tekseries' ); ?>"} -->
<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Terms and Conditions', 'tekseries' ); ?>","url":"/terms/","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Privacy Policy', 'tekseries' ); ?>","url":"/privacy/","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
