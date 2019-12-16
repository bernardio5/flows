This is the readme for the "flows" project. 

This project has been put under the MIT license by its author, Neal McDonald.

Okay, hey, I'm back. 

Flows is a JS/web-based graphical programming tool, similar to MAX/MSP,
Pure Data, Houdini, the XCode interface builder, the Maya materials editor.

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






