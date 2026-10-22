# Changelog

This file records what visitors and site editors of tekseries.com will notice in each release; versions follow semantic versioning.

## [1.24.0] — 2026-10-22
### New
- Visitors can search events by name on the Events page and the event type pages. The search field sits beside the type filters, or above them on tablets and phones.
- The list follows as visitors type, without reloading the page, and only event titles are searched. Without JavaScript, pressing Enter searches.
- While searching, a line says how many events match, such as "3 events for “camp” across all events", with a "Clear search" link. On a type page it reads "among Workshop events".
- The Latest event card and the Happening now card step aside during a search. Matches list from the newest, 12 a page.
- The type buttons and the Newest/Oldest switch keep the search, and the browser's Back and Forward buttons work.
- When nothing matches, a card reads "No events match “…”". It suggests Coding, AI, Career and Women, and offers "Clear search", plus "Search all event types" on a type page.

## [1.23.0] — 2026-10-22
### New
- Editors can mark an event as ongoing with the "Ongoing" switch in the event's Events fields. It reads "Since August 15, 2023" on its page and "Aug 2023 – Now" on cards.
- An ongoing event shows a white "Ongoing" label with a pulsing dot after its type, never says "This event has ended", and has no countdown. The dot stays still for visitors who reduce motion.
- An ongoing event's page shows "Ongoing · " and the current month, with "Since" and "Still running" around the large date. The Event details card shows "Started" and "Status: Ongoing", with no "Join here" row.
- The Events page shows a "Happening now" card above the filters for the ongoing event. It lists the title, type, start date and venue, a progress bar with "Running for 3 years, 2 months, and still going.", and a "View workshop" button. It is hidden when no event is ongoing.

### Changed
- An event's main button that links to a page on this site now opens in the same tab and has a forward arrow.

## [1.22.3] — 2026-10-22
### Fixed
- On page 2 and later of an event type, such as Webinars, the type's filter button now stays highlighted and is announced as the current page.

### Changed
- Event type pages (Webinars, Workshops, Makers' Prize) now show 6 events per page, in two rows of three, instead of 10.

## [1.22.2] — 2026-10-21
### Changed
- The theme's picture under Appearance → Themes in wp-admin is now a red code bracket (</>) on a lilac background, replacing the coloured wooden blocks. The readme credit matches.

## [1.22.1] — 2026-10-21
### New
- Editors see a picture of coloured wooden blocks on the theme's card under Appearance → Themes in wp-admin.
- The theme now comes with a readme that credits the resources it uses.

### Improved
- The theme and the plugin now name "Beekomm Technologies" as their author, with a link, in the lists of themes and plugins.
- Their descriptions are fuller, and the theme now has tags.

## [1.22.0] — 2026-10-21
### New
- Editors can connect a paragraph or heading to the page's deadline under Attributes in the block settings: choose content, Page deadline, then "Deadline: date and time", "Deadline: date" or "Deadline: time".
- A connected text writes the deadline in the page's time zone, such as "December 1, 2026, 11:59 PM WAT", and updates by itself when the deadline or time zone changes.
- A "Deadline date" block in the inserter does the same in one step.
- A connected text can't be typed into until it is disconnected under Attributes. On a page without a deadline it keeps its text.

### Changed
- On the Maker Prize page, the two "Submission Deadline" dates are now connected to the page's deadline, so changing the deadline changes them. Visitors see the same text.
- On narrow screens, the date now moves under "Submission Deadline:" as a whole, where "WAT" used to break onto its own line.
- The change was also made in the theme's Maker Prize pattern, and it reaches the live site when the site is moved over.

## [1.21.0] — 2026-10-21
### New
- Selecting a block on a page with a deadline shows a "Deadline" panel whose "Show" setting offers Always, Before the deadline and After the deadline, so editors no longer type the two deadline classes.
- For a block set to "Before the deadline", one click adds its after-the-deadline copy: "Add a copy to show after the deadline", or "Add the closed button after it" for a Button.
- The closed button is a greyed, disabled "Applications closed" button with a lock icon.
- Buttons have an "Applications closed button (disabled)" switch that makes a greyed button visitors can't click. Switching it off makes it a link again, and the link is re-added from the toolbar.

### Changed
- The Deadline panel only appears on pages with a deadline, or on a block already set to show before or after it. A warning explains when there is no deadline.
- Blocks already using the older deadline classes keep working.
- Visitors notice no change.

## [1.20.0] — 2026-10-21
### New
- Editors can pick a time zone for a page's deadline in the "Time zone" field under the date picker in the Deadline Countdown settings. The countdown and the switch to "Applications closed" follow that zone.
- "Use Nigerian time (WAT)" in that field goes back to Nigerian time. Pages that never pick a zone stay on Nigerian time.

### Fixed
- A deadline set to a time ending in :59 now closes at the end of that minute: 11:59 PM becomes 11:59:59 PM. Before, it closed a minute early.

### Improved
- The help text under the date picker now gives the exact moment applications close in the chosen zone, such as "Applications close at December 1, 2026, 11:59:59 PM WAT".

### Changed
- The "UTC" note under the date picker no longer shows in the Deadline settings.
- Visitors notice no other change, and the Maker Prize page still closes at 11:59:59 PM Nigerian time on December 1, 2026.

## [1.19.2] — 2026-10-21
### Changed
- The company registration line in the footer of every page now reads "RC 9920315." where it read "CR No. 9920315."

## [1.19.1] — 2026-10-19
### New
- The Privacy Policy now covers the Google map and YouTube and Vimeo videos under "Who We Share Personal Data With".
- It also covers the forms, such as "Upload your CV" and "Apply for the Maker's Prize", which Beekomm Technologies Limited hosts for TekSeries.
- It says how form answers are used, kept and deleted, and that the form service sets no cookies but keeps a small record in the browser's local storage.

### Changed
- The footer credit now reads "Built and maintained by Beekomm Technologies" and links to beekomm.com, where it read "Designed and developed by Allwell".
- The Privacy Policy and Terms and Conditions now give team@tekseries.com as the contact address, not series@tekseries.com, including in their "Questions about this page?" card.
- On Home, Allwell Agwu-Okoro's team card has a new description, and so does the Home page pattern editors start from.
- The Privacy Policy, Terms and Home page changes reach the live site when it is moved over. "Job Series: series@tekseries.com" on Contact is unchanged.

## [1.19.0] — 2026-10-16
### New
- Editors see a "Poster frame" panel in a video's details in the Media Library, in the pop-up and on "Edit Media", showing three frames from across the video.
- Clicking a frame makes it the video's poster in the Gallery, in the viewer and in a news post's video card.
- "Show other frames" shows three different moments, and a slider with "Use this moment" sets the poster to an exact moment.
- A video in an album with no poster gets its middle frame as the poster when opened in the Media Library. The poster can be changed at any time.
- Picking a new frame removes the frame image the panel made earlier. A picture added by hand as the poster is never removed.
- If the browser can't play a video, for example some .mov files from phones, the panel shows a message, and a picture can still be set as the featured image.
- Visitors see no change except the posters themselves.

## [1.18.1] — 2026-10-15
### Fixed
- On desktop screens from just over 1100px to about 1220px wide, such as small laptops, the header no longer breaks onto two rows, and the logo keeps its proportions.

### Improved
- On those widths the space around the menu links narrows a little. The header is unchanged at 1280px and wider, and on tablets and phones.

## [1.18.0] — 2026-10-15
### New
- Visitors get a new Maker Prize page at /maker-prize/, under What We Do in the breadcrumbs, with the application, eligibility criteria and a live countdown to the December 1, 2026, 11:59 PM Nigerian time deadline.
- The page has two "Apply now" buttons, at the top and in a closing band, that open the Maker's Prize form in a panel once the site is connected to Formbricks.
- Each answer tells Formbricks which button opened the form: `maker_prize_hero` for the top button and `maker_prize_cta` for the closing one.
- After the deadline the page closes by itself. It says "Applications are now closed", turns the buttons into greyed "Applications closed" ones and notes winners are announced beginning the first quarter of the new year.
- Editors get a new page pattern, "Maker Prize page", to start the page from. The deadline is set in the page's own Deadline Countdown settings.
- The development site already has the page, and the live site gets it when the site is moved over.

### Changed
- On Home, the third pillar's "Apply for the Maker’s Prize" button now opens the Maker Prize page, not the form, so `home_makers_prize` no longer appears in answers.
- The Settings → Forms (Formbricks) help text now names the Maker Prize page and its two button names.

## [1.17.0] — 2026-10-15
### New
- Editors get a Deadline Countdown block that counts down to the page's deadline, as four tiles (days, hours, minutes, seconds) or as one line.
- The line reads, for example, "12 days left to apply", then "Last day to apply" in the final 24 hours. After the deadline it disappears and the tiles read 00.
- Without JavaScript the countdown shows the days only.
- Editors set a page's deadline in the Deadline field of the Deadline Countdown block's settings, in Nigerian time. The picker has no seconds, so 11:59 PM is saved as 23:59:00.
- Editors can show blocks only until the deadline with the class `ts-when-open`, or only after it with `ts-when-closed`. They swap by themselves when the countdown reaches zero.
- A page without a deadline counts as open. In the editor, a dashed outline marks the `ts-when-closed` blocks.
- Editors can show a Button as disabled and greyed, for example "Applications closed", by making it a button instead of a link and adding the class `ts-disabled`.
- The Button's Icon control now offers a lock icon, and the collection gains timer and certificate icons.

## [1.16.1] — 2026-10-15
### New
- Visitors see the company registration line "CR No. 9920315." in every page's footer, between the copyright and the designer's credit.

### Improved
- On phones, each item in the footer's bottom row now sits on its own centred line.

### Changed
- On Home, the wording follows the 15 October 2026 design update in the Method paragraphs, the case study and the cards of the second and third pillars.
- On Home, the first "The challenge" card's source line now reads "Source: National Bureau of Statistics, Nigeria." and "The opportunity" card gains "Sources: Int’l Finance Corp. & National Labor Reports."
- On Home, the Job Series pillar's three figures now read 33.3% headline youth unemployment, 53.4% combined labor distress and 142%+ surge in demand for specialized tech roles.
- The Maker's Prize pillar's four cards on Home now mention applying by December 1, winner announcements beginning the first quarter of the new year, community-driven solutions and start up guidance.
- Page patterns only fill new pages. The live Home page gets these edits when the site is moved over.

## [1.16.0] — 2026-10-15
### New
- A form opened from a button on the site now tells Formbricks which button opened it, in the form's hidden field `entry_point`.
- In Formbricks, the form needs a hidden field with the ID `entry_point` for this. A form without it still opens and records no name.
- Editors name a Button by adding a class such as `ts-entry-home_job_series` next to its `ts-survey-` class under Advanced → Additional CSS class(es). Names use letters, numbers, underscores and hyphens, and an unnamed Button sends none.
- The site's buttons are named `home_job_series` for "Upload your CV" on Home, `home_makers_prize` for "Apply for the Maker's Prize", `job_series_hero` in the Job Series hero, and `job_listing` on each job's page, which editors can't change.
- Settings → Forms (Formbricks) has a new section, "See which button opened a form", with these steps and the site's names.
- Nothing changes visually for visitors.

## [1.15.1] — 2026-10-13
### Fixed
- A link or button pressed with the mouse or a finger while its block was still rising into place now works the first time. Before, only a second press worked.
- This covers the Home banner's first slide and the top bands of the Events, News, Contact, Gallery, Job Series and legal pages as they open, and the Home and Contact cards as they scroll in.
- The block now shows in full at once and keeps gliding into place under the pointer. A block that gets keyboard focus still shows at once.

## [1.15.0] — 2026-10-13
### New
- Visitors can press a marked button to open a Formbricks form in a panel over the page, without leaving the page.
- Once the site is connected, "Upload your CV" on Home and Job Series, "Apply for the Maker's Prize" on Home, and "Upload your CV to Job Series" on each job's page open the form.
- Nothing is loaded from Formbricks until a visitor moves to press such a button.
- The button's own link is followed instead when JavaScript is off or the form doesn't open within a few seconds. A button whose link is "#" then does nothing.
- Keyboard focus moves into an open form and returns to its button when it closes.
- Until the settings are filled in, the buttons stay ordinary links.
- Editors enter the "SDK connection URL", which must start with https://, and the website "ID" in Settings → Forms (Formbricks). Where Formbricks shows an Environment ID and a Workspace ID, use the Environment ID.
- That screen says whether the site is connected and lists the steps to make a button open a form.
- In Formbricks, editors set a Code action key, such as `upload-cv`, as a "Website & App Survey" form's trigger. They then add the class `ts-survey-upload-cv` to the Button under Advanced → Additional CSS class(es).
- In Formbricks, set the form to "Keep showing while conditions match" and "Ignore Cooldown Period", or it opens only once per visitor.
- The "Upload your CV" and "Apply for the Maker's Prize" buttons in the Home and Job Series patterns are already marked, with the keys `upload-cv` and `makers-prize`.

## [1.14.0] — 2026-10-13
### New
- Visitors see a countdown on each upcoming event, running to its start time and with the same time left in every time zone.
- On each event's page, the countdown sits in the banner above the Register button: "Starts in" and four tiles for days, hours, minutes and seconds.
- On the Events page, the large "Latest event" card shows the four tiles for an event still to come.
- The other event cards, including "More events", show a small pill such as "In 13 days", "In 5 hours" or "In 20 min".
- From the start time until the end of that day in Nigeria, the countdown reads "Happening now".
- An event without a start time counts whole days only and reads "Today" on its day.
- After the event's day there is no countdown, and "This event has ended" shows as before.
- Without JavaScript, visitors see the days left and the short line, but not the ticking hours, minutes and seconds.
- Screen readers hear one sentence, such as "In 13 days: October 27, 2026, 11:00 AM WAT", not a changing clock.
- Editors get an optional "Start time" field on each event, read as Nigerian time (WAT), which the countdown runs to. The "Time" text field is still what visitors see.
- Editors get an "Event Countdown" block with a Size setting of "Full" or "Compact", already in the event page templates.

### Changed
- An event's day now ends at midnight in Nigeria for "This event has ended" and the Register button, not at 1 a.m.

## [1.13.2] — 2026-10-13
### Fixed
- On the "Post a job" form, "Save draft" now works with an empty Description, and the draft appears on the job dashboard.
- On the "Post a job" form, "Preview" without a description now shows "Add a description of the role." under the editor in place of a stray empty box, and moves the cursor there.

### Improved
- Notices above the "Post a job" form that contain a link, such as "Draft was saved…", now read as one normal line, without gaps around the link.

## [1.13.1] — 2026-10-13
### Improved
- The plum band at the top of the News, Events, event type and legal pages now rises in when the page opens. It stays still for visitors who have asked for reduced motion.
- Editors who insert the Contact, Gallery, Job Series, Post a job or Job dashboard page pattern get the same entrance on its top band.
- Editors who insert the Home or Contact page patterns get cards and tiles that rise in on scroll, such as Home's impact tiles and team cards and Contact's detail cards.

### Changed
- The footer line under the logo now reads "Equipping underserved youth with Digital, AI, and Creative Economy Skills."
- The Home page pattern's slide 1 now leads with "One youth’s career at a time.", slide 2 reads "TekSeries is a 501(c)(3) Tax-Exempt Non-Profit Corporation", and the case study has new opening wording.
- Existing pages are unchanged, because page patterns only fill new pages.
- Editors: a template or footer saved in the Site Editor replaces the theme's version, so one saved before this release keeps showing what was saved until it is reset there.

## [1.13.0] — 2026-10-12
### New
- Visitors can watch a video on a news post. A "Watch the video" card with a play button under the text opens it full screen in the Gallery's viewer.
- A linked YouTube or Vimeo video plays in that site's own player inside the viewer.
- Nothing loads from YouTube or Vimeo until a visitor opens the video, and then only in their privacy-enhanced and "do not track" modes. Closing the viewer stops the video.
- Without JavaScript the card is a link to the video file, or to its YouTube or Vimeo page.
- A post without a video, or with the switch off, looks as before.
- Editors get a "Video" panel on each news post with a "Show a video" switch, a "Video file" or "Video link" (YouTube or Vimeo) and a "Thumbnail".
- The file is used when both a file and a link are set.
- Without a thumbnail, a video file shows its own poster image and a link shows a plain plum card.
- A link to any other site is not shown, so no card appears.
- Editors will find the card in the single post template as a new "Post Video" block after the post content.

## [1.12.0] — 2026-10-12
### New
- Visitors can open an event's poster full screen from "Event poster" or "View full size" under the poster. The poster now sits in a white frame with rounded corners.
- Escape or the close button returns to the page, and keyboard focus goes back to where it was.
- Without JavaScript the "View full size" link opens the image file itself.
- An event without a featured image shows no frame.
- On Home, the Case Study card has a "See video" button over the photo's bottom-left corner. It opens the video in the same viewer.
- When the viewer opens on a single file, it drops the counter, Previous and Next buttons and thumbnails. A Gallery with one file does the same.
- Editors can make a Button or linked Image open the viewer with the class `ts-lightbox-open` under Advanced, then Additional CSS class(es). It opens links to a photo or video, and other links stay ordinary.
- A Featured Image block with that class gets a link to its full-size file.
- On Home, the "See video" button links to "#" until an editor puts a video file's address in its link.
- A new "Open full size" choice in the Button's Icon panel brings it to 17 icons.

### Fixed
- On an event's page, a poster narrower than its column could be drawn over the content under it. The picture now stays inside its box.

## [1.11.0] — 2026-10-12
### New
- Visitors can reverse a list. The "Newest first" label on the Events, event type and Job Series pages is now a switch that reads "Oldest first" while active.
- The switch is a plain link ending in `?order=asc` for oldest first, so it works without JavaScript and either order can be bookmarked.
- On the Events page, the large "Latest" card stays the newest event in either order, and the grid under it lists the rest from the oldest.
- The page links under the lists and the event type filter tabs keep the chosen order.
- On Job Series the list changes in place, and a later search, filter or "Clear filters" keeps the order.
- Screen readers hear what the switch does, for example "Newest first. Show oldest first".
- Editors will find the switch in the event page templates as a Button with the class `ts-sort`, using a new "List order" source for text and link. The Icon panel gains "Sort", making 16 icons.

### Fixed
- Events without a date now always come after the dated ones, in either order. Before, one could be listed above events that have a date.

### Improved
- On Job Series, the order switch's label now shows on phones too, and its arrow points up for "Oldest first".

## [1.10.0] — 2026-10-12
### New
- On Contact, the Subject field's grey hint now follows the topic picked under "What is this about?", with its own hint for each of the four topics.
- A link that opens the form on a topic, such as "Talk to us about sponsoring", shows that topic's hint straight away, also without JavaScript.
- Text a visitor has typed in the Subject field is never changed, only the hint.
- The email the form sends now has a "Topic" line above the Subject line naming the picked topic. The live site gets this when the site is moved over.
- Developers can change the hints with the filter `tekseries_blocks_contact_subject_hints`. A topic without a hint shows the form's own placeholder.

## [1.9.0] — 2026-10-12
### New
- The Contact page now shows a real Google map of the TekSeries address (89-44 162nd Street, Queens, New York) instead of a drawn stand-in.
- The map can be dragged, zoomed and opened in Google Maps.
- Screen readers announce the map as "Map: TekSeries, 89-44 162nd Street, Queens, New York".
- Editors get a new "Map" block under Embeds. Paste the embed code from Google Maps (Share, then "Embed a map") and the block keeps only the address.
- The Map block accepts Google Maps embed codes only, and says so if anything else is pasted.
- The Map block has a field for the name screen readers hear, and its corner radius is set under Styles.
- In the editor the Map block shows a still card instead of the live map.
- To change the map on Contact, editors select the Map block there and paste a new embed code.

### Changed
- On Contact, the address and the "Get directions" button now sit in their own white card under the map.
- The visitor's browser contacts Google when the map loads, which happens only when the visitor is near it on the page. On Contact that is usually straight away on a desktop.
- Site owner: the Privacy Policy may need a line about the Google map.

## [1.8.0] — 2026-10-12
### New
- Editors can use a video as a Home banner slide's background by choosing "Replace" or "Add media" on the slide. The video is muted and loops.
- Editors get a "Photo frame (4:3)" style for the Video block under Styles. It crops the video to 4:3 with large rounded corners.
- Only the slide in view plays its video. Other slides' videos do not download or start until their slide comes.
- A banner with a video gets a pause button in its corner, even for one slide or slides that do not change by themselves. It stops the slides and video.
- Visitors who have asked for reduced motion see still videos and no pause button.
- Without JavaScript, the first slide's video plays by itself and the other videos stay still.
- Nothing changes on the site until an editor adds a video, and no page uses one yet.

## [1.7.0] — 2026-10-12
### New
- With "Change slides automatically" on, editors can set "Seconds on each slide" from 3 to 30 in the Home banner's Settings panel. It stays at 7 until changed.
- Editors can turn off "Hold while the pointer is over the slides" in the same panel, so slides keep changing under the mouse. It is on by default.
- Whatever this setting says, the slides hold while keyboard focus is inside them, in a tab nobody is viewing, and for visitors with reduced motion.
- In the same panel, editors can set "Space between dots" to "Easy to tap (44px each)", the default, or "Close together (8px apart)", as the design draws them.
- The help text warns that close dots are harder to tap on a phone and, with three or more slides, fall below the WCAG 2.2 minimum tap size. Two slides, as on Home, pass.
- An "Add slide" button under the Home banner's slides adds a complete slide, with the plum overlay, a label, a heading, text, two buttons and the "Share", "Create", "Solve" row.
- A new slide's label, heading and line show as greyed prompts to type over, and any left empty does not show on the site.
- A new slide's two buttons link to "#" until an editor changes them, and the editor still chooses the photo.
- A new Home banner now starts with the same complete slide, and so does a Cover block added from the block library. Duplicating a slide still works.

### Fixed
- On Home, the banner's second slide now also shows the "Share", "Create", "Solve" row under its buttons, like the first.

## [1.6.0] — 2026-10-12
### New
- Editors can give any Button an icon in the new "Icon" panel of the settings sidebar, choosing one of 15, such as Send, Calendar or Play, or "None".
- The "Icon after the text" switch puts the icon after the text when on and before it when off.
- The icon takes the button's text colour, and screen readers read only the button text.
- Buttons given an arrow by hand keep working, and the Icon panel now shows their icon.
- Visitors now see the icons the design gives these buttons:
- Contact: "Send a message" (pencil), "Support our work" (hand with heart), "See upcoming events" (arrow after) and "Get directions" (directions sign).
- Contact form: each topic choice ("General question", "Workshops", "Job Series", "Support or sponsorship") shows an icon, and "Send message" ends in a paper plane.
- On the event page, "All events" in the banner and "View all events" above "More events" get an arrow, as do "View all news" on a news post and "View all" on a job page.
- On Job Series, "Post a job" and "Upload your CV" in the plum band, and "Post a job" and "Employer job view" in the saffron employers band, each get an icon.
- On Home, in the Job Series card, and on the Job Series page, "Upload your CV" shows a small file icon.
- On the job submission form, the company logo's "Choose file" button shows an upload icon.

### Changed
- On the Contact form, the small round dot inside each topic choice is gone. The chosen topic is still filled plum, and the arrow keys and focus ring work as before.
- In Windows high-contrast mode the dot is kept, because the fill is not drawn there.
- The buttons in the rows of the job dashboard are unchanged, because the design draws no icon there.

## [1.5.0] — 2026-10-12
### New
- Four buttons from the design are back. The site has no pages for them yet, so each links to "#" and does nothing.
- On Home, the Job Series Portal card (Pillar II) in "What We Do" has a third button, "Upload your CV", after "Find a job" and "Post a job".
- On Home, the Maker's Prize and Micro Seed Funding card (Pillar III) has a dark "Apply for the Maker's Prize" button beside its heading on desktops and under it on tablets and phones.
- On the Job Series page, the plum band at the top has an "Upload your CV" button beside "Post a job".
- On each job's page, the side card has an outlined "Upload your CV to Job Series" link under the "Apply for job" box, hidden when an employer previews their listing.
- Editors: the buttons on Home and Job Series are ordinary Buttons. Once a page for CV uploads or Maker's Prize applications exists, put its address in the button's link.
- Editors can't change the link on each job's page. A developer points it at the real page with the filter `tekseries_blocks_cv_upload_url`.
- These changes were checked in a browser at 1440, 834 and 390px wide.

### Fixed
- On Home, the second impact figure in the theme's pattern now reads "Youths Trained", not "Youth Trained", matching the Home page.

## [1.4.0] — 2026-10-12
### New
- On every page, the footer now starts with the stacked TekSeries logo on a white rounded plate at the top of the plum panel, above "Share. Create. Solve."
- The footer logo has the alternative text "TekSeries" for screen readers.
- The footer is now taller on desktops, tablets and phones.
- Editors can replace or remove the footer logo in the Footer part of the Site Editor. It is a picture that comes with the theme.

### Changed
- On every page, the header now shows the horizontal TekSeries logo, with "SHARE, CREATE, SOLVE" under the wordmark, in place of the stacked logo.
- The header logo is a little smaller on tablets and phones, and the header bar keeps its height.
- The header logo still links to the Home page, and editors still change it in the Site Editor by clicking the logo.
- The horizontal logo is 244 by 60 pixels, so it looks slightly soft on high-density screens. The site owner can fix that by replacing it in the Site Editor with a larger or SVG copy.
- These changes were checked in a browser at 1440, 834, 390 and 360px wide.

## [1.3.0] — 2026-10-12
### New
- On Privacy and Terms, a lead line now sits under the page title in the plum band, as in the design.
- The lead line is smaller on tablets and phones.
- The Privacy and Terms pages each now end with a saffron band: "Read our Terms and Conditions" on Privacy and "Read our Privacy Policy" on Terms, each with a button to the other page.
- The band's button ends in an arrow, and on phones it sits under the text.
- Editors can write an excerpt in the Excerpt field of the page's settings sidebar. On a "Legal page" it is the lead line, and an empty field means no lead line.
- Editors can insert the pattern "Legal: Link to the other legal page" from "TekSeries: Pages" at the end of a legal page, then change its texts and link.
- Editors can make a Button show an arrow after its text with the classes `ts-icon-arrow_forward ts-icon-after` under Advanced, then Additional CSS class(es). The arrow is the only icon so far.

### Improved
- In the plum band at the top of Privacy and Terms, the space between the band's lines is now 16px.
- The "On this page" list and section numbers are unchanged, because the new saffron band's title is not a section.

## [1.2.6] — 2026-10-12
### Improved
- The three "More jobs" cards on each job's page now show when the job was posted, for example "Posted 1 week ago", with a small clock icon.
- The posted time is worded like the "Posted" chip at the top of the job page, so it follows the job board's date setting.
- When a card's location is long, the posted time wraps onto a second line and the cards in that row grow a little.
- This was done on purpose at the site owner's request. The design board for the job page shows no posted time on these cards.

## [1.2.5] — 2026-10-12
### Changed
- On desktops (wider than 1100px), the plum Mission card in Home's "Who We Are" section now ends where its text ends, not level with the photo and card beside it.
- Tablets and phones are unchanged, because the section is a single column there.
- This was done on purpose at the site owner's request. The design board shows the card as tall as the column beside it.
- Editors can give any card beside taller blocks the same behaviour with the class `ts-fit` under Advanced, then Additional CSS class(es). Removing the class restores the stretch.

## [1.2.4] — 2026-10-12
### Improved
- On a short banner, the large faint topic icon in the corner now shrinks to fit instead of being cut off at the top. Where it already fit, it looks as before.

### Changed
- On every page and screen size, the space between the header bar and the first block is now 20px instead of 48px.
- On the Events, event type, News, Contact, Gallery and Job Series pages, the plum band's text now starts level with the top of the white card beside it. Tablets and phones are unchanged.
- On each event and news post, the coloured banner is now only as tall as its content, with the text at the top. Before, on desktops, it was at least 576px tall.
- Tablets and phones had no minimum banner height and are unchanged.
- These three changes were made on purpose at the site owner's request. The design boards show a 48px gap under the header, centred text and a tall banner.
- Links that jump to a section of a page, such as "Send a message" on Contact, still land clear of the header.
- Editors who saved their own copy of a page template in the Site Editor keep the old 48px gap until they reset that template.

## [1.2.3] — 2026-10-12
### Fixed
- On the "Submit a job" page, single-choice drop-downs now show the design's down arrow instead of each browser's own, and long choices never run under it.
- The field for job categories, where several choices can be picked, is unchanged.

## [1.2.2] — 2026-10-12
### Fixed
- On the Events, News, archive and search pages, the previous and next page controls now show a chevron icon instead of « and ».
- On the first and last page, a greyed chevron, not a link, holds the place of the missing control so the page circles stay put, and screen readers skip it.

### Improved
- On a news post, the "previous post" and "next post" cards at the end are now links as a whole, not only the text.
- Each card now shows a coral label ("PREVIOUS POST" or "NEXT POST") with an arrow, the other post's title and its date. Corners are rounder, and the next card's text is right-aligned.
- On the Events and News cards, the arrow after "Read more" is now an icon, and the link text is 16px.
- On the large "latest" card, the "Read more" button is now 49px tall with 17px text.
- The page numbers under the Events and News lists are now 16px.
- The arrow icons are decoration and are not read out to screen reader users.

## [1.2.1] — 2026-10-12
### Fixed
- On the Events and event type pages, the filter tabs ("All events", "Webinars", "Workshops", "Makers' Prize") are now 44px tall as designed, with 8px between them.
- The filter tabs now follow the design's sizes on desktops, tablets (1100px wide and below) and phones (640px wide and below).
- On phones, the filter tabs now sit in one sideways-scrolling row to the screen edges instead of wrapping onto two rows. The page itself does not scroll sideways.
- On the Privacy and Terms pages, the "On this page" heading row is now 44px tall and still a full-size tap target.

## [1.2.0] — 2026-10-12
### New
- Editors can make any block rise in when the page opens with the class `ts-intro`, added under Advanced, then Additional CSS class(es). Use it at the top of a page, and `ts-reveal` lower down.
- On a Group (Row, Stack and Grid included), the blocks directly inside rise in one after another, while the Group and its background stay still.
- On any other block, that block rises in by itself, and several marked blocks side by side take turns in their order.
- A marked block inside another marked block is ignored, so the outer one decides, and decorative corner icons stay still.
- Nothing moves for visitors who have asked for reduced motion, in print or in the editor. Blocks the keyboard reaches show at once, and no JavaScript is needed.
- Rising text can slow Google's "largest paint" measure. On Contact and Job Series, marking the whole text Group raised it from about 0.4 to 1.6 seconds, and marking only the heading and buttons cost nothing.
- No page uses the class yet, so nothing changes until an editor adds it. The Home banner keeps its own built-in effect.

## [1.1.3] — 2026-10-12
### Fixed
- Keyboard visitors no longer see the Home banner's text, blocks set to rise on scroll or the first tablet and phone menu link rise in twice. Such blocks now stay put when focus moves on.
- Mouse and touch visitors, visitors with reduced motion, and editors see no difference.

## [1.1.2] — 2026-10-12
### Fixed
- A block set to rise on scroll, placed directly inside a marked Group, now plays its own rise when a visitor reaches it. Before, it could appear at once or jump in part-way.
- When a marked Group sits inside another, its contents now rise in order from the first item. Before, the first arrived after the second.
- Blocks that are not nested, and visitors with reduced motion or without JavaScript, see no difference.

## [1.1.1] — 2026-10-11
### Improved
- On tablets and phones, the menu now unrolls from under the header bar when opened. The links appear one after another, the buttons come last, and the menu button turns into a close cross.
- The menu's links, order, look and ways of closing are unchanged. It still opens at once for visitors who have asked for reduced motion, and keyboard users still find the first link at once.

## [1.1.0] — 2026-10-11
### New
- When the Home page opens, the banner's text rises and fades in one item at a time, while the photo stays still.
- Visitors see the four Home section headings ("Get Involved, Help Grow Our Impact", "Who We Are", "What We Do", "Team") rise in the first time they scroll to them.
- Visitors see each of the three "What We Do" cards rise in the first time they scroll to it, its contents following one after another.
- Editors can make any block rise in on scroll by adding the class `ts-reveal` under Advanced, then Additional CSS class(es). On a Group, its contents follow one by one.

### Improved
- The Home impact figures now count up when a visitor scrolls to them, not on page load.
- Without JavaScript, everything on these pages shows and the figures count on load. Animation stays off for visitors who ask for reduced motion, and blocks the keyboard reaches show at once.

## [1.0.0] — 2026-10-10
### New
- The new site replaces the old one, with plum, saffron and lilac colours and larger text. It has Home, Events, News, Gallery, Contact, Privacy, Terms and Job Series.
- The Home page opens with a two-slide banner that changes slides by itself, with dots to pick a slide and a pause button.
- The Home page impact figures count up, and the strip of partner logos moves, with a pause button.
- Events and News show listing cards in four colours, and each post keeps its colour and topic icon on its card and its page banner.
- Each event's page shows its date, time, venue and a register button, and says "This event has ended" once the event is over.
- Visitors can share an event or news post through sharing links on its page.
- The Gallery shows all photos and videos in one wall. Filters by type and year and the "Load more" button update it without a reload.
- Visitors can open any Gallery item full screen, with a counter, next and previous buttons, thumbnails and keyboard and swipe controls. Videos play inside the viewer.
- Job Series lets visitors search by keyword, location, job type and remote work, with results that update as they type.
- Each job has its own page with the company, the job details and an apply box.
- Employers can post a job through a form and manage their listings in a job dashboard.
- The Privacy and Terms pages have an "On this page" list that marks the section being read.
- Editors can change text, images, links, the header, the footer and the colours in the Site Editor with blocks and patterns, without code.
- Editors get new blocks for a Home banner with slides, a count-up figure, a moving logo strip, a gallery, a searchable job list, sharing links, an "On this page" list and post colour labels.
- Editors add a banner slide by duplicating one, remove it by deleting it, and can switch "Change slides automatically" on or off.
- Each new event and news post gets a colour and topic icon when first published, and editors can change both under "Tone and icon" in the sidebar.
- Editors can fill in an event's date, time, venue and register link in the editor.
- Editors can sort Gallery photos and videos into albums, each with a year, under Media, then Albums. A video's featured image is its cover.
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
