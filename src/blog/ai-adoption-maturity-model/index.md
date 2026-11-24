---
layout: layouts/post.njk
title: "Building a Healthy AI Ecosystem on an Engineering Team"
description: "How to build a healthy AI ecosystem on an engineering team: a four-rung maturity model covering governance, guardrails, code review, and developer growth."
keywords: "ai adoption, agentic development, claude code"
date: 2026-11-24
featured: true
tags:
  - ai
open_graph:
  image: "blog/ai-adoption-maturity-model/og-image-ai-adoption-maturity-model.webp"
---

Are you an engineering leader who feels like you can't keep up with AI tools? Buying everyone a Claude or Cursor plan is just the start. A healthy AI ecosystem is built on review and guardrails, not on the tools you pick.

AI amplifies development speed, but engineering teams need more than code velocity: shared standards, structured ideation and architecture workflows, reliable reviews, and trustworthy outputs.

In most cases where teams feel they aren't getting the best out of AI, it's because people worry more about tools than about understanding where their AI usage sits, what the challenges are, and what it takes to reach the next level.

<nav aria-labelledby="toc-title" class="table-of-contents">
    <h2 id="toc-title">Table of Contents</h2>
    <ul>
        <li>
            <a href="#the-ladder">The ladder</a>
        </li>
        <li>
            <a href="#from-experimenting-to-adopting">Rung 1 to 2: From experimenting to adopting</a>
        </li>
        <li>
            <a href="#rung-2-give-your-tools-your-context">Rung 2: Give your tools your context</a>
        </li>
        <li>
            <a href="#rung-3-guarding">Rung 3: Guarding</a>
        </li>
        <li>
            <a href="#rung-4-growing">Rung 4: Growing</a>
        </li>
        <li>
            <a href="#knowing-where-you-stand">Knowing where you stand</a>
        </li>
        <li>
            <a href="#reaching-the-top-is-a-new-beginning">Reaching the top is a new beginning</a>
        </li>
    </ul>
</nav>

## <a href="#the-ladder" id="the-ladder">The ladder</a>

Teams don't level up by buying better software, but by maturing how they review code and mentor developers. Maturity models are an old idea, so here's one I aimed at AI on an engineering team:

1. **Experimenting**: Individuals independently paste content into AI tools without shared norms or visibility.
2. **Adopting**: The organization buys enterprise seats, but review processes and standards remain unchanged.
3. **Guarding**:  Automated checks catch the recurring failure modes AI generates.
4. **Growing**: Code reviews and professional growth are deliberate; AI accelerates developers who understand their output.

The rest of this post breaks down each rung: what it looks like, its defining failure mode, and how to reach the next rung.

## <a href="#from-experimenting-to-adopting" id="from-experimenting-to-adopting">Rung 1 to 2: From experimenting to adopting</a>

**What it looks like**: People are already using AI invisibly, pasting snippets into personal accounts without shared rules.

**The defining failure**: You cannot manage or secure what you cannot see. Without clear team-wide AI policies, proprietary business data will inevitably leak into personal AI accounts.

**How you climb**:

- **Governance first**: Ensure the entire team adheres to consistent standards, retaining organizational knowledge without compromising security.
- **Pick one tool per job**: Standardize on a single primary tool for each task: code generation, review, testing, documentation, or debugging. Using multiple overlapping tools creates decision friction; establish an integration strategy to avoid a disorganized whack-a-mole approach.
- **Close the data gap**: Work with security and compliance teams to ensure model training excludes proprietary business logic and sensitive data. Enterprise plans typically offer data opt-outs; maintain a clear matrix of repository access and data residency guarantees for every tool.

## <a href="#rung-2-give-your-tools-your-context" id="rung-2-give-your-tools-your-context">Rung 2: Give your tools your context</a>

**What it looks like**: Seats are provisioned, but the tools lack context regarding your specific codebase and team conventions.

**The defining failure**: Tooling has evolved, but daily workflows haven't changed. A gap the next rung addresses.

**How you climb**:

- **Documentation**: Strong documentation forms the backbone of AI integration. A clear knowledge base of your codebase and business rules enhances automated code generation, review, and testing. While documentation is often neglected under daily pressure, modern tools make maintenance easier, and enforcement can occur during code review. The primary challenge is keeping documentation concise, relevant, and accessible for new engineers.
- **Shared context as code**: Repository rules files (like CLAUDE.md, Cursor rules, or Copilot workspace configs) outlining design patterns, state management, folder structures, and naming conventions improve AI output quality far more than switching models. Version-control these files alongside your code so they evolve naturally with your project.
- **Custom agents**: Build custom agents integrated with issue trackers (like Jira or Linear) to process tickets and generate code that strictly complies with your team's standards.

Here is an example of a trimmed CLAUDE.md file that codifies conventions otherwise repeatedly explained during peer reviews:

<pre data-copy-code>
<code># CLAUDE.md

## Project
Content-heavy marketing site. Astro for pages; client-side JS only in islands, and only where interactivity is genuinely required. TypeScript throughout.

## Core principle: Less JS, more platform
Reach for a native HTML element or a CSS feature before a library or a framework component. Justify every new dependency in the PR description, with its bundle-size cost.

## Conventions
- Components: PascalCase, one per file, styles colocated (Card.astro + Card.css).
- Semantic HTML first: button, nav, dialog, details, never a div with an onClick.
- State: prefer the platform (URL params, form state, :has()) over client state; add a store only when state is shared across islands.
- Styling: design tokens from tokens.css. No inline styles, no magic numbers.

## Performance budgets (enforced in CI)
- Field targets (CrUX, not just Lighthouse): LCP &lt; 2.5s, CLS &lt; 0.1, INP &lt; 200ms.
- No render-blocking JS. Images use width/height to reserve space; below-the-fold is lazy-loaded.

## Accessibility (non-negotiable)
- Keyboard-operable and visibly focusable for every interactive element.
- Label every control; don't add ARIA where native semantics already do the job.
- Modals: native dialog element with showModal().

## Don't
- Introduce a state-management library for local state.
- Hand-roll what the platform provides (dialogs, disclosure, date inputs).</code>
</pre>

## <a href="#rung-3-guarding" id="rung-3-guarding">Rung 3: Guarding</a>

**What it looks like**: You have established automated guardrails to catch predictable AI errors.

**The defining failure**: Guardrails are defensive. They catch bad code but do not actively develop engineers, which brings us to rung 4.

Code review is frequently an engineering bottleneck, and AI can exacerbate it by generating massive pull requests that overwhelm human reviewers.

On my previous team, we spent significant effort resolving this bottleneck through two targeted strategies.
First, we introduced automated initial reviews via tools like CodeRabbit, refining configurations based on recurring edge cases. Over time, low-risk pull requests, such as minor refactors and library upgrades, no longer required manual approval. However, this approach relies entirely on a comprehensive, trustworthy automated test suite that catches regressions reliably.

While mechanical reviews were automated, feature additions still required human oversight. To resolve this, we enforced a strict small-PR policy, breaking feature work into reviewable increments so engineers could thoroughly evaluate diffs rather than rubber-stamping massive pull requests.

**How you climb**:

- **Smaller PRs**: Merge small, incremental pull requests into feature branches to maintain manageable review scopes.
- **Testing**: High testing standards remain essential as delivery speeds accelerate. Avoid reliance on superficial coverage metrics. While tools like Playwright and Keploy aid test generation, AI models default to happy paths. Engineers must explicitly define edge cases and non-standard workflows. Additionally, AI assistance lowers the barrier to adopting Test-Driven Development (TDD).
- **Automated safe approvals**: Configure workflows to evaluate change impact, automatically approving low-risk pull requests to relieve review bottlenecks.

### <a href="##automated-guardrails-targeting-common-failure-modes" id="#automated-guardrails-targeting-common-failure-modes">Automated guardrails targeting common failure modes (failure vs automated check)</a>

1. **Hallucinated dependencies**

AI models frequently generate non-existent package recommendations. A research study analyzing 576,000 code samples across 16 models found that roughly 20% of suggested packages were fictitious (<a href="http://arxiv.org/abs/2406.10279" target="_blank">"We Have a Package for You!", USENIX Security 2025</a>).

This predictable behavior heightens susceptibility to slopsquatting attacks. Enforce lockfile and dependency validation in CI.

2. **Accessibility violations**

AI assistants often resolve immediate accessibility errors suboptimally, such as cluttering non-semantic markup with excessive ARIA attributes rather than using clean semantic HTML elements. I wrote more about it on <a href="https://amandavilela.me/blog/using-chrome-devtools-mcp-to-debug-web-accessibility/">Using Chrome DevTools MCP to debug web accessibility</a> post.

Enforce semantics on accessibility code generation and review.

3. **Main-thread performance degradation**

As highlighted by <a href="https://developer.chrome.com/blog/top-10-things-ai-gets-wrong-in-web-dev" target="_blank">Chrome's engineering team</a>: While models effectively implement basic load-time optimizations (such as offloading heavy computations to Web Workers), they frequently struggle with main-thread responsiveness and Interaction to Next Paint (INP). They routinely miss layout isolation, priority scheduling, and off-thread rendering primitives.

Mitigate this with lab performance budgets for long tasks and CI checks for main-thread execution time, alongside real-user INP monitoring.

4. **Security vulnerabilities**

Incorporate static application security testing (SAST) and secret scanning into CI pipelines. Research shows that roughly 40% of programs generated by AI assistants across security-sensitive scenarios contained vulnerabilities listed in the CWE Top 25 (<a href="http://arxiv.org/abs/2108.09293" target="_blank">&quot;Asleep at the Keyboard?&quot;, Pearce et al., IEEE S&P 2022</a>).

Treat generated code as untrusted until verified by automated tools and human review.

## <a href="#rung-4-growing" id="rung-4-growing">Rung 4: Growing</a>

**What it looks like**: Code review and developer growth are intentional, leveraging AI to empower engineers who thoroughly understand the systems they deploy.
**The defining failure**: It represents the only sustainable level. Refined technical judgment improves AI usage, which in turn further sharpens developer skills.

While AI accelerates execution and catches superficial issues, engineers must actively understand root errors, refine prompts, and improve system architecture. Without conscious effort, teams fall into repetitive feedback loops. Engineers must maintain strong ownership of their code. Otherwise, control over the development lifecycle erodes.

### <a href="#the-invisible-metric-comprehension-debt" id="the-invisible-metric-comprehension-debt">The invisible metric: Comprehension debt</a>

<a href="https://addyosmani.com/blog/comprehension-debt/" target="_blank">Addy Osmani defines comprehension debt</a> as the gradual loss of human understanding and memory caused by over-reliance on AI automation. In agentic workflows, this debt accumulates quietly through hundreds of casual code reviews where tests passed, and changes looked plausible. Unlike technical debt, comprehension debt often goes unnoticed until critical systems break. Mitigating it requires deliberate cultural changes.

### <a href="#fostering-a-culture-that-prevents-comprehension-debt" id="fostering-a-culture-that-prevents-comprehension-debt">Fostering a culture that prevents comprehension debt</a>

Comprehension debt is addressed through team culture, not software tools. Clear, human-centered documentation serves as the primary defense. Beyond maintainable documentation, teams should adopt specific operational practices:

- **Ask "walk me through why this works"**: Make code walkthroughs standard during peer reviews of AI-assisted PRs; if the author cannot explain the implementation, it is not ready to merge.
- **Host AI-free coding sessions**: Conduct regular coding dojos or katas without AI assistants to keep core engineering skills sharp, preserving the critical judgment needed to evaluate generated code.
- **Pair-program on new features**: Pair engineers even when using AI tools; two developers with shared understanding provide far better oversight than a single developer trusting model output.

Deep technical comprehension has to stay non-negotiable, for companies and for engineers thinking about the long-term career they want to build.

## <a href="#knowing-where-you-stand" id="knowing-where-you-stand">Knowing where you stand</a>

A maturity model requires objective metrics to track progress and identify regression.

Metrics provide visibility into team adoption, delivery speed, and code quality. Standard DORA metrics can be augmented to track code churn, review bottlenecks, testing delays, and return on tooling investments.

Distinguish between vanity metrics (such as acceptance rate or generated lines of code) and actionable indicators: increased rework rates, defect escape rates, and extended review times signal that code generation is outpacing human review capacity. Always evaluate tool subscription costs against measurable efficiency gains.

Regularly audit custom prompts and AI agent configurations to remove outdated conventions and prevent models from generating deprecated code.

## <a href="#reaching-the-top-is-a-new-beginning" id="reaching-the-top-is-a-new-beginning">Reaching the top is a new beginning</a>

Climbing the rungs of AI maturity takes continuous effort. Organizational pressures — onboarding, tight deadlines, reviewer fatigue — can pull teams back to earlier rungs if guardrails and review standards slip.

Your tool ecosystem should work cohesively while engineers keep deep familiarity with the codebase. Automated review tools should reference your documentation standards, generation tools should enforce project conventions, and team culture must prioritize comprehension. Disconnected tools plus disengaged engineers produce isolated productivity spikes rather than lasting progress.

An AI engineering ecosystem is never 100% done. Even after reaching the Growing rung, you can drop back into experimenting with new techniques and new processes; that's healthy. As models and capabilities evolve, teams have to keep adapting their workflows. Successful engineering organizations focus not on adopting every emerging tool, but on maintaining a structured process for evaluating tools against their technical stack, security requirements, and team culture.

## <a href="#reading-recommendations" id="reading-recommendations">Reading recommendations</a>

- <a href="https://addyosmani.com/blog/comprehension-debt/" target="_blank">Comprehension Debt - the hidden cost of AI generated code - addyosmani.com</a>

- <a href="https://developer.chrome.com/blog/top-10-things-ai-gets-wrong-in-web-dev" target="_blank">Top 10 things AI gets wrong in web development - developer.chrome.com</a>

- <a href="https://arxiv.org/html/2406.10279v3" target="_blank">We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs - USENIX Security 2025</a>

- <a href="https://arxiv.org/html/2108.09293v3" target="_blank">Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions - Pearce et al., IEEE S&P 2022</a>

- <a href="https://getdx.com/blog/dora-metrics/" target="_blank">DORA metrics: the complete guide to measuring DevOps performance in the AI era - getdx.com</a>
