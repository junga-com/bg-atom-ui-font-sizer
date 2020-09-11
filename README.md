# bg-ui-font-sizer package

Change the size of fonts in Atom UI.

This package adds commands that dynamically change font size of the bundled Tree-view and the Pane Item Tab controls that appear on each of the WorkspaceCenter, LeftDock, RightDock, and BottomDock areas. This is particularly useful for the tree-view where it has the effect of zooming in and out to see your project tree at different levels. I find this works well in conjunction with the bg-pane-navigation package.

Note that some themes, such as the dark themes bundled with Atom have a configuration to set the UI font size. If you just want to
increase the readability on a high resolution monitor those themes offer a good solution. Aside from addressing that issue on themes
that do not offer configurable font size like the light themes bundled with Atom, this package is useful to be able to adjust the tab
sizes of the 4 different places where PaneItem tabs appear independently. I generally make the WorkspaceCenter tabs bigger and the
Dock tabs smaller.

If you find yourself with so many editor tabs open that there is not enough of the names visible to tell them apart, you can temporarily make the tab font for the WorkspaceCenter very small to seem more of the names. With your focus in an editor window execute the bg-tabs:decrease-font-size' command (`ctrl-_` by default -- note that `_` is shift minus).

I have only tested this on my linux workstation using the bundled Atom themes. Create an issue if you have problems in your environment because I would like it to work well in all environments.

#### Commands

There are two sets of commands -- those for the tree-view and those for tabs. For each, you can increase/decrease the font size and
also increase/decrease the line height. You can also reset the font and line height to its original styling. The tab commands also
have a modal dialog that can be opened to enter a mode to adjust the tabs. This was necessary because its not practical to find non-conflicting
keystrokes for all the tabs in any context you could adjust them in.

| Command                            | KeyMap                       | Description
|---                                 |---                           |---
|'bg-tree-view:decrease-font-size'   | .tree-view: 'ctrl--':        | zoom tree-view out
|'bg-tree-view:increase-font-size'   | .tree-view: 'ctrl-=':        | zoom tree-view in
|'bg-tree-view:decrease-line-height' | .tree-view: 'ctrl-up':       | squeeze tree-view vertically
|'bg-tree-view:increase-line-height' | .tree-view: 'ctrl-down':     | stretch tree-view vertically
|'bg-tree-view:reset-font-size'      | .tree-view: 'ctrl-0':        | remove styling so that theme default applies to tree-view fonts
|---                                 |---                           |---
|'bg-tabs:decrease-font-size'        | `ctrl-_`                     | zoom out tabs of focused dock/center
|'bg-tabs:increase-font-size'        | `ctrl-+`                     | zoom in tabs of focused dock/center
|'bg-tabs:increase-line-height'      |                              | stretch focused tabs vertically
|'bg-tabs:decrease-line-height'      |                              | squeeze focused tabs vertically
|'bg-tabs:reset-font-size'           | `ctrl-)`                     | remove styling so that theme default applies
|'bg-tabs:toggle-size-dialog'        | `ctrl-alt-_`<br>`ctrl-alt-+` | opens a model dialog to adjust all the tab sizes.
|'bg-tabs:size-dialog-next'          |                              | in modal dialog, cycle through tab locations
|'bg-tabs:size-dialog-previous'      |                              | in modal dialog, cycle through tab locations

Note that the 'bg-tabs:...' commands are context sensitive. They apply to the Dock or WorkspaceCenter that currently has the user's
focus. If the bg-tabs:size-dialog is open, they apply to the location that is currently highlighted in the dialog. When all locations
are highlighted (cycle to that with the tab key), the commands act on all the tab locations at once.

The 'bg-tree-view:...' commands are not context sensitive but the default keymaps for those commands are only active when the focus is in the tree-view.

Note that I registered the commands from this package under the 'bg-tree-view:' and 'bg-tabs' prefixes because I wanted you to
find them in the command palette when searching for those things for which they apply to. I included the bg- prefix so that you can
tell that they are not native to the tree-view and tabs package. The downside is that they are not as strongly associated with this
package but hopefully the bg- prefix is enough to lead back here if needed.

#### Keymaps

In general, my packages provide only keymap suggestions that you need to put in your keymap.cson because I believe that it does more
harm than good to assume the keystrokes you should use.  This package does provide a keymap, though, for two reasons. First, it
provides keymaps for its modal size-dialog which can not conflict with anything else. The whole purpose of that modal dialog is to avoid
keymap conflicts my providing a mode that the user enters while adjusting tab sizes. Second, the other keymaps it provides seem pretty
safe. There is a config setting to selectively disable the keymaps that are not associated with the modal dialog.

Here is the .atom/pacakges/bg-ui-font-sizer/keymaps/bg-ui-font-sizer.cson file copied reference.

    # by adding shift and alt to the keystrokes that typically zoom in/out, we open the modal dialog
    # note that these are shift keystrokes because _ and + are shift characters on their keys
    '.platform-linux atom-workspace':
      'ctrl-alt-_':   'bg-tabs:toggle-size-dialog'
      'ctrl-alt-+':   'bg-tabs:toggle-size-dialog'

    # once the modal dialog is open, we can control the keyboard without risk keystroke conflict. (so these are aways safe)
    ".bg-ui-font-sizer-dialog":
      'ctrl-+':     'bg-tabs:increase-font-size'
      'ctrl-=':     'bg-tabs:increase-font-size'
      'ctrl-_':     'bg-tabs:decrease-font-size'
      'ctrl--':     'bg-tabs:decrease-font-size'
      'ctrl-down':  'bg-tabs:increase-line-height'
      'ctrl-up':    'bg-tabs:decrease-line-height'
      'ctrl-0':     'bg-tabs:reset-font-size'
      'ctrl-)':     'bg-tabs:reset-font-size'
      'escape':     'bg-tabs:toggle-size-dialog'
      'tab':        'bg-tabs:size-dialog-next'
      'shift-tab':  'bg-tabs:size-dialog-previous'

    # add context sensitive zoom to tree-view. By default, Atom will zoom the text editor with ctrl-+/- even when the focus is
    # in the tree view. This seems like a safe change because I think that it makes it more intuitive to zoom the thing where your
    # focus is.  ctrl-up/down are also mapped for to vertically squeeze and expand the tree items (line height adjustment).
    # LMK by creating an issue if this caused problems for you. I'd like to know.
    '.platform-linux .tree-view':
      'ctrl-0':     'bg-tree-view:reset-font-size'
      'ctrl--':     'bg-tree-view:decrease-font-size'
      'ctrl-=':     'bg-tree-view:increase-font-size'
      'ctrl-up':    'bg-tree-view:decrease-line-height'
      'ctrl-down':  'bg-tree-view:increase-line-height'

#### How it works

The main thing that the commands do is sets the font-size css property on a container node of the thing being zoomed in or out.

	this.treeViewEl = document.querySelector('.tree-view.tool-panel');
	this.treeViewEl.style.fontSize = '18px'

But there are two problems with this. Atom's themes css include a very specific rule that hardcodes .list-items line-height to 25px
and the selection highlight bar (implemented as ::before content) height to 25px.

This package uses the bg-atom-utils NPM node_module's BGStylesheet class to dynamically add more specific styles that override those
rules from the theme.

You could probably figure out static rules that make those properties relative to font-size but I decided to use dynamic rules so that
I could also dynamically change the font-size to line-height proportions.

The default atom-light-ui theme (at least on my workstation) makes the tree-view list items very small with a lot of space inbetween
them.  (11px font and 25px line-height = 230%).  I personally find that odd,  but think more people would find this package useful if
it allowed keeping that 230% line height if desired. Thats really why I incuded the line height adjustment but now that its done, I
find that I use it all the time to squeeze a whole folder into view when needed.

The reset command removes all the dynamic styling so that the Atom theme defaults apply again. After doing a reset (or before issuing
one of the other package commands), this package will be dormant and not mess with your styles at all.  

#### Hacking Tip

If you want to play around with this package in ways that are not exposed through the commands, open devtools console (window:toggle-dev-tools) and explore the bgPlugins... global variable. Start typing the `bgPlugin[...` and use the autocomplete to select this package name. If you hit enter on the completed `bgPlugins['packageName']` it shows you a reference to the plugin object that you can expand to explore the current state of the plugin. You can autocomplete further to navigate to the sub-objects and invoke methods and see what they do.
