<?php
/**
 * Title: Home: What We Do
 * Slug: tekseries/home-services
 * Categories: tekseries-home
 * Description: The three pillars (anchor #services).
 * Viewport Width: 1440
 *
 * @package TekSeries
 */

?>
<!-- wp:group {"tagName":"section","align":"wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|section-y"},"blockGap":"var:preset|spacing|24"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"},"anchor":"services"} -->
<section class="wp-block-group alignwide" id="services" style="margin-top:var(--wp--preset--spacing--section-y)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|16"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"bottom"}} -->
<div class="wp-block-group"><!-- wp:heading {"className":"ts-reveal"} -->
<h2 class="wp-block-heading ts-reveal"><?php echo esc_html__( 'What We Do', 'tekseries' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:buttons {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}}} -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-chip"} -->
<div class="wp-block-button is-style-chip"><a class="wp-block-button__link wp-element-button" href="#pillar-1"><mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-coral-text-color"><?php echo esc_html__( 'I', 'tekseries' ); ?></mark> <?php echo esc_html__( 'Digital Skills', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-chip"} -->
<div class="wp-block-button is-style-chip"><a class="wp-block-button__link wp-element-button" href="#pillar-2"><mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-coral-text-color"><?php echo esc_html__( 'II', 'tekseries' ); ?></mark> <?php echo esc_html__( 'Job Series', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-chip"} -->
<div class="wp-block-button is-style-chip"><a class="wp-block-button__link wp-element-button" href="#pillar-3"><mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-coral-text-color"><?php echo esc_html__( 'III', 'tekseries' ); ?></mark> <?php echo esc_html__( 'Maker’s Prize', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","className":"is-style-card ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|28"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"},"anchor":"pillar-1"} -->
<article id="pillar-1" class="wp-block-group is-style-card ts-reveal"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-chip","style":{"typography":{"letterSpacing":"0.08em","textTransform":"uppercase"}},"backgroundColor":"lilac","textColor":"plum"} -->
<p class="is-style-chip has-plum-color has-lilac-background-color has-text-color has-background" style="letter-spacing:0.08em;text-transform:uppercase"><?php echo esc_html__( 'Pillar I', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"800"}},"textColor":"plum"} -->
<h3 class="wp-block-heading has-plum-color has-text-color" style="font-weight:800"><?php echo esc_html__( 'Digital Skills & Youth Capacity Development', 'tekseries' ); ?></h3>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group"><!-- wp:group {"className":"is-style-tile ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile ts-reveal"><!-- wp:icon {"icon":"tekseries/extension","className":"is-style-tile"} /-->

<!-- wp:heading {"level":4,"fontSize":"lead"} -->
<h4 class="wp-block-heading has-lead-font-size"><?php echo esc_html__( 'Elementary & Secondary Track', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"fontSize":"body-s"} -->
<p class="has-body-s-font-size"><?php echo esc_html__( 'Early-stage digital instruction, building blocks, and entry-level coding (Scratch, basic logic), PictoBlox AI, Robotics & Maker Workshops; Graphic Design.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-tile ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile ts-reveal"><!-- wp:icon {"icon":"tekseries/school","className":"is-style-tile"} /-->

<!-- wp:heading {"level":4,"fontSize":"lead"} -->
<h4 class="wp-block-heading has-lead-font-size"><?php echo esc_html__( 'Undergraduate & Graduate Track', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"fontSize":"body-s"} -->
<p class="has-body-s-font-size"><?php echo esc_html__( 'In-demand functional tracks, including Web & Mobile Development, Cybersecurity, Cloud Computing, and Artificial Intelligence Integration.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-tile ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile ts-reveal"><!-- wp:icon {"icon":"tekseries/trending_up","className":"is-style-tile"} /-->

<!-- wp:heading {"level":4,"fontSize":"lead"} -->
<h4 class="wp-block-heading has-lead-font-size"><?php echo esc_html__( 'Workforce Upskilling', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"fontSize":"body-s"} -->
<p class="has-body-s-font-size"><?php echo esc_html__( 'Career Clinics, CV revamping, and AI-powered career readiness workshops, like the 2026 Smart Job Search using AI Webinar and the AI Impact on Job Readiness & Search for New Graduates Webinar.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-card-saffron ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|24","padding":{"top":"var:preset|spacing|16","right":"var:preset|spacing|16","bottom":"var:preset|spacing|16","left":"var:preset|spacing|16"}},"border":{"radius":"var:preset|border-radius|xl"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group is-style-card-saffron ts-reveal" style="border-radius:var(--wp--preset--border-radius--xl);padding-top:var(--wp--preset--spacing--16);padding-right:var(--wp--preset--spacing--16);padding-bottom:var(--wp--preset--spacing--16);padding-left:var(--wp--preset--spacing--16)"><!-- wp:group {"className":"ts-photo-pill","layout":{"type":"default"}} -->
<div class="wp-block-group ts-photo-pill"><!-- wp:image {"aspectRatio":"4/3","scale":"cover","style":{"border":{"radius":"var:preset|border-radius|md"}}} -->
<figure class="wp-block-image has-custom-border"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/home/case-study.jpg' ) ); ?>" alt="<?php echo esc_attr__( 'Eziama Rural Jr. Boot Camp students with their instructor', 'tekseries' ); ?>" style="border-radius:var(--wp--preset--border-radius--md);aspect-ratio:4/3;object-fit:cover"/></figure>
<!-- /wp:image -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-dark ts-lightbox-open ts-icon-play_arrow ts-icon-small"} -->
<div class="wp-block-button is-style-dark ts-lightbox-open ts-icon-play_arrow ts-icon-small"><a class="wp-block-button__link wp-element-button" href="#"><?php echo esc_html__( 'See video', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|12","padding":{"top":"var:preset|spacing|12","right":"var:preset|spacing|16","bottom":"var:preset|spacing|12"}},"layout":{"columnSpan":2},"@tablet":{"layout":{"columnSpan":1}},"@mobile":{"layout":{"columnSpan":1}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--12);padding-right:var(--wp--preset--spacing--16);padding-bottom:var(--wp--preset--spacing--12)"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"center"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/auto_stories","style":{"dimensions":{"width":"18px"}}} /-->

<!-- wp:paragraph {"className":"is-style-eyebrow","textColor":"ink"} -->
<p class="is-style-eyebrow has-ink-color has-text-color"><?php echo esc_html__( 'Case Study · Elementary & Secondary Track', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:paragraph -->
<p><?php echo esc_html__( 'The Rural Jr. Boot Camp, in Eziama, is a case study in perseverance to progressive impact. Comprised of 8-16 year olds, some of whom had never turned on a computer when they first started the after school program. 12-18 months from finding the power button on a laptop, most of the kids now code and design games using Scratch & PictoBlox AI programming, build an entire Robot Car and design Event Cards and Flyers. This reaffirms what we all know, that talent knows no boundaries and is the reason, we remain even more committed to improving and expanding our program.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></article>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","className":"is-style-card-plum ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|28"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"},"anchor":"pillar-2"} -->
<article id="pillar-2" class="wp-block-group is-style-card-plum ts-reveal"><!-- wp:icon {"icon":"tekseries/work","className":"is-style-deco"} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"bottom"}} -->
<div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-chip","style":{"typography":{"letterSpacing":"0.08em","textTransform":"uppercase"}},"backgroundColor":"saffron","textColor":"ink"} -->
<p class="is-style-chip has-ink-color has-saffron-background-color has-text-color has-background" style="letter-spacing:0.08em;text-transform:uppercase"><?php echo esc_html__( 'Pillar II', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"800"}},"textColor":"white"} -->
<h3 class="wp-block-heading has-white-color has-text-color" style="font-weight:800"><?php echo esc_html__( 'Job Series Portal', 'tekseries' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|8"}},"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"top"}} -->
<div class="wp-block-group"><!-- wp:icon {"icon":"tekseries/info","style":{"dimensions":{"width":"18px"}},"textColor":"saffron"} /-->

<!-- wp:paragraph {"textColor":"lilac-deep","fontSize":"body-s"} -->
<p class="has-lilac-deep-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'Shares select job openings from third party sources, who retain full rights and credits to their job listings.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:buttons {"style":{"spacing":{"blockGap":"var:preset|spacing|12"}}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/jobs/"><?php echo esc_html__( 'Find a job', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-glass"} -->
<div class="wp-block-button is-style-glass"><a class="wp-block-button__link wp-element-button" href="/submit-job/"><?php echo esc_html__( 'Post a job', 'tekseries' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"textColor":"white","className":"is-style-outline ts-icon-upload_file ts-icon-small ts-survey-upload-cv ts-entry-home_job_series"} -->
<div class="wp-block-button is-style-outline ts-icon-upload_file ts-icon-small ts-survey-upload-cv ts-entry-home_job_series"><a class="wp-block-button__link has-white-color has-text-color wp-element-button" href="#"><?php echo esc_html__( 'Upload your CV', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@mobile":{"layout":{"columnCount":1},"spacing":{"blockGap":"var:preset|spacing|8"}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group"><!-- wp:group {"className":"is-style-tile-glass ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|4","padding":{"top":"var:preset|spacing|16","right":"var:preset|spacing|16","bottom":"var:preset|spacing|16","left":"var:preset|spacing|16"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-glass ts-reveal" style="padding-top:var(--wp--preset--spacing--16);padding-right:var(--wp--preset--spacing--16);padding-bottom:var(--wp--preset--spacing--16);padding-left:var(--wp--preset--spacing--16)"><!-- wp:paragraph {"className":"is-style-stat","textColor":"saffron","fontSize":"heading-3"} -->
<p class="is-style-stat has-saffron-color has-text-color has-heading-3-font-size"><?php echo esc_html__( '33.3%', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","lineHeight":"1.35"}},"textColor":"lilac-deep","fontSize":"body-s"} -->
<p class="has-lilac-deep-color has-text-color has-body-s-font-size" style="font-weight:600;line-height:1.35"><?php echo esc_html__( 'headline youth unemployment', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-tile-glass ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|4","padding":{"top":"var:preset|spacing|16","right":"var:preset|spacing|16","bottom":"var:preset|spacing|16","left":"var:preset|spacing|16"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-glass ts-reveal" style="padding-top:var(--wp--preset--spacing--16);padding-right:var(--wp--preset--spacing--16);padding-bottom:var(--wp--preset--spacing--16);padding-left:var(--wp--preset--spacing--16)"><!-- wp:paragraph {"className":"is-style-stat","textColor":"saffron","fontSize":"heading-3"} -->
<p class="is-style-stat has-saffron-color has-text-color has-heading-3-font-size"><?php echo esc_html__( '53.4%', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","lineHeight":"1.35"}},"textColor":"lilac-deep","fontSize":"body-s"} -->
<p class="has-lilac-deep-color has-text-color has-body-s-font-size" style="font-weight:600;line-height:1.35"><?php echo esc_html__( 'combined labor distress', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-tile-glass ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|4","padding":{"top":"var:preset|spacing|16","right":"var:preset|spacing|16","bottom":"var:preset|spacing|16","left":"var:preset|spacing|16"}}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-glass ts-reveal" style="padding-top:var(--wp--preset--spacing--16);padding-right:var(--wp--preset--spacing--16);padding-bottom:var(--wp--preset--spacing--16);padding-left:var(--wp--preset--spacing--16)"><!-- wp:paragraph {"className":"is-style-stat","textColor":"saffron","fontSize":"heading-3"} -->
<p class="is-style-stat has-saffron-color has-text-color has-heading-3-font-size"><?php echo esc_html__( '142%+', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontWeight":"600","lineHeight":"1.35"}},"textColor":"lilac-deep","fontSize":"body-s"} -->
<p class="has-lilac-deep-color has-text-color has-body-s-font-size" style="font-weight:600;line-height:1.35"><?php echo esc_html__( 'surge in demand for specialized tech roles', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@tablet":{"layout":{"columnCount":1}},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group"><!-- wp:group {"className":"is-style-tile-glass ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-glass ts-reveal"><!-- wp:icon {"icon":"tekseries/report","className":"is-style-tile","style":{"color":{"background":"var:preset|color|saffron","text":"var:preset|color|ink"}}} /-->

<!-- wp:heading {"level":4,"textColor":"white","fontSize":"lead"} -->
<h4 class="wp-block-heading has-white-color has-text-color has-lead-font-size"><?php echo esc_html__( 'The Challenge', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"lilac-deep","fontSize":"body-s"} -->
<p class="has-lilac-deep-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'Nigeria faces severe youth employment challenges, with headline youth unemployment at 33.3% and underemployment driving the combined labor distress rate to 53.4%. Demand for specialized technical roles has surged by over 142%, yet a structural gap exists between acquiring basic certificates and securing gainful employment or seed support.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-tile-glass ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-glass ts-reveal"><!-- wp:icon {"icon":"tekseries/conversion_path","className":"is-style-tile","style":{"color":{"background":"var:preset|color|saffron","text":"var:preset|color|ink"}}} /-->

<!-- wp:heading {"level":4,"textColor":"white","fontSize":"lead"} -->
<h4 class="wp-block-heading has-white-color has-text-color has-lead-font-size"><?php echo esc_html__( 'Bridge to Employment', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"lilac-deep","fontSize":"body-s"} -->
<p class="has-lilac-deep-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'A free, curated portal, JobSeries highlights City and regional job opportunities, to match job-ready youth with employers seeking interns, entry-level, and mid-level tech talent. Applicants can upload their CVs and Resumes, perform free job searches and attend periodic interview assessments, Career Clinics and Workshops.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-tile-glass ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-glass ts-reveal"><!-- wp:icon {"icon":"tekseries/handshake","className":"is-style-tile","style":{"color":{"background":"var:preset|color|saffron","text":"var:preset|color|ink"}}} /-->

<!-- wp:heading {"level":4,"textColor":"white","fontSize":"lead"} -->
<h4 class="wp-block-heading has-white-color has-text-color has-lead-font-size"><?php echo esc_html__( 'Employer Partner Network', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"lilac-deep","fontSize":"body-s"} -->
<p class="has-lilac-deep-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'Partnering with corporate entities and startups to create internship pathways that serve as gateways to long-term tech and new economy careers.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></article>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","className":"is-style-card-saffron ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|28"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"},"anchor":"pillar-3"} -->
<article id="pillar-3" class="wp-block-group is-style-card-saffron ts-reveal"><!-- wp:icon {"icon":"tekseries/emoji_events","className":"is-style-deco-bottom"} /-->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"bottom"}} -->
<div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"is-style-chip","style":{"typography":{"letterSpacing":"0.08em","textTransform":"uppercase"}},"backgroundColor":"ink","textColor":"white"} -->
<p class="is-style-chip has-white-color has-ink-background-color has-text-color has-background" style="letter-spacing:0.08em;text-transform:uppercase"><?php echo esc_html__( 'Pillar III', 'tekseries' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3,"style":{"typography":{"fontWeight":"800"}},"textColor":"ink"} -->
<h3 class="wp-block-heading has-ink-color has-text-color" style="font-weight:800"><?php echo esc_html__( 'Maker’s Prize & Micro Seed Funding', 'tekseries' ); ?></h3>
<!-- /wp:heading --></div>
<!-- /wp:group -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-dark ts-survey-makers-prize ts-entry-home_makers_prize"} -->
<div class="wp-block-button is-style-dark ts-survey-makers-prize ts-entry-home_makers_prize"><a class="wp-block-button__link wp-element-button" href="#"><?php echo esc_html__( 'Apply for the Maker’s Prize', 'tekseries' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"},"@mobile":{"layout":{"columnCount":1}}},"layout":{"type":"grid","columnCount":2,"minimumColumnWidth":null}} -->
<div class="wp-block-group"><!-- wp:group {"className":"is-style-tile-frost ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-frost ts-reveal"><!-- wp:icon {"icon":"tekseries/how_to_reg","className":"is-style-tile","style":{"color":{"background":"var:preset|color|ink","text":"var:preset|color|saffron"}}} /-->

<!-- wp:heading {"level":4,"textColor":"ink","fontSize":"lead"} -->
<h4 class="wp-block-heading has-ink-color has-text-color has-lead-font-size"><?php echo esc_html__( 'Who can apply', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"ink","fontSize":"body-s"} -->
<p class="has-ink-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'TekSeries can make independent awards to deserving students, student teams and start ups, who are also eligible to apply by December 1, by going to TekSeries.com.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-tile-frost ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-frost ts-reveal"><!-- wp:icon {"icon":"tekseries/event","className":"is-style-tile","style":{"color":{"background":"var:preset|color|ink","text":"var:preset|color|saffron"}}} /-->

<!-- wp:heading {"level":4,"textColor":"ink","fontSize":"lead"} -->
<h4 class="wp-block-heading has-ink-color has-text-color has-lead-font-size"><?php echo esc_html__( 'When winners are announced', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"ink","fontSize":"body-s"} -->
<p class="has-ink-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'Winners are announced beginning the first quarter of the new year.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-tile-frost ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-frost ts-reveal"><!-- wp:icon {"icon":"tekseries/construction","className":"is-style-tile","style":{"color":{"background":"var:preset|color|ink","text":"var:preset|color|saffron"}}} /-->

<!-- wp:heading {"level":4,"textColor":"ink","fontSize":"lead"} -->
<h4 class="wp-block-heading has-ink-color has-text-color has-lead-font-size"><?php echo esc_html__( 'What makers build', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"ink","fontSize":"body-s"} -->
<p class="has-ink-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'Makers must build community-driven solutions, products or services.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->

<!-- wp:group {"className":"is-style-tile-frost ts-reveal","style":{"spacing":{"blockGap":"var:preset|spacing|12"}},"layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch","flexWrap":"nowrap"}} -->
<div class="wp-block-group is-style-tile-frost ts-reveal"><!-- wp:icon {"icon":"tekseries/rocket_launch","className":"is-style-tile","style":{"color":{"background":"var:preset|color|ink","text":"var:preset|color|saffron"}}} /-->

<!-- wp:heading {"level":4,"textColor":"ink","fontSize":"lead"} -->
<h4 class="wp-block-heading has-ink-color has-text-color has-lead-font-size"><?php echo esc_html__( 'What winners receive', 'tekseries' ); ?></h4>
<!-- /wp:heading -->

<!-- wp:paragraph {"textColor":"ink","fontSize":"body-s"} -->
<p class="has-ink-color has-text-color has-body-s-font-size"><?php echo esc_html__( 'Pre and post MVP support, in the form of micro seed funds, Accelerator program sponsorship, for legal & start up guidance.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->

<!-- wp:paragraph {"className":"is-style-pull ts-reveal"} -->
<p class="is-style-pull ts-reveal"><?php echo esc_html__( 'We are resolved to support strictly viable solutions and help kick start concepts we believe can evolve into mass appeal enterprises.', 'tekseries' ); ?></p>
<!-- /wp:paragraph --></article>
<!-- /wp:group --></section>
<!-- /wp:group -->
