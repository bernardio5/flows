This project contains two editors. The "Flows" editor is a visual programming 
enviornment, sort of. The "Tiles" editor is a tile editor, for video-game editing-- 
games TBD. 

To run them, clone this project and load the "index.html".

Flows:

Flows is a JS/web-based graphical programming tool, similar to MAX/MSP,
Pure Data, Houdini, the XCode interface builder, the Maya materials editor.
These tend to exist to hide the need to code, but Flows, no.

The problem it (will) solves: when you are attempting to build a next of 
interconnected function calls, the algorithm can disappear into the long lists
of commands.

What it does: you use the program to build a graph of nodes. Each node 
is a command and has inputs and outputs. The graph visually represents how
things are connected, and the hope is that that's powerfully helpful. 

The graph, when "run"/"evaluated"/verbs are weird, makes a sequence of commands. 
Each node generally makes one command, of the form "vn = command(va, vb)".
The list of commands can then be pasted into a document and run.

The editor, right now, is making JavaScript commands, but the technique is language-agnostic. 
The nodes types are created/loaded at runtime from text that specifies inputs, outputs,
and the command that the node type will generate. 

The "libs" folder contains javascript libraries that do things. The code in these libraries 
is not loaded by Flows; Flows makes code, but it isn't a run environment. The code is 
scanned by Flows, so that it can make code that uses the libraries. In the library source are 
comment lines prefixed by "//??"; these lines are node type definitions, which tell Flows
data types and call syntax. 

So, Flows lets you make code that calls functions from these libraries. There's linear algebra, 
some particle system/physics, Proportion (cf.), and the stump of a WebGL, but I have nto gotten
far with that yet. I ought to do some sprite stuff.. 

Javascript runs in a sandbox, so file I/O is usually disabled. The "report" button
evaluates the node tree and outputs to the debugger console, and you can copy/paste from there. 
Which is kinda sketchy but hey: FREE TERSE WEIRD CUSOMIZABLE VISUAL PROGRAMMING ENVIRONMENT you're welcome. 

I'm working in Firefox; Chrome and Edge seem to work OK, too. 

Implementation Description: 

The system is, first of all, a single HTML/CSS page that loads the flEditor
library, which loads other things. 

The code in flEditor.js relies on the DOM contents of the editor page being 
pretty much as they are in the project-- the flEditor does not attempt to 
format the page to suit itself. 

The flEditor connects the buttons in the editor page to the graph nodes. 
It draws the nodes in a Canvas div. 

The flNodes contain the classes flNode, which draws and evaluates nodes, flGraph, which
is the editor's interface to the nodes, and flIO, which connect the nodes.
Data is stored in flIO objects; to add a data type, you would extend this class. 
Nodes are collections of flIO's, mostly, and the functions that convert nodes to code. 
The flGraph object allows you to build and evaluate node networks.

The editor has two collections of nodes: the template list, which has one entry per node type,
and the graph, which is the flGraph you're working on. 


Tiles:

is a quickie tile-editor. I kept wanting lists of things, 
initialized Just So, output Just So, so: it.

The "scratch" directory contains tile-set images that you can use, or you could add your own. 

The tile editor can load tile arrangements, but JS usually won't let you save, so 
that just gets sent to console. Scketchy, functional, hrmph. 

Tiles can point to each other; I've found this endlessly useful in games: triggers, 
hinges, targets, path segments, scripting, timers. 



