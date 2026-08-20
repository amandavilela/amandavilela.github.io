---
layout: layouts/post.njk
title: "Less JS, more platform: A hands-on test of Declarative Partial Updates"
description: "A hands-on test of Chrome's Declarative Partial Updates: out-of-order HTML streaming, setHTML/streamHTML, and where it breaks."
keywords: "Declarative Partial Updates, Chrome DPU API, out-of-order HTML streaming, declarative partial updates accessibility"
date: 2026-08-20
featured: true
tags: 
  - frontend
open_graph:
  image: "blog/declarative-partial-updates-hands-on-test/og-image-declarative-partial-updates-hands-on-test.webp"
---

I've always been an advocate for the web platform and its capabilities. In 2017, with the rise of JS frameworks, I gave a talk named "Maybe you don't need a JS framework", in which I presented and explained a set of JS features (modules, template strings, promises, fetch API) that could help people build a robust, lightweight page with dynamic content and templates.

In May this year, the Chrome team released a preview of Declarative Partial Updates, where you can stream content into any part of a page as it becomes ready. It made me really curious because, with vanilla JS, we've traditionally had to rely on quite a few tricks to achieve the same result.

In this article, I'll explain the Declarative Partial Updates capabilities with a test case and analyze its pros and cons.

<nav aria-labelledby="toc-title" class="table-of-contents">
    <h2 id="toc-title">Table of Contents</h2>
    <ul>
        <li>
            <a href="#what-are-declarative-partial-updates">What are Declarative Partial Updates?</a>
            <ul>
                <li><a href="#out-of-order-streaming">Out-of-order streaming</a></li>
                <li><a href="#html-insertion-and-streaming-methods">HTML insertion and streaming methods</a></li>
                <li><a href="#frameworks-vs-platform">Frameworks vs. Platform</a></li>
            </ul>
        </li>
        <li>
            <a href="#a-test-case">A test case</a>
        </li>
        <li>
            <a href="#what-worked-well">What worked well</a>
        </li>
        <li>
            <a href="#friction-points">Friction points</a>
        </li>
        <li>
            <a href="#browser-support-gaps">Browser support gaps</a>
        </li>
        <li>
            <a href="#final-thoughts">Final thoughts</a>
        </li>
        <li>
            <a href="#reading-recommendations">Reading recommendations</a>
        </li>
    </ul>
</nav>

## <a href="#what-are-declarative-partial-updates" id="what-are-declarative-partial-updates">What are Declarative Partial Updates?</a>

Declarative Partial Updates is a set of proposed Web Platform APIs that enable out-of-order HTML streaming directly in the browser and provide new JavaScript methods for dynamically updating parts of an existing document.

These APIsare ready for developer testing from Chrome 148 using the `chrome://flags/#enable-experimental-web-platform-features` flag.

Currently, we have two ways of rendering HTML on the page:

1. render the whole page server-side;
2. rely on JS frameworks or play with limited JS features to deliver components asynchronously.

Declarative Partial Updates can help us handle HTML content insertion and deliver out-of-order HTML natively, instead of relying on JS. Let's look at how they work.

## <a href="#out-of-order-streaming" id="out-of-order-streaming">Out-of-order streaming</a>

The new out-of-order streaming APIs use processing instruction placeholders to mark insertion points in the DOM, allowing late-arriving HTML inside `<template for="...">` elements to automatically target and fill those spots as it streams in.

```html
<section>
<?marker name="template-name"></section>

<template for="template-name">
This is my HTML template :)
</template>
```

When the browser encounters the `<?marker name="template-name">` processing instruction, holds that spot in the DOM. Once a matching `<template for="template-name">` arrives, the browser replaces the marker with the template’s contents, resulting in the following DOM structure:

```html
<section>
This is my HTML template :)
</section>
```

**A note on syntax:** you'll also see `<?start name="...">...fallback content...<?end>` used in the wild (and in my test case below) instead of a bare `<?marker>`. They're doing the same reconciliation job, a `<template for>` will patch either, but `<?start>`/`<?end>` wraps a *range* of fallback content that gets replaced, rather than marking a single insertion point. In practice this matters for skeleton/loading states: 
- `<?marker>` is for a spot with genuinely nothing to show yet.
- `<?start>`/`<?end>` is for a spot where you want a skeleton, spinner, or "Loading..." text visible right away, which then gets swapped out entirely when the template patches in.

## <a href="#html-insertion-and-streaming-methods" id="html-insertion-and-streaming-methods">HTML insertion and streaming methods</a>

These new methods provide a way to deliver that HTML incrementally. While JavaScript already offers ways to inject HTML such as `setHTML`, `setHTMLUnsafe`, `innerHTML`, `outerHTML`, `createContextualFragment`, and `insertAdjacentHTML`, they allrequire a lot of effort to implement a good experience that sanitizes HTML, overrides/appends content, etc.

To address these inconsistencies, Chrome has proposed expanding the setHTML and setHTMLUnsafe family with a full suite of insertion and streaming APIs:

| Action | Static | Streaming |
|---|---|---|
| Set the HTML contents of the element | `setHTML(html, options);` | `streamHTML(options);` |
| Replace the entire element with this HTML | `replaceWithHTML(html, options);` | `streamReplaceWithHTML(options);` |
| Add the HTML before the element | `beforeHTML(html, options);` | `streamBeforeHTML(options);` |
| Add the HTML as the first child of the element | `prependHTML(html, options);` | `streamPrependHTML(options);` |
| Add the HTML as the last child of the element | `appendHTML(html, options);` | `streamAppendHTML(options);` |
| Add the HTML after the element | `afterHTML(html, options);` | `streamAfterHTML(options);` |

There are also "unsafe" versions of each of the APIs, but prefer the standard methods (e.g., `setHTML()`) with a `Sanitizer` instance over the `...Unsafe` variants. The `...Unsafe` methods bypass browser sanitization, potentially exposing your application to XSS attacks. Only use `Unsafe` methods when you are certain the source HTML is trustworthy or has been sanitized independently.

When you insert `<template for>` using a non-streaming method like `setHTML()` or `innerHTML`, the browser parses that HTML into an intermediate document fragment first, and reconciliation only happens inside that fragment, it can't reach out and patch a marker that's already live in the DOM. Only the streaming path (`streamHTML()`, `streamHTMLUnsafe()`) skips the intermediate fragment and lets a late-arriving `<template for>` patch a marker that's already rendered on the page. This is exactly why my test case opens a writer via `streamHTML()` instead of calling `setHTML()` in a loop: with `setHTML()`, the shuffled, out-of-order arrival of each match's data simply wouldn't reach the markers already sitting in the DOM.

<section class="info-box note">
<strong>The rule of thumb:</strong> if you're inserting a marker and its matching template in the same call, either method works, you're building both in the same parse. But if the marker is already on the page and you're filling it in later, separately (which is the whole point of out-of-order streaming, markers render first, real content trickles in after), you need <code>streamHTML()</code>. The non-streaming methods simply can't reach a marker that already exists outside the fragment they just parsed.
</section>

## <a href="#frameworks-vs-platform" id="frameworks-vs-platform">Frameworks vs. Platform</a>

React's streaming SSR and other libraries have long relied on userland techniques for out-of-order delivery, using JavaScript to manipulate the DOM as content arrives. Declarative Partial Updates embraces a pattern the ecosystem has independently reinvented for over a decade, shifting that responsibility away from JavaScript and into the HTML parser itself.

## <a href="#a-test-case" id="a-test-case">A test case</a>

I created this small project to exercise Chrome's proposed DPU APIs. It fetches data from the Football API and renders the next 5 matches of Campeonato Brasileiro 2026, using the new methods (`setHTML`/`streamHTML`/etc.) plus a declarative out-of-order patching mechanism using `<?start>`/`<?end>` markers and `<template for>`.

This is the GitHub repository: <a href="https://github.com/amandavilela/test-dpu" target="_blank">https://github.com/amandavilela/test-dpu</a>

### Core functionality

Two pieces work together:

1. A marker pair sits wherever content will eventually land:

```html
<div><?start name="match-3">...fallback content...<?end></div>
```

2. A `<template for>` element, which can arrive anywhere else, at any time, targets that marker by name:

```html
<template for="match-3"><div class="ticket">...</div></template>
```

The browser's parser reconciles them regardless of arrival order, that's the "out-of-order" part.

This is the primary advantage of the renewed HTML insertion and streaming methods (`streamHTML()`, etc.): they pipe text through the actual HTML parser (not a plain fragment parse like `innerHTML`), so this marker/template reconciliation kicks in even for a targeted DOM update, not just a full-page navigation.

### Feature detection

Before using these experimental APIs, verify support:

```js
if ("setHTML" in Element.prototype) {
  // Safe to use native API
} else {
  // Fallback to existing methods or load polyfill
}
```

Note this only detects the static insertion methods. If your implementation depends on the streaming/out-of-order patching behavior specifically (as mine does), you'll also want to check for `streamHTML` separately, since a browser could ship one without the other during the rollout.

### Initial shell render

`shellMarkup(5)` builds 5 `<li>` skeletons, each with a marker pair wrapping fallback content (`"00/XXX/00:00"`, `"Fixture loading..."`), rendered immediately on page load and again on every button click.

### Simulating out-of-order arrival

It shuffles the match indices (`shuffle(...)`) so fixtures resolve in a genuinely different order each run, opens a writer via `ticketsEl.streamHTML({ sanitizer: cardSanitizer }).getWriter()`, writes the shell first, then writes each `<template for="match-N">` chunk with a randomized delay between writes.

From there, the browser itself is entirely responsible for finding each marker and splicing the template content in — this code never touches the DOM to insert fixture data.

<figure>
    <video width="720" height="362" controls loading="lazy">
        <source src="declarative_partial_updates_test.mp4" type="video/mp4">
        <source src="declarative_partial_updates_test.webm" type="video/webm">
        Your browser does not support the video tag.
    </video>
    <figcaption>Test execution from skeleton loading to content hydration</figcaption>
</figure>

## <a href="#what-worked-well" id="what-worked-well">What worked well</a>

- **Reduced JavaScript payload:** No framework runtime is required to reconcile out-of-order content, the parser does it natively.
- **Streaming-friendly, works with server-rendered content:** No client-side hydration step, the DOM you get is the DOM you wanted, with no diffing pass.
- **Native XSS sanitization:** The safe method variants sanitize by default, which removes a class of manual work (DOMPurify-style sanitization) that a hand-rolled streaming solution would otherwise need to own.

## <a href="#friction-points" id="friction-points">Friction points</a>

### Content-only replacement
`<template for>` swaps what's between the markers, never attributes on the wrapping element. So a loading-state attribute like `aria-busy` on the `<li>` can't be cleared by the patch itself, that requires an external bridge (a `MutationObserver`, the same trick we already use for `.skeleton`).

```html
function watchNativeResolution(container, total) {
    let resolvedCount = 0;
    const observer = new MutationObserver(() => {
      container.querySelectorAll('li.ticket.skeleton').forEach((li) => {
        if (li.querySelector('.pending')) return;

        markResolved(li);
        resolvedCount += 1;
        const index = li.id.split('-')[1];
        log(`match-${index} resolved → native declarative patch (out of order)`);
        if (resolvedCount === total) {
          log('stream complete — all fixtures resolved out of order');
        }
      });
    });
    observer.observe(container, { childList: true, subtree: true });
    return observer;
}
```

### Focus loss on replacement
Despite the name, "partial update" doesn't mean DOM diffing. The old subtree is destroyed and a new one inserted, so a focused element inside the swapped region loses focus, and there's no hook to restore it on the native path.

<figure>
    <video width="720" height="362" controls loading="lazy">
        <source src="focus_loss_declarative_partial_updates.mp4" type="video/mp4">
        <source src="focus_loss_declarative_partial_updates.webm" type="video/webm">
        Your browser does not support the video tag.
    </video>
    <figcaption>Focus loss after content replacement</figcaption>
</figure>

### No defined announcement semantics
If the newly inserted content represents an important user-facing update that should be announced, developers might need to supply an `aria-live` region proactively, same as for any other dynamic content.

### No JS hook at the moment of native resolution
The browser patches markers mid-parse with no callback, so there's no way to wrap that specific swap in a View Transition, or to programmatically compensate scroll/layout at that instant.

These insertion and accessibility issues can be handled with a `MutationObserver`, but depending on how complex the UI is, accessibility can be seriously hurt or become very hard to manage manually.

### Sanitizer API support gap
The safe `setHTML`/`streamHTML` path depends on the Sanitizer API, which isn't supported in Safari today. If you need the safe variants cross-browser, you're currently blocked outside Chromium, which is important to consider before using this for anything shipping soon.

## <a href="#browser-support-gaps" id="browser-support-gaps">Browser support gaps</a>

Currently, these features are experimental. Developers should feature-detect these APIs, and the Chrome team has released an <a href="https://github.com/GoogleChromeLabs/html-setters-polyfill" target="_blank">html-setters-polyfill</a> for broader compatibility until support is finalized, however, Sanitizer API is a gap for this functionality as it does not work in Safari.

## <a href="#final-thoughts" id="final-thoughts">Final thoughts</a>

Today, streaming server-rendered applications typically rely on JavaScript to find placeholders, reconcile incoming HTML, and move it into the correct position.

Declarative Partial Updates move that responsibility to the browser, but that doesn't automatically translate into better performance. Rendering performance still depends on the amount of DOM work being performed, layout costs, CSS, and the rest of the page, however, it does remove a layer of application code that previously existed only to glue streamed content together.

As these APIs mature, I see them fitting naturally into an "islands architecture," particularly for applications where most of the page remains server-rendered.

What initially caught my attention was how much JavaScript could be deleted by offloading this work to browser primitives. Ultimately, though, I view Declarative Partial Updates as a structural architectural improvement with potential performance benefits, rather than a guaranteed performance optimization.

Back in 2017, I argued that we might not need heavy JS frameworks to build robust web applications, I still believe that, the web has evolved a lot, and many complex behaviors can now be handled natively. Even so, Declarative Partial Updates won't be a replacement for frameworks, instead, it will potentially influence how frameworks manage partial content updates.

Special thanks to <a href="https://www.linkedin.com/in/taraojo/" target="_blank">Tara Ojo Agyemang</a> for her clarification and contributions to the demo project in this post.

## <a href="#reading-recommendations" id="reading-recommendations">Reading recommendations</a>

- <a href="https://developer.chrome.com/blog/declarative-partial-updates" target="_blank"> Declarative partial updates - developer.chrome.com</a>
