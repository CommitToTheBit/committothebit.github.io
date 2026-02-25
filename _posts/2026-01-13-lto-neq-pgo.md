---
title: "LTO != PGO"
description: "Ballooning link times for fun and profit."
date: 2026-01-13 10:30:00 +0000
categories: [Procedural Whodunnits]
tags: ["c++", "llvm", "pgo", "lto", "optimisation"]
math: true
published: true
---

> PGO is just LTO with extra profiling data, right?

**Wrong!** Right before the holidays, I found myself chatting to a senior dev at my work - - it's been rattling around at the back of my head for the festive period. 

Link-time optimisation (LTO) is what it says on the tin. 

between my previous post about <a href="https://sammakesgames.com/posts/pgo-but-better/"><strong>profile-guided optimisation</strong></a> (PGO), and another, much larger project of mine that I'm not quite ready to share just yet. But plenty of digital ink (pixels?) have been spilled on link-time optimisations (J. Ryan Stinnett's <a href="https://convolv.es/guides/lto/"><strong>guide</strong></a> is one I'll refer back to throughout). I honestly don't think 

But, in the lead up to shipping *Tomb Raider*, a senior dev at Feral asked me a really quite good question,

Back to my colleague.
> I think my mistake was imagining the optimisation steps in LTO is distinct from normal compiler optimisation

I figured oh *okay,* there's a blog post in here.

which was enough to convince me a circuitous and more-than-a-little-self-indulgent answer might be in order.

We're going to treat this as bitcode... 

## But what is a Linker?

**translation units** (your `.cpp` files, basically)

![Desktop View](/assets/img/posts/2026-02-20-compiler-and-linker.png)
*<strong>The toolchain</strong> that transforms source code to (executable) machine code. The preprocessor, compiler, and assembler are, technically, their own programs, but I'll be lumping them all together and calling them the compiler for convenience; they aren't the part of the toolchain we're interested in today.*

At compile time, translation units get transformed, one by one, into **machine code** binaries native to your desired instruction set (x86, ARM, *etc.*). The linker is what takes those native object files (`.o`) and merging them together, maybe as an executable (`.exe`), or maybe a library (`.dll`). It's machine code in, machine code out.

Now, when we talk about linking object files, we're linking them by their **symbols**. These are the named entities in a program that get attached to a fixed memory location, a definition that encompasses functions and class methods, variables global and static. Because compilers only deal with one compilation unit at a time, they have to attach table of **weak symbols** (function declarations, uninitialised variables) and  **strong symbols**. It's the linker that mixes and matches these references to the definitions in a process known as **symbol resolution.**

<a href="https://chessman7.substack.com/i/164431639/the-compilation-pipeline-where-symbols-come-from"><strong>The compiler will [...],</strong></a>, so that 

From here, [...] dead code stripping on unused externals, plus relocation mapping symbols into actual memory.

Beyond symbol resolution, linkers are responsible for [memory addresses], plus [relocations]. <a href="https://mcyoung.xyz/2021/06/01/linker-script/"><strong>Miguel Young</strong></a> goes into much more technical here if you feel like further reading, I highly recommend you check his work out. Once you're back, I reckon it'll be time to narrow down this discussion from toolchains in general to one toolchain in particular.

## LLVM, Revisited

I was, I'll admit, a bit tricksy with how I wrote *PGO, But Better*. It's not got any outright lies or outstanding corrections - I like to think I'm pretty rigorous in how I put these posts together - but like any programming blog I had to elide some finer points for the sake of clarity. You might remember I introduced Clang as my compiler of choice, the one I'll be writing these blogs about. You might also remember that it's the C/C++ frontend of the LLVM compiler infrastructure. What you won't remember is where the linker fits into this infrastructure - I didn't even mention it.

![Desktop View](/assets/img/posts/2025-11-25-compiler-architecture.png)
*<strong>The story so far...</strong> The front-end [...]*

How exactly does our source code pass through...

Linking actually happens *within* `llc`, the LLVM static compiler!

### LLVM IR

I've talked about the **intermediate representation** (IR) LLVM uses before, but it's another topic that could use some elaboration. 

To get even more granular, LLVM translates to 

forms: a human-readable **textual form** (`.ll`), and a **binary form** (`.bc`) often referred to as **LLVM bitcode**.

This is an aside, but - until writing this blog, I never really *got* the concept of a virtual machine. Like, I knew , I knew that LLVM was an acronym-cum-orphan initialism for Low Level Virtual Machine... but I never knew what that actually means, yknow? LLVM bitcode is just machine code for a virtual machine. `.bc` files are , and `.ll`s likewise the virtual versions of assembly.

any file that contains machine code, virtual or native.

![Desktop View](/assets/img/posts/2026-02-21-llvm-no-lto.png)
*<strong>The LLVM Toolchain, Revisited</strong> We now understand Llvm in terms of [...]. Crucially, translation units can be compiled in parallel, but linking must take place on a single thread.*

As an example of what this IR looks like, let's take a minimal example. Here's some source code I wrote earlier:

```foobar.h
```

```foobar.cpp
```

Using LLVM X.Y.Z, I can feed these in to...

```
$ clang foobar.cpp -S -emit-llvm
```

Note also that LLVM IR is a **static single assignment form** (SSA), where each variable `%n` gets set exactly once. If you're curious as to why that's a useful property for an intermediate representation, <a href="https://mcyoung.xyz/2025/10/21/ssa-1/"><strong>Miguel Young</strong></a> is once again yer man.

When optimised, we see

```
$ clang foobar.cpp -S -emit-llvm -O2 -o foobar.O2.ll
```

## Link-Time Optimisations (LTO)

Of course, this is a blog about linking, so continuing this example we need a second source to link `foobar.cpp` to.
```main.cpp
#include "foobar.h"
#include <stdio.h>

int main()
{

}

void baz()
{

}
```
At link-time, we can expect the linker to recognise `bar` as [...], and strip it accordingly. What we can't expect is...

This is where **link-time optimisation** (LTO) comes in.

LLVM in specific does this by making calls to libLTO, a [...]. 

If there's one idea I want to get across with this blog, it's this: the linker makes more or less the same optimisations across *multiple* sources that compiler does within *each* source.

### Full LTO

. This is called **full LTO**, and I tend to think of it as the 'correct' way to go about these optimisations.

![Desktop View](/assets/img/posts/2026-02-21-llvm-full-lto.png)
*<strong>Full LTO</strong>*

```
$ clang foobar.cpp -c -O2 -flto
$ clang main.cpp -c -O2 -flto
$ clang foobar.o main.o -flto -Wl,-plugin-opt=save-temps -o main
```

```
$ llvm-dis main.preopt.bc -o main.preopt.ll
```

```
$ llvm-dis main.opt.bc -o main.opt.ll
```

Because in this implementation, after that first pass through the linker, libLTO has to run <a href="https://www.cs.cmu.edu/afs/cs/academic/class/15745-s13/public/lectures/L3-LLVM-Overview-1up.pdf#page=10"><strong>20-odd</strong></a> of the usual optimisation passes on the monolithic module we've merged our IRs into - all on a single thread. At best impractical, at worst unusable, these extra optimisations will slow your link times to a crawl (and that's assuming so large a `monolithic.bc` will even fit in memory). Surely, surely, there's a compromise to be found between performance and quality-of-life?

*Clang flags* `-flto[=full]`

### Thin LTO

The funny thing [...] noticed about LTO is, well, there's not all that many symbols libLTO really cares about at link time.

![Desktop View](/assets/img/posts/2026-02-21-llvm-thin-lto.png)
*<strong>Thin LTO</strong>*

The corollary to this is thin LTO is also incremental. Again, full LTO merges all of its translation units into a single module; when any of those sources are edited, libLTO will have to rerun. Because [...]

Notes on linker caching here, actually get technical with it?

**Clang flags** `-flto=thin`

## LTO, But Better (Better Link Times, Anyway)

In terms of raw performance, thin LTO is negligibly worse: [...] finds a speed-up of 2.63% versus full LTO's 2.86%.

This section is really , and, while they're not going to meaningfully worsen your LTO, they're not going to make it more perfromant either.

### Unified LTO

**Clang flags** [...]

### Fat LTO

**Clang flags** [...]

### Distributed Thin LTO (DTLTO)

Now, in Stinett's guide to LTO, he flags up three more advanced LTO concepts for the curious reader: symbol visibility, linker caching, and distributed build support. The first two are already covered about, but what about the third? A **distributed build**...

If you're working on an extremely large project, chances are you're running **distributed builds** across a whole network of machines, with each taking responsibility for its own units of work. Full LTO, being single-threaded, also needs run on one single linker, but Thin LTO slots into a distributed system nicely. Here, machines receive their own [index files?], and can be [...]. But I digress.  

**Clang flags** [...]

## LTO && PGO

All told, the most intuitive definition of LTO I can think of is *optimisation with knowledge of all sources*. If you'd asked me the same thing on my last post, I'd probably have described PGO as something like *optimisation with knowledge of how a source is used*. **These are orthogonal properties,** you can absolutely have either one without the other. And that, I think, gets us back to where we started.

![Desktop View](/assets/img/posts/2026-02-21-pgo-and-lto.png)
*<strong>Just LTO with extra profiling data, right?</strong> PGO and LTO*

I've spent a lot of this post running off the various ,

CS and IR PGO 

Now, these two tricks *are* superficially very similar.

Where I think the confusion arises that "PGO is just LTO with extra steps" is, there's very rarely a reason to use PGO if you don't already have LTO enabled.

(and as should be pretty clear from the above, LTO offers more or less the exact same optimisation opportunities; all the flags laid out above exist )

The only other argument against turning LTO on immediately is undefined behaviour. Now, that's an easy thing to handwave away - I would simply write code that's well-defined, and all that - but what if you're working on a pre-existing codebase? Suppose you're, well, *me*, porting games from 10, 15, 20 years ago. As a third party chipping away at an already-existing ; some of them were written before LTO was even A Thing. Now, personally I'd still advocate for sucking it up, enabling LTO first, and slogging through the regressions one by one, but I'm not going to tell you how to live your life. 

All of which brings us back to where we started: what is the relationship between LTO and another key tool, profile-guided optimisation (PGO)? And

The fuzzy, intuitive - *but wrong!* - read LTO unlocks "the last" optimisations we might want to run, and PGO builds on those.

In theory, that is. In practice, MSVC won't let you enable PGO without LTO because of how the compiler has been written; Clang and GCC, however, support either/or.