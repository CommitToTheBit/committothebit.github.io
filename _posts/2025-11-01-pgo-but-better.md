---
title: "PGO, But Better"
description: "Finding free performance down the back of the sofa."
date: 2025-09-24 12:00:00 +0000
categories: [Procedural Whodunnits]
tags: ["devlog", "godot", "cmake", "c++"]
math: true
---

Let's talk branch prediction. Don't worry if you don't know what that is. Honestly, don't worry if you don't know what <strong>anything</strong> in C++ is.

My own ulterior motive for this is...

But back to what I was saying: *branch predictions*.

## Performance-Guided Optimisations (PGO)

To understand how this is possible, it's useful to take a step back and look at how clang actually compiles your source code.

### Front-End (FE) PGO

### Intermediate Representation (IR) PGO

### Context-Sensitive (CS) PGO

## Link-Time Optimisations (LTO)

## Post-Link Optimisations (PLO)

### BOLT, a Binary Optimisation and Layout Tool