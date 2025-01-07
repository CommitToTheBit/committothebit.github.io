---
title: "Procedural Whodunnits #1, Motives and Means"
description: "Or, Agatha Christie was actually pretty formulaic too when you think about it."
date: 2024-12-30 23:01:00 +0000
categories: [Procedural Whodunnits]
tags: ["devlog", "procgen"]
math: true
image:
  path: /assets/img/posts/2024-Jul-27-toggling-clues.png
  lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
  alt: July 27, 2024. An early set of procedurally generated clues, being used to fill in an Einstein puzzle.
---

There's this old blog post by [**Jimmy Maher**](https://www.filfre.net/2013/02/free-fall-part-2-murder-on-the-zinderneuf/)...

A little bit about me first: I am a sucker for murder mysteries.

## Representation

At its lowest level, this game is an exercise in generating logic puzzles - specifically, **Einstein puzzles**. Given $n$ forenames, $n$ surnames, *etc.*, ...

## Generalisation

the 2D coordinates of $[forename, surname]$ square, but our $[forename]$ and $[surname]$ lines.
While we're at it, we'll also go ahead and assign a bound to the point in the top left corner of Fig. A, which will represent the total number of characters in the puzzle.

Not only does loosening these bounds allow repetitions, but also red herrings. *Bad Bohemians*, for instance, $[title]$.

<!-- FIXME: Write clue in handwriting? -->
Another scenario, suppose we received the clue *Character #1 is either called Adeline, or is a Byron*.
A player might read that and decide to come back to it once they've eliminated either Adeline or Byron as an option, but what about the solver? It makes sense to extend to a 3D grid $[character, forename, surname]$

## Limitations
