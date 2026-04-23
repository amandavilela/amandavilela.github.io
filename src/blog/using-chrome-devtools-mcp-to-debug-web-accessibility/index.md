---
layout: layouts/post.njk
title: "Using Chrome DevTools MCP to debug web accessibility"
description: "Learn how to set up the Chrome DevTools MCP Server with the Gemini CLI + Agent skills. Follow my walkthrough on using AI agent skills to debug web accessibility issues and automatically fix local code files."
date: 2026-04-23
open_graph:
  image: "blog/using-chrome-devtools-mcp-to-debug-web-accessibility/og-image-using-chrome-devtools-mcp-to-debug-web-accessibility.webp"
---

Chrome DevTools MCP Server enables a direct connection between your browser and AI coding assistants, providing real-time context of the active session and making debugging and fixes more accurate.

In this post, I’ll walk through how to set up the Chrome DevTools MCP Server with the Gemini CLI + Agent Skills, and share my adventures using the tool to debug the accessibility of a travel website, then analyze a poorly structured local file and ask the tool to fix it. 🤠

<nav aria-labelledby="toc-title" class="table-of-contents">
    <h2 id="toc-title">Table of Contents</h2>
    <ul>
        <li>
            <a href="#install-chrome-devtools-mcp">Installing Chrome DevTools MCP</a>
        </li>
        <li>
            <a href="#installing-agent-skills">Installing Agent Skills</a>
        </li>
        <li>
            <a href="#debugging-accessibility">Debugging accessibility</a>
            <ul>
                <li>
                    <a href="#lighthouse-accessibility-audits">Lighthouse accessibility audits</a>
                </li>
                <li>
                    <a href="#asking-for-fixes">Asking for fixes</a>
                </li>
                <li>
                    <a href="#dealing-with-non-semantic-markup">Dealing with non-semantic markup</a>
                </li>
                <li>
                    <a href="#keyboard-testing">Keyboard testing</a>
                </li>
            </ul>
        </li>
        <li>
            <a href="#running-chrome-devtools-mcp-locally">Running Chrome DevTools MCP locally</a>
        </li>
        <li>
            <a href="#final-thoughts">Final thoughts</a>
        </li>
        <li>
            <a href="#reading-recomendations">Reading recomendations</a>
        </li>
    </ul>
</nav>

First things first, what is MCP (Model Context Protocol)?

>MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems. Using MCP, AI applications like Claude or ChatGPT can connect to data sources (e.g. local files, databases), tools (e.g. search engines, calculators) and workflows (e.g. specialized prompts)—enabling them to access key information and perform tasks.
— <a href="https://modelcontextprotocol.io/docs/getting-started/intro" target="_blank">Model Context Protocol docs</a>

Think of it like giving AI a pair of eyes and hands inside your browser.

Now, with enough context, we can start testing the Chrome DevTools MCP Server capabilities.

<section class="info">
    <p>This audit uses <a href="https://www.momondo.com" target="_blank">www.momondo.com</a> as a case study to explore the capabilities of the Chrome DevTools MCP Server for accessibility debugging. I picked Momondo both for its effective flight-search deals that I use regularly and for providing a perfect example of a complex, real-world UI.</p>
    <p>The intention is not to evaluate the company or its teams, but to understand how the tool performs in practice. I’m always open to discussing the findings further.</p>
</section>

## <a href="#install-chrome-devtools-mcp" id="install-chrome-devtools-mcp">Installing Chrome DevTools MCP</a>

To get started, you'll need an **AI tool** on your terminal. Chrome DevTools MCP works with a <a href="https://github.com/ChromeDevTools/chrome-devtools-mcp?tab=readme-ov-file#mcp-client-configuration" target="_blank">large range of clients</a>, in this tutorial I'm using <a href="https://geminicli.com/" target="_blank">gemini-cli</a>.

1. Install gemini-cli

```
npm install -g @google/gemini-cli
```

2. Install the Chrome DevTools MCP server and add it to Gemini's list of MCP servers.

```
gemini mcp add -s user chrome-devtools npx chrome-devtools-mcp@latest
```

### <a href="#testing-chrome-devtools-mcp-installation" id="testing-chrome-devtools-mcp-installation">Testing Chrome DevTools MCP installation</a>

To check if everything is working, run `gemini` and **interact with the MCP**

```
Open https://www.momondo.com
```

Gemini detects that it needs to run `"new_page"` from server ChromeDevTools MCP and ask will ask for permissions to run that.
Choosing **Allow all server tools for this session** will save you from constant prompts during your session.

<picture>
    <source srcset="mcp_new_page-960w.webp" media="(min-width: 640px)" height="365">
    <source srcset="mcp_new_page-640w.webp" media="(min-width: 320px)" height="237">
    <img src="mcp_new_page-320w.webp" width="300" height="151" loading="lazy" alt='Execution of the Chrome DevTools MCP "new_page" tool for https://www.momondo.com, with options including "Allow once", "Allow tool for this session", and "Allow all server tools for this session", the last option highlighted.'>
</picture>

On the first run, you'll be asked to **login on your Google Account**.

You can then watch Gemini open a Chrome window and start following your commands:

<figure>
    <video width="720" height="362" controls loading="lazy">
        <source src="mcp_test.mp4" type="video/mp4">
        <source src="mcp_test.webm" type="video/webm">
        Your browser does not support the video tag.
    </video>
    <figcaption>Gemini opens Chrome and uses DevTools MCP to open a new page automatically.</figcaption>
</figure>

Once the page is open, the MCP should respond with something like: `The momondo homepage is now open. Would you like to search for a flight or do anything else?`

Now that we’re set up, let’s add some "Agent Skills."

## <a href="#installing-agent-skills" id="installing-agent-skills">Installing Agent Skills</a>

Agent Skills are packages containing instructions, and optional scripts that extend AI agent capabilities with specialized knowledge and workflows.

We know AI coding agents are powerful but they usually optimize for "done" over "correct", Agent Skills can be very helpful to avoid shortcuts, specially when analyzing code.

In this post we are going to use <a href="https://github.com/addyosmani/agent-skills" target="_blank">Addy Osmani Agent Skills</a>, this package include 20 Skills that consolidate workflows, quality gates, and best practices that senior engineers use when building software, including accessibility skills, that will be relevant for this test.

In order to add those skills, you can simply run on your terminal:

```
gemini skills install https://github.com/addyosmani/agent-skills.git --path skills
```

To check if the skills were properly installed you can open gemini and run:

```
/skills list
```

**a11y-debugging** should be the first item of the list this command returns.

## <a href="#debugging-accessibility" id="debugging-accessibility">Debugging accessibility</a>

Now that have all the setup correct, let's take a deeper look on the **accessibility features**.

### <a href="#lighthouse-accessibility-audits" id="lighthouse-accessibility-audits">Lighthouse accessibility audits</a>

I started by asking the MCP to perform a flight search and run an initial check.

```
Can you make a search of flights to tokyo and run an accessibility check of the results page?
```

And it generates an report based on Lighthouse audit:

<picture>
    <source srcset="mcp_fix_issues_prompt-960w.webp" media="(min-width: 640px)" height="346">
    <source srcset="mcp_fix_issues_prompt-640w.webp" media="(min-width: 320px)" height="237">
    <img src="mcp_fix_issues_prompt-320w.webp" width="300" height="151" loading="lazy" alt="Accessibility audit report generated by Gemini showing a list of detected issues.">
    <figcaption>Gemini generated accessibility audit report highlighting issues.</figcaption>
</picture>

<details>
    <summary>Click here to see the full Lighthouse audit</summary>
    <pre>
        <code>✦ The accessibility check for the Momondo flight results page (Tokyo) is complete. The page received an Accessibility score of 83/100.
        
        Key Accessibility Issues Identified:
        
        1. Critical ARIA Misuse:
            * Invalid Attributes: The "Cheapest," "Best," and "Quickest" sort buttons incorrectly use the aria-selected attribute, which is not permitted for the button role.
            * Invalid Child Elements: The flight origin and destination "listbox" elements contain button roles as direct children, which violates ARIA standards (they should only contain option roles).

        2. Serious Contrast Issues:
            * Multiple elements, including price labels ("$1,456") and category headers ("Cheapest"), have a contrast ratio of ~2.63:1, falling well below the WCAG AA requirement of 4.5:1. This makes the text difficult to read for users with low vision.

        3. Labeling & Naming:
            * Accessible Names: Several interactive elements, such as informational tooltips, lack accessible names, making them "unnamed" to screen readers.
            * Name Mismatches: Visible text labels for locations (e.g., "Sao Paulo") do not perfectly align with their programmatic accessible names, which can cause issues for voice control users.

        4. Role Inconsistencies:
            * Radio roles are applied to label elements, and group roles are applied to link elements, which is non-standard and can confuse assistive technologies.

        Would you like a more detailed breakdown of any specific section, or should I help with something else?</code>
    </pre>
</details>

### <a href="#asking-for-fixes" id="asking-for-fixes">Asking for fixes</a>

The report was concise, and the initial recommendations seemed reasonable at a glance. I followed up by asking for specific code fixes.

```
How to fix those issues found? Can you point the exact items to fix?
```

It returned a list with 6 detailed recommendations:

<pre>
    <code>&#10022; To fix the accessibility issues found on the Momondo flight results page, you need to address specific ARIA role violations and color contrast failures. Here are the exact items to fix, along with the recommended code changes:
    
    1. Fix ARIA Attribute Misuse (Critical)
    The sort buttons (&quot;Cheapest&quot;, &quot;Best&quot;, &quot;Quickest&quot;) use attributes that aren&#39;t allowed for their current roles.
    
    * Item: Sort Buttons (div.Hv20-option)
    * Current Issue: Uses role=&quot;button&quot; with aria-selected.
    * The Fix: Use aria-pressed instead of aria-selected for buttons that toggle state.
        * Bad: &lt;div role=&quot;button&quot; aria-selected=&quot;true&quot;&gt;Best&lt;/div&gt;
        * Fixed: &lt;div role=&quot;button&quot; aria-pressed=&quot;true&quot;&gt;Best&lt;/div&gt;
    
    2. Fix Invalid Component Structure (Critical)
    The location search fields violate the rule that a listbox can only contain option elements.
    
    * Item: Origin/Destination Inputs (div.vvTc)
    * Current Issue: The role=&quot;listbox&quot; container has a role=&quot;button&quot; (the &quot;Add&quot; button) as a direct child.
    * The Fix: Move the &quot;Add&quot; button outside the listbox or change the parent role to group.
        * Fixed: Change role=&quot;listbox&quot; to role=&quot;group&quot; or ensure only role=&quot;option&quot; elements are direct children.
    
    3. Fix Color Contrast (Serious)
    Several key pieces of information are hard to read for users with low vision because the text is too light.
    
    * Items:
        1. &quot;Wait&quot; label (div.IzNq-label-wait): Increase contrast of #e02472 on #21033a.
        2. Sort labels &amp; prices (span in div.Hv20-title and div.Hv20-value): The color #a79bb0 on white is too light (2.63:1 ratio).
        3. Result descriptions (div.NAnQ-description): Also uses #a79bb0.
    * The Fix: Change the text color from #a79bb0 to a darker shade like #595959 or darker to reach the 4.5:1 contrast ratio.
    
    4. Fix Missing Accessible Names (Serious)
    Screen readers can&#39;t identify what some buttons do because they have no text or labels.
    
    * Item: Information Tooltips (div.ftDe-trigger-wrapper and div.qQvr-wrapper)
    * Current Issue: No visible text and no aria-label.
    * The Fix: Add an aria-label describing the button&#39;s purpose.
        * Fixed: &lt;div role=&quot;button&quot; aria-label=&quot;Flight details and amenities info&quot; ...&gt;&lt;/div&gt;
    
    5. Fix Invalid ARIA Roles
    Some elements are assigned roles that aren&#39;t valid for their HTML tag.
    
    * Item: Filter Radios (label.c2jKu-label)
        * Issue: role=&quot;radio&quot; is assigned to a &lt;label&gt; element.
        * Fix: Put the role on the &lt;input type=&quot;radio&quot;&gt; itself and use the label normally (associated via for and id).
    * Item: Price Links (a.eNVa-link)
        * Issue: role=&quot;group&quot; is assigned to an &lt;a&gt; (anchor) tag.
        * Fix: Remove role=&quot;group&quot;. Anchors should naturally act as link roles.
    
    6. Fix Name Mismatches
    * Item: Location Buttons (div.vvTc-item)
    * Issue: The visible text &quot;Sao Paulo&quot; is inside an aria-label=&quot;Flight origin input Sao Paulo&quot;. This can fail for voice users who say &quot;Click Sao Paulo.&quot;
    * The Fix: Ensure the visible text matches or is at the start of the accessible name.
        * Fixed: Use aria-label=&quot;Sao Paulo, Flight origin input&quot; so the primary identifier is first.
    
    By addressing these specific elements, you will significantly improve the accessibility score and ensure the page is usable for people relying on screen readers, high contrast, or voice commands.</code>
</pre>

Recommendations 3, 4, and 6 were spot on, but things got questionable with items 1, 2, and 5.
Let's see more details on the next section.

### <a href="#dealing-with-non-semantic-markup" id="dealing-with-non-semantic-markup">Dealing with non-semantic markup</a>

I would like to start this with the <a href="https://www.w3.org/TR/using-aria/#rule1" target="_blank">first rule of ARIA use</a>:

>If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so.

Notice that the implementation suggestions rely a lot on adding or updating ARIA attributes, which is not wrong, but if we take a deeper look on the page markup, we notice that the HTML structure could be improved and that could result on a better accessibility.

#### <a href="#recommendation-1" id="recommendation-1">Recommendation 1</a>

For recommendation 1 (swapping `aria-selected` for `aria-pressed`), we have a `<div>` playing the role of a `<button>`.

<picture>
    <source srcset="div_as_button-960w.webp" media="(min-width: 640px)" height="346">
    <source srcset="div_as_button-640w.webp" media="(min-width: 320px)" height="237">
    <img src="div_as_button-320w.webp" width="300" height="151" loading="lazy" alt='Flight results page with "Cheapest", "Best", and "Quickest" options, alongside Chrome DevTools showing a highlighted element where a div with role="button" and aria-selected="true" is used instead of a native button.'>
</picture>

Instead of changing the ARIA attributes, it would be much simpler and more maintainable to just use a real `<button>` element. This gives you all the built-in accessibility for free.

#### <a href="#recommendation-2" id="recommendation-2">Recommendation 2</a>

Recommendation 2 suggested moving the "Add" button out of the listbox or changing the parent role to "group." Let's break it into 2 parts:

1. Moving the button outside the listbox makes sense as `listbox` only accepts `option` or `group` as child roles. **The first part of the recommendation is ok**.

2. It also recommends to use the <a href="https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA17" target="_blank">group pattern</a> instead of <a href="https://www.w3.org/WAI/ARIA/apg/patterns/listbox/" target="_blank">listbox</a> for this component, however, `listbox` is far more appropriate here than a generic group. **The second part is not so accurate**.

There is also a `<div>` acting as the container for the `listbox` trigger, implemented as a `<div>` with `role="button"` that opens the listbox on click. This wasn’t mentioned in the audit, even though it has an invalid markup.

A possible solution would be to use a native `<button>` element for the trigger and avoid coupling it with the listbox structure. Not calling this out makes the assessment feel incomplete.

<picture>
    <source srcset="div_button_listbox-960w.webp" media="(min-width: 640px)" height="346">
    <source srcset="div_button_listbox-640w.webp" media="(min-width: 320px)" height="237">
    <img src="div_button_listbox-320w.webp" width="300" height="151" loading="lazy" alt='Flight search form with origin and destination fields, alongside Chrome DevTools highlighting a div with role="button" containing another role="button", and an element with role="listbox".'>
</picture>

#### <a href="#recommendation-5" id="recommendation-5">Recommendation 5</a>

On recommendation 5 we also have **2 fixes**, let's start with the **first**: "Put the role on the `<input type="radio">` itself and use the label normally (associated via for and id)".

This component is acts as a tab that switches the available options depending on the selection of "take-off" or "landing", <a href="https://www.w3.org/WAI/ARIA/apg/patterns/tabs/" target="_blank">tabs pattern</a> would work here, but I don't think it's an anti pattern using radio buttons implementation as it was made.

It uses a custom radio button element, the suggested fix makes sense, but we don't need to add `role="radio"` to the `<input type="radio">`, just removing the `role="radio"` from label is enough. **Not a very accurate recommendation, again**.

<picture>
    <source srcset="radio-buttons-960w.webp" media="(min-width: 640px)" height="346">
    <source srcset="radio-buttons-640w.webp" media="(min-width: 320px)" height="237">
    <img src="radio-buttons-320w.webp" width="300" height="151" loading="lazy" alt='Flight filters panel with take-off and landing time options, alongside Chrome DevTools highlighting a radio input and label using role="radio", showing redundant ARIA on native form controls.'>
</picture>

The **second recommendation** is about removing `role="group"` from a link, **which makes total sense**.

<picture>
    <source srcset="links_group-960w.webp" media="(min-width: 640px)" height="346">
    <source srcset="links_group-640w.webp" media="(min-width: 320px)" height="237">
    <img src="links_group-320w.webp" width="300" height="151" loading="lazy" alt='Flight results page with a sponsored Expedia deal, alongside Chrome DevTools highlighting a link element with role="group" and aria-label="Price details", indicating misuse of ARIA roles on a clickable link.'>
</picture>

Seeing these suggestions, I pushed back and asked if patching ARIA was really the best approach.

```
given that html semantics are important to ensure accessibility. Does this page have a valid markup? Are the provided approaches the best solutions to fix those issues? Are there issues that can be fixed by improving the page semantics?
```

This prompted a much more insightful response suggesting fixing the markup over updating/adding attributes ARIA.

<details>
    <summary>Click here to see the full response</summary>
    <pre>
        <code>&#10022; The current markup on the Momondo flight results page relies heavily on &lt;div&gt; soup with ARIA roles rather than native HTML elements. While ARIA can make a &lt;div&gt; act like a button, it is a &quot;polyfill&quot; for poor semantics and often leads to the exact bugs I found in the audit.
    
        Here is an evaluation of the page&#39;s structural integrity and how improving semantics would provide better, more resilient fixes than just patching ARIA attributes.
        
        1. Is the current markup &quot;Valid&quot;?
        Technically No. The audit highlights several spec violations:
        * Structural Mismatch: A role=&quot;listbox&quot; containing a role=&quot;button&quot; is a direct violation of the ARIA structural model. A listbox is a managed container that should only contain option roles.
        * Role Abuse: Placing role=&quot;radio&quot; on a &lt;label&gt; element is semantically incorrect. Labels are meant to describe inputs, not be the inputs.

        2. Are the previous fixes the &quot;Best&quot; solutions?
        The previous fixes were &quot;surgical patches&quot; (fixing the ARIA to match the div structure). However, the best solution is almost always to replace the div with the correct native HTML element. 

        Native elements have &quot;built-in&quot; accessibility that doesn&#39;t break when a developer forgets an attribute.
        
        3. Issues Fixed by Improving Semantics
        By shifting from &quot;ARIA-on-DIVs&quot; to &quot;Semantic HTML,&quot; you fix multiple issues simultaneously:
        
        A. The Sort Buttons (Cheapest/Best/Quickest)
        * Current: &lt;div role=&quot;button&quot; aria-selected=&quot;true&quot;&gt;
        * Better Semantic Fix: Use a &lt;button&gt; or a Radio Group.
        * Why: If these are mutualy exclusive options, they should be &lt;input type=&quot;radio&quot;&gt; elements styled to look like buttons. 
        * Result: You no longer need aria-selected or aria-pressed. Screen readers will automatically announce &quot;Checked&quot; or &quot;Unchecked,&quot; and keyboard navigation (arrow keys) is handled by the browser for free.
        
        B. The Filter Radios (Take-off/Landing)
        * Current: &lt;label role=&quot;radio&quot;&gt;
        * Better Semantic Fix: Use standard &lt;input type=&quot;radio&quot;&gt; with an associated &lt;label&gt;.
        * Why: A native radio button handles its own checked state, focus management, and grouping. 
        * Result: Fixes the &quot;ARIA role radio is not allowed for given element&quot; error and ensures the state is correctly communicated without manual aria-checked updates.
        
        C. The Location Inputs (Sao Paulo/Tokyo)
        * Current: div role=&quot;listbox&quot; containing div role=&quot;button&quot;
        * Better Semantic Fix: Use a &lt;datalist&gt; or a Combobox pattern.
        * Why: The &quot;Add&quot; button is currently trapped inside a container that tells screen readers &quot;everything in here is a list option.&quot; 
        * Result: Moving to a proper combobox structure separates the input, the list of suggestions, and the action buttons, resolving the structural violation.
        
        D. The &quot;Unnamed&quot; Tooltips
        * Current: &lt;div role=&quot;button&quot;&gt; with an icon.
        * Better Semantic Fix: Use a &lt;button&gt; with visually hidden text.
        * Why: Instead of an aria-label (which can sometimes be ignored or misread), putting a &lt;span&gt; with a &quot;visually-hidden&quot; CSS class inside a real &lt;button&gt; tag is the gold standard.
        * Result: Fixes the &quot;Buttons do not have an accessible name&quot; error and ensures the button is naturally focusable in the tab order.
        
        Summary: The &quot;Semantics First&quot; Rule
        The most important rule in web accessibility is: &quot;The best ARIA is no ARIA at all.&quot; 
        
        Conclusion: The current page is &quot;over-engineered&quot; with ARIA to compensate for a lack of semantic HTML. Replacing the interactive &lt;div&gt; elements with their native counterparts would resolve about 80% of the failed audits automatically.</code>
    </pre>
</details>

It got confused with the buttons and divs soup, but overall, the debugging was **better than browser Lighthouse**, which scored this page at 88 and only complained about icon buttons without labels.

<picture>
    <source srcset="lighthouse-audit-accessibility-960w.webp" media="(min-width: 640px)" height="346">
    <source srcset="lighthouse-audit-accessibility-640w.webp" media="(min-width: 320px)" height="237">
    <img src="lighthouse-audit-accessibility-320w.webp" width="300" height="151" loading="lazy" alt='A split-screen view of a web development audit. The left side displays a flight booking interface listing three travel options. The right side shows the Lighthouse accessibility audit panel with a score of 88/100. It displays an ARIA error stating that "button, link, and menu item elements do not have accessible names".'>
    <figcaption>That's why we can't rely on Lighthouse only for accessibility</figcaption>
</picture>


### <a href="#keyboard-testing" id="keyboard-testing">Keyboard testing</a>

I also asked the MCP to perform a manual keyboard test, which revealed critical issues that automated audits often miss such as non-functional controls, unreachable content and inefficient tab order.

```
Is it possible to run a proper keyboard test and identy issues?
```

<details>
    <summary>Click here to see the keyboard audit</summary>
    <pre>
        <code>&#10022; I&#39;ve identified that the &quot;Show more results&quot; button is reachable with &quot;Tab,&quot; which is a good sign for keyboard accessibility. I&#39;ll now summarize my findings from the keyboard test.

          Additional Keyboard Accessibility Issues Found:
        
           1. Non-Functional Controls (Critical):
               * Filter Switches (INPUT role=&quot;switch&quot;): These elements do not toggle when pressing &quot;Space&quot; or &quot;Enter.&quot; A keyboard user is effectively locked out of using these filters.

           2. Unreachable Content (Serious):
               * Flight Result Cards: The cards themselves have tabindex=&quot;-1&quot;. While the &quot;Select&quot; button inside is reachable, the card structure (which often contains click-to-expand details) is not natively focusable.

           3. Inefficient Tab Order:
               * The &quot;Location&quot; fields (Sao Paulo, Tokyo) require multiple tab presses to get past (Container -&gt; Option -&gt; Remove -&gt; Add). This makes navigating the header very tedious for power users.

           4. Inconsistent Focus Indicators:
               * While focus moves between elements, some div role=&quot;button&quot; elements lack a clearly visible focus ring in their default state, making it hard to know exactly where the focus is without a screen reader.

           5. Native Element Abuse:
               * The &quot;Show more results&quot; button is a &lt;div&gt; with role=&quot;button&quot; and tabindex=&quot;0&quot;. While it works, using a native &lt;button&gt; would be more robust as it handles &quot;Enter&quot; and &quot;Space&quot; activation automatically.
        
          Would you like me to focus on fixing one of these specific keyboard interactions?</code>
    </pre>
</details>

I noticed it didn't interact with many components on the page, so I asked it to test more components, such as the date picker and the airline filters, and it returned:

<details>
    <summary>Click here to see the components audit</summary>
    <pre>
        <code>&#10022; I&#39;ve conducted extensive accessibility testing on the flight results page, focusing on keyboard navigation and semantic markup. Here&#39;s a summary of my findings:

          1. Date Picker Accessibility (Critical)
           * Reachability Issues: The main &quot;Departure date&quot; and &quot;Return date&quot; buttons have tabindex=&quot;-1&quot;, which prevents them from being reached via standard keyboard navigation. While the dates themselves are reachable, the &quot;Date arrows&quot; (increment/decrement buttons) are also inaccessible.
           * Interaction Failure: Even when focusing the date div and pressing &quot;Enter,&quot; the calendar fails to open, effectively locking out keyboard users from modifying their travel dates.
        
          2. Airline Filters Accessibility (Serious)
           * Non-Standard Markup: The airline checkboxes and filter controls are implemented as &lt;div&gt; elements with role=&quot;button&quot; or tabindex=&quot;0&quot;, rather than native &lt;input type=&quot;checkbox&quot;&gt; elements.
           * Functional Barrier: The airline checkboxes fail to toggle when the &quot;Space&quot; or &quot;Enter&quot; keys are pressed, preventing keyboard users from filtering by airline.
        
          3. Price Alert Modal (UX Issue)
           * Trap &amp; Trigger: Pressing &quot;Enter&quot; on a results page can trigger the &quot;Price Alert&quot; modal unexpectedly. Once open, the modal&#39;s &quot;Close&quot; button is difficult to reach via the keyboard, and the &quot;Escape&quot; key doesn&#39;t reliably close it, creating a &quot;keyboard trap.&quot;
        
          4. Overall Markup Observations
           * &quot;DIV Soup&quot;: The page relies heavily on generic &lt;div&gt; elements with ARIA roles and manual tabindex management, which is more prone to bugs and inconsistent behavior than using native HTML elements.
           * Missing Semantic Cues: The lack of native form elements (buttons, checkboxes, radios) makes the page less intuitive for assistive technology and more difficult to navigate for keyboard-only users.
        
          Recommended Fixes (Prioritized):
           1. Replace &lt;div&gt; buttons/checkboxes with native &lt;button&gt; and &lt;input type=&quot;checkbox&quot;&gt; to restore standard keyboard functionality and ARIA compatibility.
           2. Ensure all interactive elements are in the natural tab order (removing tabindex=&quot;-1&quot; from primary controls).
           3. Implement proper &quot;Escape&quot; key handling for modals and ensure they are reachable and closable via the keyboard.
        
          Would you like me to focus on fixing a specific component, or is there another part of the page you&#39;d like me to audit?</code>
    </pre>
</details>
 
This part of the audit was insightful and highlighted the tool's real value as a debugging "sidekick."

## <a href="#running-chrome-devtools-mcp-locally" id="running-chrome-devtools-mcp-locally">Running Chrome DevTools MCP locally</a>

Finally, I decided to test its ability to fix code directly. I created a purposefully broken HTML file and asked it to fix the accessibility issues locally.

<a href="poorly_accessible_flight_search.html" download>Download the broken file</a>.

```
What change would you make to fix the accessibility of the flight_search.html file? You can edit the file locally
```

<picture>
    <source srcset="mcp_local_file_change-960w.webp" media="(min-width: 640px)" height="365">
    <source srcset="mcp_local_file_change-640w.webp" media="(min-width: 320px)" height="237">
    <img src="mcp_local_file_change-320w.webp" width="300" height="151" loading="lazy" alt='Terminal displaying an "Action Required" prompt to apply a code change in a file named flight_search.html. A menu lists options for accepting the changes, including "Allow once," "Allow for this session," "Modify with external editor," and "No, suggest changes'>
    <figcaption>Before Gemini edits files, you'll need to approve that.</figcaption>
</picture>

It updated the file with fixes. <a href="flight_search_fixed.html" download>Download the fixed file</a>.

The agent refactored the file, replacing generic `<div>` tags with semantic elements like `<header>`, `<main>`, and `<button>`. It also fixed contrast issues and added proper `aria-labels`. 

Although my file was very simple and had obvious accessibility improvements, I think the fixes suggested were reliable.

## <a href="#final-thoughts" id="final-thoughts">Final thoughts</a>

Chrome DevTools MCP Server + Gemini CLI + Agent Skills were useful for spotting odd or problematic accessibility cases on the page. It’s particularly good at identifying keyboard navigation failures that static analysis misses.

However, the quality of its fix suggestions is still inconsistent. In the case of the buttons, for example, it recommended adding ARIA attributes, which is not incorrect, but it wasn’t appropriate for that page, where the real issue was poor semantics. Despite having browser context, it wasn’t able to fully understand some custom components, such as the listbox and the tabs. This led to accessibility suggestions that weren’t entirely wrong, but could have been resolved with simpler markup.

This test aligns with recent research from <a href="https://embrace.io/guides/ai-observability-gap-report/" target="_blank">Embrace</a>, showing that while developers are comfortable using AI for **building**, they are still hesitant to fully trust its explanations for **why** things are broken.

One open question is whether plugin a more code-focused agent, such as <a href="https://claude.ai/" target="_blank">Claude</a> on Chrome DevTools MCP, would produce more robust results in this kind of analysis. This is something worth exploring further to understand how different AI tools perform in accessibility and debugging workflows.

Is it ready to replace a manual audit? Not quite. Is it a good tool for spotting issues and facilitate keyboard testing? Absolutely! The tool is more effective as an exploratory and debugging aid than as a reliable source of solutions. It can guide your attention, but it still requires a critical eye to interpret and validate its recommendations, even so, I see a lot of potential and I'm curious to see how this evolves.

I intend to continue using these tools in future case studies and accessibility audits. I recommend you do the same, as the Chrome DevTools MCP receives frequent updates and AI agents continue to advance.

## <a href="#reading-recomendations" id="reading-recomendations">Reading recomendations</a>

- <a href="https://www.a11y-collective.com/blog/aria-in-html/" target="_blank">Implementing ARIA: Avoid Common Pitfalls and Optimise Performance - a11y collective</a>
