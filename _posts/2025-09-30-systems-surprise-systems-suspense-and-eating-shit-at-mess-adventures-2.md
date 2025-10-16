---
title: "Systems Surprise, Systems Suspense, and Eating Shit at Mess Adventures 2"
date: 2025-09-24 12:00:00 +0000
tags: ["design", "systems design", "procgen"]
math: true
image:
  path: /assets/img/posts/2025-09-24-theoretical-degree-in-physics.png
---

Here's a question, what's the funniest joke you've seen a game pull off? What about the most impressive - is that the same? I have fond memories playing *Fallout: New Vegas* as a preteen, right in that sweet spot where a single bit of media could rewire my entire sense of humour (*Arrested Development* and the Cornetto trilogy were other such offenders). Half of, say, Fantastic's lines could just as easily have come from a Gob Bluth or a Gary King. "They asked me how well I understood theoretical physics. I said I had a theoretical degree in physics" is a great gag, but it's one told with the same techniques of wordplay and characterisation afforded to film and TV. Are there other, subtler ways of telling jokes exclusive to an interactive medium?

![Desktop View](/assets/img/posts/2025-09-25-sisyphus-is-happy.png)

Early on in the roguelike *Hades*, you'll likely run into Supergiant's take on Sisyphus: a cheery chap with an even cheerier boulder (just look at that big fella's winning smile!). You'll just as likely pick up on the allusion to that old philosophical question, is Sisyphus happy? More than cheap reference humour, this is the game taking its genre conventions and using them to gently poke fun at you, the player. After all, how could any roguelike *not* characterise Sisyphus like this? If there was no meaning to be found in a repetitive and unending task - you wouldn't be playing, would you? The worst thing one can to a joke is over-explain it, but I do want to tie in to the philosophy of humour here. For Schopenhauer, humour is "the suddenly perceived incongruity between a concept" and the real". Conceptually, that Sisyphus could be happy is absurd; in reality, you are; ergo, funny.

...But how does any of that make <a href="https://youtu.be/C6119Q9pDAk?t=478"><strong>this</strong></a> a joke?

{% include embed/youtube.html id='C6119Q9pDAk' %}

*Mess Adventures* is an extremely mean platformer. It is also, with little dialogue or writing at all, extremely funny. Where 

streamer and mess-adventurer Tom Walker so eloquently puts it: *i knew it i knew do you see do you see they changed the fucking layout they ththththththey took it away.*

## Surprise! It's a Systems Design blog

Okay, big glaring caveat before I go any further: I am not a systems designer. I am even less an authoritative voice on systems design. What I am is a programmer, and as a programmer I do believe it's my responsibility to approach my work with at least some degree of media literacy - especially as it relates to the systems I'm personally implementing. So in this post, I thought I'd share two recent concepts, *systems surprise* and *systems suspense*, and use them as a lens to better understand more of my own experiences with comedy and games.

Let's start by thinking about games in the abstract (this section is shamelessly cribbed from the seminal <a href="https://polarisgamedesign.com/2023/understanding-systems-suspense/"><strong>Understanding Systems Suspense</strong></a>, so feel free to skip ahead if you're already familiar). A videogame is a formal, computational system, governed by its rules and processes. The player can't know these rules for certain - not without access to the codebase - so must reverse engineer them by making inputs and interpreting their outputs... playing the game, in other words. We'll define a <strong>mental model</strong> as the framework the engineers that maps their understanding of how the game operates.

Mental modelling is best understood as a continuous process. Influenced by publicity, franchise/genre history, *etc.*, player expectations start to form long before booting up a game, and continue to develop long after completing its tutorial. *Understanding Systems Suspense* is interested in how two key qualities of a mental model evolve with time:
- <strong>Shape</strong> The set of rules and processes that describe a game. We can think of it as a boundary in possibility space, separating what is possible from what isn't.
- <strong>Fidelity</strong> A player's confidence is in the shape of their mental model. Where the boundary is clear, the player believes they understand a game's ruleset; where it is fuzzy, they are able to reverse engineer several such (contradictory) possibilities.
As an aside, authors such as... Florence Smith-Nicholls? Max Kreminski? argue that building this mental model *is* the gameplay experience.

![Desktop View]()
*<strong>Mental Models</strong>*

We're now ready to define <strong>systems surprise</strong> as *a sharp and sudden change in the shape of a player's mental model into a new and noticeably different one*. 

Examples of systems surprise include can range from the genre-shattering swings taken by games like *Fez* and *Inscryption*, right down to staples like mimic chests and dreaded second healthbars.

![Desktop View]()
*<strong>Systems Surprise</strong> By contrast, content surprise only changes: it might add*

Systems suspense, on the other hand, is a matter of *fidelity*. Along . Others points will be more fuzzy, where
We therefore arrive at our last key definition, that systems suspense is

![Desktop View]()
*<strong>Systems Suspense</strong>*

*Understanding Systems Suspense* go on to give a rundown of several reasons a designer might include 

(and I'm quite excited cos I really haven't seen this anyone writing about this before) - getting a laugh.

## Embedding Humour with Systems Surprise

Systems surprise is, in Schopenhauer's terms, the sudden perception of incongruity between a mental model and the actual rules of a game. As we saw in Mess *Adventures*,

In this case, systems surprise is acting alone as the ludic equivalent of a one-liner: the player's mental model snaps from one well-defined shape (one where the ground cannot simply disappear out from under them) to another (one where it can). There's not a change in fidelity here, since the moment is, on a systemic level, self-contained. Systems surprises lend themselves to jokes <strong>embedded</strong> by the designer.

An even more elementary example is *Scary Maze Game*. The player would expect their win condition to be completing a series of mazes, but in reality their is only one level, and no way of winning - a reality that comes suddenly, shockingly, and hilariously into focus when the jumpscare comes. In mental modelling terms,

But comedy doesn't begin or end with punchlines. If you've ever heard Norm Macdonald's <a href="https://www.youtube.com/watch?v=jJN9mBRX3uo"><strong>moth joke</strong></a>, you'll know how much craft goes in to setting up a joke, how much tension can be wrung out of the fact you just can't tell where it's going. Suspense is followed by surprise; the audience's anticipation of the punchline heightens the eventual moment of release. This too is an affordance of both content and systems, especially in the case of puzzlers.

Perhaps surprisingly, 

Puzzle games especially lend themselves to telling this type of joke on a systemic level. They're already built around the release of a satisfying solution - so what if 

(its no coincidence that both installments of *Mess Adventures* pastiche *Baba Is You* at several points). And once again, my favourite example is from the heyday of Adobe Flash...

![Desktop View](/assets/img/posts/2025-10-09-dont-touch-blue.png)
*<strong>Impossible to Replicate</strong> To get from A to B in question 5 of The Impossible Quiz, the player has to completel disengage with the systems of the game and move their mouse around the outside of its window - a joke that incidentally did not translate to mobile ports on account of touchscreens. The medium is the message, eh?*

## Emergent Humour and Systems Suspense

When *Understanding Systems Suspense* talks about how suspense can manifest *without* surprise, they characterise it as a "dawning realization... notable for how much it allows a player to look back on their past experiences in a new light". That feeling of dawning realisation, it doesn't strike me as an conducive to telling jokes... or at least, it didn't until I circled back to *Arrested Development*. In its heyday, the sitcom was notorious for how far in advance it'd telegraph certain punchlines. What makes the sight gags I'll only catch on a second or third or seventh rewatch so funny is not so much the jokes themselves, but the fact they've been staring me in the face the whole time.

Replaying games can create a similar sort of suspense. If you've ever revisited an RPG, I'm willing to bet you've tried seeing just how much of a horrible git you can be the second time around. Even in Fallout: New Vegas, where going all-in on Caesar's Legion can be played completely straight, mapping out the fuzzy edges of the narrative and seeing just how much of a mess you can make... playing like that strikes me as inherently *funny*. Maybe I've spent too long in the Mojave Wasteland, though.

My grander point here is, in the same way that games might have "obviously wrong" choices at the content level, so too can their mechanics be engaged with wrong altogether. Dr Merlin Seller has a really insightful blog about 
href="https://www.dearplayer.org/blog/2017/3/22/dear-player-inaction-in-an-interactive-medium"><strong>inaction in games</strong></a>, where she plays through the entirety of *Batman: The Telltale Series* in stony silence. Every dialogue choice has a timer attached to it, so she let's every choice time-out, saying nothing. There is humour in Batman's individual (non)responses, but more wrung out of the fact the game is just fine with this.

I would argue that the systemic analogy to this, where the player 

To me at least, it seems 

Whereas systems surprise (with or without the help of suspense) lends itself to top-down, embedded humour, here it is <strong>emergent</strong>, arising bottom-up. It would have to be, really, seeing as subversive play can really be prescribed by a designer. Liam Mitchell has written at length on the topic, but subversive play is...

Another example: Gervais%.  opening your third eye and driving your close personal friend Niko Bellic to the nearest in sub-60. Probably.

Take it one step further than that, even - forget subversive play, let's talk straight up glitches. Games are held together with sticky tape, JIRA tickets, and dreams.
Is committing unsafe code really a radical act of systems design? Fuck it, sure, that's what I'll be telling my boss in my next performance review.

## Closing Notes

Right, that' s

- <strong>Changing the rules of a game midway is, inherently. *very funny*.</strong>
- <strong>The player's experience of systems doesn't begin or end with what </strong>

## Selected Bibliography

<a href="https://polarisgamedesign.com/2023/understanding-systems-suspense/"><strong>Understanding Systems Suspense</strong></a> 

<a href="https://www.dearplayer.org/blog/2017/1/11/dear-player-ludic-humour"><strong>Dear Player: Ludic Humour</strong></a>

<a href="https://www.dearplayer.org/blog/2017/3/22/dear-player-inaction-in-an-interactive-medium"><strong>Dear Player: Inaction in an Interactive Medium</strong></a>

<strong>Mitchell, L. (2018), *Ludopolitics*, Hamshire, UK</strong>
