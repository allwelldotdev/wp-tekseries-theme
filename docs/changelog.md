# Changelog

This file records what visitors and site editors of tekseries.com will notice in each release; versions follow semantic versioning.

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
