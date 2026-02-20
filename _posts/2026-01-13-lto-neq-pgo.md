---
title: "LTO != PGO"
description: "Ballooning link times for fun and profit."
date: 2026-01-13 10:30:00 +0000
categories: [Procedural Whodunnits]
tags: ["c++", "llvm", "pgo", "lto", "optimisation"]
math: true
image:
  path: /assets/img/posts/2025-12-26-pgo-and-lto.png
published: true
---

> PGO is just LTO with extra profiling data, right?

**Wrong!** Just before the holidays, I found myself chatting to a senior dev at my work - - it's been rattling around at the back of my head for the festive period. 



Link-time optimisation (LTO) is what it says on the tin. 

between my previous post about <a href="https://sammakesgames.com/posts/pgo-but-better/"><strong>profile-guided optimisation</strong></a> (PGO), and another, much larger project of mine that I'm not quite ready to share just yet. But plenty of digital ink (pixels?) have been spilled on link-time optimisations (J. Ryan Stinnett's <a href="https://convolv.es/guides/lto/"><strong>guide</strong></a> being my personal favourite). I honestly don't think 

But, in the lead up to shipping *Tomb Raider*, a senior dev at Feral asked me a really quite good question,

Back to my colleague.
> I think my mistake was imagining the optimisation steps in LTO is distinct from normal compiler optimisation

I figured oh *okay,* there's a blog post in here.

which was enough to convince me a circuitous and more-than-a-little-self-indulgent answer might be in order.

## But what is a Linker?

![Desktop View](/assets/img/posts/2026-02-20-compiler-and-linker.png)
*<strong>The toolchain</strong> that transforms source code to (executable) machine code. The preprocessor, compiler, and assembler are, technically, their own programs, but I'll be lumping them together as the compiler for convenience; the part of the toolchain we're really interested in is the linker.*

The linker is, if nothing else

Now, this post is going to get a pedantic at points, so I want to clarify up top what an object file actually is. 

As far as the linker's role goes,

## LLVM, Revisited

I was, I'll admit, a bit tricksy with how I wrote *PGO, But Better*. It's not got any outright lies or outstanding corrections - I like to think I'm pretty rigorous in how I put these posts together - but like any programming blog I had to elide some finer points for the sake of clarity. You might remember I introduced Clang as my compiler of choice, the one I'll be writing these blogs about. You might also remember that it's the C/C++ frontend of the LLVM compiler infrastructure. What you won't remember is where the linker fits into this infrastructure - I didn't even mention it.

![Desktop View](/assets/img/posts/2025-11-25-compiler-architecture.png)
*<strong>The LLVM "Toolchain"</strong> The front-end [...]*

But what even is a linker? [Definition of linker]. [Definition of modules].

Compile-time and link-time are, well, finicky concepts.
Linking actually happens *within* `llc`, the LLVM static compiler!

How exactly does our source code pass through...

The LLVM Middle-End

Let's look at this in a 

### LLVM IR

To get even more granular (and this subsection is totally optional), LLVM translates to 

forms: a human-readable **textual form**, and a **binary form** often referred to as **LLVM bitcode**.

As an example of what this IR looks like, let's take a minimal example. Here's two modules I made earlier:

Using LLVM X.Y.Z, I can feed these in to...

Optimising...

Finally, linking with...

## Link-Time Optimisations (LTO)

Compile and decompile this example, play about!!

If there's one idea I want to get across with this blog, it's this: the linker makes more or less the same optimisations across *multiple* sources that compiler does within *each* source. If you understand one, you do understand the other.

Further example, undefined behaviour...

Describe w/o...

### Full LTO

### Thin LTO

Notes on linker caching here, actually get technical with it?

End that - this is the limit!

## LTO, But Better... Link Times

Describe the benefit of LTO as being faster, philosophy of link-times (especially as it relates to indie development). then...

### Unified LTO

### Fat LTO

### Distributed Thin LTO (DTLTO)

If you're working on an extremely large project, chances are you're running **distributed builds** across a whole network of machines, with each taking responsibility for its own units of work. Full LTO, being single-threaded, also needs run on one single linker, but Thin LTO slots into a distributed system nicely. Here, machines receive their own [index files?], and can be [...]. But I digress.  

## LTO && PGO

And now, I think, I'm ready to circle back to the question that started this all. Stepping back, the most intuitive definition of LTO I can think of is *optimisation with knowledge of all sources*. If you'd asked me the same thing on my last post, I'd probably have described PGO as something like *optimisation with knowledge of how a source is used*. **These are orthogonal properties,** you can absolutely have either one without the other.

I've spent a lot of this post running off the various ,

CS and IR PGO 

Now, these two tricks *are* superficially very similar.

Where I think the confusion arises that "PGO is just LTO with extra steps" is, there's very rarely a reason to use PGO if you don't already have LTO enabled.

(and as should be pretty clear from the above, LTO offers more or less the exact same optimisation opportunities; all the flags laid out above exist )

The only other argument against turning LTO on immediately is undefined behaviour. Now, that's an easy thing to handwave away - I would simply write code that's well-defined, and all that - but what if you're working on a pre-existing codebase? Suppose you're, well, *me*, porting games from 10, 15, 20 years ago. As a third party chipping away at an already-existing ; some of them were written before LTO was even A Thing. Now, personally I'd still advocate for sucking it up, enabling LTO first, and slogging through the regressions one by one, but I'm not going to tell you how to live your life. 

All of which brings us back to where we started: what is the relationship between LTO and another key tool, profile-guided optimisation (PGO)? And

The fuzzy, intuitive - *but wrong!* - read LTO unlocks "the last" optimisations we might want to run, and PGO builds on those.

In theory, that is. In practice, MSVC won't let you enable PGO without LTO because of how the compiler has been written; Clang and GCC, however, support either/or.