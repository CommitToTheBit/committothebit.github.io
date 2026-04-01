---
title: LTO != PGO
description: Ballooning link times for fun and profit.
date: 2026-01-13 10:30:00 +0000
categories:
  - Procedural Whodunnits
tags:
  - c++
  - llvm
  - pgo
  - lto
  - optimisation
math: true
published: false
---

> PGO is just LTO with extra profiling data, right?

**Wrong!** December, 2025: hot off my last dev talk of the year, I get asked this question by one of the leads at Feral. I've been talking about link-time optimisation (LTO), a nice, easy, one-and-done topic that (little do I know it yet) will end up rattling around the back of my head for the rest of the festive period. That's because my colleague has made me realise, I've given a whole presentation on how linking unlocks extra optimisations a compiler can't make on a per-unit basis - and completely failed to explain what those extra optimisations actually are.

Please consider this my *mea culpa*, a spiritual sequel to my post on <a href="https://sammakesgames.com/posts/pgo-but-better/"><strong>profile-guided optimisation</strong></a>. PGO, LTO, plus a third, much larger project of mine I'm not quite ready to share just yet, are conceptually very similar. I like to think of them as cheat codes for CPU optimisation; less the ABCs than the ↑↑↓↓←→←→BAs of performance engineering. They're cheating because, well, they're glorified compiler flags, and I strongly suspect what stops most devs from using them is simply not knowing they exist.

But plenty of digital ink - pixels? - have already been spilled on LTO (<a href="https://convolv.es/guides/lto/"><strong>J. Ryan Stinnett's</strong></a> being my personal favourite of the many very accessible introductions available). Much like I did with PGO, what I want to do here is walk through my own personal experience integrating the process into a build pipeline, and make explicit some subtler points I've had to read between the lines elsewhere. It'll be a bit circuitous, but by the end of this article I should have convinced you of what the Os in LTO and PGO are really doing, the way my colleague and I convinced ourselves. Oh, and while some code snippets and console commands will be specific to my compiler of choice, there's enough in here that should be relevant whatever your setup.

## But what is a Linker?

Looking at a C++ developer's toolchain, it's easy to get hung up on the compiler. It is where the magic (read: optimisation) happens. But compilers alone do not a toolchain make, they rely on **linkers** and other ancillary programs:

![Desktop View](/assets/img/posts/2026-02-20-compiler-and-linker.png)
*<strong>The toolchain</strong> transforms source code to (executable) machine code. The preprocessor, compiler, and assembler are, technically, their own programs, but I'll lump them together and call them the compiler for convenience; they aren't the part of the toolchain we're interested in today.*

Toolchains think about a project in terms of **compilation units**, which in C++ are just its `.cpp` source files. At compile time, sources get lowered, unit by unit, into independent **machine code** binaries native to your desired instruction set (x86, ARM, *etc.*). The linker is what then takes their native object files (`.o`) and merges them together. Whether returning an executable (`.exe`) or maybe a library (`.dll`), this last step is machine code in, machine code out.

Now, when we talk about linking object files, we're linking them by their **symbols**. These are any named entities in a program that get attached to a fixed memory location - *e.g.* functions and class methods, global and static variables - many of which will be **externally visible** beyond the scope of their own compilation unit. When externals are referenced elsewhere it's the linker that matches them to their definitions, a process known as <a href="https://chessman7.substack.com/i/164431639/symbol-resolution-in-action"><strong>symbol resolution</strong></a>.

While they will attempt some amount of *dead code stripping*, compilers evaluate each unit in isolation. Only at link time, with a global view of the executable, can we spot unused externals and remove them. Linkers are also responsible for resolving *relocations* using newly-finalised runtime memory addresses, but I'll refer you to <a href="https://mcyoung.xyz/2021/06/01/linker-script/"><strong>Miguel Young</strong></a> for the further reading there. Crucially, compile-time optimisations run in parallel, whereas we only unlock these further 'whole program' capabilities by linking on a single thread.

## LLVM, Revisited

If you read *PGO, But Better*, you might remember I introduced Clang as my go-to compiler, the one I'll be writing these blogs about. You might also remember that it's the C/C++ frontend of the LLVM compiler infrastructure, translating source code into an **intermediate representation (IR)** on which the middle-end performs a series of language-agnostic passes. And if you remember that after optimisation, the backend translates the IR again, it's no great shock that this is where we return a bunch of instruction set-specific object files, ready for linking.

For a blog about link-time optimisations (we're getting there, I promise) what may come as a surprise is our choice of linker barely matters. LLVM's [**lld-link**](https://lld.llvm.org/windows_support.html) writes executables in the Common Object File Format **COFF**, a binary file format that runs on Windows, [**ld.ldd**](https://man.archlinux.org/man/extra/lld/ld.lld.1.en) the Executable and Linkable **ELF** Format targeting Linux/Android, and [**ld64.ldd**](https://llvm.org/devmtg/2022-05/slides/2022EuroLLVM-LLD-for-Mach-O.pdf) the **Mach-O** Mach Objects for macOS/iOS. Any such flavour of the LLD subproject - and for that matter, any of the respective system linkers they [**were designed to replace**](https://lld.llvm.org/) - will slot into the LLVM toolchain as below:

![Desktop View](/assets/img/posts/2026-02-21-llvm-no-lto.png)
*<strong>No LTO</strong> LLVM's default build pipeline. Sources are compiled in parallel, then linked into a final executable... but what are those `*.bc` files?*

### LLVM IR

Intermediate representations are abstractions of source code, used to write easily retargetable compilers. Let's say you're a compiler engineer, and you want to lower any of $n$ source languages to any of $m$ instruction sets. Rather than building $n \times m$ compilation pipelines start to finish, with a set of optimisation passes mapping IR to IR you'll only need a single, language- and machine-agnostic middle-end. Once this transformation step is squared away, the $n$ frontends and $m$ backends it'll then take to translate to and from IR can be written independently of one another, your workload increasing with $\mathcal{O}(n+m)$ instead of $\mathcal{O}(n \times m)$ as you extend the compiler further.

Beyond this *raison d'être*, the LLVM IR tries to complement its surrounding compiler infrastructure. While it is not uncommon for a compiler to use [**several different IRs to get from source code to native machine code**](https://cs.lmu.edu/~ray/notes/ir/), the LLVM middle-end is designed for modularity and therefore uses the same IR at every pass. Granted, the syntax of LLVM IR is already more legible than assembly (let alone other IRs!), but as <a href="https://www.cs.cornell.edu/~asampson/blog/llvm.html"><strong>Adrian Sampson</strong></a> points out, it certainly can't hurt that the curious programmer playing about with optimisation passes only needs one language throughout. The compiler processes this in its *binary form* (`.bc`), often referred to **LLVM bitcode**, but it can also be disassembled to an equivalent human-readable *textual form* (`.ll`) by `llvm-dis` (and reassembled with `llvm-as`).

A quick aside - until writing this blog, I never really got the concept of a virtual machine. 

With this understanding, we can broaden our earlier definition of an **object file** to include any file that contains machine code, virtual or native. `.bc` files are the virtual versions of `.o`s, much like `.ll`s read as quote-unquote *virtual* assembly. When compiling with `clang -S` or `clang -c", adding an extra `-emit-llvm` <a href="https://clang.llvm.org/docs/ClangCommandLineReference.html#id3"><strong>flag</strong></a> will indeed return the IR analogue of an assembler or object file, respectively.

When running Clang with its (clang command line reference) `-S` or `-c` flags, adding an extra `-emit-llvm` to the command line will return the 


Indeed, whereas `clang foobar.cpp -` 

 As such, it makes sense that when compiling with an `-emit-llvm` flag, `-c` and `-S` return us LLVM IR in binary and textual forms, respectively.

[...]

Well, it turns out LLVM bitcode is just machine code for a virtual machine. There isn't an Actually Existing computer architecture that'll run that bitcode instruction set, but LLVM pretends there is in order to standardise its optimisations. 

Now, this isn't going to be the <a href="https://mcyoung.xyz/2023/08/01/llvm-ir/"><strong>gentlest</strong></a> introduction out there, but we can start out nice and slow. Let's translate a trivial C++ function to IR:
```c++
static int qux()
{
    baz();
    return 10;
}
```
{: file='*.cpp'}
```llvm
define internal i32 @qux() {
    call void @baz()
    ret i32 10
}
```
{: file='*.ll'}

In both languages, we `define` `@qux`, a function `internal` to the source file (rather than an external symbol). `@qux` in turn `call`s `@baz`, some other `void` function, before `ret`urning a value of `10` itself. Really, the only difference with C++ is how we denote types. Integer types are denoted `iN`, and floating-point types `fN`, such that `int` becomes `i32`, `double` becomes `f64`, and so on. In fact, because IR is only an abstract representation of an instruction set, it doesn't need to worry about physically storing variables in a fixed number of bytes. That means `N` can be any natural number, not just a multiple of 8 - notably, Booleans are written `i1` in IR!

So far, so good, yeah? Filling in the rest of the compilation unit...
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

This is not a terribly novel snippet of code: I found it in the <a href="https://llvm.org/docs/LinkTimeOptimization.html#example-of-link-time-optimization"><strong>LLVM docs</strong></a> and filed the serial numbers off. Adding an extra `-emit-llvm` flag to clang's command for generating assembly, `clang foobar.cpp -emit-llvm -S` returns `foobar.ll` as the 'assembled' textual form of IR (minus some metadata removed for clarity):

```llvm
@i = internal global i32 24

define i32 @foo() {
    %1 = alloca i32
    store i32 0, ptr %1
    %2 = load i32, ptr @i
    %3 = icmp slt i32 %2, 0
    br i1 %3, label %qux, label %add42

qux:
    %4 = call i32 @qux()
    store i32 %4, ptr %1
    br label %add42

add42:
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
There are plenty of `@`s here, and plenty more `%`s. These are the **sigils** LLVM prepends to user-defined symbols to indicate their scope. We've seen `@` is the prefix used for functions, but it also marks out global variables like `@i`. `%`s, on the other hand, are used for local **registers** holding top-level variables that get set exactly once. If that's true of all variables in an intermediate representation, we say it's in **static single assignment form** (SSA), an incredibly valuable property for compiler design (to find out why, <a href="https://mcyoung.xyz/2025/10/21/ssa-1/"><strong>Miguel Young</strong></a> is once again yer man).

Canny readers will already be wondering, how is it legal to `store i32 0, ptr %1` in an SSA? And here's the neat thing - it's not! The LLVM IR allows address-taken variables to be `alloca`ted, `store`d and `load`ed at will. It allows these, even though they unapologetically break SSA form; the compiler can no longer know <a href="https://llvm.org/pubs/2009-01-POPL-PointerAnalysis.pdf"><strong>"which variables are defined and/or used at each statement."</strong></a>

As a compromise, address-taken variables can only be accessed indirectly through top-level variables, using, *e.g.*, the `ptr` dialect. `ptr @i` and `ptr %1` are mutable integers, but the pointers stored at `@i` and `%1` will not change. That makes LLVM IR a **partial SSA**. It is reasonable, I think, that most blogs gloss over this distinction, but it's *the* detail I needed to make the syntax click. Trying to satisfy myself `store` could exist in a true SSA was shunting a square peg into a round hole.

Another important feature of the IR is the **control flow** by which a program executes instructions - but before we get to that, I'll let you in on a dirty secret. *Your CPU has a fetish.* Your CPU has a fetish, specifically, for running code in order, and **basic blocks** are the maximal units of code for which this is actually possible. Each one consists of some sequence of instructions executed top to bottom as written on the page, its last a singular **terminator** redirecting the control flow to another block.

![Desktop View](/assets/img/posts/2026-03-23-llvm-control-flow-graph.png)
*<strong>Control Flow Graphs</strong> `@foo` has three blocks: the start of the function (denoted `%0` in LLVM IR), `%qux`, and `%add42`. These form a CFG.*

Branches, function calls, *etc.*, are the (directed) edges that connect basic blocks into a **control flow graph (CFG)**, which LLVM encodes with its terminator instructions. `ret` we've already discussed, that counts as a terminator because it returns us to wherever we came from on the stack. `br`, meanwhile, signifies branching. `br i1 %3, label %qux, label %add42` is a bog-standard if/else statement. It might be more surprising to know `br` also has an unconditional form: `br label %add42` always takes us to block `%add42`,

Incidentally, basic blocks help make sense of what's going on with `int data`. It is, I'm sure, quite strange that a local variable we never take the address of nevertheless needs stored as an address-taken variable in `@foo`. Now, we see that if `%0` instead initialised `%1 = 0` and `%qux` still set `%4 = call i32 @qux()`, `%add42` would have no way of knowing which register to `add nsw i32` with `42`!

There's one last bit of syntax in the <a href="https://llvm.org/docs/LangRef.html"><strong>LLVM LangRef</strong></a> I'd like to talk about, but you won't find it in the example above. Luckily, we can recompile `foobar.cpp` with an extra `-O2` flag to tease it out...
```llvm
@i = internal global i1 false

define i32 @foo() {
    %1 = load i1, ptr @i
    br i1 %1, label %qux, label %add42

qux:
    tail call void @baz()
    br label %3

add42:
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
Already, `@qux` has been inlined, `@i` safely simplified to a Boolean, and several registers removed. However, where I really want to draw your attention is the **phi node (Φ)** added in `line 12`. This functions like a switch statement, conditioned on the predecessor block in the control flow. `%2` is set to `42` if we've jumped directly from `line 5` into `%add42`, but `52` should we be routed through `%qux` first. A basic block might have any number of phi nodes, but they must always be grouped together at the top of their chunk of code (*i.e.* before a single non-phi instruction is called).

Because they only link a basic block's registers to their predecessors, phi nodes are better thought of as called along the edges of a CFG than within the blocks themselves.<sup>1</sup> They are fake operations, in a very technical sense. I mean, Kenneth Zadeck, who along with Barry Rosen and Mark Wegman <a href="https://www.cs.wustl.edu/~cytron/cs531/Resources/Papers/valnum.pdf"><strong>proposed SSA in 1988</strong></a>, all but admits to choosing the name Φ because it was <a href="https://compilers.cs.uni-saarland.de/ssasem/talks/Kenneth.Zadeck.pdf#page=40"><strong>more publishable</strong></a> than saying "phony functions" outright. I've even seen some sources transliterate Φ as the Greek letter *for* phony - but that part's a false etymology, they're just soundalikes. Ironic.
<p style="line-height:1.25"><sup><sup>1</sup> This formalism is completely equivalent to the <a href="https://github.com/llvm/llvm-project/blob/main/mlir/docs/Dialects/LLVM.md#phi-nodes-and-block-arguments"><strong>block arguments</strong></a> preferred by more modern IRs.</sup></p>

## Link-Time Optimisations (LTO)

Congratulations, you've now read your first IR! Granted, if you're not a compiler engineer, it's probably not a language you'll ever need to be fluent in.
Nevertheless, it has its niche in your programmer's toolbox, worth picking out and dusting off every now and then to see how an extra flag is changing your code.

But this is still a blog about LTO; we need a second source with which to link.
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
Here, we can expect the linker to recognise `bar` as an unused external and strip it accordingly. However, it won't infer that `i` is never changed, that `%qux` and therefore `@baz` become inaccessible, that `main` will not never return a value of `42`. Those are the extra **link-time optimisations (LTO)** this section is dedicated to.

The reason we don't mind which linker we're using is - plot twist! - it's not the linker that'll be making our optimisations. The LLVM project contains a separate tool, **libLTO**, that manages...

In LLVM specifically, the linker dispatches its extra work to **libLTO**. This is a wrapper for the optimisation passes of the LLVM middle-end, a shared object integrated with LLD and its alternatives. If there's one idea I want to get across with this blog, it's this: the linker makes more or less the same optimisations across *multiple* sources that compiler does within *each* source.

### Full LTO

The naive implementation of LTO is, weirdly, also the best. This is **full LTO**, and I tend to think of it as the 'correct' way to go about these optimisations.

![Desktop View](/assets/img/posts/2026-02-21-llvm-full-lto.png)
*<strong>Full LTO</strong>* By compiling our sources as,

```
$ clang foobar.cpp -c -O2 -flto
$ clang main.cpp -c -O2 -flto
$ clang foobar.o main.o -flto -Wl,-plugin-opt=save-temps -o main
```
we receive a snapshot of the `main.bc` IR at every steps of the full LTO process. The first of these, `main.preopt.bc` shows us the IR for the two files when they've just been merged. Disassembling with `$ llvm-dis main.preopt.bc -o main.preopt.ll`, we confirm `bar` is stripped, but little else.

```llvm
@i = internal global i1 false,
@s = private unnamed_addr constant [13 x i8] c"Hello world!\00"

define i32 @main() {
    %1 = tail call i32 @foo()
    ret i32 %1
}

define i32 @foo() {
    %1 = load i1, ptr @i
    br i1 %1, label %qux, label %add42

qux:
    tail call void @_Z3bazv()
    br label %add42

add42:
    %2 = phi i32 [ 42, %0 ], [ 52, %qux ]
    ret i32 %2
}

define void @baz() {
    %1 = tail call i32 (ptr, ...) @printf(ptr @.s)
    ret void
}
```
{: file='main.preopt.ll'}

A fully LTO'd `main.opt.ll` also behaves as we'd expect:
```llvm
define i32 @main() {
    ret i32 42
}
```
{: file='main.opt.ll'}

Full LTO is the 'true' form of LTO, but it isn't always feasible. What we've seen above it, after that first pass through the linker, libLTO has to run <a href="https://www.cs.cmu.edu/afs/cs/academic/class/15745-s13/public/lectures/L3-LLVM-Overview-1up.pdf#page=10"><strong>20-odd</strong></a> of the usual optimisation passes on the monolithic module we've merged our IRs into - all on a single thread. At best impractical, at worst unusable, these extra optimisations will slow your link times to a crawl (and that's assuming so large a `monolithic.bc` will even fit in memory). Surely, surely, there's a compromise to be found between performance and quality-of-life?

**Clang flags** `-flto[=full]`

### Thin LTO

The funny thing <a href="https://llvm.org/devmtg/2015-04/slides/ThinLTO_EuroLLVM2015.pdf"><strong>Teresa Johnson and Xinliang David Li</strong></a> noticed about LTO is, well, there's not all that many symbols libLTO really cares about at link time. **Thin LTO** generates a compact summary of each compilation unit, which can be "thinly linked" much faster than full object files. During the think link, the summaries are joined together as a single index upon which we can quickly perform further global analyses, and determine which external functions will be imported into each `*.bc` file before passing it to libLTO.

**Function importing** is designed to import only those functions that would (likely) be inlined by full LTO, and ignore those that would (likely) be ignored. This means 

During the thin link, the summaries are joined together as a monolithic *index* used for global analyses,


That means, rather than a single, monolithic `*.bc`, 

![Desktop View](/assets/img/posts/2026-02-21-llvm-thin-lto.png)
*<strong>Thin LTO</strong>*

What we see above is a clear 


**Clang flags** `-flto=thin`

## LTO, But Better (Better Build Times, Anyway)

In terms of raw performance, thin LTO is a negligible downgrade: using it to build Clang 3.9, Stinnett finds a speed-up of 2.63% versus full LTO's 2.86%. The trade-off for that extra 0.23%, however, is compiling and linking with full LTO takes him 4x longer! As benchmarks go, it paints an instructive picture of what 'better' LTO looks like.

With my last post, I wanted to highlight various cheat codes for PGO, and get in to how, when, and why they complement each other. This time around, I'm working backwards. Full LTO is, by definition, the most performant LTO can get: if you want to eke out improvements across sources, you won't do better than optimising every compilation unit with knowledge of every other compilation unit. Its variants are instead designed around reducing build times without shifting (too much of) that sluggishness onto the end user. Depending on your project, parallelising with thin LTO might not be the only way of bettering your quality-of-life as a developer - but temper your expectations, while none of the following tricks should meaningfully worsen run-time performance versus full LTO, they're not going to make it faster either.

### Linker Caching

The corollary to this is, thin LTO is also incremental. Full LTO merges all of its compilation units into a single module, so whenever any of those sources are edited, the full libLTO step needs rerun. If you edit a source without changing its index files, however, thin LTO can skip this. It will still need to...

Now, . Further flags for "pruning" the cache size [**are also available.**](https://clang.llvm.org/docs/ThinLTO.html#cache-pruning)

**lld-link flags** `/lldltocache:<path/to/cache>`

**ld.lld flags** `-Wl,--thinlto-cache-dir=<path/to/cache>`

**ld64.lld flags** `-Wl,-cache_path_lto,<path/to/cache>`
### Unified LTO

**Clang flags** `-funified-lto`

### Fat LTO

Take it one step further, even: if you can defer , . This is, again, useful

**Clang flags** `-ffat-lto-objects`

### Distributed Thin LTO (DTLTO)

Now, in Stinett's guide to LTO, he flags up three more advanced LTO concepts for the curious reader: symbol visibility, linker caching, and distributed build support. The first two we've already touched on, but what about the third? A **distributed build**...

If you're working on an extremely large project, chances are you're running **distributed builds** across a whole network of machines, with each taking responsibility for its own units of work. Full LTO, being single-threaded, also needs run on one single linker, but thin LTO slots into a distributed system nicely. Here, machines receive their own [index files?], and can be [...]. But I digress.  

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