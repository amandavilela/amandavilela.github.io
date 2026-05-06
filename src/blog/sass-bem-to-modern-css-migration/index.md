---
layout: layouts/post.njk
title: "From Sass and BEM to modern CSS: A migration journey in 4 acts"
description: "A deep dive into refactoring this blog. Learn how native CSS features can replace legacy pre-processors and naming conventions to create a faster, leaner codebase."
date: 2026-05-12
open_graph:
  image: "blog/og-image-sass-bem-to-modern-css-migration/sass-bem-to-modern-css-migration.webp"
---

In March of this year, I started redesigning my website and building this blog.
Between choosing design patterns and static-site tools, I took one thing for granted: my styling workflow. I just stuck with the ecosystem I knew best: **Sass, BEM, and standard CSS**, without giving it a second thought.

With the recent <a href="https://web.dev/baseline" target="_blank">Baseline releases</a>, I decided to take a look at the CSS of my site and begin this modernization journey, which I will split into 4 acts 🤠

<nav aria-labelledby="toc-title" class="table-of-contents">
    <h2 id="toc-title">Table of Contents</h2>
    <ul>
        <li>
            <a href="#act-1-modern-css-properties">Act 1 - Modernizing CSS: Meet new properties</a>
            <ul>
                <li><a href="#css-variables">CSS variables</a></li>
                <li><a href="#logical-properties">Logical properties</a></li>
                <li><a href="#css-nesting">CSS nesting</a></li>
                <li><a href="#modern-selectors">Modern selectors</a></li>
                <li><a href="#modern-media-query-syntax">Modern media query syntax</a></li>
                <li><a href="#native-color-handling">Native color handling</a></li>
                <li><a href="#clamp-fluid-typography">Clamp, fluid typography without media queries</a></li>
            </ul>
        </li>
        <li>
            <a href="#act-2-scope-rule">Act 2 - @scope: The rule that changed everything</a>
            <ul>
                <li><a href="#scope-over-nesting">What's the real gain over regular nesting?</a></li>
                <li><a href="#scope-proximity">Solving specificity with scope proximity</a></li>
            </ul>
        </li>
        <li>
            <a href="#act-3-abandoning-bem">Act 3 - The controversial decision: Abandoning BEM</a>
            <ul>
                <li><a href="#replace-bem-for-scope">Should everybody replace BEM for @scope?</a></li>
                <li><a href="#use-scope-correctly">How to use @scope correctly?</a></li>
            </ul>
        </li>
        <li>
            <a href="#act-4-need-sass">Act 4 - Do I really need Sass after all?</a>
        </li>
        <li>
            <a href="#was-it-worth-it">Was it all worth it?</a>
        </li>
    </ul>
</nav>

## <a href="#act-1-modern-css-properties" id="act-1-modern-css-properties">Act 1: Modern CSS Properties</a>

As we know, CSS has evolved rapidly over the last couple of years. Here are the specific properties I decided to implement to modernize this site’s styles (shout-out to <a href="https://moderncss.dev/" target="_blank">ModernCSS.dev</a> for the inspiration).

### <a href="#css-variables" id="css-variables">CSS variables</a>

CSS variables have been around since 2017, I had previously relied on Sass variables. Switching to native CSS variables was my first step. The primary advantage is that they are handled at runtime by the browser, unlike Sass variables, I can manipulate them directly in the DevTools to test changes instantly.

CSS variables are defined via the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/--*" target="_blank">custom property syntax</a> (often within the :root selector) and accessed using the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/var" target="_blank">var() function</a>. For even more control, like defining types or default values, you can also use the <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property" target="_blank">@property at-rule</a>.

<pre data-copy-code>
<code>:root {
    --color-bg: #FAFAFA;
    --color-text: #5f5f5f;
}

body {
    background-color: var(--color-bg);
    color: var(--color-text);
}</code></pre>

**Support**: Major support since April 2017, <a href="https://caniuse.com/css-variables" target="_blank">check css variables support</a>.

### <a href="#logical-properties" id="logical-properties">Logical properties</a>

According to MDN, logical properties map layout to the flow of content (start/end) rather than physical directions (top/bottom/left/right). This makes your styles more resilient to different writing modes.

Beyond future-proofing for internationalization, what I liked the most is how the code gets less verbose. Instead of explicitly defining four separate margins or paddings to target specific axes, we can use concise block and inline values:

<pre data-copy-code>
<code>/* Instead of this: */
margin-top: 20px;
margin-bottom: 15px;
padding-left: 30px;
padding-right: 40px;

/* We can simply use: */
margin-block: 20px 15px;
padding-inline: 30px 40px;
</code></pre>

It’s important to note that the property values can change depending on the values defined for writing-mode, direction, and text-orientation. <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values" target="_blank">Check docs of logical properties for more details</a>.

**Support**: Major support since September 2021, <a href="https://caniuse.com/css-logical-props" target="_blank">check logical properties support</a>.

### <a href="#css-nesting" id="css-nesting">CSS nesting</a>

Native nesting allows you to nest child rules inside parent rules, making the relationship explicit and your code more organized.

In practice, it works very similarly to the Sass nesting, but is parsed by the browser rather than being pre-compiled.

<pre data-copy-code>
<code>/* Old CSS: */
.link {
    color: var(--color-green);
}
.link:hover {
    color: var(--color-green-dark);
}

/* Modern CSS: */
.link {
    color: var(--color-green);

    &:hover {
        color: var(--color-green-dark);
    }
}
</code></pre>

Notice that **it does not support class name interpolation on the nest as Sass does**, which might be inconvenient, specially if you are using BEM, which we’ll dive into later.

**Sass:**
<pre data-copy-code>
<code>.hero {
    padding-block: 5rem 1rem;

    &__inner {
        display: flex;
    }
}
</code></pre>

**CSS:**
<pre data-copy-code>
<code>.hero {
    padding-block: 5rem 1rem;

    .hero__inner {
        display: flex;
    }
}
</code></pre>

**Important:**

- **Pseudo-Elements**: You cannot nest a pseudo-element inside another (e.g., `::after { ::before { ... } }` is invalid). The only exceptions are specialized cases like `::before::marker`.
- **Order Matters**: Pseudo-elements must always be at the end of a selector. You can nest a pseudo-element inside a pseudo-class (like `:hover::before`), but you cannot put a pseudo-class after a pseudo-element.

**Support**: Major support since December 2023, <a href="https://caniuse.com/css-nesting" target="_blank">check logical properties support</a>.

### <a href="#modern-selectors" id="modern-selectors">Modern selectors</a>

### <a href="#is" id="is">is()</a>

The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-classes" target="_blank">:is() pseudo-class</a> takes a selector list and matches any element in that list. It’s great for reducing code bloat and making styles easier to read.

<pre data-copy-code>
<code>/* Instead of repeating selectors: */
h1, h2, h3, h4, h5, h6 {
    color: var(--color-green);
}

/* Use :is() for a cleaner approach: */
:is(h1, h2, h3, h4, h5, h6) {
    color: var(--color-green);
}
</code></pre>

### <a href="#has" id="has">has()</a>

`:has()` allows you to style an element based on its children or preceding siblings.

I used this for the hover effect in the header (dimming other links), which was previously only possible with JavaScript or fragile CSS hacks. Now it's handled natively by the browser's engine, which is faster and more reliable.

<pre data-copy-code>
<code>.nav {
    /* Dim other links when one is hovered */
    &:has(.link:hover) .link:not(:hover) {
        opacity: .9;
    }
}
</code></pre>

**Performance note**: Certain uses of `:has()` can significantly impact page performance during heavy DOM mutations. <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:has#performance_considerations" target="_blank">Read has() MDN performance considerations for more detail</a>.

**Support:**
- is(): Major support since January 2021, <a href="https://caniuse.com/css-matches-pseudo" target="_blank">check is() support</a>.
- has(): Major support since December 2023, <a href="https://caniuse.com/?search=has%28%29" target="_blank">check has() support</a>.

### <a href="#modern-media-query-syntax" id="modern-media-query-syntax">Modern media query syntax</a>

This new syntax simplifies the writing and is significantly more intuitive to read than (min-width: 1024px).

<pre data-copy-code>
<code>/* Instead of @media (min-width: 1024px) */
@media (width >= 1024px) {
    align-items: flex-start;
    display: flex;
}
</code></pre>

It also makes "between" queries much cleaner. For example, instead of combining min-width and max-width with an and, you can now write: `@media (768px <= width <= 1024px)`.

**Support**: Major support since March 2023, <a href="https://caniuse.com/css-media-range-syntax" target="_blank">check modern media query syntax support</a>.

### <a href="#native-color-handling" id="native-color-handling">Native color handling</a>

The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix" target="_blank">color-mix()</a> CSS function allows you to blend two colors in a specified color space directly in your stylesheet. 

I used that to replace Sass functions `lighten()` and `darken()` to pre-calculate every bubble shade on the 404 page, now the browser can calculate these on the fly.

**Sass**:
<pre data-copy-code>
<code>.b6 {
    background: darken($color-salmon, 12%);
}

.b7 {
    background: lighten($color-green, 45%);
}
</code></pre>

**CSS**:
<pre data-copy-code>
<code>.b6 {
    background: color-mix(in srgb, var(--color-salmon), black 12%);
}

.b7 {
    background: color-mix(in srgb, var(--color-green), white 45%);
}
</code></pre>

**Support**: Major support since May 2023, <a href="https://caniuse.com/wf-color-mix" target="_blank">check color-mix() support</a>.

### <a href="#clamp-fluid-typography" id="clamp-fluid-typography">Clamp, fluid typography without media queries</a>

The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp" target="_blank">clamp() function</a> defines a value that scales fluidly within a fixed range. It sets a minimum and maximum boundary for a property (like font size or width), with an ideal "preferred" value in between.

<pre data-copy-code>
<code>/* Syntax: clamp(min, val, max) */

font-size: clamp(1.85rem, 4vw + 0.75rem, 2.75rem);
</code></pre>

`clamp(min, preferred, max)` keeps a value fluid within a fixed range. The browser uses the preferred value (usually dynamic units like vw) as long as it stays between the minimum and maximum bounds.

Here is the breakdown of what those units do together:

* **Min**: 1.85rem ensure the text is never illegible on small screens.
* **Val**: By mixing a fixed unit (.75rem) and a fluid unit (4vw), you create a gentle slope. The text still grows, but it grows at a controlled rate.
    * **4vw** means 4% of the current screen width.
This is what makes the text "fluid." As the browser window gets wider, 4vw gets larger, and the text grows.
    * **.75rem** (The Static Anchor)<br>By adding .75rem to the calculation, you are giving the font an anchor. 
Without this, if the screen was extremely narrow, 4vw could become too small to read or even grow very aggressively on larger monitors.
3. **Max**: 2.75rem ensure the text won’t get comically large on ultra-wide monitors.

**Concrete Example**: `clamp(1.85rem, 4vw + 0.75rem, 2.75rem)`

- **On a small phone (375px width)**: 4vw (15px) + .75rem (12px) = 27px, since 1.85rem (29.6px) is the minimum, **it stays around 30px**.

- **On a laptop (1440px width)**: 4vw (57.6px) + .75rem (12px) = 69.6px, since 2.75rem (44px) is the maximum, the browser "clamps" it and **prvents it from getting bigger than 44px**.

The use of clamp() can reduce the amount of CSS/@media queries by allowing elements like typography, padding, or gaps to resize themselves automatically for every single device width.

**Support**: Major support since July 2020, <a href="https://caniuse.com/css-math-functions" target="_blank">check clamp() support</a>.

## <a href="#act-2-scope-rule" id="act-2-scope-rule">Act 2: @scope — The rule that changed everything</a>

One feature that caught my attention was @scope, <a href="https://caniuse.com/css-cascade-scope" target="_blank">available across major browsers since December 2025</a>, it allows you to limit a selector's reach to a specific DOM subtree, creating isolated styles.

I found this especially useful for styling my blog's body content. Previously, I had to style specific tags under a `.post__body` class, which felt awkward as I was following <a href="https://getbem.com/naming/" target="_blank">BEM conventions</a>.

**Before scope:**
<pre data-copy-code>
<code>.post__body {
    p {
        line-height: 1.7rem;
    }

    p + p {
        margin-top: 1rem;
    }

    h2 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
        margin-top: 2.5rem;
    }

    /*other tags here...*/
}
</code></pre>

**Using scope:**
<pre data-copy-code>
<code>@scope (.post__body) {
    p {
        line-height: 1.7rem;
    }

    p + p {
        margin-block-start: 1.25rem;
    }

    h2 {
        font-size: 1.5rem;
        margin-block-end: 1rem;
        margin-block-start: 2.5rem;
    }

    /*other tags here...*/
}
</code></pre>

### <a href="#scope-over-nesting" id="scope-over-nesting">What's the real gain over regular nesting?</a>

The answer is isolation, with regular nesting, styles "leak" into every descendant. For example, if I embed a newsletter signup component inside a post, the global p styles from `.post__body` might accidentally mess up the signup form's layout.

To solve this, we can use **Donut Scope**, a technique that styles a subtree while explicitly excluding nested areas, with this syntax `@scope (start) to (end) { ... }`, it’s possible to create a "hole" in the scope where styles don't apply. 

This is how the donut scope would apply in this case:

<pre data-copy-code>
<code>/* Style everything inside .post__body EXCEPT what's inside .newsletter-signup */

@scope (.post__body) to (.newsletter-signup) {
    p {
        line-height: 1.7rem;
    }

    /*other tags here...*/
}
</code></pre>

### <a href="#scope-proximity" id="scope-proximity">Solving specificity with scope proximity</a>

Another advantage of `@scope` is **proximity**. In traditional CSS, if two selectors have the same specificity, the one defined last in the file wins. `@scope` changes the game: the browser applies the style from the "closest" scope root.

<pre data-copy-code>
<code>@scope (.card) {
         p { color: blue; }
   }

   @scope (.section) {
         p { color: red; }
   }
</code></pre>

If a `.card` is nested inside a `.section`, the p will be **blue** because the `.card` root is "closer" to the element than the `.section` root, even if the CSS order is different.

Interesting how it can keep the styles encapsulated and reduce specificity, right? 

There are problems I’m currently solving with BEM naming conventions on this project. It made me wonder... do I actually still need BEM?

## <a href="#act-3-abandoning-bem" id="act-3-abandoning-bem">Act 3: The controversial decision: Abandoning BEM</a>

After experimenting with `@scope`, I began to question if BEM (Block, Element, Modifier) still made sense for this project.

Originally, I adopted BEM for two reasons:

1. To scope CSS to specific components.
2. To avoid styling conflicts.

Can `@scope` achieve this?

**Yes**, it allows us to target elements precisely without overly-specific selectors and avoid "style leakage" without increasing specificity. Furthermore, it eliminates the long, repetitive BEM class names that make the maintenance and even refactors difficult.

So in the case of my project that is a very small project handled by a single developer, it made sense removing BEM and solve the scope and styling conflicts with `@scope`.

### <a href="#replace-bem-for-scope" id="replace-bem-for-scope">Should everybody replace BEM for @scope?</a>

There are overlaps between `@scope` and `BEM`, but they don’t need to be replacements. 

- @scope handles **proximity-based scoping**, it limits styles to a DOM subtree.
- BEM handles **naming collisions** and **visual structure documentation**.

Here is a summary of solutions for both approaches:
| Problem                | BEM's answer               | @scope's answer       |
|------------------------|----------------------------|-----------------------|
| Name collision         | Unique verbose names       | n/a                   |
| Style leaking out      | Naming discipline          | Scope boundary        |
| Nested component bleed | Elements are never re-used | to () limit (donut)   |
| Specificity wars       | Always one class           | :scope proximity wins |

It is important to mention that **BEM and @scope can coexist**. It all depends on the specific problems you are trying to solve. A mixed approach can also be a solution: you can continue using BEM class names for structural clarity while using @scope to encapsulate those styles and manage proximity.

Before deleting your BEM classes, consider these factors:

- **Support**: It’s a newer feature and the support is still evolving, so you might need fallbacks depending on your audience and supported browsers;
- **Performance**: If you have to write "fallback" CSS for older browsers, you might end up with larger bundle sizes. However, for modern browsers, removing long BEM strings actually reduces the HTML/CSS payload.
- **Team adoption**: BEM is a global industry standard. Switching to a scoped model requires a shift in how your team thinks about styles.

### <a href="#use-scope-correctly" id="use-scope-correctly">How to use @scope correctly?</a>

If you decided to remove BEM or start using @scope, it is important to establish clear patterns to avoid creating new architectural debt. Since there isn't an 'official' methodology for @scope just yet, here are the rules I’m following to keep my styles organized:

1. **Avoid scoping styles to tags**: Scoping to a generic tag (like div) is risky. Use a class for your scope root to avoid endup with a lot of style leak to solve. 
2. **Naming is still important**: Use generic class names inside the scope block. This way you can have naming standards on the project, but the CSS remains "locally" valid within its own scope.
    - BEM: .hero__title, .hero__button, .hero__image
    - @scope: .title, .button, .image inside @scope (.hero).
3. **Don't rely on @scope to resolve specificity conflicts**: Don't use @scope as a crutch to win specificity wars. If you find yourself reaching for !important, your architecture likely needs a rethink. BEM-style "modifiers" (e.g., --large) are still a great way to handle state or variations.

<section class="info-box explore">
    <p>If you liked <code>@scope</code> for encapsulation, you should look into <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers" target="_blank">Cascade Layers</a>, while <code>@scope</code> limits where a selector applies, <code>@layer</code> controls which styles win regardless of specificity.</a>
</section>

## <a href="#act-4-need-sass" id="act-4-need-sass">Act 4: Do I really need Sass after all?</a>

After modernizing my styles and even removing BEM, I had the ultimate question: **Does Sass still earn its place in my stack?** I broke it down by the features I use most:

### <a href="#sass-variables" id="sass-variables">1. Variables</a>
It makes easier to change theme colors, standarlize spacing etc.<br>
Does native CSS support it? Yes ✅

### <a href="#sass-nesting" id="sass-nesting">2. Nesting</a>
Avoids repetitive writing to rules like .btn:hover, .btn:focus<br>
Does native CSS support it? Yes ✅

### <a href="#sass-interpolation" id="sass-interpolation">3. Interpolation</a>
Allows you to write style rules inside one another, mirroring your HTML structure. Perfect to avoid writing the long BEM names.

Does native CSS support it? No ⛔

- You cannot directly append text to a selector using & in native CSS as you can in Sass.<br>
- CSS currently lacks a direct alternative to .#{$variable} interpolation. 

**How to handle that?**<br>
No alternative at this moment, so I had to choose repeating class names on the styles, the good thing is that removing BEM, I was able to reduce class names.

### <a href="#sass-partials-modularity" id="sass-partials-modularity">4. Partials & modularity</a>

Small modules can be shared across the project.

Is it possible with CSS? Yes, **but with considerations** ✍️

CSS has `@import` feature available across browsers since July 2015 and it works pretty much like Sass imports do, so on the code writing no problems. I basically renamed all partial `.css` and fixed the imports on top of the files.

However, Sass imports allow multiple imports to be separated by commas rather than requiring each one to have its own `@import` and are **handled entirely during compilation**.

CSS `@import` equire the browser to **make multiple HTTP requests** as it renders your page and it can significantly **negative impact** web performance because it forces the browser to load the stylesheets sequentially rather than in parallel.

To solve this without Sass, I updated my build process. I swapped the Sass compiler for <a href="https://bun.com/" target="_blank">Bun</a>, which bundles and minifies my CSS imports into a single production-ready file.

**Build switch**:
<pre data-copy-code>
<code>// From Sass:
execSync(`"${sassBin}" src/scss:dist --style=compressed`);

// To Bun:
execSync(`bun build ./src/css/${name} --outdir ./dist --minify`);
</code></pre>

### <a href="#sass-mixins" id="sass-mixins">5. Mixins</a>

In this project I was using mixins for:
- Reusable media queries
- Reusable shared styles

Unfortunatelly <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Custom_functions_and_mixins" target="_blank">CSS mixins aren’t available yet</a>, as at this point I was already decided to remove Sass, I decided to:

- Replace media query mixins to new media query syntax `@media (width >= 768px)`;
- Create utility classes for the shared styles.

To keep the final bundle clean, I used **Lightning CSS** to group media queries and handle autoprefixing for older browsers.

**Sass is officially gone**. While I miss the convenience of mixins, the combination of **Modern CSS + Bun + Lightning CSS** gives me a faster and more "future-proof" workflow.

## <a href="#was-it-worth-it" id="was-it-worth-it">Was it all worth it?</a>

Here is the breakdown of this journey:

- **HTML simplification**: Removing BEM resulted in cleaner, more readable HTML with significantly shorter class names.
- **Debugging clarity**: The source code and the browser’s executed code are nearly 1:1, making debugging much more intuitive.
- **Build performance**: Switching to Lightning CSS (Rust-based) provided near-instant build speeds compared to the Sass compiler.
- **Smaller bundles**:
  - Before: 22.6 KB
  - After: 16.68 KB (~26% reduction)

This refactor was a perfect opportunity to experiment with modern CSS features and tool consolidation. While this was a personal project where I could afford to be "bleeding edge", every project has unique constraints. Decisions regarding browser support, team familiarity, and performance should always be made on a case-by-case basis.

Ultimately, while modern CSS allows us to shed heavy tools, it doesn't eliminate the need for architectural decisions. 

I hope these insights help you decide which tools to keep, and which to leave behind, in your next project 🙂

## <a href="#reading-recomendations" id="reading-recomendations">Reading recomendations</a>

- <a href="https://web.dev/articles/media-query-range-syntax" target="_blank"> New syntax for range media queries - web.dev</a>
- <a href="https://ishadeed.com/article/css-nesting/" target="_blank"> CSS Nesting -  Ahmad Shadeed</a>
- <a href="https://ishadeed.com/article/css-has-guide/" target="_blank"> CSS :has() Interactive Guide -  Ahmad Shadeed</a>
