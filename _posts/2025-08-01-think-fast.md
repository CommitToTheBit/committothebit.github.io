---
title: "Procedural Whodunnits #2, Think Fast"
description: "Exercising the CPU's little grey cells."
date: 2025-01-08 21:47:00 +0000
categories: [Procedural Whodunnits]
tags: ["devlog", "procgen"]
math: true
---

In the last post, I set out my overarching motivations for making *Bad Bohemians*, and how I mean to do so.
In describing how my logic puzzle solver receives and represents information, though, conspicuously absent was an explanation of how it actually, well, *solves*.
This is, in my opinion, the most important code in the whole damn thing.

The stakes are high.
From a design perspective, it'd be bad enough if the solver can't make the deductions a player can; far worse if it makes mistakes.
If *Bad Bohemians* returns even one puzzle that is over- or under-determined, the player has no reason to trust it won't happen again.
I'm far from the first to point this out (see Danny Day's excellent essay in *Procedural Generation in Game Design*, 2017), but guaranteeing a generated puzzle's solvability is vital to maintaining a sense of fairness.
Moreover, this code is going to become more and more of a bottleneck as the project goes on.
It may not be clear *why* just yet, but our solver needs to work - and work fast.

## The Grid

Let's start by revisiting some familiar concepts. Suppose our puzzle has some number of `mCategories`, and suppose the $i$th of these contains a number of `mElements[i]`, as given by the `vector<int> mElements`.
