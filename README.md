# bg-ui-font-sizer package

Change the size of fonts in Atom UI.

This package adds command that dynamically change the running styles to increase or decrease the fontSize of the tree-view (and eventually menus).

Note: I have only tested this on my linux workstation using the atom-light-ui theme. LMK if you have problems in your environment.

#### Commands

Note that I registered the commands under the 'bg-tree-view' label because I wanted people to find them in the command palette when
typing tree-view:... but I included the bg- prefix so that they know they are not native to the tree-view package. The downside is that
they are not as strongly associated with this package but hopefully the bg- prefix is enough to lead back here if needed.

| Command                            | Suggested KeyMap          | Description
|---                                 |---                        |---
|'bg-tree-view:reset-font-size'      | .tree-view: 'ctrl-0':     | return tree view fontSize and lineHeight to Atom default
|'bg-tree-view:decrease-font-size'   | .tree-view: 'ctrl--':     | zoom out (1 px smaller font)
|'bg-tree-view:increase-font-size'   | .tree-view: 'ctrl-=':     | zoom in (1 px larger font)
|'bg-tree-view:decrease-line-height' | .tree-view: 'ctrl-up':    | squeeze shorter (10% points smaller lineHeight)
|'bg-tree-view:increase-line-height' | .tree-view: 'ctrl-down':  | stretch taller (10% points larger lineHeight)


#### Keymaps

This package does not provide any keymap so that the user can decide how to use their keyboard.

Here is the relevant portion of my keymap.cson that you may find useful to merge into your keymap.cson (menu:Edit->Keymap...)

'.platform-linux .tree-view':
  'ctrl-0': 'bg-tree-view:reset-font-size'
  'ctrl--': 'bg-tree-view:decrease-font-size'
  'ctrl-=': 'bg-tree-view:increase-font-size'
  'ctrl-up': 'bg-tree-view:decrease-line-height'
  'ctrl-down': 'bg-tree-view:increase-line-height'

#### How it works

Principally, it sets the font-size css property on a .tool-panel container node.

	this.treeViewEl = document.querySelector('.tree-view.tool-panel');
	this.treeViewEl.style.fontSize = '18px'

But there are two problems with this. Atom's themes css include a very specific rule that hardcodes .list-items line-height to 25px
and the selection highlight bar (implemented as ::before content) height to 25px.

This package uses the bg-atom-utils NPM node_module's BGStylesheet class to dynamically add more specific styles that override those
rules from the theme. 

You could probably figure out static rules that make those properties relative to font-size but I decided to use dynamic rules so that
I could also dynamically change the font-size to line-height proportions.

The default atom-light-ui theme (at least on my workstation) makes the tree-view list items very small with a lot of space inbetween
them.  (11px font and 25px line-height = 230%).  I personally find the odd but that more people would find this package useful if
it allowed keep that 230% line height if desired.

The reset command removes all the static styling so that the Atom theme defaults apply again. After doing a reset (or before issuing
one of the other package commands), this package will be dormant and not mess with your styles.  

#### Hacking Tip

If you want to play around with this in ways that are not exposed through the commands, view the package code ('view code' in setting's package page) 
and in the lib/<packageName>.js file, uncomment the line in the constructor with sets a global variable with the this pointer.

Then do window:reload and open devtools console (window:toggle-dev-tools). In the console start typing the global variable name and use
its autocomplete to explore the plug. If you complete the name of a member variable, dev tools will create a reference to that variable
that you can expend and explore the data within it. 
