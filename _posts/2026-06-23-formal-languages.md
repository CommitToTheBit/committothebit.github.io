---
title: "Formal Languages I: "
description: ""
date: 2025-06-23 10:30:00 +0000
categories:
  - Formal Languages
tags:
  - mathematics
math: true
image:
  path: /assets/img/posts/2025-09-24-theoretical-degree-in-physics.png
comments: true
sitemap: true
published: true
---
ASCII was standardised back when JFK still had a head. This development had no real bearing on the President's decision-making in the days and weeks leading up to his assassination, and to the best of my knowledge the American National Standards Institute (ANSI, then the ASA) was never formally implicated by the Warren Commission, but yeah, sure, there's probably a conspiracy in there somewhere. For my purposes it's just an illustrative historical curiosity, one to show how long text encoding has been causing computer scientists headaches.

Of course, most blogs on this topic start with a history lesson. Usually that history lesson goes ASCII, Windows (née ANSI) code pages, Unicode - and make no mistake, we will be getting to that - but it's well-trodden ground. There's <a href="https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/"><strong>absolutely, positively</strong></a> nothing another programmer's blog is going to add to that discourse, save for the odd fun fact.

Instead, I want to treat text encodings as something of a lens,

Even further into history, back before Chomsky formulated his hierarchy of grammars, back before Turing,
## Definitions

At the most abstract, a **string** is a finite sequence of elements, chosen from a finite, non-empty set $\Sigma$. Depending on the example, it might be more intuitive to call $\Sigma$ either an *alphabet* or a *vocabulary*, its elements *symbols* or *letters* or *words*, and its strings *words* or *sentences* or *formulae*, so - fair warning - I’m going to be mixing my metaphors pretty freely. For instance, I find it most natural to describe:
- $\textrm{hello}$ and $\textrm{world}$ as words over the Latin alphabet $\{\textrm{a}, \dots, \textrm{z}\}$,
- `Hello world!` as a sentence (rather than a single word) over the ASCII alphabet { … },
- $0000$, $11$, $10000000$, $100010000000000000000$ as strings over the binary alphabet $\{0, 1\}$

Notice that this definition permits strings of length zero: mathematicians denote the so-called *empty string* with an $\varepsilon$,  whereas C++ programmers prefer  `""`.

Let's further take $\Sigma^n$ to be the set of all strings of length $n$ over $\Sigma$. The binary alphabet, for instance, has $\{0, 1\}^0 = \{\varepsilon\}$, $\{0, 1\}^1 = \{0, 1\}$, $\{0, 1\}^2 = \{00, 01, 10, 11\}$, *etc.* Defining the **Kleene operator** (or **closure**) $*$ by $$\Sigma^* = \bigcup_{n\in\mathbb{N}}\Sigma^n,$$ this represents the set of all strings over an alphabet.

In this linguistic metaphor, we now know how letters make up words, but not how those words will form a language. Truthfully, though, mathematicians leave this vague: a **language** is literally any subset $L \subseteq \Sigma^*$, with examples including
- $\{w\,|\,\textrm{\textit{w} is a word in English}\}$ is a language from the Latin alphabet,
- $\{0^n1^n\,|\,n \geq 0\}$ of the binary alphabet,
- The *empty language* $\emptyset$, and the *Kleene closure* $\Sigma^*$, of any alphabet $\Sigma$

Likewise, the $\textrm{hello}, \textrm{world} \in L$, whereas $\textrm{aaaaaaaaaaaa}, \textrm{bonjour}, \varepsilon \in \Sigma^* - L$

If you're starting to find this a little dry - yeah, there's a reason I gravitated towards applied maths throughout my degree. But! These definitions are actually about to become very, very applicable.

Because here's a question, what's a *character*?
