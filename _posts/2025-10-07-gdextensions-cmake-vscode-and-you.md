---
title: "GDExtensions, CMake, VSCode and you"
description: "Waiting for Godot (to switch to a not terrible build system)."
date: 2025-09-24 12:00:00 +0000
categories: [Procedural Whodunnits]
tags: ["devlog", "godot", "cmake", "c++"]
math: true
---

So who is this post for? Myself for one: God knows I forget half this stuff every time I fire up a new project. Really, though, I've written it at anyone familiar with Godot who wants to get better with C++, and anyone familiar with C++ who wants to get better with Godot.

The theme is more or less, some things I wish I knew the first time around.

## Prerequisites

First, I want to give an entry-level explainer on 

I also want to make a quick note about compilers here. If you're following this tutorial on Windows you'll be using MSVC by default; I personally prefer clang for its suite of compiler optimisations (nice foreshadowing for a future blog, that). Just please, Christ, whatever you do, <strong>don't use gcc.</strong> 

## File Structure


```
my-project
> build
  > windows-debug
  > windows-release
> exe
> extensions
  > my-gdextension-cpp
      // Source 
      CMakeLists.txt
	  register_types.cpp
    CMakeLists.txt
> game // Create godot project within this dir
  > bin
      my-extension.gdextension
    .gitignore
  .gitignore
  CMakeLists.txt
```

We can fill in the `.gitignore` file already. The file only needs two directories added:
```
build
exe
```
This means...

It'll also be useful to append
```
# GDExtension ignores
bin/*.dll
bin/*.exp
bin/*.lib
bin/*.pdb
```

## godot-cpp

There's one important directory we're currently missing. Go into extensions. Run git submodule add -b 4.x https://github.com/godotengine/godot-cpp, then init.

```
git submodule add -b 4.2 https://github.com/godotengine/godot-cpp
cd godot-cpp
git submodule update --init
```

Then, commit the submodule (and accompanying .gitmodules file).

```
scons platform=[windows,macos,linux,android,ios] target=[template_debug,template_release,editor]
```

This is, mercifully, the first and only time we'll need scons is as we generate these

## CMake



extensions: linking

gdextension: add nuance, etc.

## VSCode