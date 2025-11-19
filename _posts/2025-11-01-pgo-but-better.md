---
title: "PGO, But Better"
description: "Finding performance down the back of the sofa."
date: 2025-09-24 12:00:00 +0000
categories: [Procedural Whodunnits]
tags: ["devlog", "godot", "cmake", "c++"]
math: true
published: false
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

This was going to be a blog about branch prediction. This was going to be a blog about how <a href="https://web.archive.org/web/20190717130447/http://web.engr.oregonstate.edu/~benl/Projects/branch_pred/"><strong>dynamic branch prediction algorithms</strong></a> do (and don't) work. This was *going* to be about how I've been integrating <a href="https://johnfarrier.com/branch-prediction-the-definitive-guide-for-high-performance-c/"><strong>best branch prediction practices</strong></a> into my ongoing work on <a href="https://sammakesgames.com/bad-bohemians"><strong>*Bad Bohemians*</strong></a>... but then I stumbled ass-backwards into a treasure trove of LLVM resources and decided I'd share those instead. Whoops.

## Performance-Guided Optimisation (PGO)

clang - or more accurately, LLVM, the middle-end compiler clang is built on - comes with a suite of tools for **performance-guided optimisation**. The central conceit is, if we identify the hot/cold paths of a game's code in a realplaythrough, the compiler can use this information to better improve subsequent builds: hotpaths are tuned for performance, cold paths for size. After manually playing through an *instrumented* build to collect a profile (personally, I prefer the term*telemetry data*), that profile is then fed back into 
LLVM to, surprise surprise, guide its *PGO-optimised* builds.

What do performance-guided optimisations look like in practice? In the case of branchpredictions, it means logging branch frequencies as part of our telemetry data. Then, when
optimising with

Other common optimisations include:
* Function inlining
* Function reordering
* Virtual call speculation
...Several of which well deserved a blog of their own. However, for today's purposes, I'm happy to treat the optimisations themselves as something of a black box. I'm not so much interested 

The theory here is largely a rehashing of"The Many Faces of PGO and FDO," mixing in the reasoning behind how I've integrated it in personal and professional projects. For instance, all the techniques and compiler flags I mention here are used for
instrumented PGO, where the compiler builds profiling tools directly into its PGOGen builds.
This instrumentation introduces some overhead, but Not covered are alternatives like
sampling PGO, profiling instead with an external tool and sacrificing granularity for
convenience (any non-PGOLink build can be used for sampling). Chances are, you’re only
going to care about PGO if your project is CPU-bound, and in those cases neither you nor
QA are going to want to cut corners. I’ll be using PGO as shorthand for instrumented PGO
for the rest of this talk.

### Front-End (FE) PGO

### Intermediate Representation (IR) PGO

### Context-Sensitive (CS) PGO

But wait a minute! Why all this focus on the intermediate representation? Surely there’s other places in the compilation to inject PGO instrumentation?

Suppose our earlier function `foo` is inlined in two other functions, `bar` and `baz`:
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
If `bar` and `baz` get called at about the same frequency, FE and IR PGO will both register that foo takes each branch with about the same probability, and prediction will fail about half the time. By instead adding instrumentation after inlining takes place, each instance of an inlined function gets profiled and optimised independently of any others. `bar::foo` can safely be rearranged to prioritise branch `a`, and `baz::foo` branch `b`. We are gathering and applying separate telemetry data for the several contexts a single function gets inlined - hence the name, context-sensitive PGO.

### Temporal Profiling

## On Faustian Pacts

## Link-Time Optimisations (LTO)

## Post-Link Optimisations (PLO)

### BOLT, a Binary Optimisation and Layout Tool