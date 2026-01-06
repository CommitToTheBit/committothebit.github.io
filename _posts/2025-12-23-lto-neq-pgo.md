---
title: "LTO != PGO"
description: "Ballooning link times for fun and profit."
date: 2025-12-23 10:30:00 +0000
categories: [Procedural Whodunnits]
tags: ["c++", "llvm", "pgo", "lto", "optimisation"]
math: true
image:
  path: /assets/img/posts/2025-12-26-pgo-and-lto.png
published: false
---

> PGO is just LTO with extra profiling data, right?

**Wrong!** Just before the holidays, I found myself chatting to a - - it's been rattling around at the back of my head for the 

Link-time optimisation (LTO) is what it says on the tin. 

between my previous post about <a href="https://sammakesgames.com/posts/pgo-but-better/"><strong>profile-guided optimisation</strong></a> (PGO), and another, much larger project of mine that I'm not quite ready to share just yet.

Plenty of digital ink (pixels?) has been spilled on link-time optimisations, J. Ryan Stinnett's <a href="https://convolv.es/guides/lto/"><strong>guide</strong></a> being  accessible yet comprehensive. But, in the lead up to shipping *Tomb Raider*, a senior dev at Feral asked me a really quite good question,

Back to my colleague.
> I think my mistake was imagining the optimisation steps in LTO is distinct from normal compiler optimisation
I figured oh *okay,* there's a blog post in here.

which was enough to convince me a circuitous and more-than-a-little-self-indulgent answer might be in order.

## A Worked Example

## Link-Time Optimisations (LTO)

Describe w/o...

### Full LTO

### Thin LTO

End that - this is the limit!

## Fast(er) Link-Times

Describe the benefit of LTO as being faster, philosophy of link-times (especially as it relates to indie development). then...

### Unified LTO

### Fat LTO

### Linker Caching

## LTO && PGO

If LTO is "optimisation with knowledge of