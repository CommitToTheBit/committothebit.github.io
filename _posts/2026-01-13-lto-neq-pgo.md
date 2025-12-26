---
title: "LTO != PGO"
description: "Ruining your link-times for fun and profit."
date: 2026-01-13 10:30:00 +0000
categories: [Procedural Whodunnits]
tags: ["c++", "llvm", "pgo", "lto", "optimisation"]
math: true
---

I didn't know what *stubs* were until surprisingly (shamefully) recently. Okay, well, I knew what they were - I'm sure most devs, self included, use them on instinct - but I didn't *know* I did for the longest time. A stub is [...]. Likewise a *driver* would be [...]. Both terms are often trussed up in the language of unit testing and CI/CD, but I find that overcomplicates thngs for programmers who don't have to think about DevOps every day. Stubs and drivers are, at their core, just two useful idioms to get new code up and running, whether you're implementing it top-down or bottom-up, respectively.

 and the like, but I prefer to think of them in isolation: as two idioms

This isn't a blog about stubbing - but it is more or less my blog's equivalent of a stub. between my previous post about <a href="https://sammakesgames.com/posts/pgo-but-better/"><strong>profile-guided optimisation</strong></a> (PGO), and another, much larger project of mine that I'm not quite ready to share just yet.

J. Ryan Stinnett's <a href="https://convolv.es/guides/lto/"><strong>guide</strong></a> is surprisingly comprehensive for how accessible it is. But, in the lead up to shipping *Tomb Raider*, a senior dev at Feral asked me a really quite good question,
> Quote goes here
which was enough to convince me a circuitous and more-than-a-little-self-indulgent answer might be in order.

## The Why

## The Where

## The How