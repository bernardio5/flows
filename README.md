This is the readme for the "flows" project. 

This project has been put under the MIT license by its author, Neal McDonald.


FYI: I am developing this in Safari on a (2010) MacBook Pro. The library does not 
work, annoyingly, in other browsers, for instance Chrome can't draw the labels properly, 
and of course Explorer just prefers that you install Silverlight and submit your 
Microsoft user name. I have not run Firefox lately; I should port to Firefox. 


Flows is an attempt to recreate the experiences I had with the Houdini
animation system back in the 90's; it's also similar to MAX/MSP and Pure Data. 
Also, I just wanted to see whether I could: I can. Also, I wanted something
web-based.

That is, I want a HTML/JS based, extensible, visual programming environment. 
"To Do What, Exactly?", is not a question I've answered while trying to get 
the basics together. It's for Programming! Visually!

Such environments can be useful for creating creative works. They exist in
a middle ground between scripting and user inderfaces. Composers seem to find 
these systems useful, and livecoding is possible. 



Implementation Description: 

The system is, first of all, a single HTML/CSS page that loads the flEditor
library, which loads other things. 

The code in flEditor.js relies on the DOM contents of the editor page being 
pretty much as they are in the project-- the flEditor does not attempt to 
format the page to suit itself. 

The flEditor connects the buttons in the editor page to the graph nodes. 
It draws the nodes in a Canvas div. 

The flNodes contain the classes flNode, which draws and evaluates nodes, 
and flIO, which connect the nodes. Functions/actions are kept in flNode; to add a new node
type, you add an evaluation function to flNode, and add a case to three switch statements. 
Data is stored in flIO objects; to add a data type, you would extend this class. 

There is not, currently, a way to get node output, other than by means 
that smack of debugging (console output, etc). I need to add a canvas node that can 
be drawn into, or som

Users create nodes in the page. They may load or save nodes by (barbarically) copying 
XML out of one of the windows in the page.

The nodes are connected into a graph. The connections are topside/inputs and 
bottom-side/outputs. 

Each node type has a JS function associated with it, that is called by the fl
library when the graph is evaluated. 

The nodes at the moment are generic. 






