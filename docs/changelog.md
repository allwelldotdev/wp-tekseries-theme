# Changelog

This file records what visitors and site editors of tekseries.com will notice in each release; versions follow semantic versioning.

## [1.19.2] — 2026-10-21
### Changed
- The company registration line in the footer of every page now reads "RC 9920315." where it read "CR No. 9920315."

## [1.19.1] — 2026-10-19
### New
- The Privacy Policy now covers maps and videos from other services (the Google map, and YouTube and Vimeo videos that load only when played) under "Who We Share Personal Data With".
- It also covers the forms, such as "Upload your CV" and "Apply for the Maker's Prize", which Beekomm Technologies Limited hosts for TekSeries.
- It says how form answers are used, kept and deleted, and that the form service sets no cookies but keeps a small record in the browser's local storage.

### Changed
- The footer credit now reads "Built and maintained by Beekomm Technologies" and links to beekomm.com, where it read "Designed and developed by Allwell".
- The Privacy Policy and Terms and Conditions now give team@tekseries.com as the contact address, in place of series@tekseries.com. The "Questions about this page?" card on those pages uses it too.
- On Home, Allwell Agwu-Okoro's team card has a new description, and so does the Home page pattern that editors start from.
- The Privacy Policy, Terms and Home page changes were made on the development site and reach the live site when it is moved over. "Job Series: series@tekseries.com" on Contact is unchanged.

## [1.19.0] — 2026-10-16
### New
- Editors see a "Poster frame" panel in a video's details in the Media Library, in the pop-up and on the "Edit Media" page, showing three frames taken from across the video.
- Clicking a frame makes it the video's poster in the Gallery, in the viewer and in a news post's video card.
- "Show other frames" shows three different moments from the video, and a slider with "Use this moment" sets the poster to an exact moment.
- A video in an album that has no poster gets its middle frame as the poster when it is opened in the Media Library. The poster can be changed at any time.
- Picking a new frame removes the earlier frame image that the panel made in the Media Library. A picture added by hand as the poster is never removed.
- If the browser cannot play a video, for example some .mov files from phones, the panel shows a message, and a picture can still be set as the video's featured image.
- Visitors see no change except the posters themselves.

## [1.18.1] — 2026-10-15
### Fixed
- On desktop screens from just over 1100px to about 1220px wide, such as small laptops or a narrow browser window, the header no longer breaks onto two rows: the menu no longer wraps, the "Job Series" and "Post A Job" buttons no longer stack, and the logo keeps its proportions.

### Improved
- On those widths the space around the menu links narrows a little. The header is unchanged at 1280px and wider, and on tablets and phones.

## [1.18.0] — 2026-10-15
### New
- Visitors get a new Maker Prize page, at /maker-prize/ and under What We Do in the breadcrumbs, with the Annual Maker Prize Application, a live countdown to the deadline of December 1, 2026, 11:59 PM Nigerian time, and the eligibility criteria.
- The page has two "Apply now" buttons, one at the top and one in a closing band. Each opens the Maker's Prize form in a panel over the page once the site is connected to Formbricks.
- Each answer tells Formbricks which button opened the form: `maker_prize_hero` for the top button and `maker_prize_cta` for the closing one.
- After the deadline the page switches to its closed state by itself. It says "Applications are now closed", the buttons become greyed "Applications closed" buttons, and a line says winners are announced beginning the first quarter of the new year.
- Editors get a new page pattern, "Maker Prize page", to start the page from. The deadline is set in the page's own Deadline Countdown settings.
- The development site already has the page, and the live site gets it when the site is moved over.

### Changed
- On Home, the "Apply for the Maker’s Prize" button in the third pillar now opens the Maker Prize page instead of the form, so answers no longer arrive with the name `home_makers_prize`.
- The Settings → Forms (Formbricks) help text now names the Maker Prize page and its two button names.

## [1.17.0] — 2026-10-15
### New
- Editors get a new block, Deadline Countdown, that counts down to the deadline of the page it sits on, either as four tiles (days, hours, minutes and seconds, with "Mins" and "Secs" on phones) or as one line.
- The one-line version reads, for example, "12 days left to apply", and "Last day to apply" in the last 24 hours. After the deadline the line is left out and the tiles all read 00.
- Without JavaScript the countdown shows the days only. The hours, minutes and seconds appear once the page's script runs.
- Editors set a page's deadline in the Deadline field of the Deadline Countdown block's settings, as a date and time in Nigerian time, which is saved with the page. The picker has no seconds, so 11:59 PM is saved as 23:59:00.
- Editors can make blocks show only until the deadline by adding the class `ts-when-open`, or only after it by adding `ts-when-closed`. On a page that is open in the browser they swap by themselves when the countdown reaches zero.
- A page without a deadline counts as open. In the editor, a dashed outline marks the `ts-when-closed` blocks so they can be found.
- Editors can show a Button as disabled and greyed, for example for "Applications closed", by setting the Button to be a button instead of a link and adding the class `ts-disabled`.
- The Button block's Icon control now offers a lock icon, and the icon collection gains a timer icon and a certificate icon.

## [1.16.1] — 2026-10-15
### New
- Visitors now see the company registration line "CR No. 9920315." in the footer of every page, between the copyright and the designer's credit.

### Improved
- On phones, each item in the footer's bottom row now sits on its own centred line.

### Changed
- On Home, the wording follows the design update of 15 October 2026 in the Method paragraphs (Micro Seed funding, and the Job Series line, which now says it curates, highlights and aggregates city and regional job opportunities), the case study (Scratch and PictoBlox AI programming), and the cards of the second and third pillars.
- On Home, the first "The challenge" card's source line now reads "Source: National Bureau of Statistics, Nigeria." and "The opportunity" card gains "Sources: Int’l Finance Corp. & National Labor Reports."
- On Home, the three figures of the Job Series pillar now read 33.3% headline youth unemployment, 53.4% combined labor distress and 142%+ surge in demand for specialized tech roles.
- On Home, the four cards of the Maker's Prize pillar now say to apply by December 1, that winners are announced beginning the first quarter of the new year, community-driven solutions, and start up guidance.
- Page patterns only fill new pages. The development site's Home page received the same edits, and the live Home page gets them when the site is moved over.

## [1.16.0] — 2026-10-15
### New
- A form opened from a button on the site now tells Formbricks which button opened it: each answer carries the button's name in the form's hidden field `entry_point`.
- In Formbricks, the form needs a hidden field with the ID `entry_point` for this; a form without it still opens and simply records no name.
- Editors name a Button by adding a second class next to `ts-survey-` and its key: `ts-entry-` followed by a name in letters, numbers, underscores and hyphens, for example `ts-entry-home_job_series`, under Advanced → Additional CSS class(es). A Button without it sends no name, as before.
- The site's own buttons are named: "Upload your CV" on Home is `home_job_series`, "Apply for the Maker's Prize" on Home is `home_makers_prize`, "Upload your CV" in the Job Series page hero is `job_series_hero`, and "Upload your CV to Job Series" on each job's page is `job_listing`, which is set in the plugin and cannot be changed in the editor.
- Settings → Forms (Formbricks) has a new section, "See which button opened a form", with these steps and the site's names.
- Nothing changes visually for visitors.

## [1.15.1] — 2026-10-13
### Fixed
- Pressing a link or button with the mouse or a finger while its block was still rising into place now works the first time. Before, only a second press worked. This fault had been there since 1.1.3.
- This is fixed for the text and buttons of the Home page's first slide just after the page opens (for example "Explore Job Series"), the top bands of the Events, News, Contact, Gallery, Job Series and legal pages just after they open, and the cards on the Home and Contact pages just after they scroll into view.
- The block is now shown in full at once and keeps gliding into place under the pointer. With the keyboard, a block that gets focus is still shown at once in its final place.

## [1.15.0] — 2026-10-13
### New
- Visitors can now press a marked button to open a Formbricks form in a panel over the page, and the page stays where it was.
- Once the site is connected, "Upload your CV" on the Home and Job Series pages, "Apply for the Maker's Prize" on the Home page, and "Upload your CV to Job Series" on each job's page open a form this way.
- Nothing is loaded from the Formbricks server until a visitor moves to press such a button.
- The button's own link is still followed when JavaScript is off, when the form cannot be loaded within a few seconds, or when Formbricks answers but no form opens within a few seconds, for example because the form is not published. A button whose link is "#" does nothing in these cases.
- When a form opens, keyboard focus moves into it, and when it is closed, focus returns to the button that opened it.
- Until the settings are filled in, nothing changes and the buttons stay ordinary links, as before.
- Editors get a new screen, Settings → Forms (Formbricks), where they enter the "SDK connection URL" of the Formbricks server (it must start with https://) and the "ID" from the code Formbricks gives for connecting a website. Where Formbricks lists both an Environment ID and a Workspace ID, as version 4 does, use the Environment ID.
- The Forms (Formbricks) screen says whether the site is connected and lists the steps to make a button open a form.
- Editors can make any Button open a form of the type "Website & App Survey". In Formbricks, add an action of the kind "Code" with a key such as `upload-cv` and set it as the form's trigger. Then on the site, add the class `ts-survey-` followed by the key, such as `ts-survey-upload-cv`, to the Button under Advanced → Additional CSS class(es).
- In Formbricks, the form should be set to "Keep showing while conditions match" and "Ignore Cooldown Period", otherwise it opens only once per visitor.
- The buttons "Upload your CV" and "Apply for the Maker's Prize" in the Home and Job Series page patterns are already marked, with the keys `upload-cv` and `makers-prize`.

## [1.14.0] — 2026-10-13
### New
- Visitors now see a countdown on each upcoming event, running to its start time, with the same time left in every time zone.
- On each event's page the countdown sits in the banner above the Register button: "Starts in" and four tiles for days, hours, minutes and seconds, ticking every second.
- On the Events page, the large "Latest event" card shows the same four tiles when that event is still to come.
- The other event cards show one line in a small pill: "In 13 days", then "In 5 hours", then "In 20 min" on the day. This covers the Events page grid, the event type pages (Webinars, Workshops and Makers' Prize) and "More events" on an event's page.
- From the start time until the end of that day in Nigeria, the countdown reads "Happening now".
- An event without a start time counts whole days only and reads "Today" on its day.
- Once the event's day is over there is no countdown, and the "This event has ended" note is as before. Events that are already past show nothing new.
- Without JavaScript, visitors see the days left and the short line, but not the ticking hours, minutes and seconds.
- Screen readers hear one sentence, for example "In 13 days: October 27, 2026, 11:00 AM WAT", instead of a clock that changes every second.
- Editors get a new optional "Start time" field on each event, a time picker read as Nigerian time (WAT), and the countdown runs to it. The existing "Time" text field is still the time visitors see.
- Editors get a new block, "Event Countdown", in the block list, with a Size setting of "Full" or "Compact". It is already placed in the Events, event type and single event page templates.

### Changed
- An event's day now ends at midnight in Nigeria for "This event has ended" and for the Register button, instead of at 1 a.m.

## [1.13.2] — 2026-10-13
### Fixed
- On the "Post a job" form, "Save draft" now saves a job whose Description is still empty. The page says "Draft was saved. Job listing drafts can be resumed from the job dashboard." and the draft appears on the Job dashboard.
- On the "Post a job" form, "Preview" without a description now shows "Add a description of the role." under the editor instead of a stray empty box, and puts the cursor in the editor. The message clears when the employer starts typing. Other empty required fields still show the browser's own message, and without JavaScript the form still reports the missing description after it is sent.

### Improved
- Notices above the "Post a job" form that contain a link, such as "Draft was saved…", now read as one normal line of text instead of having gaps around the link.

## [1.13.1] — 2026-10-13
### Improved
- The plum band at the top of the News, Events, event type (Webinars, Workshops and Makers' Prize) and legal pages (Privacy Policy, Terms and Conditions) now rises in when the page opens. It stays still for visitors who have asked their device for reduced motion.
- Editors who insert the Contact, Gallery, Job Series, Post a job or Job dashboard page pattern get the same entrance on its top band.
- Editors who insert the Home or Contact page patterns get cards and tiles that rise in as they are scrolled into view. On Home these are the impact tiles, the Mission card and photo, the method tiles, the tiles inside the three pillar cards, the case study card, the quote and the team cards. On Contact they are the three detail cards and the Support heading row and tiles.

### Changed
- The footer line under the logo now reads "Equipping underserved youth with Digital, AI, and Creative Economy Skills."
- In the Home page pattern, slide 1 now leads with "One youth’s career at a time.", slide 2 reads "TekSeries is a 501(c)(3) Tax-Exempt Non-Profit Corporation" with the heading "Equipping underserved youth with Digital, AI, and Creative Economy Skills", and the case study begins "The Rural Jr. Boot Camp, at Eziama, …" and says the children "had never turned on a computer".
- Existing pages are unchanged, because page patterns only fill new pages.
- Editors: a template or the footer saved in the Site Editor still replaces the theme's own version, so one saved before this release keeps showing what was saved until it is reset there.

## [1.13.0] — 2026-10-12
### New
- Visitors can now watch a video on a news post. Under the post's text, a 16:9 card with a play button and the words "Watch the video" opens the video full screen in the Gallery's viewer. Escape or the close button returns to the post.
- A linked YouTube or Vimeo video plays in that site's own player inside the viewer.
- Nothing is loaded from YouTube or Vimeo until a visitor opens the video. YouTube's player then loads in its privacy-enhanced mode and Vimeo's with its "do not track" setting. Closing the viewer removes the player, which stops the video.
- Without JavaScript the card is a link to the video file, or to the video's page on YouTube or Vimeo.
- A post without a video, or with the switch off, looks as before.
- Editors get a "Video" panel under each news post in the editor, with a "Show a video" switch, then a "Video file" from the Media Library or a "Video link" to a YouTube or Vimeo video, and a "Thumbnail" for the card.
- The file is used when both a file and a link are set.
- Without a thumbnail, a video file shows its own poster image and a link shows a plain plum card.
- A link to any other site is not shown: the card does not appear.
- Editors who open the single post template will find the card is a new block, "Post Video", placed after the post content.

## [1.12.0] — 2026-10-12
### New
- Visitors can now open an event's poster full screen. On each event's page the poster sits in a white frame with rounded corners, as in the design, with "Event poster" and a "View full size" link under it. Selecting either opens the Gallery's viewer.
- Escape or the close button returns to the page, and keyboard focus goes back to where it was.
- Without JavaScript the "View full size" link opens the image file itself.
- An event without a featured image shows no frame.
- On Home, the Case Study card has a "See video" button over the bottom-left corner of the photo, which opens the video in the same viewer. The card keeps its height at every width.
- When the viewer opens on one file, it drops the counter, the Previous and Next buttons and the thumbnail strip, and the picture or video takes their room. A Gallery that holds a single file gets the same.
- Editors can make a Button, or an Image that links to its media file, open the viewer by adding the class `ts-lightbox-open` under Advanced, then Additional CSS class(es). It opens the file when the link leads to a photo or video, and other links stay ordinary.
- A Featured Image block with that class gets a link to its full-size file.
- On Home the "See video" button links to "#" until an editor puts the address of a video file in its link. On the development site it links to a video from the Media Library.
- "Open full size" is a new choice in the Button's Icon panel, which now offers 17 icons.

### Fixed
- On an event's page, a poster file narrower than its column, such as a small image on a tablet, could be drawn over the content under it. The picture now always stays inside its box.

## [1.11.0] — 2026-10-12
### New
- Visitors can now turn a list round. The "Newest first" label above the lists on the Events, event type (Webinars, Workshops and Makers' Prize) and Job Series pages is now a switch. It lists the oldest first, reads "Oldest first" while it does, and goes back when selected again.
- The switch is a plain link whose address ends in `?order=asc` when the oldest come first. It works without JavaScript, and a list in either order can be shared or bookmarked.
- On the Events page, the large "Latest" card stays the newest event in either order, and the grid under it lists the rest from the oldest.
- The page links under the lists and the event type filter tabs keep the chosen order.
- On Job Series the list changes in place, a search or filter made afterwards keeps the order, and "Clear filters" keeps it too.
- Screen readers hear what the switch does, for example "Newest first. Show oldest first".
- Editors who open the event page templates will find the switch is an ordinary Button with the class `ts-sort` that takes its text and link from a new "List order" source. "Sort" is a new choice in the Button's Icon panel, which now offers 16 icons.

### Fixed
- An event with no date could be listed above events that have one. Events without a date now always come after the dated ones, in either order.

### Improved
- On Job Series, the order switch's label now also shows on phones, where it was hidden before, and its arrow points up for "Oldest first".

## [1.10.0] — 2026-10-12
### New
- On the Contact page, the grey hint in the Subject field now follows the topic a visitor picks under "What is this about?": "How can we help?" for General question, "e.g. Joining the next Eziama boot camp" for Workshops, "e.g. Posting an internship" for Job Series, and "e.g. Sponsoring a workshop" for Support or sponsorship.
- A link that opens the form on a topic, such as "Talk to us about sponsoring", shows that topic's hint straight away, also without JavaScript.
- What a visitor has typed in the Subject field is never changed; only the hint is.
- The email the form sends to the site now has a "Topic" line above the Subject line, naming the topic that was picked. This is a setting of the contact form itself, set on the development site, and the live site gets it when the site is moved over.
- Developers can change the hints with the filter `tekseries_blocks_contact_subject_hints`. A topic without a hint shows the form's own placeholder.

## [1.9.0] — 2026-10-12
### New
- Visitors now see a real Google map of the TekSeries address (89-44 162nd Street, Queens, New York) on the Contact page, 450px tall with rounded corners, in place of a drawn stand-in (a plum card with a street grid and a pin).
- The map can be dragged, zoomed and opened in Google Maps, like the map on the old site.
- Screen readers announce the map as "Map: TekSeries, 89-44 162nd Street, Queens, New York".
- Editors get a new "Map" block, found under Embeds in the block inserter. Paste the code Google Maps gives under Share, then "Embed a map", into the block, and it keeps only the map's address.
- The Map block accepts Google Maps embed codes only, and says so if anything else is pasted.
- The Map block has a field for the name screen readers hear, and its corner radius can be set under Styles.
- In the editor the Map block shows a still card instead of the live map; the map itself shows on the site.
- To change the map on the Contact page, editors select the Map block there and paste a new embed code.

### Changed
- On the Contact page, the address and the "Get directions" button now sit in their own white card under the map, not on top of the drawn stand-in.
- The map comes from Google, so the visitor's browser contacts Google when the page shows it. The browser loads it only when the visitor is near it on the page, which on Contact is usually straight away on a desktop.
- Site owner: the Privacy Policy may need a line about the Google map.

## [1.8.0] — 2026-10-12
### New
- Editors can now use a video as the background of a slide in the Home banner. Select the slide, choose "Replace" or "Add media" and pick a video. Short, silent clips work best, because the video is muted and loops.
- Editors get a new style for the Video block, "Photo frame (4:3)", under the block's Styles. It crops the video to 4:3 with large rounded corners, so a video can stand where a photo stands, such as beside the Mission card on Home.
- When a banner slide has a video, only the slide in view plays it. The other slides' videos do not download or start until their slide comes, so the page is not slowed.
- A banner with a video also gets a pause button in its corner, even when there is only one slide or the slides do not change by themselves. It stops the slides and the video, and pressing it again starts them.
- Visitors who have asked their device for reduced motion see still videos and no pause button.
- Without JavaScript, the first slide's video plays by itself, which is the browser's own behaviour, and the other videos stay still.
- Nothing changes on the site until an editor adds a video, and no page uses one yet.

## [1.7.0] — 2026-10-12
### New
- Editors can now set how long the Home banner stays on each slide. With "Change slides automatically" on, a new "Seconds on each slide" slider in the banner's Settings panel runs from 3 to 30 seconds. It stays at 7 seconds, as before, until an editor moves it.
- Editors can turn off "Hold while the pointer is over the slides" in the same panel, so the slides keep changing under the mouse. It is on by default, as before.
- The slides always hold while keyboard focus is inside them, in a browser tab nobody is looking at, and for visitors who ask their device for reduced motion, whatever this setting says.
- Editors can choose "Space between dots" in the same panel: "Easy to tap (44px each)", the default and as before, or "Close together (8px apart)", which is how the design draws them.
- The help text under that choice warns that close dots are harder to tap on a phone and, with three or more slides, smaller than the minimum tap size the accessibility guideline (WCAG 2.2) allows. With two slides, as on Home, close dots still pass.
- Editors get an "Add slide" button under the slides of the Home banner. It adds a complete slide: the plum overlay, a short label, a heading, a line of text, two buttons and the "Share", "Create", "Solve" row.
- The label, heading and line of a new slide show as greyed prompts to type over, and any left empty does not show on the site.
- The two buttons of a new slide link to "#" until an editor changes them, and the editor still chooses the photo.
- A new Home banner now starts with the same complete slide, and a Cover block added from the block library becomes one too. Duplicating a slide still works.

### Fixed
- On Home, the second slide of the banner now also shows the "Share", "Create", "Solve" row under its buttons, like the first.

## [1.6.0] — 2026-10-12
### New
- Editors can now give any Button an icon. Select the Button, open the new "Icon" panel in the settings sidebar and choose one of 15 icons (Arrow forward, Arrow back, Arrow outward, Add business, Upload file, Edit note, Send, Directions, Dashboard, Volunteer, Mail, Phone, Calendar, Search, Play) or "None". The icon shows in the editor at once.
- The "Icon after the text" switch in that panel puts the icon after the text when on and before it when off.
- The icon is 20px, takes the button's text colour and needs no code. Screen readers read only the button text.
- Buttons that were given an arrow by hand in the editor keep working, and the Icon panel now shows their icon.
- Visitors now see the icons the design gives these buttons:
- Contact: "Send a message" (pencil), "Support our work" (hand with heart), "See upcoming events" (arrow after) and "Get directions" (directions sign).
- Contact form: each topic choice ("General question", "Workshops", "Job Series", "Support or sponsorship") shows an icon for its topic, and "Send message" ends in a paper-plane icon.
- Event page: "All events" (arrow back) in the banner and "View all events" (arrow after) above "More events"; news post: "View all news" (arrow after); job page: "View all" (small arrow after).
- Job Series: "Post a job" (shop with a plus) and "Upload your CV" (file with an arrow) in the plum band, and "Post a job" and "Employer job view" (dashboard) in the saffron employers band.
- On Home, in the Job Series card, and on the Job Series page, "Upload your CV" shows a small file icon.
- On the job submission form, the "Choose file" button for the company logo shows an upload icon.

### Changed
- On the Contact form, the small round dot inside each topic choice is gone. The chosen topic is still the filled plum one, the arrow keys still move between topics, and the focused topic still shows a ring.
- In Windows high-contrast mode the dot is kept, because the fill is not drawn there.
- The buttons in the rows of the job dashboard are unchanged, because the design draws no icon there.

## [1.5.0] — 2026-10-12
### New
- Four buttons from the design are back. The site has no pages for them yet, so each links to "#" and pressing it does nothing.
- On Home, in "What We Do", the Job Series Portal card (Pillar II) has a third button, "Upload your CV", outlined in white, after "Find a job" and "Post a job".
- On Home, the Maker's Prize and Micro Seed Funding card (Pillar III) has a dark "Apply for the Maker's Prize" button, beside the card's heading on desktops and under it on tablets and phones.
- On the Job Series page, the plum band at the top has an "Upload your CV" button beside "Post a job".
- On each job's page, the side card has an outlined "Upload your CV to Job Series" link with a small icon under the "Apply for job" box. It is not shown when an employer previews their own listing.
- Editors: the buttons on Home and Job Series are ordinary Buttons. Once a page for CV uploads or Maker's Prize applications exists, put its address in the button's link in the editor.
- The link on each job's page is not in a page editors can open. A developer points it at the real page with one line of code (the filter `tekseries_blocks_cv_upload_url`).
- These changes were checked in a browser at 1440, 834 and 390px wide.

### Fixed
- On Home, the second impact figure in the theme's pattern now reads "Youths Trained" where it read "Youth Trained", matching the wording already used on the Home page.

## [1.4.0] — 2026-10-12
### New
- On every page, the footer now starts with the stacked TekSeries logo at the top of the plum panel, above "Share. Create. Solve.", on a white rounded plate.
- The footer logo has the alternative text "TekSeries" for screen readers.
- The footer is now taller on desktops, tablets and phones.
- Editors can replace or remove the footer logo in the Footer part of the Site Editor. It is a picture that comes with the theme.

### Changed
- On every page, the header now shows the horizontal TekSeries logo, the wordmark with "SHARE, CREATE, SOLVE" under it, in place of the stacked logo.
- The header logo is a little smaller on tablets and phones than on desktops, and the header bar keeps its height.
- The header logo still links to the Home page, and editors still change it in the Site Editor by clicking the logo.
- Note for the site owner: the horizontal logo file in the Media Library is 244 by 60 pixels, so it looks slightly soft on high-density screens, such as most phones and many laptops. A larger or SVG copy of the logo would fix that. To swap it, click the logo in the Site Editor and choose Replace. No other change is needed.
- These changes were checked in a browser at 1440, 834, 390 and 360px wide.

## [1.3.0] — 2026-10-12
### New
- On the Privacy Policy and Terms and Conditions pages, a lead line now sits under the page title in the plum band, as in the design: "How TekSeries collects, uses and protects the personal data of people who use our Site." on Privacy and "The rules for using TekSeries.com. By using the Site, you agree to abide by them." on Terms.
- The lead line's text is smaller on tablets and phones, and the line has a maximum width.
- Each of those two pages now ends with a saffron band that points to the other one: "Read our Terms and Conditions" with a button to Terms on Privacy, and "Read our Privacy Policy" with a button to Privacy on Terms.
- The button in the band ends in an arrow, and on phones it sits under the text.
- Editors can now write an excerpt on a page, in the Excerpt field of the page's settings sidebar. On a page that uses the "Legal page" template the excerpt is the lead line under the title, and with the field empty the page shows no lead line.
- Editors have a new pattern in the inserter, under "TekSeries: Pages", called "Legal: Link to the other legal page". Insert it at the end of a legal page, then change its three texts and its link.
- Editors can make a Button show an arrow after its text by adding the classes `ts-icon-arrow_forward ts-icon-after` under Advanced, then Additional CSS class(es). This is a first step, and the arrow is the only icon so far.

### Improved
- In the plum band at the top of the Privacy and Terms pages, the space between the band's lines is now 16px.
- The "On this page" list and the section numbers are unchanged, because the title of the new saffron band is not a section.

## [1.2.6] — 2026-10-12
### Improved
- On each job's page, the three cards under "More jobs" now show when that job was posted, for example "Posted 1 week ago", after the job type and location, with a small clock icon.
- The posted time is worded the same way as the "Posted" chip at the top of the job page, so it follows the job board's date setting (time ago, or a date).
- When a card's location is long, the posted time wraps onto a second line and the cards in that row grow a little.
- This was done on purpose at the site owner's request. The design board for the job page shows no posted time on these cards.

## [1.2.5] — 2026-10-12
### Changed
- On Home, in the "Who We Are" section on desktops (screens wider than 1100px), the plum Mission card now ends where its text ends, instead of stretching to the height of the photo and "Get Involved" card beside it.
- Tablets and phones are unchanged, because the section is a single column there.
- This was done on purpose at the site owner's request. The design board shows the card as tall as the column beside it.
- Editors can give any card in a row beside taller blocks the same behaviour by adding the class `ts-fit` under Advanced, then Additional CSS class(es). Removing the class brings the stretch back.

## [1.2.4] — 2026-10-12
### Improved
- On a short banner, the large faint topic icon in the banner's corner now shrinks to fit instead of being cut off at the top. Where it already fit, on banners and on listing cards, it looks as before.

### Changed
- On every page, the space between the header bar and the first block of the page is now 20px instead of 48px, on desktops, tablets and phones alike.
- On the Events, event type, News, Contact, Gallery and Job Series pages, the text in the plum band at the top (breadcrumbs, title, lead line and buttons) now starts level with the top of the white card beside it, not centred against it. Tablets and phones are unchanged.
- On a single event and a single news post, the coloured banner at the top is now only as tall as its content, with its text at the top. Before, on desktops, it was at least 576px tall with the text at the bottom.
- Tablets and phones had no minimum banner height and are unchanged.
- These three changes were made on purpose at the site owner's request. The design boards show 48px under the header, centred text in the band and a tall banner.
- Links that jump to a section of a page, such as "Send a message" on Contact, still land clear of the header.
- Editors who saved their own copy of a page template in the Site Editor keep the old 48px gap until they reset that template. No template has been customised on the development site.

## [1.2.3] — 2026-10-12
### Fixed
- On the "Submit a job" page, the drop-down fields that take one choice (Job type, and the salary unit where salary fields are on) now show the design's down arrow, set a little in from the right edge, in place of each browser's own arrow. A long choice never runs under the arrow, and the arrow stays in place while the field is in use.
- The field for job categories, where several choices can be picked, is unchanged.

## [1.2.2] — 2026-10-12
### Fixed
- On the Events, News, archive and search pages, the previous and next page controls under the lists now show a centred chevron icon instead of the characters « and ».
- On the first and last page of those lists, a greyed chevron now holds the place of the missing control, so the page circles no longer shift. It is not a link, and screen readers skip it.

### Improved
- On a news post, the "previous post" and "next post" cards at the end of the article are now links as a whole, not only the text.
- Each of those cards now shows a small coral label ("PREVIOUS POST" or "NEXT POST") with an arrow icon, the other post's title on its own line, and that post's date under the title. The next card's text is right-aligned, the corners are rounder, and the border still turns saffron on hover.
- On the Events and News cards, the arrow after "Read more" is now an icon, and the link text is 16px.
- On the large "latest" card, the "Read more" button is now 49px tall with 17px text.
- The page numbers under the Events and News lists are now 16px.
- The arrow icons are decoration and are not read out to screen reader users.

## [1.2.1] — 2026-10-12
### Fixed
- On the Events page and the event type pages, the filter tabs above the list ("All events", "Webinars", "Workshops" and "Makers' Prize") are now 44px tall as designed, with 8px between them.
- The filter tabs now follow the design's sizes on desktops, tablets (1100px wide and below) and phones (640px wide and below).
- On phones, the filter tabs now sit in one sideways-scrolling row that runs to the screen edges, instead of wrapping onto two rows. The page itself does not scroll sideways.
- On the Privacy and Terms pages, the "On this page" heading row of the contents card is now 44px tall and is still a full-size tap target.

## [1.2.0] — 2026-10-12
### New
- Editors can make any block rise in when the page opens, as the Home banner's text does, by adding the class `ts-intro` under Advanced, then Additional CSS class(es). It is meant for the top of a page, such as the hero, since lower down it would play unseen. Use `ts-reveal` for blocks that should rise on scroll.
- On a Group (Row, Stack and Grid included), the blocks directly inside rise in one after another while the Group and its background stay still. The first six take turns, and later ones come in with the sixth.
- On any other block, that block rises in by itself, and several marked blocks side by side take turns in their order.
- A marked block inside another marked block is ignored, so the outer one decides, and decorative corner icons stay still.
- Nothing moves for visitors who have asked their device for reduced motion, in print or in the editor. A block the keyboard reaches is shown at once, and no JavaScript is needed.
- Editors should know that rising text can slow the "largest paint" speed measure Google uses. On Contact and Job Series, where the hero is mostly text, marking the whole text Group moved it from about 0.4 to about 1.6 seconds, while marking only the heading and buttons cost nothing. A hero led by a photo, as on Home, has no cost.
- No page uses the class yet, so nothing changes until an editor adds it. The Home banner keeps its own built-in effect.

## [1.1.3] — 2026-10-12
### Fixed
- Keyboard visitors no longer see the Home banner's text, blocks set to rise on scroll, or the first link of the tablet and phone menu rise in a second time. A block the keyboard has reached is still shown at once. It now stays in place when the focus moves on, instead of vanishing and rising in again.
- Mouse and touch visitors, visitors with reduced motion, and editors see no difference.

## [1.1.2] — 2026-10-12
### Fixed
- A block set to rise in on scroll, placed directly inside a marked Group such as a card, now plays its own rise when a visitor reaches it. Before, it could appear at once or jump in part-way, most often on phones where cards are tall.
- When a marked Group sits inside another marked Group, the inner contents now rise in order from the first item. Before, the first item arrived after the second.
- Blocks that are not nested, and visitors with reduced motion or without JavaScript, see no difference.

## [1.1.1] — 2026-10-11
### Improved
- On tablets and phones (screens up to 1100px wide), the menu now unrolls from under the header bar when a visitor opens it. The links appear one after another and the two buttons come last. The menu button's bars turn into a close cross and swing back when the menu closes.
- The menu's links, order, look and ways of closing are unchanged. It still opens at once for visitors who have asked their device for reduced motion, and keyboard users find the first link there at once.

## [1.1.0] — 2026-10-11
### New
- Visitors see the Home banner's text (the chip, the headline, the line under it, the buttons and the three labels) rise and fade in one item after another when the page opens, while the photo stays still.
- Visitors see the four Home section headings ("Get Involved, Help Grow Our Impact", "Who We Are", "What We Do" and "Team") rise in the first time they scroll to them.
- Visitors see each of the three "What We Do" cards rise in the first time they scroll to it, with its contents following one after another.
- Editors can make any block rise in on scroll by adding the class `ts-reveal` under Advanced, then Additional CSS class(es). A Group marked this way rises in with its contents following, and removing the class removes the effect.

### Improved
- The Home impact figures now count up when a visitor scrolls to them. Before, they counted as soon as the page loaded and had usually finished before anyone reached them.
- Without JavaScript, everything on these pages is shown and the figures count on load. Animation stays off for visitors who have asked their device for reduced motion, and a block the keyboard reaches is shown at once.

## [1.0.0] — 2026-10-10
### New
- Visitors get the whole site in a new design with plum, saffron and lilac colours and larger text, replacing the old site: Home, Events, News, Gallery, Contact, Privacy, Terms and Job Series.
- The Home page opens with a two-slide banner that changes slides by itself, with dots to pick a slide and a pause button.
- The Home page impact figures count up, and the strip of partner logos moves, with a pause button.
- Events and News show listing cards in four colours, and each post keeps its own colour and topic icon on its card and on its page banner.
- Each event's page shows its date, time, venue and a register button, and says "This event has ended" once the event is over.
- Visitors can share an event or news post through sharing links on its page.
- The Gallery shows all photos and videos in one wall, with filters by type and year and a "Load more" button that update the page without a reload.
- Visitors can open any Gallery item full screen, with a counter, next and previous buttons, thumbnails, keyboard and swipe controls, and videos that play inside the viewer.
- Job Series lets visitors search by keyword, location, job type and remote work, with results that update as they type.
- Each job has its own page with the company, the job details and an apply box.
- Employers can post a job through a form and manage their listings in a job dashboard.
- The Privacy and Terms pages have an "On this page" list that marks the section being read.
- Editors can change text, images, links, the header, the footer and the colours in the Site Editor with blocks and patterns, without code.
- Editors get new blocks for the Site Editor: a Home banner with slides, a count-up figure, a moving logo strip, a photo and video gallery, a job list with search, sharing links, an "On this page" list and a colour label for posts.
- Editors add a banner slide by duplicating one, remove it by deleting it, and can switch "Change slides automatically" on or off.
- Each new event and news post is given a colour and a topic icon when first published, and editors can change both in the post's sidebar under "Tone and icon".
- Editors can fill in an event's date, time, venue and register link in the editor.
- Editors can sort Gallery photos and videos into albums, each with a year, under Media, then Albums. A video shows its featured image as its cover picture.
- Editors can choose the page layouts "Page with its own hero" and "Legal page" for a page.

### Improved
- Pages work without JavaScript, and animation stays off for visitors who have asked their device for reduced motion.
- Keyboard focus is always visible, and text over photos stays readable.
- Every kind of page was checked against the WCAG 2.2 AA accessibility standard, with an automatic check and a keyboard walk-through.
- Text appears in the site's own fonts sooner when a page loads.

## Planned
- The Home banner may get Previous and Next arrows if they are wanted.
- The Gallery "Load more" button will add 10 items on phones, and the totals at the top of the Gallery will follow the year filter.
- Gallery photos will get descriptive captions and picture descriptions, and the Gallery video will get captions.
- Editors will get a bulk "add to album" action in the Media Library.
- Event pages on phones will show the poster before the details and the register button at the end, as in the design.
- Past events and events with closed registration will get their own designed look, and the logged-out job dashboard will get a designed sign-in page.
- Editors will get a picker for an event type's icon in the admin area.
- The statistics window of the job dashboard will be restyled to match the design.
- Job categories will be reduced to a curated list, and the "Upload your CV" buttons and the "Apply now" buttons on the Maker Prize page, which open a form once the site is connected but otherwise lead nowhere, will get real pages to go to.
- Photos will load faster once uploads are converted to a lighter picture format.
- Igbo letters (ị, ọ, ụ) in headings will show in the site's heading font once a font that covers them is found.
- Time and venue still need to be filled in for older events, and the emoji lost from some posts and events need to be restored.
