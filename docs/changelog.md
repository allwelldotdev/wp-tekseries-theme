# Changelog

This file records what visitors and site editors of tekseries.com will notice in each release; versions follow semantic versioning.

## [1.25.1] — 2026-10-22
### Fixed
- On the live site, form fields and form buttons (Contact, Job Series search, Post a Job, Events search, job dashboard search) no longer lose their borders and backgrounds.

## [1.25.0] — 2026-10-22
### New
- Editors can pick or upload an image from the Media Library as a video's poster, using "Choose or upload a picture" in the "Poster frame" panel. This also works for videos the browser can't play.
- Replacing a poster made from a frame removes that frame image. A picture chosen from the Library is never deleted.

## [1.24.0] — 2026-10-22
### New
- Visitors can search events by title on the Events page and the event type pages. The list updates as they type, and pressing Enter works without JavaScript.
- A line says how many events match, with a "Clear search" link. The type buttons, the Newest/Oldest switch and the browser's Back and Forward buttons keep the search.
- The Latest event and Happening now cards step aside during a search. When nothing matches, a card suggests other searches and offers to clear it.

## [1.23.0] — 2026-10-22
### New
- Editors can mark an event as ongoing with the "Ongoing" switch in the event's Events fields.
- An ongoing event shows an "Ongoing" label with a pulsing dot (still for visitors who reduce motion), "Since" and "Still running" wording on its page, "Aug 2023 – Now" on cards, and never says it has ended or shows a countdown.
- The Events page shows a "Happening now" card above the filters with the event's details, how long it has been running and a button to view it. It is hidden when no event is ongoing.

### Changed
- An event's main button that links to a page on this site now opens in the same tab and has a forward arrow.

## [1.22.3] — 2026-10-22
### Fixed
- On page 2 and later of an event type, such as Webinars, the type's filter button stays highlighted.

### Changed
- Event type pages (Webinars, Workshops, Makers' Prize) now show 6 events per page, in two rows of three, instead of 10.

## [1.22.2] — 2026-10-21
### Changed
- The theme's picture under Appearance → Themes is now a red code bracket (</>) on a lilac background, replacing the coloured wooden blocks.

## [1.22.1] — 2026-10-21
### New
- Editors see a picture on the theme's card under Appearance → Themes, and the theme comes with a readme crediting the resources it uses.

### Improved
- The theme and the plugin name "Beekomm Technologies" as author, with a link, and have fuller descriptions.

## [1.22.0] — 2026-10-21
### New
- Editors can connect a paragraph or heading to the page's deadline under Attributes in the block settings, choosing date and time, date only or time only. It shows the deadline in the page's time zone and updates when the deadline changes.
- A "Deadline date" block in the inserter does the same in one step.

### Changed
- On the Maker Prize page, the two "Submission Deadline" dates are now connected to the page's deadline. Visitors see the same text, and on narrow screens the date no longer breaks before "WAT".
- The same change is in the theme's Maker Prize pattern and reaches the live site when the site is moved over.

## [1.21.0] — 2026-10-21
### New
- Selecting a block on a page with a deadline shows a "Deadline" panel whose "Show" setting offers Always, Before the deadline and After the deadline, so editors no longer type deadline classes.
- For a block set to show before the deadline, one click adds its after-the-deadline copy, or a greyed "Applications closed" button with a lock icon for a Button.
- Buttons have an "Applications closed button (disabled)" switch that makes a greyed button visitors can't click.

### Changed
- The Deadline panel only appears on pages with a deadline, or on a block already set to show before or after it. Blocks using the older deadline classes keep working, and visitors notice no change.

## [1.20.0] — 2026-10-21
### New
- Editors can pick a time zone for a page's deadline under the date picker in the Deadline Countdown settings. The countdown and the switch to "Applications closed" follow it. Pages that never pick a zone stay on Nigerian time.

### Fixed
- A deadline set to a time ending in :59 now closes at the end of that minute (11:59:59 PM), not a minute early.

### Improved
- The help text under the date picker gives the exact moment applications close in the chosen zone.

### Changed
- The "UTC" note under the date picker no longer shows. The Maker Prize page still closes at 11:59:59 PM Nigerian time on December 1, 2026.

## [1.19.2] — 2026-10-21
### Changed
- The company registration line in the footer now reads "RC 9920315." instead of "CR No. 9920315."

## [1.19.1] — 2026-10-19
### New
- The Privacy Policy now covers the Google map, YouTube and Vimeo videos, and the forms hosted for TekSeries by Beekomm Technologies Limited, including how answers are used, kept and deleted.

### Changed
- The footer credit now reads "Built and maintained by Beekomm Technologies" and links to beekomm.com.
- The Privacy Policy and Terms and Conditions now give team@tekseries.com as the contact address.
- On Home, Allwell Agwu-Okoro's team card and the Home page pattern have a new description.
- The Privacy Policy, Terms and Home changes reach the live site when it is moved over.

## [1.19.0] — 2026-10-16
### New
- Editors see a "Poster frame" panel in a video's details in the Media Library, showing three frames from across the video. Clicking one makes it the poster in the Gallery, the viewer and a news post's video card.
- "Show other frames" offers three different moments, and a slider sets the poster to an exact moment.
- A video with no poster gets its middle frame when opened in the Media Library. Picking a new frame removes the earlier frame image, but never a picture added by hand.
- If the browser can't play a video, such as some phone .mov files, the panel says so and a picture can still be set as the featured image.

## [1.18.1] — 2026-10-15
### Fixed
- On screens from just over 1100px to about 1220px wide, such as small laptops, the header no longer breaks onto two rows and the logo keeps its proportions.

## [1.18.0] — 2026-10-15
### New
- Visitors get a new Maker Prize page at /maker-prize/ with the application, eligibility criteria and a live countdown to the December 1, 2026, 11:59 PM Nigerian time deadline.
- Two "Apply now" buttons open the Maker's Prize form in a panel once the site is connected to Formbricks.
- After the deadline the page closes by itself: it says "Applications are now closed", greys the buttons and notes winners are announced beginning the first quarter of the new year.
- Editors get a "Maker Prize page" pattern to start from. The deadline is set in the page's Deadline Countdown settings.
- The live site gets the page when it is moved over.

### Changed
- On Home, the third pillar's "Apply for the Maker’s Prize" button now opens the Maker Prize page, not the form.

## [1.17.0] — 2026-10-15
### New
- Editors get a Deadline Countdown block that counts down to the page's deadline, as four tiles (days, hours, minutes, seconds) or as one line such as "12 days left to apply". Without JavaScript it shows days only.
- Editors set the deadline in Nigerian time in the block's settings.
- Editors can show blocks only until the deadline (class `ts-when-open`) or only after it (`ts-when-closed`). They swap by themselves at zero. A page without a deadline counts as open.
- Editors can show a Button as disabled and greyed, such as "Applications closed", with the class `ts-disabled`.
- The Button's Icon control offers a lock icon, and the collection gains timer and certificate icons.

## [1.16.1] — 2026-10-15
### New
- Visitors see the company registration line "CR No. 9920315." in every page's footer.

### Improved
- On phones, each item in the footer's bottom row sits on its own centred line.

### Changed
- On Home, the wording follows the 15 October 2026 design update: the Method paragraphs, the case study, the second and third pillar cards, new source lines, and new Job Series figures (33.3% youth unemployment, 53.4% labor distress, 142%+ demand for specialized tech roles).
- Page patterns only fill new pages. The live Home page gets these edits when the site is moved over.

## [1.16.0] — 2026-10-15
### New
- A form opened from a button on the site now tells Formbricks which button opened it, in a hidden field `entry_point`. The form needs that field in Formbricks, or no name is recorded.
- Editors name a Button with a class such as `ts-entry-home_job_series` next to its `ts-survey-` class under Advanced → Additional CSS class(es). The site's own buttons are already named.
- Settings → Forms (Formbricks) has a new section, "See which button opened a form", with the steps and names.

## [1.15.1] — 2026-10-13
### Fixed
- A link or button pressed while its block was still rising into place now works the first time, not only on a second press. This covers the Home banner's first slide, the top bands of most pages, and the Home and Contact cards as they scroll in.

## [1.15.0] — 2026-10-13
### New
- Visitors can press a marked button to open a Formbricks form in a panel over the page. "Upload your CV" on Home and Job Series, "Apply for the Maker's Prize" on Home, and "Upload your CV to Job Series" on each job's page open the form once the site is connected.
- Nothing loads from Formbricks until a visitor moves to press such a button. Without JavaScript, or if the form doesn't open within a few seconds, the button's own link is followed.
- Keyboard focus moves into an open form and returns to its button when it closes. Until the settings are filled in, the buttons stay ordinary links.
- Editors enter the "SDK connection URL" (starting with https://) and the website "ID" (the Environment ID) in Settings → Forms (Formbricks). The screen shows whether the site is connected and lists the steps to make a button open a form.
- In Formbricks, editors set a Code action key as the form's trigger, set it to "Keep showing while conditions match" and "Ignore Cooldown Period", and add the matching `ts-survey-` class to the Button. The Home and Job Series buttons are already marked.

## [1.14.0] — 2026-10-13
### New
- Visitors see a countdown on each upcoming event, running to its start time and the same in every time zone.
- On an event's page it sits above the Register button as four tiles. On the Events page the large "Latest event" card shows the tiles, and other cards show a small pill such as "In 13 days".
- From the start time to the end of that day in Nigeria it reads "Happening now". After that, "This event has ended" shows as before.
- Without JavaScript visitors see the days left but not the ticking clock. Screen readers hear one sentence, not a changing clock.
- Editors get an optional "Start time" field on each event, read as Nigerian time (WAT). The "Time" text field is still what visitors see. An event without a start time counts whole days only.
- Editors get an "Event Countdown" block with a "Full" or "Compact" size, already in the event page templates.

### Changed
- An event's day now ends at midnight in Nigeria for "This event has ended" and the Register button, not at 1 a.m.

## [1.13.2] — 2026-10-13
### Fixed
- On the "Post a job" form, "Save draft" now works with an empty Description, and the draft appears on the job dashboard.
- "Preview" without a description now shows "Add a description of the role." and moves the cursor there, instead of a stray empty box.

### Improved
- Notices above the "Post a job" form that contain a link now read as one normal line.

## [1.13.1] — 2026-10-13
### Improved
- The plum band at the top of the News, Events, event type and legal pages rises in when the page opens, and stays still for visitors who reduce motion.
- Editors who insert the Contact, Gallery, Job Series, Post a job or Job dashboard pattern get the same entrance, and the Home and Contact patterns get cards and tiles that rise in on scroll.

### Changed
- The footer line under the logo now reads "Equipping underserved youth with Digital, AI, and Creative Economy Skills."
- The Home page pattern has new wording on slide 1, slide 2 ("TekSeries is a 501(c)(3) Tax-Exempt Non-Profit Corporation") and the case study. Existing pages are unchanged.
- Editors: a template or footer saved in the Site Editor replaces the theme's version, so one saved earlier keeps showing what was saved until it is reset.

## [1.13.0] — 2026-10-12
### New
- Visitors can watch a video on a news post. A "Watch the video" card under the text opens it full screen in the Gallery's viewer, and YouTube or Vimeo videos play in their own player there.
- Nothing loads from YouTube or Vimeo until a visitor opens the video, and closing the viewer stops it. Without JavaScript the card is a link to the video.
- Editors get a "Video" panel on each news post with a "Show a video" switch, a "Video file" or "Video link" (YouTube or Vimeo only) and a "Thumbnail". The file wins if both are set.
- The card is a new "Post Video" block after the post content in the single post template.

## [1.12.0] — 2026-10-12
### New
- Visitors can open an event's poster full screen from "Event poster" or "View full size". The poster now sits in a white frame with rounded corners, and an event without a featured image shows no frame.
- Escape or the close button returns to the page. Without JavaScript the link opens the image file.
- On Home, the Case Study card has a "See video" button over the photo that opens the video in the same viewer. It links to "#" until an editor adds a video file's address.
- When the viewer opens on a single file, it drops the counter, Previous and Next buttons and thumbnails.
- Editors can make a Button or linked Image open the viewer with the class `ts-lightbox-open`, and a Featured Image block with that class links to its full-size file.
- A new "Open full size" choice in the Button's Icon panel brings it to 17 icons.

### Fixed
- On an event's page, a poster narrower than its column could be drawn over the content under it. It now stays inside its box.

## [1.11.0] — 2026-10-12
### New
- Visitors can reverse a list. "Newest first" on the Events, event type and Job Series pages is now a switch that reads "Oldest first" while active. It works without JavaScript and either order can be bookmarked.
- On the Events page the large "Latest" card stays the newest event in either order. Page links and type filter tabs keep the chosen order, as do later searches and filters on Job Series.
- Editors will find the switch in the event page templates as a Button with the class `ts-sort`. The Icon panel gains "Sort", making 16 icons.

### Fixed
- Events without a date now always come after the dated ones, in either order.

### Improved
- On Job Series, the order switch's label now shows on phones, and its arrow points up for "Oldest first".

## [1.10.0] — 2026-10-12
### New
- On Contact, the Subject field's grey hint follows the topic picked under "What is this about?", with its own hint for each of the four topics. A link that opens the form on a topic shows that hint straight away. Text a visitor has typed is never changed.
- The email the form sends now has a "Topic" line naming the picked topic. The live site gets this when the site is moved over.

## [1.9.0] — 2026-10-12
### New
- The Contact page shows a real Google map of the TekSeries address (89-44 162nd Street, Queens, New York) that can be dragged, zoomed and opened in Google Maps.
- Editors get a "Map" block under Embeds. Paste the embed code from Google Maps and the block keeps only the address. Only Google Maps embed codes are accepted.
- The block has a field for the name screen readers hear, and its corner radius is set under Styles. In the editor it shows a still card.

### Changed
- On Contact, the address and "Get directions" button now sit in their own white card under the map.
- The visitor's browser contacts Google when the map loads, when the visitor is near it on the page. The Privacy Policy may need a line about the map.

## [1.8.0] — 2026-10-12
### New
- Editors can use a video as a Home banner slide's background by choosing "Replace" or "Add media" on the slide. The video is muted and loops, and only the slide in view plays.
- A banner with a video gets a pause button in its corner. Visitors who reduce motion see still videos and no pause button.
- Editors get a "Photo frame (4:3)" style for the Video block under Styles.
- Nothing changes on the site until an editor adds a video.

## [1.7.0] — 2026-10-12
### New
- With "Change slides automatically" on, editors can set "Seconds on each slide" (3 to 30, default 7) in the Home banner's Settings panel, and can turn off "Hold while the pointer is over the slides". Slides always hold during keyboard focus, in an unviewed tab, and for reduced motion.
- Editors can set "Space between dots" to "Easy to tap" (default) or "Close together". Close dots are harder to tap on phones and fail the WCAG 2.2 tap size with three or more slides.
- An "Add slide" button adds a complete slide, with the plum overlay, label, heading, text, two buttons and the "Share", "Create", "Solve" row. Empty prompts don't show on the site, and the buttons link to "#" until changed.
- A new Home banner, or a Cover block from the block library, starts with the same complete slide.

### Fixed
- On Home, the banner's second slide now also shows the "Share", "Create", "Solve" row.

## [1.6.0] — 2026-10-12
### New
- Editors can give any Button an icon in the new "Icon" panel, choosing one of 15 or "None", before or after the text. The icon takes the button's text colour and screen readers read only the text.
- Visitors now see the icons the design gives buttons: on Contact (Send a message, Support our work, See upcoming events, Get directions), on the Contact form's topic choices and Send message, on event, news and job pages ("All events", "View all news" and similar arrows), on Job Series bands (Post a job, Upload your CV, Employer job view), on Home's Job Series card, and on the job form's logo upload button.

### Changed
- On the Contact form, the small round dot inside each topic choice is gone. The chosen topic is still filled plum, and the dot stays in Windows high-contrast mode.

## [1.5.0] — 2026-10-12
### New
- Four buttons from the design are back. Each links to "#" and does nothing until a page exists: "Upload your CV" on Home's Job Series card and in the Job Series top band, "Apply for the Maker's Prize" on Home's Pillar III card, and an outlined "Upload your CV to Job Series" link in each job's side card (hidden in an employer's preview).
- Editors can set the link on the Home and Job Series buttons. The link on each job's page is changed by a developer.

### Fixed
- On Home, the second impact figure in the theme's pattern now reads "Youths Trained".

## [1.4.0] — 2026-10-12
### New
- Every page's footer now starts with the stacked TekSeries logo on a white rounded plate above "Share. Create. Solve.", and the footer is taller. Editors can replace or remove the logo in the Footer part of the Site Editor.

### Changed
- The header now shows the horizontal TekSeries logo with "SHARE, CREATE, SOLVE" under the wordmark, slightly smaller on tablets and phones. It still links to Home.
- The horizontal logo looks slightly soft on high-density screens. The site owner can replace it in the Site Editor with a larger or SVG copy.

## [1.3.0] — 2026-10-12
### New
- On Privacy and Terms, a lead line sits under the page title in the plum band. Editors write it in the page's Excerpt field; empty means no lead line.
- Each of those pages ends with a saffron band linking to the other ("Read our Terms and Conditions" or "Read our Privacy Policy"). Editors can insert the pattern "Legal: Link to the other legal page" on any legal page.
- Editors can make a Button show an arrow after its text with the classes `ts-icon-arrow_forward ts-icon-after`.

### Improved
- The space between lines in the plum band at the top of Privacy and Terms is now 16px.

## [1.2.6] — 2026-10-12
### Improved
- The three "More jobs" cards on each job's page now show when the job was posted, such as "Posted 1 week ago", with a small clock icon. This was done at the site owner's request.

## [1.2.5] — 2026-10-12
### Changed
- On desktops, the plum Mission card in Home's "Who We Are" section now ends where its text ends, not level with the photo and card beside it. Tablets and phones are unchanged. This was done at the site owner's request.
- Editors can give any card the same behaviour with the class `ts-fit`.

## [1.2.4] — 2026-10-12
### Improved
- On a short banner, the large faint topic icon in the corner shrinks to fit instead of being cut off.

### Changed
- On desktops, the space between the header bar and the first block is now 20px instead of 48px, and the plum band's text on the Events, event type, News, Contact, Gallery and Job Series pages starts level with the top of the white card beside it.
- On each event and news post, the coloured banner is now only as tall as its content, with the text at the top. It was at least 576px tall on desktops.
- These changes were made at the site owner's request. Editors who saved their own copy of a page template keep the old gap until they reset it.

## [1.2.3] — 2026-10-12
### Fixed
- On the "Submit a job" page, single-choice drop-downs now show the design's down arrow, and long choices never run under it.

## [1.2.2] — 2026-10-12
### Fixed
- On the Events, News, archive and search pages, the previous and next page controls show a chevron instead of « and ». On the first and last page a greyed chevron holds the place of the missing control.

### Improved
- On a news post, the "previous post" and "next post" cards at the end are links as a whole, with a coral label, arrow, the other post's title and its date, and rounder corners.
- On the Events and News cards, the "Read more" arrow is now an icon with larger text, and the page numbers are larger.

## [1.2.1] — 2026-10-12
### Fixed
- On the Events and event type pages, the filter tabs are now the designed size and spacing. On phones they sit in one sideways-scrolling row instead of wrapping onto two.
- On Privacy and Terms, the "On this page" heading row is now 44px tall and still a full-size tap target.

## [1.2.0] — 2026-10-12
### New
- Editors can make any block rise in when the page opens with the class `ts-intro` (top of a page) or `ts-reveal` (lower down), under Advanced → Additional CSS class(es). On a Group, the blocks inside rise one after another.
- Nothing moves for visitors who reduce motion, in print or in the editor, and no JavaScript is needed to see the blocks.
- Rising text can slow Google's "largest paint" measure, so mark headings and buttons rather than whole text groups.
- No page uses the class yet, so nothing changes until an editor adds it.

## [1.1.3] — 2026-10-12
### Fixed
- Keyboard visitors no longer see the Home banner's text, blocks set to rise on scroll or the first tablet and phone menu link rise in twice.

## [1.1.2] — 2026-10-12
### Fixed
- A block set to rise on scroll, placed inside a marked Group, now plays its own rise when reached instead of appearing at once or jumping in part-way. Nested groups now rise in order from the first item.

## [1.1.1] — 2026-10-11
### Improved
- On tablets and phones, the menu now unrolls from under the header bar, with links appearing one after another and the menu button turning into a close cross. It opens at once for visitors who reduce motion.

## [1.1.0] — 2026-10-11
### New
- When the Home page opens, the banner's text rises and fades in one item at a time. The four Home section headings and the three "What We Do" cards rise in the first time they are scrolled to.
- Editors can make any block rise in on scroll with the class `ts-reveal` under Advanced → Additional CSS class(es).

### Improved
- The Home impact figures count up when a visitor scrolls to them, not on page load.
- Without JavaScript everything shows. Animation stays off for visitors who reduce motion.

## [1.0.0] — 2026-10-10
### New
- The new site replaces the old one, with plum, saffron and lilac colours and larger text. It has Home, Events, News, Gallery, Contact, Privacy, Terms and Job Series.
- Home opens with a two-slide banner that changes slides by itself, with dots and a pause button. Its impact figures count up, and a strip of partner logos moves, with a pause button.
- Events and News show listing cards in four colours, and each post keeps its colour and topic icon on its card and page banner.
- Each event's page shows its date, time, venue and a register button, and says "This event has ended" once it is over. Visitors can share an event or news post through sharing links.
- The Gallery shows all photos and videos in one wall, with filters by type and year and a "Load more" button that update without a reload. Any item opens full screen with a counter, next and previous buttons, thumbnails, and keyboard and swipe controls. Videos play inside the viewer.
- Job Series lets visitors search by keyword, location, job type and remote work, with results that update as they type. Each job has its own page with the company, details and an apply box.
- Employers can post a job through a form and manage their listings in a job dashboard.
- The Privacy and Terms pages have an "On this page" list that marks the section being read.
- Editors can change text, images, links, the header, the footer and the colours in the Site Editor with blocks and patterns, without code.
- Editors get new blocks for a Home banner with slides, a count-up figure, a moving logo strip, a gallery, a searchable job list, sharing links, an "On this page" list and post colour labels.
- Editors add a banner slide by duplicating one, and can switch "Change slides automatically" on or off.
- New events and news posts get a colour and topic icon when first published, which editors change under "Tone and icon". Editors fill in an event's date, time, venue and register link in the editor.
- Editors can sort Gallery photos and videos into albums, each with a year, under Media → Albums. A video's featured image is its cover.
- Editors can choose the page layouts "Page with its own hero" and "Legal page".

### Improved
- Pages work without JavaScript, and animation stays off for visitors who reduce motion.
- Keyboard focus is always visible, text over photos stays readable, and every kind of page was checked against the WCAG 2.2 AA accessibility standard.
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
