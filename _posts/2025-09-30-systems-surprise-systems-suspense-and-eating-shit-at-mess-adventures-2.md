---
title: "Systems Surprise, Systems Suspense, and Eating Shit at Mess Adventures 2"
date: 2025-09-24 12:00:00 +0000
tags: ["design", "systems design"]
math: true
image:
  path: /assets/img/posts/2025-09-24-theoretical-degree-in-physics.png
---

Here's a question, what's the funniest joke you've seen a game pull off? What about the most impressive - is that the same? I have fond memories playing *Fallout: New Vegas* as a preteen, right in that sweet spot where a single bit of media could rewire my entire sense of humour (*Arrested Development* and the Cornetto trilogy were other such offenders). Half of, say, Fantastic's lines could just as easily have come from a Gob Bluth or a Gary King. "They asked me how well I understood theoretical physics. I said I had a theoretical degree in physics" is a great gag, but it's one told with the same techniques of wordplay and characterisation afforded to film and TV. Are there other, subtler ways of telling jokes exclusive to an interactive medium?

![Desktop View](/assets/img/posts/2025-09-25-sisyphus-is-happy.png)

Early on in the roguelike *Hades*, you'll likely run into Supergiant's take on Sisyphus: a cheery chap with an even cheerier boulder (just look at that big fella's winning smile!). You'll just as likely pick up on the allusion to that old philosophical question, is Sisyphus happy? More than cheap reference humour, this is the game taking its genre conventions and using them to gently poke fun at you, the player. After all, how could any roguelike *not* characterise Sisyphus like this? If there was no meaning to be found in a repetitive and unending task - you wouldn't be playing, would you? The worst thing one can to a joke is over-explain it, but I do want to tie this in to the more general philosophy of humour. For Schopenhauer, humour is "the suddenly perceived incongruity between a concept and the real". Conceptually, that Sisyphus could be happy is absurd; in reality, you are; ergo: funny.

...Okay, but how does any of that make <a href="https://youtu.be/C6119Q9pDAk?t=478"><strong>this</strong></a> a joke?

{% include embed/youtube.html id='C6119Q9pDAk' %}

*Mess Adventures* is an extremely mean platformer. It is also, with little dialogue or writing at all, extremely funny. Where 

streamer and mess-adventurer Tom Walker so eloquently puts it: *i knew it i knew do you see do you see they changed the fucking layout they ththththththey took it away.*

## Surprise! It's a Systems Design blog

Okay, big glaring caveat before I go any further: I am not a systems designer. I am not an authoritative voice on systems design. What I am is a programmer, and as a programmer I do believe it's my responsibility to approach my work with at least some degree of media literacy - especially as it relates to the systems I'm personally implementing. So in this post, I thought I'd share two related concepts, *systems surprise* and *systems suspense*, and use them as a lens to reflect on my own formative experiences with games.

Let's start by thinking about games in the abstract (this section is shamelessly cribbed from the seminal <a href="https://polarisgamedesign.com/2023/understanding-systems-suspense/"><strong><i>Understanding Systems Suspense</i></strong></a>, feel free to skip ahead if you're already familiar). A videogame is a formal, computational system, governed by its rules and processes. The player can't know these rules for certain - not without access to the codebase - so must reverse engineer them by making inputs and interpreting their outputs... playing the game, in other words. A <strong>mental model</strong> is the reversed engineered framework that maps their understanding of how the game operates.

Mental modelling is best understood as a continuous process. Influenced by publicity, franchise/genre history, *etc.*, player expectations start to form long before booting up a game, and continue to develop long after completing its tutorial. *Understanding Systems Suspense* focuses on how two qualities of a mental model evolve with time:
- <strong>Shape</strong> The set of rules and processes that describe a game. We can think of it as a boundary in possibility space, separating what is possible from what isn't.
- <strong>Fidelity</strong> A player's confidence is in the shape of their mental model. Where the boundary is clear, the player believes they understand a game's rules; where it is fuzzy, they are able to arrive at several such (contradictory) possibilities.

As an aside, authors such as... Florence Smith-Nicholls? Max Kreminski? argue that building this mental model *is* the gameplay experience.

![Desktop View]()
*<strong>Mental Models</strong>*

We're now ready to define <strong>systems surprise</strong> as *a sharp and sudden change in the shape of a player's mental model into a new and noticeably different one*. 

Examples of systems surprise include can range from the genre-shattering swings taken by games like *Fez* and *Inscryption*, right down to staples like mimic chests and dreaded second healthbars.

![Desktop View]()
*<strong>Systems Surprise</strong> By contrast, content surprise is only: it might add*

Systems suspense, on the other hand, is a matter of fidelity: *a state in which the player is actively and excitedly aware of a fuzzy edge within their mental model of the game*.

![Desktop View]()
*<strong>Systems Suspense</strong>*

*Understanding Systems Suspense* gives many use cases for how and why designers might use this framework, but it is not exhaustive. Where it talks about using systems suspense and surprise to ellicit specific emotional responses from the player, it focuses predominantly on fear and loss. If they realise their understanding of a game is incorrect or incomplete, it can absolutely undermine their sense of security. That's why mimic chests always get a fright out of me at least. However, it would be wrong to think upending a mental model can *only* be played for tension or outright horror. That's why this blog post (and I'm rather excited because I really haven't seen this anyone writing about this before) is focused on an altogether different affordance of systems design - getting a laugh. 

## Embedding Humour with Systems Surprise

Systems surprise is, in Schopenhauer's terms, the sudden perception of incongruity between a mental model and the actual rules of a game. Certainly, this tracks with our reading of *Mess Adventures*, where such surprises act as the ludic equivalents of one-liners. The player's mental model snaps from one well-defined shape (one where the ground cannot simply disappear out from under them) to another (one where it can), with no change in fidelity per se. An even more elementary example is *Scary Maze Game*. The player would expect their win condition to be completing a series of mazes, but in reality their is only one level, and no way of winning - a reality that comes suddenly, shockingly into focus when the jumpscare hits. 

These games share a certain sensibility. In both, systems surprises are something that happen to (and at the expense of) the player. In both, the comedy lies in being deliberately unfair, and there's no way of anticipating that in advance. The player does need to progress far enough to discover each joke, sure, but neither is predicated on player *agency*. All of which is to say, I find systems surprises lend themselves very well to punchlines <strong>embedded</strong> by the designer.

But comedy doesn't begin or end with punchlines. If you've ever heard Norm Macdonald's <a href="https://www.youtube.com/watch?v=jJN9mBRX3uo"><strong>moth joke</strong></a>, you'll know how much craft goes in to setting up a joke, how much comic tension can be wrung out of the fact you just can't tell where it's going. Suspense is followed by surprise; the audience's anticipation of the punchline heightens the eventual moment of release. This too can be affected on a systemic level, particularly when designing puzzles.

Now, *Understanding Systems Surprise* recognises "puzzle games as a genre commonly use [a] pattern of setting up rules and then bending them" in how their systems are designed. However, it doesn't make explicit how puzzles resemble a classic setup and punchline structure. Consider the following. You present a player with two separate mechanics. You tutorialise each of these in their own separate levels. Then, you put them together, [...]

This is, in other words, game designer Arvi Teikari's philosophy towards puzzles:

Once you've created a logical paradox to complete a level of *Patrick's Parabox* or accidentally disembodied yourself in Teikari's own *Baba Is You*, you'll know some solutions are so out of left field you can help but laugh. No wonder both installments of *Mess Adventures* pastiche *Baba* throughout! My own, personal favourite example of this design pattern, though, hails from the heyday of Adobe Flash...

<div style="text-align:center;width:75%;display:block;margin-left:auto;margin-right:auto">
<img src="assets/img/posts/2025-10-09-dont-touch-blue.png" alt="Alt. text." style="aspect-ratio:4/3;border-radius:0.5rem;">
<p style="font-size:80%;padding:0;color:#6d6c6c;"><strong>Impossible to Replicate</strong> To get from A to B in question 5 of The Impossible Quiz, the player has to completel disengage with the systems of the game and move their mouse around the outside of its window - a joke that incidentally did not translate to mobile ports on account of touchscreens. The medium is the message, eh?</p>
</div>

## Emergent Humour and Systems Suspense

When *Understanding Systems Suspense* describes how suspense can manifest *without* surprise, it is characterised as a "dawning realization... notable for how much it allows a player to look back on their past experiences in a new light". That feeling of dawning realisation, it doesn't strike me as an conducive to telling jokes - or at least, it didn't until I circled back to *Arrested Development*. In its heyday, the sitcom was notorious for how far in advance it'd telegraph certain punchlines. What makes the sight gags I'll only catch on a second or third or seventh rewatch so funny is not so much the jokes themselves, but the fact they've been staring me in the face the whole time.

Confession time: I have a guilty pleasure when it comes to replaying RPGs. I am not a sadist (nor an achievement hunter) but if I'm starting New Game+ it's to respec my character as a truly horrible git. Even in *Fallout: New Vegas*, where going all-in on Caesar's Legion can be played harrowingly straight, I still find this perverse humour to romping through the Mojave Wasteland and seeing just how much of a mess I can make. Amongst Dr Merlin Seller's writings on <a href="https://www.dearplayer.org/blog/2017/3/22/dear-player-inaction-in-an-interactive-medium"><strong>inaction in games</strong></a>, she retells a similar experience with *Batman: The Telltale Series*. As is the Telltale style, every dialogue choice has a timer attached to it; Seller lets every choice time-out, finding humour in Batman's stoic (non)responses as the plot unfolds in stony silence. Where I was only making "obviously wrong" choices at *Fallout*'s narrative level, she engages with an entire mechanic the wrong way altogether.

We've seen how surprise, whether embedded in systems or content, lends itself to top-down, authored jokes, but here the comedy is <strong>emergent</strong>, arising bottom-up through our own player behaviours. I have unresolved questions about narrative *(how evil will* Fallout *let me be?)*, Seller has an unresolved mental model *(how little will* Batman *let me play?);* both of us go out of our way to resolve that suspense. Whether or not it pays off in an actually surprising punchline, I would argue any such wilfully obtuse playstyle is, if only in a self-reflexive sense, inherently funny. Obstinance, though, is an unkind word. Liam Mitchell might better recognise this as a form of <strong>subversive play</strong>,

Now this isn't really the point of my post, but I do think there's an interesting paradox here. One of Mitchell's central arguments in *Ludopolitics* is how games represent power fantasies not only in the overt *You too can be a cigar-chomping babe magnet like Duke Nukem!* sense, but how they implicitely present systems of control.
Completionism is the clearest manifestation of this, where Mitchell argues.
The perverse humour of Seller's playthrough is it simultaneously represents an attempt to subvert, it is still informed by that completionist mindset 

...But not always. Speedrunning is maybe *the* canonical example of subversive play for how...
Maybe
One of *Grand Theft Auto IV*'s speedrun niches is Gervais%.
Ironically, the systems we're using are much funnier than any of Ricky's hack bits.
Speedrunning categories in a similar vein include Cuno%, Nipple%, and the very notion of <a href="https://graham.build/s/a-blog/028-unfair-flips-world-record-strategy/"><strong>attempting a world record time at <i>Unfair Flips</i></strong></a>.<sup>1</sup> 
<p style="line-height:1.25"><sup><sup>1</sup> As <a href="https://bsky.app/profile/catacalypto.bsky.social/post/3m37tir6boc2x"><strong>Cat Manning</strong></a>, co-author of <i>Understanding Systems Suspense</i>, puts it, "some people have decided they want to speedrun [checks notes] probability"</sup></p>

Take it one step further than that, even - forget subversive play, let's talk straight up glitches. Games are held together with sticky tape, JIRA tickets, and dreams. Liam Mitchell
Is committing unsafe code really a radical act of systems design? Fuck it, sure, that's what I'll be telling my boss in my next performance review.

## Closing Thoughts

Like I said, I'm not a systems designer; comedy is subjective; the line between content and systems is not particularly rigid; things of that nature. I especially want to highlight that systems can well facilitate humour and play without either surprises or suspense.

Really, it comes down to two key points. Firstly, . In this case, we've seen how

<p align="right">And secondly, it's never not funny to be a dick to your players.</p>