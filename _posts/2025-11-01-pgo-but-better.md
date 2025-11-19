---
title: "PGO, But Better"
description: "Finding performance down the back of the sofa."
date: 2025-09-24 12:00:00 +0000
categories: [Procedural Whodunnits]
tags: ["devlog", "godot", "cmake", "c++"]
math: true
image:
  path: /assets/img/posts/2025-11-06-its-free-cpu-performance.png
---

Let's talk <strong>branch prediction</strong>. Because the modern CPU pipeline is optimised to fetch and decode instructions in advance of their actual execution, any control statement that branches those instructions along two or more paths presents a serious problem. In the `if-else` statement
```c++
void foo()
{
    if (/* branch condition */)
    {
        // branch a
    }
    else
    {
        // branch b
    }
}
```
the CPU doesn’t know which branch it’s taking at time of fetching `line 3` - but to wait until that branch condition has been decoded, executed and evaluated before fetching its next instruction would bring the entire pipeline to a standstill. `for` loops and `while` loops too branch at every iteration on deciding whether to terminate the loop.

Now, stalling at a single branch condition would only cost us ~20 <strong>clock cycles</strong>, the fundamental units of CPU time. On modern microprocessors that’s in the order of about ~10ns, but along the hotter paths of your codebase these stalls add up. That’s why, on fetching a branch condition, the CPU uses a *branch predictor* to guess which path it's going to take. Instructions along that predicted path can then be fetched, decoded and speculatively executed, their results stored in temporary buffers, in the gap before the condition is evaluated. If our prediction is correct that work is committed immediately (Agner Fog's <a href="https://www.agner.org/optimize/#manuals"><strong>Optimizing Software in C++</strong></a> puts the overhead of a correctly-predicted branch instruction at 0-2 cycles all told). If we are wrong, however, the speculative work gets flushed and we start processing the actual branch, those ~20 wasted clock cycles constituting our *branch misprediction penalty*.

This was going to be a blog about branch prediction. This was going to be a blog about how <a href="https://web.archive.org/web/20190717130447/http://web.engr.oregonstate.edu/~benl/Projects/branch_pred/"><strong>dynamic branch prediction algorithms</strong></a> do (and don't) work. This was *going* to be about how I've been integrating <a href="https://johnfarrier.com/branch-prediction-the-definitive-guide-for-high-performance-c/"><strong>best branch prediction practices</strong></a> into my ongoing work on <a href="https://sammakesgames.com/bad-bohemians"><strong>*Bad Bohemians*</strong></a>... but then I got bored and went and overhauled some build pipelines instead. oops!!

## Profile-Guided Optimisation (PGO)

clang - or more accurately, LLVM, the middle-/back-end compiler clang is built on - comes with a suite of tools for **profile-guided optimisation**. The central conceit is, if we identify the hot/cold paths of a game's code in a real
playthrough, the compiler can use this information to better improve subsequent builds. Playing an *instrumented* build will accumulate raw *telemetry data*, data which together form a profile of the game. This gets fed back into LLVM to, surprise surprise, guide its optimisations: hot paths will be tuned for performance, cold paths for size.

What do these optimisations look like in practice? In the case of branch predictions, we track branch frequencies in the telemetry data. The compiler can then reorganise the code to place more likely paths sooner after each branch condition, which is most efficient for the resulting machine code.<sup>1</sup> Crucially, this is all done statically - the final PGO-optimised program won't be bloated by any telemetry data, those are only needed at compile-time!
<p style="line-height:1.25"><sup><sup>1</sup> It's also why C++20 introduced the <code>[[likely]]</code> and <code>[[unlikely]]</code> attributes.</sup></p>

Other common optimisations include:
* Function inlining
* Function reordering
* Virtual call speculation
* Memory intrinsics
* Register allocation

...Several of which well deserve blog posts of their own. However, for today's purposes I'm happy to treat the optimisations themselves as something of a black box. This discussion is about where and how we collect telemetry data, not so much what we do with it.

The theory here is largely a rehashing of Amir Aupov's <a href="https://aaupov.github.io/blog/2023/07/09/pgo"><strong><i>The Many Faces of PGO and FDO</i></strong></a>, mixing in some reasoning behind how I've integrated it in personal and professional projects myself. For instance, all the techniques and compiler flags I mention here are used for **instrumented PGO**, where the compiler insert profiling tools directly into builds. Instrumentation introduces some overhead, and might even have an observer effect on its readings, but it is also 
Not covered are alternatives like **sampling PGO**, which would mean profiling with an external tool like `perf` and sacrificing granularity for convenience (we don't need a 'special' build for sampling). Aupov suggests this is the better choice for, e.g., web servers, but between <a href="https://developer.android.com/games/agde/pgo-overview#:~:text=Profile%2Dguided%20optimization%20(also%20known,played%20in%20the%20real%2Dworld."><strong>Android development</strong></a> at Feral and experimenting with Godot at home, I'm satisfied that instrumentation is suitable for optimising games. I'll be using "PGO" as shorthand for "instrumented PGO" going forward, then.

### Front-End (FE) PGO

**clang flags** `-fprofile-instr-generate`, `-fprofile-instr-use=<path/to/.profdata>`

### Intermediate Representation (IR) PGO

**clang flags** `-fprofile-generate`, `-fprofile-use=<path/to/.profdata>`

### Context-Sensitive (CS) PGO

Of course, even IR PGO has its limits. Suppose our earlier function `foo` is inlined in two other functions, `bar` and `baz`:
```c++
void bar()
{
	foo() // usually takes branch a
}

void baz()
{
	foo() // usually takes branch b
}
```
If `bar` and `baz` get called at about the same frequency, FE and IR PGO will both register that foo takes each branch with about the same probability, and prediction will fail about half the time. By instead adding instrumentation *after* inlining takes place, each instance of an inlined function gets profiled and optimised independently of any others. `bar::foo` can safely be rearranged to prioritise branch `a`, and `baz::foo` branch `b`. We are gathering and applying separate telemetry data for the several contexts a single function gets inlined - hence the name, **context-sensitive PGO**.

Taking all three methods into account, IR PGO is still be expected to give the biggest gains. Don't get me wrong, CS PGO greatly improves inlined functions, but it just isn't all that powerful on its own. That's why we're lucky CS instrumentation can be layered on top of an already IR-optimised program, the two phases of telemetry data eventually being merged together to fine-tune a third and final build. If you're willing to accept a multi-stage pipeline, **CSIR PGO** really is the gold standard for profile-guided optimisations.

**clang flags** `-fcs-profile-generate`, `-fprofile-use=<path/to/.profdata>`

### Temporal Profiling

This last one's for my fellow mobile devs. A few years ago now, the compiler team at Meta identified 

**clang flags** `-pgo-temporal-instrumentation`

## On the Nature of Faustian Pacts

The immediate danger, not just of PGO but similar methods like LTO, PLO, is . At Feral, for instance, 

If your code doesn't outright break, then lucky you - but you might still have made it slower.

There's also . Personally, I'd recommend