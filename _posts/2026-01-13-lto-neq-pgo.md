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

**Wrong!** December, 2025: hot off my last dev talk of the year, I get asked this question by one of the leads at Feral. I've been talking about link-time optimisation (LTO), a nice, easy, one-and-done topic that (little do I know it yet) will end up rattling around the back of my head for the rest of the festive period. That's because my colleague has made me realise, I've given a whole presentation on how linking unlocks extra optimisations a compiler can't make on a per-unit basis - and completely failed to explain what those extra optimisations actually are.

Please consider this my *mea culpa*, a spiritual sequel to my post on <a href="https://sammakesgames.com/posts/pgo-but-better/"><strong>profile-guided optimisation</strong></a>. PGO, LTO, plus a third, much larger project of mine I'm not quite ready to share just yet, are conceptually very similar. I like to think of them as cheat codes for CPU optimisation; less the ABCs than the ↑↑↓↓←→←→BAs of performance engineering. They're cheating because, well, they're glorified compiler flags, and I strongly suspect what stops most devs from using them is simply not knowing they exist.

But plenty of digital ink - pixels? - have already been spilled on LTO (<a href="https://convolv.es/guides/lto/"><strong>J. Ryan Stinnett's</strong></a> being my personal favourite of the many very accessible introductions available). Much like I did with PGO, what I want to do here is walk through my own personal experience integrating the process into my a build pipeline, and show my working on the subtler points I've had to read between the lines elsewhere. It'll be a bit circuitous, but by the end of this article I should have convinced you of what the Os in LTO and PGO are really doing, the way my colleague and I convinced ourselves. Oh, and while some code snippets and console commands will be specific to my compiler of choice, there's enough in here that should be relevant whatever your toolchain.

## But what is a Linker?

Looking at a C++ developer's toolchain, it's easy to get hung up on the compiler. It is, after all, where the optimisation happens. But compilation alone does not a toolchain make; there are other, admittedly lesser, programs deserving of attention:

![Desktop View](/assets/img/posts/2026-02-20-compiler-and-linker.png)
*<strong>The toolchain</strong> transforms source code to (executable) machine code. The preprocessor, compiler, and assembler are, technically, their own programs, but I'll lump them together and call them the compiler for convenience; they aren't the part of the toolchain we're interested in today.*

Toolchains think about a project in terms of **compilation units**, which in C++ are just its `.cpp` source files. At compile time, sources get lowered, unit by unit, into independent **machine code** binaries native to your desired instruction set (x86, ARM, *etc.*). The linker is what then takes their native object files (`.o`) and merges them together. Whether returning an executable (`.exe`) or maybe a library (`.dll`), this last step is machine code in, machine code out.

Now, when we talk about linking object files, we're linking them by their **symbols**. These are the named entities in a program that get attached to a fixed memory location - *e.g.* functions and class methods, global and static variables - many of which will be **externally visible** beyond the scope of their own compilation unit. When externals are referenced elsewhere it's the linker that matches them to their definitions, a process known as <a href="https://chessman7.substack.com/i/164431639/symbol-resolution-in-action"><strong>symbol resolution</strong></a>.

While they will attempt some amount of *dead code stripping*, compilers are limited to optimising one unit at a time. Only the linker, with its global view of an executable, can spot unused externals and remove them. Linkers are also responsible for resolving *relocations* using newly-finalised runtime memory addresses, but I'll refer you to <a href="https://mcyoung.xyz/2021/06/01/linker-script/"><strong>Miguel Young</strong></a> for the further reading there. Once you've checked his site out, it'll be time to narrow down our own discussion from toolchains in general to one toolchain in particular...

## LLVM, Revisited

I was, I'll admit, a bit tricksy with how I wrote *PGO, But Better*. It's not got any outright lies or outstanding corrections - I like to think I'm pretty rigorous in how I put these posts together - but like any programming blog I had to elide some finer points for the sake of clarity. You might remember I introduced Clang as my go-to compiler, the one I'll be writing these blogs about. You might also remember that it's the C/C++ frontend of the LLVM compiler infrastructure. What you won't remember is where the linker fits into this infrastructure - I didn't even mention it.

![Desktop View](/assets/img/posts/2025-11-25-compiler-architecture.png)
*<strong>The story so far...</strong> The LLVM front-end translates source code into an intermediate representation (IR), on which the middle-end performs a series of language-agnostic passes. After optimisation, the back-end translates the IR again, to run on your instruction set of choice.*

Classically, 

Linking actually happens *within* `llc`, the LLVM static compiler!

### LLVM IR

To optimise...

*PGO, But Better* also touched on the **intermediate representation** (IR) used by LLVM, but only in the abstract. Here, I want to take advantage of it to better understand the compiler. The LLVM middle-end is designed for modularity, 

That's why, if you want to see

If you want to see the before and after of a pass you've hacked in, this is the only language 

Here, I want to use it as a tool to understand. It is, first and foremost, flexible. LLVM is designed to only 

Compared to assembly, it's also more legible.

The other benefit of LLVM IR is its legibility. While the compiler processes IR in *binary form* (`.bc`), often referred to **LLVM bitcode**, it can be disassembled into an equivalent human-readable *textual form* (`.ll`). That means, if you want to drill down into LLVM's modular design, [and if you want to understand what any of its optimisation passes are doing to you code you absolutely can]. Running `...` will [...], or `...` to [...].

This is an aside, but - until writing this blog, I never really *got* the concept of a virtual machine. Like, I knew , I knew that LLVM was an acronym-cum-orphan initialism for Low Level Virtual Machine... but I never knew what that actually means, yknow? Well, it turns out LLVM bitcode is just machine code for a virtual machine. There isn't an Actually Existing computer architecture that'll run that bitcode instruction set, but LLVM pretends there is in order to standardise it's optimisations. With this understanding, we can broaden our definition of an **object file** as any file that contains machine code, virtual or native. `.bc` files are the virtual versions of `.o`, much like `.ll`s read as 'virtual' assembly.

![Desktop View](/assets/img/posts/2026-02-21-llvm-no-lto.png)
*<strong>The LLVM Toolchain, Revisited</strong> We now understand LLVM in terms of [...]. Crucially, compilation units can be compiled in parallel, but linking must take place on a single thread.*

So, LLVM let's you get under the hood and see the optimisations it's making, provided you can understand the IR. Well, in this blog I want to really understand what changes get made to code at link-time - so we're going to need to learn. Here's some source code from the LLVM docs themselves, with the serial numbers filed off:

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

Plugging  `clang foobar.cpp -S -emit-llvm` into your terminal, but it's . This isn't going to be the <a href="https://mcyoung.xyz/2023/08/01/llvm-ir/"><strong>gentlest</strong></a> introduction, but it'll [...].

`qux` is relatively minimal:
```llvm
define internal i32 @qux() {
    call void @baz()
    ret i32 10
}
```
{: file='foobar.ll'}

First, we `define` `@qux`, a function `internal` to `foobar.cpp` (rather than an external symbol). `@qux` in turn `call`s `@baz`, a `void` function, before `ret`urning a value of `10` itself. Really, the only difference with C++ is how we denote types. Integer types are denoted `iN`, and floating-point types `fN`, such that `int` becomes `i32`, `double` becomes `f64`, and so on. In fact, because IR is only an abstract representation of an instruction set, it doesn't need to worry about physically storing variables in a fixed number of bytes. That means `N` can be any natural number, not just a multiple of 8 - notably, Booleans are written `i1` in IR!

When we look at the IR in its totality, 

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

there are plenty of `@`s, and plenty more `%`s. These are the **sigils** LLVM prepends to user-defined symbols to indicate their scope. We've seen `@` is the prefix used for functions, but it also marks out global variables like `@i`. `%`s, on the other hand, are used for local **registers** holding top-level variables that get set exactly once. If that's true of all variables in an intermediate representation, we say it's in **static single assignment form** (SSA), an incredibly valuable property for compiler design (to find out why, <a href="https://mcyoung.xyz/2025/10/21/ssa-1/"><strong>Miguel Young</strong></a> is once again yer man).

Canny readers will already be wondering, how is it legal to `store i32 0, ptr %1` in an SSA? And here's the neat thing - it's not! The LLVM IR allows address-taken variables to be `alloca`ted, `store`d and `load`ed at will. It allows these, even though they unapologetically break SSA form; the compiler can no longer know <a href="https://llvm.org/pubs/2009-01-POPL-PointerAnalysis.pdf"><strong>"which variables are defined and/or used at each statement."</strong></a>

As a compromise, address-taken variables can only be accessed indirectly through top-level variables, using, *e.g.*, the `ptr` dialect. `ptr @i` and `ptr %1` may well be mutable integers, but the pointers stored at `@i` and `%1` will not change. I'll be honest, I struggled with . The LLVM IR is only a **partial SSA**, 

Many, if not most, of the resources I used to help me with this part gloss over the fact that LLVM is only a **partial SSA**, ... struggled with `store`, `load`, and `alloca`. 

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
Already, `@qux` has been inlined, `@i` safely simplified to a Boolean, and several registers removed. I'd also be remiss not to touch on the **phi node** added in `line 12`. Derived from the 

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

## LTO, But Better (Better Build Times, Anyway)

In terms of raw performance, thin LTO is negligibly worse: using it to build Clang 3.9, Stinnett finds a speed-up of 2.63% versus full LTO's 2.86%. The trade-off for that extra 0.23%, however, is compiling and linking with full LTO takes him 4x longer! [quality-of-life].

Mark the difference with my last set of cheat codes. CS and IR PGO [...]; there's nothing nearly so declarative here. Depending on your project, parallising LTO might not be the only way of improving your quality-of-life as a developer - but fair warning, while none of the following tricks will meaningfully worsen run-time performance versus full LTO, they're won't make it more faster either.

### Unified LTO

**Clang flags** [...]

### Fat LTO

**Clang flags** [...]

### Distributed Thin LTO (DTLTO)

Now, in Stinett's guide to LTO, he flags up three more advanced LTO concepts for the curious reader: symbol visibility, linker caching, and distributed build support. The first two we've already touched on, but what about the third? A **distributed build**...

If you're working on an extremely large project, chances are you're running **distributed builds** across a whole network of machines, with each taking responsibility for its own units of work. Full LTO, being single-threaded, also needs run on one single linker, but Thin LTO slots into a distributed system nicely. Here, machines receive their own [index files?], and can be [...]. But I digress.  

**Clang flags** [...]

## LTO && PGO

All told, the most intuitive definition of LTO I can think of is *optimisation with knowledge of all sources*. If you'd asked me the same question on my last post, I'd probably have described PGO as something like *optimisation with knowledge of how a source is used*. **These are orthogonal properties,** you can absolutely have either one without the other. And that, I think, gets us back to where we started.

![Desktop View](/assets/img/posts/2026-02-21-pgo-and-lto.png)
*<strong>Just LTO with extra profiling data, right?</strong> PGO and LTO*

The fuzzy, intuitive - *but wrong!* - read LTO unlocks "the last" optimisations we might want to run, and PGO builds on those.

Now, these two tricks *are* superficially very similar. Both [...], both [...]. Whether [LTO (via libLTO), ...], all of them use the same LLVM passes: as my colleague put it,
> I think my mistake was imagining the optimisation steps in LTO is distinct from normal compiler optimisation.

Where I think the confusion arises that "PGO is just LTO with extra steps" is, there's very rarely a reason to use PGO if you don't already have LTO enabled.

(and as should be pretty clear from the above, LTO offers more or less the exact same optimisation opportunities; all the flags laid out above exist )

The only other argument against turning LTO on immediately is undefined behaviour. Now, that's an easy thing to handwave away - I would simply write code that's well-defined, and all that - but what if you're working on a pre-existing codebase? Suppose you're, well, *me*, porting games from 10, 15, 20 years ago. As a third party chipping away at an already-existing ; some of them were written before LTO was even A Thing. Now, personally I'd still advocate for sucking it up, enabling LTO first, and slogging through the regressions one by one, but I'm not going to tell you how to live your life. 

In theory, that is. In practice, MSVC won't let you enable PGO without LTO because of how the compiler has been written; Clang and GCC, however, support either/or.