---
title: "Procedural Whodunnits #1, Motives and Means"
description: "Or, Agatha Christie was actually pretty formulaic too when you think about it."
date: 2024-12-30 23:01:00 +0000
categories: [Procedural Whodunnits]
tags: ["devlog", "procgen"]
math: true
image:
  path: /assets/img/posts/2024-07-27-toggling-clues.png
  lqip: data:image/webp;base64,UklGRpoAAABXRUJQVlA4WAoAAAAQAAAADwAABwAAQUxQSDIAAAARL0AmbZurmr57yyIiqE8oiG0bejIYEQTgqiDA9vqnsUSI6H+oAERp2HZ65qP/VIAWAFZQOCBCAAAA8AEAnQEqEAAIAAVAfCWkAALp8sF8rgRgAP7o9FDvMCkMde9PK7euH5M1m6VWoDXf2FkP3BqV0ZYbO6NA/VFIAAAA
  alt: July 27, 2024. An early set of procedurally generated clues, being used to fill in an Einstein puzzle.
---

There's a strong argument to be made that the whodunnit lends itself uniquely well to game design, with no other literary genre seeing itself so explicitly "as a form of game between reader writer" ([**Maher**](https://www.filfre.net/2013/02/free-fall-part-2-murder-on-the-zinderneuf/), 2013). There's an equally strong argument that trying to procedurally generate whodunnits is a doomed and deeply stupid venture. For a design problem with such a rich history of misfires and mistakes, from Sheldon Klein's mystery generator (1973) to *Murder of the Zinderneuf* (Free Fall Associates, 1983), it's reasonable to ask - why do this?

I'll be honest, I am a sucker for murder mysteries. *Five Little Pigs* unfailing makes me misty-eyed, *Knives Out* is a yearly rewatch, and I ardently believe *Return of the Obra Dinn* is one of the best things to ever happen to the genre. Between that and the *Golden Idol* series, the design space for deductive games has undoubtedly opened up in recent years, but I find both lack the simple human drama of gathering a bunch of characters in a room and letting them talk. I wanted to make a more dialogue-driven puzzle centred around that moment of the whodunnit... and not just because it's easier to write a bunch of text than it is other assets.

The other problem baked into these stories is, well, you can only really experience them once. Yes, yes, it's all good fun to reread/rewatch/replay a mystery and see all the clues hidden in plain sight, but it's not *the same* now is it? Just look at the reviews for *Obra Dinn*: you can hardly move for players wishing they could experience it for the first time again. To me, the whodunnit represents a holy grail for procedural storytelling: where players (self included) can experience similar, but not the same, puzzles as many times as they wish.*1* They have the space to learn how the generator works, and can easily look up details about it online, without having any solutions spoiled per se.

*1*Well, at least until perceptual collapse sets in. I highly recommend this short paper by Max Kreminski on the phenomenon, where they describe the fun of building a mental model of the generator. I'll be the first to admit that [...] - but I'll keep using the phrase "infinitely replayable" all the same.

All of this is to say, I've got a lot to write about here. In this (likely sporadic) series of blogs, I'm going to talk through the core features of my generator and the thinking behind them, the how and the why as it were. Some posts will be inevitably more design-focused, some more technical (it's unlikely there'll be any on the art direction, I doubt I'll have all that much to contribute in that area), but all of them should [...]. Shall we?

## Representation

At its lowest level, *Bad Bohemians* is an exercise in generating logic puzzles - specifically, **Einstein puzzles**. Given $n$ forenames, $n$ surnames, *etc.*, the player is tasked each element from each category to one of $n$ different characters. The player can do this by filling up a grid with ticks and crosses; in code, they'll be replaced with closed intervals $[min,max]$.

<!-- FIXME: Figure here -->

The idea here is, we need a way of representing our puzzles and their possible solutions in a form the computer can understand. This is not a natural language processing project; the computer won't get any information out of even a clue like *Character #1 is called Abigail* as written. However, if we tag that clue with a constraint $(1, Abigail) \in [1,1]$, ...

## Generalisation

Here's what I mean. Right now, we're assuming each element is used exactly once, which eliminates the possibility of mistaken identities, where, *e.g.*, two characters share the same forename. This assumption is restricting narrative possibilities; the above model needs generalised. By assigning bounds to not only 2D coordinates of $[forename, surname]$ square, but also the 1D coordinates along our $[forename]$ and $[surname]$ lines, we can surely enough bake in the possibility of forenames and surnames appearing more than once. While we're at it, we'll also go ahead and assign a bound to the point in the top left corner of Fig. A, which will represent the total number of characters in the puzzle.

<!-- FIXME: Figure with explanation of characters' uniqueness -->

As a collorary to the above, these 1D bounds can also introduce red herrings. *Bad Bohemians*, for instance, $[title]$.

<!-- FIXME: Write clue in handwriting? -->
Another scenario, suppose we received the clue *Character #1 is either called Adeline, or is a Byron*.
A player might read that and decide to come back to it once they've eliminated either Adeline or Byron as an option, but what about the computer? It makes sense to extend to a 3D grid $[character, forename, surname]$

## Deductions

I'll get more into the code side of this in the next post.

## Limitations
