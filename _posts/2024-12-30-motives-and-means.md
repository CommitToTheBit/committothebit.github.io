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

There's a strong argument from [**Jimmy Maher**](https://www.filfre.net/2013/02/free-fall-part-2-murder-on-the-zinderneuf/) that the whodunnit lends itself uniquely well to game design, in that no other literary genre sees itself so explicitly "as a form of game between reader writer". There's an equally strong argument that trying to procedurally generate whodunnits is a doomed and deeply stupid venture. For a design problem with such a rich history of misfires and mistakes, from Sheldon Klein's mystery generator (1973) to *Murder of the Zinderneuf* (Free Fall Associates, 1983), you've got to ask - why do this?

I am a sucker for murder mysteries. *Five Little Pigs* unfailing makes me misty-eyed, *Knives Out* is a yearly rewatch, and I ardently believe *Return of the Obra Dinn* is one of the best things to ever happen to the genre. Between that and the *Golden Idol* series, the design space for deductive games has undoubtedly opened up in recent years, but I find both lack the simple human drama of gathering a bunch of characters in a room and letting them talk. I wanted to make a more dialogue-driven puzzle centred around that moment of the whodunnit... and not just because it's easier to write a bunch of text than it is other assets.

The other problem baked into these stories is, well, you can only really experience them once. Yes, yes, it's all good fun to reread/rewatch/replay a mystery and see all the clues hidden in plain sight, but it's not *the same* now is it? Just look at the reviews for *Obra Dinn*: you can hardly move for players wishing they could experience it for the first time again. To me, the whodunnit represents a holy grail for procedural storytelling: where players (self included) can experience similar, but not the same, puzzles as many times as they wish.*1* They have the space to learn how the generator works, and can easily look up details about it online, without having any solutions spoiled per se.

*1*Well, at least until perceptual collapse sets in. I highly recommend this short paper by Max Kreminski on the phenomenon, where they describe the experience of building a mental model of the generator from its output. I'll be the first to admit that any generator will only ever produce sp much variety - but I'll keep using the phrase "infinitely replayable" all the same.

All of this is to say, I've got a lot to write about here. In this - sporadic - series of blogs, I'm going to talk through the core features of my generator and the thinking behind them, the how and the why as it were. Some posts will be inevitably more design-focused, some more technical (it's unlikely there'll be any on the art direction, I doubt I'll have all that much to contribute in that area): I'll be writing them as much as to help myself eep track of what hasn't worked as let other devs know what has. So, without further ado...

## Representation

At its lowest level, *Bad Bohemians* is an exercise in generating logic puzzles - specifically, **Einstein puzzles**. Given $n$ forenames, $n$ surnames, *etc.*, the player is tasked each element from each category to one of $n$ different characters. The player can do this by filling up a grid with ticks and crosses; in code, they'll be replaced with closed intervals $[min,max]$.

<!-- FIXME: Figure here -->

The idea here is, we need a way of representing our puzzles and their possible solutions in a form the computer can understand. This is not a natural language processing project; the computer won't get any information out of even a clue like *Character #1 is called Abigail* as written. However, if we tag that clue with a constraint $(1, Abigail) \in [1,1]$, the code has a solver that will read this and tighten the bounds at its $(1, Abigail)$ coordinate to a minimum of $1$, and a maximum of... well, in this case, also $1$.

We won't concern ourselves with where those constraints are being written just yet, that's a problem for our text generator. What matters here and now is we've got a tried-and-tested data structure that our solver can read information into to then make deductions from. That said, this grid, while perfectly suitable for pen-and-paper Einstein puzzles, actually encodes several assumptions about which solutions may or may not be valid. In order to generate a broader and more narratively interesting range of whodunnits, we're going to need to extend our model to remove some of those limitations.

## Generalisation

Here's what I mean. Right now, we're assuming each element is used exactly once, which eliminates the possibility of mistaken identities, where, *e.g.*, two characters share the same forename. This assumption is restricting narrative possibilities; the above model needs generalised. By assigning bounds to not only 2D coordinates of $[forename, surname]$ square, but also the 1D coordinates along our $[forename]$ and $[surname]$ lines, we can surely enough bake in the possibility of forenames and surnames appearing more than once. While we're at it, we'll also go ahead and assign a bound to the point in the top left corner of Fig. A, which will represent the total number of characters in the puzzle.

<!-- FIXME: Figure with explanation of characters' uniqueness -->

As a collorary to the above, these 1D bounds can also introduce red herrings. *Bad Bohemians*' characters, for instance, are members of the landed gentry, and so each has an associated $[nobility]$. The British aristocracy has five ranks of peerage, from Dukes and Duchesses down to Barons and Baronesses, for a total of 10 possible titles. We can now comfortably include a category with more elements than our puzzle has characters, as our model now allows for elements that aren't used even once!

<!-- FIXME: Write clue in handwriting? -->
Another scenario, suppose we received the clue *Character #1 is either called Adeline, or is a Byron*.
A player might read that and decide to come back to it once they've eliminated either Adeline or Byron as an option, but what about the computer? Just as we've added 1D bounds to our model, we can just as well extend it in the other direction with a 3D grid $[character, forename, surname]$. Rather than waiting to use the clue, our solver can immediately bound all elements in the set $ $ to 0.

## Deductions

I'll get more into the code side of this in the next post.

## Limitations
