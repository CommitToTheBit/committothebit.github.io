---
title: Unicode Headaches
date: 2026-06-02 10:30:00 +0000
tags:
math: true
image:
  path: /assets/img/posts/2025-09-24-theoretical-degree-in-physics.png
comments: true
published: false
---
ASCII was standardised back when JFK still had a head. This development had no real bearing on the President's decision-making in the days and weeks leading up to his assassination, and to the best of my knowledge the American National Standards Institute (ANSI, then the ASA) was never formally implicated by the Warren Commission, but yeah, sure, there's probably a conspiracy in there somewhere. For my purposes it's just an illustrative historical curiosity, one to show how long text encoding has been causing computer scientists headaches.

Of course, most blogs on this topic start with a history lesson. Usually that history lesson goes ASCII, Windows (née ANSI) code pages, Unicode - and make no mistake, we will be getting to that - but it's well-trodden ground. There's <a href="https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/"><strong>absolutely, positively</strong></a> nothing another programmer's blog is going to add to that discourse, save for the odd fun fact.

Where I don't think there's quite so much discussion going on is how text encodings intersect with C++. At work I've recently ventured beyond the sunny, Mediterranean climes of latin-1 and out into the world of **text localisation**. My hope is to leave some way points, a cairn here and there, on what how I've gone about parsing variable-length encodings of `std::string`s safely and efficiently.

## Text Encodings

What is a character? What is a character of text? "I know it when I see it."

### ASCII

#### Code Pages

but as we'll see, latin won.

### Fixed-Length Encodings, and the Universal Character Set

#### UCS-2

#### UCS-4

### Variable-Length Encodings, and Unicode

#### UTF-16

#### UTF-8

## std::string

The other piece of this puzzle is the C++ of it all, the `std::string`.

## Parsing Unicode

If you store a UTF-8 encoding in an std::string, std::string::operator[] returns the nth code unit, **not the nth code *point***. Then, lay out example in a code snippet.

Lay out template for, e.g., getting a substring, as a second example.

But would you want O(1) access to a code point? Find meaningful example *or* return genuinely never.

End with a table of computational complexities?

