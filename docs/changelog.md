# Changelog

This file records what visitors and site editors of tekseries.com will notice in each release; versions follow semantic versioning.

## [1.2.4] — 2026-10-12
### Improved
- On a short banner, the large faint topic icon in the banner's corner now shrinks to fit instead of being cut off at the top; where it already fit, on banners and on listing cards, it looks as before.

### Changed
- On every page, the space between the header bar and the first block of the page is now 20px, where before it was 48px, on desktops, tablets and phones alike.
- On the Events, event type, News, Contact, Gallery and Job Series pages, the text in the plum band at the top (breadcrumbs, title, lead line and buttons) now starts at the top of the band, level with the top of the white card beside it, where before it was centred against the card on desktops; on tablets and phones the card sits under the text and nothing moves.
- On a single event and a single news post, the coloured banner at the top is now only as tall as its content and its text starts at the top, where before on desktops it was at least 576px tall with the text at the bottom; for example, a news post with a one-line title went from 576px to 295px tall at 1440px wide, and an event with a long title from 576px to 568px.
- Tablets and phones had no minimum banner height and are unchanged.
- These three changes are made on purpose at the site owner's request and differ from the design boards, which show 48px under the header, centred text in the band and a tall banner.
- Links that jump to a section of a page, such as "Send a message" on Contact, still land clear of the header.
- Editors who saved their own copy of a page template in the Site Editor keep the old 48px gap until they reset that template; no template has been customised on the development site.

## [1.2.3] — 2026-10-12
### Fixed
- On the "Submit a job" page, the drop-down fields that take one choice (Job type, and the salary unit where salary fields are on) now show the design's down arrow, 14px in from the right edge, where before each browser drew its own arrow tight against the edge; room is kept for the arrow so a long choice never runs under it, and it stays in place while the field is in use.
- The field for job categories, where several choices can be picked, is unchanged.

## [1.2.2] — 2026-10-12
### Fixed
- Under the lists on the Events and News pages, and on the archive and search pages, the previous and next page controls now show a chevron icon, 24px and centred in its 44px circle, where before they showed the characters « and », which sat 6.5px off centre.
- On the first page of those lists, and on the last, a greyed chevron now stands where the missing previous or next control would be, so the row of page circles no longer shifts from page to page; it is not a link and screen readers are not told about it.

### Improved
- On a news post, the "previous post" and "next post" cards at the end of the article are now links as a whole, where before only the text was.
- Each of those cards now shows a small coral label ("PREVIOUS POST" or "NEXT POST") with an arrow icon, the other post's title on its own line, and that post's date under the title; the next card's text is right-aligned, the corners are rounder (24px), and the border still turns saffron on hover.
- On the Events and News cards, the arrow after "Read more" is now an icon (20px) and the link text is 16px.
- On the large "latest" card, the "Read more" button is now 49px tall with 17px text, where before it was about 57px tall.
- The page numbers under the Events and News lists are now 16px, where before they were 17px.
- The arrow icons are decoration and are not read out to screen reader users.

## [1.2.1] — 2026-10-12
### Fixed
- On the Events page and the event type pages, the filter tabs above the list ("All events", "Webinars", "Workshops" and "Makers' Prize") are now 44px tall as designed, where before they were 66px, and the gap between tabs is now 8px, where before it was 4px.
- The filter tabs now follow the design's sizes for each screen: 16px text on desktops, 15px text with a slightly smaller icon and padding on tablets (1100px wide and below), and 14px text on phones (640px wide and below), where before the text shrank to as little as 12px on a phone.
- On phones, the filter tabs now sit in one row that scrolls sideways and runs to the edges of the screen, where before they wrapped onto two rows, and the page itself does not scroll sideways.
- On the Privacy and Terms pages, the "On this page" heading row of the contents card is now 44px tall, where before it was 60px, and it is still a full-size tap target.

## [1.2.0] — 2026-10-12
### New
- Editors can make any block rise in when the page opens, the way the Home banner's text does, by adding the class `ts-intro` under Advanced, then Additional CSS class(es), in the editor; this is meant for the top of a page, such as the hero, because lower down it would play before anyone sees it, and `ts-reveal` is the class for blocks that should rise when a visitor scrolls to them.
- On a Group (Row, Stack and Grid are Groups too), the blocks directly inside rise in one after another while the Group and its background stay still; the first six take turns and any after that come in with the sixth.
- On any other block, that block rises in by itself, and several marked blocks side by side take turns in their order.
- A marked block inside another marked block is ignored, so the outer one decides, and decorative corner icons stay still.
- Nothing moves for visitors who have asked their device for reduced motion, in print, or in the editor, a block the keyboard reaches is shown at once, and it needs no JavaScript.
- Editors should know that text which rises in only counts as shown, for the "largest paint" speed measure Google uses, once it has finished rising: on a hero led by a photo, as on Home, there is no cost, but on Contact and Job Series, where the hero's text is the largest thing on screen, marking the whole text Group moved that time from about 0.4 seconds to about 1.6 seconds, while marking only the heading and the buttons and leaving the large paragraph unmarked cost nothing.
- No page uses the class yet, so nothing on the site changes until an editor adds it, and the Home banner keeps its own built-in effect.

## [1.1.3] — 2026-10-12
### Fixed
- For visitors moving through the page with the keyboard, the Home banner's text, any block marked to rise in on scroll, and the first link of the tablet and phone menu no longer rise in a second time: a block the keyboard has reached is still shown at once, and it now stays in place when the focus moves on, where before it vanished and rose in again.
- Mouse and touch visitors, visitors with reduced motion, and editors see no difference.

## [1.1.2] — 2026-10-12
### Fixed
- A block marked to rise in on scroll, placed directly inside a marked Group such as a card, now plays its own rise when a visitor reaches it, where before it could appear at once or jump in part-way, most often on phones where cards are tall.
- When a marked Group sits inside another marked Group, the inner contents now rise in order from the first item, where before the first item arrived after the second.
- Blocks that are not nested, and visitors with reduced motion or without JavaScript, see no difference.

## [1.1.1] — 2026-10-11
### Improved
- On tablets and phones (screens up to 1100px wide), the menu now unrolls from under the header bar when a visitor opens it, with the links appearing one after another and the two buttons last, and the menu button's bars turn into the close cross and swing back when the menu closes, where before the menu appeared at once.
- The menu's links, order, look and ways of closing are unchanged, it still opens at once for visitors who have asked their device for reduced motion, and a keyboard user finds the first link there at once.

## [1.1.0] — 2026-10-11
### New
- Visitors see the Home banner's text (the chip, the headline, the line under it, the buttons and the three labels) rise and fade in one item after another when the page opens, while the photo stays still.
- Visitors see the four Home section headings ("Get Involved, Help Grow Our Impact", "Who We Are", "What We Do" and "Team") rise in the first time they scroll to them.
- Visitors see each of the three "What We Do" cards rise in the first time they scroll to it, with its contents following one after another.
- Editors can make any block rise in on scroll by adding the class `ts-reveal` under Advanced, then Additional CSS class(es), in the editor; a Group marked this way rises in and its contents follow, and removing the class removes the effect.

### Improved
- The Home impact figures now count up when a visitor scrolls to them, where before they counted as soon as the page loaded and had usually finished before anyone reached them.
- Without JavaScript, everything on these pages is simply shown and the figures count on load; animation stays off for visitors who have asked their device for reduced motion, and a block the keyboard reaches is shown at once.

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
- Editors can sort Gallery photos and videos into albums, each with a year, under Media, then Albums, and a video shows its featured image as its cover picture.
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
- Job categories will be reduced to a curated list, and "Upload your CV" links will return once they have somewhere to go.
- Photos will load faster once uploads are converted to a lighter picture format.
- Igbo letters (ị, ọ, ụ) in headings will show in the site's heading font once a font that covers them is found.
- Time and venue still need to be filled in for older events, and the emoji lost from some posts and events need to be restored.
