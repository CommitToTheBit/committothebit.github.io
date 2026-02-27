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

**Wrong!** Right before the holidays, I found myself having a chat with a senior dev at work, and it's been rattling around at the back of my head this whole festive period. I'd recently given a dev talk on link-time optimisations (LTO): how to enable them, why Feral should use them, things of that nature. It was only afterwards I realised, I was never clear on what those Os in LTO actually *were*.

I'm going to answer this in something of a spiritual sequel to my last post about <a href="https://sammakesgames.com/posts/pgo-but-better/"><strong>profile-guided optimisation</strong></a> (PGO). PGO, LTO, and indeed a third, much larger project of mine I'm not quite ready to share just yet, are conceptually very similar; I tend to think of all three as optimisation via cheat code. As a programmer increasingly specialised in the dark art of Make CPU Run Good, my energies . , less the ABCs than the ↑↑↓↓←→←→BAs of performance engineering.

Plenty of digital ink (pixels?) have already been spilled on link-time optimisations, J. Ryan Stinnett's <a href="https://convolv.es/guides/lto/"><strong>guide</strong></a> being a personal favourite - and one I'll rehash most of here. Much like I did with PGO, though, I want to blend this theory with practical guidance about how to implement LTO with minimal foot-shooting along the way. It'll be a bit circuitous, but by the end of the article you should come away with a greater confidence as to how and why LTO and PGO can coexist in your build pipeline. Oh, and I will be centering this discussion around my compiler of choice, LLVM; it's the one I use day-to-day, and the one I feel making declarative statements on, but I'm sure there'll be enough in here that'll be of use whatever tools you're using.

## But what is a Linker?

**compilation units** (your `.cpp` files, basically)

![Desktop View](/assets/img/posts/2026-02-20-compiler-and-linker.png)
*<strong>The toolchain</strong> that transforms source code to (executable) machine code. The preprocessor, compiler, and assembler are, technically, their own programs, but I'll be lumping them all together and calling them the compiler for convenience; they aren't the part of the toolchain we're interested in today.*

At compile time, source code gets transformed, unit by unit, into **machine code** binaries native to your desired instruction set (x86, ARM, *etc.*). The linker is what takes those native object files (`.o`) and merging them together, maybe as an executable (`.exe`), or maybe a library (`.dll`). It's machine code in, machine code out.

Now, when we talk about linking object files, we're linking them by their **symbols**. These are the named entities in a program that get attached to a fixed memory location - *e.g.* functions and class methods, global and static variables - many of which will be **externally visible** beyond the scope of their own compilation unit. When externals are referenced elsewhere it's the linker that matches them to their definitions, a process known as <a href="https://chessman7.substack.com/i/164431639/symbol-resolution-in-action"><strong>symbol resolution</strong></a>.

While they will attempt some amount of dead code stripping, compilers can only [...]. Crucially, linkers don't [...]. They're also responsible for resolving *relocations* using newly-finalised runtime memory addresses, but we won't get into those here. <a href="https://mcyoung.xyz/2021/06/01/linker-script/"><strong>Miguel Young</strong></a> goes on some good tangents on this topic if you feel like the further reading, I highly recommend you check his work out; once you're back, it'll be time to narrow down this discussion from toolchains in general to one toolchain in particular.

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
*<strong>The LLVM Toolchain, Revisited</strong> We now understand Llvm in terms of [...]. Crucially, compilation units can be compiled in parallel, but linking must take place on a single thread.*

As an example of what this IR looks like, let's take a minimal example. Here's some source code I wrote earlier:

```c++
extern int  foo();
extern void bar();
extern void baz();
```
{: file='foobar.h'}

```c++
#include "foobar.h"

static int qux();
static int i = 24;

int foo()
{
    int data = 0;
    if (i < 0)
    {
        data = qux();
    }

    data = data + 42;
    return data;
}

void bar()
{
    i = -1;
}

int qux()
{
    baz();
    return 10;
}
```
{: file='foobar.cpp'}

Using LLVM X.Y.Z, I can feed these in to...

```llvm
@i = internal global i32 24

define i32 @foo() {
    %1 = alloca i32
    store i32 0, ptr %1
    %2 = load i32, ptr @i
    %3 = icmp slt i32 %2, 0
    br i1 %3, label %qux, label %add10

qux:
    %4 = call i32 @_ZL3quxv()
    store i32 %4, ptr %1
    br label %add10

add10:
    %5 = load i32, ptr %1
    %6 = add nsw i32 %5, 42
    store i32 %6, ptr %1
    %7 = load i32, ptr %1
    ret i32 %7
}

define void @bar() {
    store i32 -1, ptr @i
    ret void
}

declare void @baz()

define internal i32 @qux() {
    call void @baz()
    ret i32 10
}
```
{: file='foobar.ll'}

```
$ clang foobar.cpp -S -emit-llvm
```

Note also that LLVM IR is a **static single assignment form** (SSA), where each variable `%n` gets set exactly once. If you're curious as to why that's a useful property for an intermediate representation, <a href="https://mcyoung.xyz/2025/10/21/ssa-1/"><strong>Miguel Young</strong></a> is once again yer man.

Speaking of optimisations, rebuilding with an extra `-O2` flag greatly simplifies the IR:
```llvm
@i = internal global i1 false

define i32 @foo() {
    %1 = load i1, ptr @i
    br i1 %1, label %qux, label %add10

qux:
    tail call void @baz()
    br label %3

add10:
    %2 = phi i32 [ 42, %0 ], [ 52, %qux ]
    ret i32 %2
}

define void @bar() {
    store i1 true, ptr @i
    ret void
}

declare void @baz()
```
{: file='foobar.optimised.ll'}
Here, `qux` has been inlined, our internal variable `i` safely simplified to a boolean (`i1` in the LLVM parlance), and several registers removed. We also see a **phi node** in `line 12`, which [...].

## Link-Time Optimisations (LTO)

Of course, this is a blog about linking, so continuing this example we need a second source to link `foobar.cpp` to.
```c++
#include "foobar.h"
#include <stdio.h>

int main()
{
    return foo();
}

void baz()
{
    printf("Hello world!\n");
}
```
{: file='main.cpp'}
We can expect the linker to recognise `bar` as an unused external and strip it accordingly. What we can't expect is it to make any of the inferences that would follow: that `i` is never changed, that `%qux` and therefore `baz` becomes inaccessible, that `main` will not never return a value of `42`. Further simplification 

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

```llvm
@i = internal global i1 false,
@s = private unnamed_addr constant [13 x i8] c"Hello world!\00"

define i32 @main() {
    %1 = tail call i32 @foo()
    ret i32 %1
}

define i32 @foo() {
    %1 = load i1, ptr @i
    br i1 %1, label %qux, label %add10

qux:
    tail call void @_Z3bazv()
    br label %add10

add10:
    %2 = phi i32 [ 42, %0 ], [ 52, %qux ]
    ret i32 %2
}

define void @baz() {
    %1 = tail call i32 (ptr, ...) @printf(ptr @.s)
    ret void
}
```
{: file='main.preopt.ll'}
Here, we see the after effects of symbol resolution: the linker has already been able to strip `bar` safe in the knowledge it goes unused in `main.cpp`. However... we all know `main` always returns `42`, don't we? Like, we can all, tangibly see that - so why can't LLVM? It's because the inferences that follow from removing `bar` - that `i` is always false, that `%qux` is inaccessible, that `baz` can also be stripped - are all link-time optimisations we need to route through libLTO. And surely enough, disassembling `main.opt.ll` gives us exactly that:
```llvm
define i32 @main() {
    ret i32 42
}
```
{: file='main.opt.ll'}

Full LTO is the 'true' form of LTO, but it isn't always feasible. What we've seen above it, after that first pass through the linker, libLTO has to run <a href="https://www.cs.cmu.edu/afs/cs/academic/class/15745-s13/public/lectures/L3-LLVM-Overview-1up.pdf#page=10"><strong>20-odd</strong></a> of the usual optimisation passes on the monolithic module we've merged our IRs into - all on a single thread. At best impractical, at worst unusable, these extra optimisations will slow your link times to a crawl (and that's assuming so large a `monolithic.bc` will even fit in memory). Surely, surely, there's a compromise to be found between performance and quality-of-life?

**Clang flags** `-flto[=full]`

### Thin LTO

The funny thing [...] noticed about LTO is, well, there's not all that many symbols libLTO really cares about at link time.

![Desktop View](/assets/img/posts/2026-02-21-llvm-thin-lto.png)
*<strong>Thin LTO</strong>*

The corollary to this is thin LTO is also incremental. Again, full LTO merges all of its compilation units into a single module; when any of those sources are edited, libLTO will have to rerun. Because [...]

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