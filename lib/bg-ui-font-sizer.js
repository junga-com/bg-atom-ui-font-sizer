import { BGAtomPlugin, BGRemoveKeybindings } from 'bg-atom-utils';
import { BGAtomTreeItemFontSizer, BGAtomTabFontSizer }                   from './fontCntrStylesheets.js';
import { BGFontSizeControlModalDialog }                                  from './BGFontSizeControlModalDialog.js'
import dedent from 'dedent'

// Main Class for this Atom package
// BGUIFontSizerAtomPlugin provides control over the font size and lineHeight in the tree-view and in the tab bars of the 4 pane containers
// (WorkspaceCenter, and Left,Right, and Bottom Docks). Changing the font size of UI controls has the effect of zooming and its
// useful on high resolution monitors to be able to decide how big each of these UI elements should be.
class BGUIFontSizerAtomPlugin extends BGAtomPlugin {
	constructor(state) {
		super('bg-ui-font-sizer', state);

		//global.bgUIFontSizer = this; console.log("the global variable 'bgUIFontSizer' is available on the console to hack with the bg-ui-font-sizer package code");

		// Tree-view font sizing stuff
		this.treeViewEl = document.querySelector('.tree-view.tool-panel');
		if (this.treeViewEl) {
			this.treeItemFontSizer = new BGAtomTreeItemFontSizer(this.treeViewEl, (this.lastSessionsState.treeItemFontSizer));
//			this.disposables.add(this.treeItemFontSizer);

			// register the tree-view commands. note the bg-tree-view:.. lables to associate the commands more strongly with tree-view.
			this.addCommand("bg-tree-view:increase-font-size",   ()=>this.treeItemFontSizer.adjustFontSize( 1 ));
			this.addCommand("bg-tree-view:decrease-font-size",   ()=>this.treeItemFontSizer.adjustFontSize(-1 ));
			this.addCommand("bg-tree-view:reset-font-size",      ()=>this.treeItemFontSizer.resetFontSize());
			this.addCommand("bg-tree-view:increase-line-height", ()=>this.treeItemFontSizer.adjustItemLineHightPercentage( 10 ));
			this.addCommand("bg-tree-view:decrease-line-height", ()=>this.treeItemFontSizer.adjustItemLineHightPercentage(-10 ));
		}

		// Dock Tabs stuff

		// Create the tab sizer stylesheets for each of the Docks (we consider workspace center a dock too)
		this.tabFontSizerWorkSpcCenter = new BGAtomTabFontSizer('atom-workspace-axis.vertical > atom-pane-container.panes', (this.lastSessionsState.tabFontSizerWorkSpcCenter));
		this.tabFontSizerLeftDock      = new BGAtomTabFontSizer('atom-dock.left',   (this.lastSessionsState.tabFontSizerLeftDock));
		this.tabFontSizerRightDock     = new BGAtomTabFontSizer('atom-dock.right',  (this.lastSessionsState.tabFontSizerRightDock));
		this.tabFontSizerBottomDock    = new BGAtomTabFontSizer('atom-dock.bottom', (this.lastSessionsState.tabFontSizerBottomDock));
//		this.disposables.add(this.tabFontSizerWorkSpcCenter, this.tabFontSizerLeftDock, this.tabFontSizerRightDock, this.tabFontSizerBottomDock)

		// create an aggregate object instance that manipulates each of the Dock sizers at once. This will be the 'all' Dock
		this.tabFontSizerAllDocks={
			adjustFontSize: (d)=>{
				this.tabFontSizerWorkSpcCenter.adjustFontSize(d);
				this.tabFontSizerLeftDock.adjustFontSize(d);
				this.tabFontSizerRightDock.adjustFontSize(d);
				this.tabFontSizerBottomDock.adjustFontSize(d);
			},
			resetFontSize: ()=>{
				this.tabFontSizerWorkSpcCenter.resetFontSize();
				this.tabFontSizerLeftDock.resetFontSize();
				this.tabFontSizerRightDock.resetFontSize();
				this.tabFontSizerBottomDock.resetFontSize();
			},
			adjustBarHeight: (d)=>{
				this.tabFontSizerWorkSpcCenter.adjustBarHeight(d);
				this.tabFontSizerLeftDock.adjustBarHeight(d);
				this.tabFontSizerRightDock.adjustBarHeight(d);
				this.tabFontSizerBottomDock.adjustBarHeight(d);
			}
		}

		// The modal dialog stuff...
		this.tabsDialog = new BGFontSizeControlModalDialog();

		// register the tab font size commands
		this.addCommand("bg-tabs:increase-font-size",   ()=>this.getActiveSizer().adjustFontSize( 1 ));
		this.addCommand("bg-tabs:decrease-font-size",   ()=>this.getActiveSizer().adjustFontSize(-1 ));
		this.addCommand("bg-tabs:reset-font-size",      ()=>this.getActiveSizer().resetFontSize());
		this.addCommand("bg-tabs:increase-line-height", ()=>this.getActiveSizer().adjustBarHeight( 1 ));
		this.addCommand("bg-tabs:decrease-line-height", ()=>this.getActiveSizer().adjustBarHeight(-1 ));

		// register the commands for the modal dialog
		this.addCommand("bg-tabs:toggle-size-dialog",   ()=>{this.toggleModalDialog();});
		this.addCommand("bg-tabs:size-dialog-next",     ()=>{this.tabsDialog.cycleSelectedDock(true);});
		this.addCommand("bg-tabs:size-dialog-previous", ()=>{this.tabsDialog.cycleSelectedDock(false);});
		this.addCommand("bg-tabs:size-dialog-left",  ()=>{this.tabsDialog.selectDockWithDirectionKey('left');});
		this.addCommand("bg-tabs:size-dialog-right", ()=>{this.tabsDialog.selectDockWithDirectionKey('right');});
		this.addCommand("bg-tabs:size-dialog-up",    ()=>{this.tabsDialog.selectDockWithDirectionKey('up');});
		this.addCommand("bg-tabs:size-dialog-down",  ()=>{this.tabsDialog.selectDockWithDirectionKey('down');});


		// init the onGlobalKeymapsConfigChange and then have it called whenever the relavent config changes
		this.onGlobalKeymapsConfigChange();
		atom.config.addDep('bg-ui-font-sizer.enable-global-keymaps', this, ()=>{this.onGlobalKeymapsConfigChange()});
		atom.config.addDep('core.packagesWithKeymapsDisabled',       this, ()=>{this.onGlobalKeymapsConfigChange()});

		atom.config.addDep('bg-ui-font-sizer.showWelcomeOnActivation', this, ()=>this.doWelcomeTutorial())
		this.doWelcomeTutorial();
	}

	destroy() {
		super.destroy()
	}

	doWelcomeTutorial() {
		if (atom.config.get('bg-ui-font-sizer.showWelcomeOnActivation')) {
			atom.config.set('bg-ui-font-sizer.showWelcomeOnActivation', false);
			const dialog = atom.notifications.addInfo(dedent`
				<h3>Thank you for installing bg-ui-font-sizer.</h3>
				<p>You can now zoom in and zoom out the tree-view pane and also the tabs on each of the docks and workspace center.</p>
				<p>You are used to the cntr plus/minus keys zooming in and out the editor window. Now when your focus is in the tree-view
				   those same keys will zoom in and out the tree-view. </p>
				<p>By adding the shift key to those key strokes you can zoom in and out the tabs of the dock or workspace center that
				   has the focus.</p>
				<p>If you add the alt key to those keystrokes, you will open a modal dialog that will let you zoom in/out the tabs of any fo the docks or workspace center</p>
				<p>You can go to the settings page of the bg-ui-font-sizer package to learn more, particularly if you want to map different key strokes to these zoom functions</p>`, {
				dismissable: true,
				buttons: [
					{text: 'Goto settings', onDidClick: ()=>{atom.workspace.open('atom://config/packages/bg-ui-font-sizer/');; dialog.dismiss()}},
					{text: 'Ok, got it', onDidClick: ()=>{dialog.dismiss()}}
				]
			})
		}
	}


	toggleModalDialog() {
		this.tabsDialog.setSelectedDock(atom.workspace.getActivePaneContainer().getLocation());
		this.tabsDialog.toggle();
	}

	// the tab size adjustment commands all use this to determine for which Dock to change the tabs
	getActiveSizer() {
		switch (this.getSelectedDock()) {
			case "center": return this.tabFontSizerWorkSpcCenter;   break;
		  	case "left":   return this.tabFontSizerLeftDock;        break;
		 	case "right":  return this.tabFontSizerRightDock;       break;
			case "bottom": return this.tabFontSizerBottomDock;      break;
			case "all":    return this.tabFontSizerAllDocks;         break;
			default:       return this.tabFontSizerWorkSpcCenter;
		}
	}

	// when the tabsDialog is closed, we use the Dock that has the user's focus
	// when the tabsDialog is open, we use its explicitly selected location
	getSelectedDock() {
		if (this.tabsDialog.isShown())
			return this.tabsDialog.getSelectedDock();
		else
			return atom.workspace.getActivePaneContainer().getLocation();
	}


	// save our state so that the font sizes will remain each time Atom starts
	serialize() {
		return {
			treeItemFontSizer: (this.treeItemFontSizer) ? this.treeItemFontSizer.serialize() : null,
			tabFontSizerWorkSpcCenter: (this.tabFontSizerWorkSpcCenter) ? this.tabFontSizerWorkSpcCenter.serialize() : null,
			tabFontSizerLeftDock:      (this.tabFontSizerLeftDock)      ? this.tabFontSizerLeftDock.serialize()      : null,
			tabFontSizerRightDock:     (this.tabFontSizerRightDock)     ? this.tabFontSizerRightDock.serialize()     : null,
			tabFontSizerBottomDock:    (this.tabFontSizerBottomDock)    ? this.tabFontSizerBottomDock.serialize()    : null
		};
	}

	// this supports the enable-global-keymaps config option. We can selectively disable only the global keybindings, leaving the modal
	// dialog keybindind active. This compliments the core.packagesWithKeymapsDisabled setting which removes all the package's keybindings.
	onGlobalKeymapsConfigChange() {
		this._gblKeysConfig || (this._gblKeysConfig = 'all')
		const shouldGblBeEnabled = atom.config.get('bg-ui-font-sizer.enable-global-keymaps');

		// if the user has disabled all the keymaps from this package
		if ((atom.config.get('core.packagesWithKeymapsDisabled') || []).includes('bg-ui-font-sizer')) {
			// we dont have to change anything but we record the state as 'none' so that we kow what needs to be done when config changes
			this._gblKeysConfig = 'none';
			return

		} else if (!shouldGblBeEnabled && this._gblKeysConfig != 'noGbl') {
			// remove keybindings from this package that are either global (atom-workspace) or attached to the .tree-view
			var removeCount = BGRemoveKeybindings({
				sourceRegex:   /bg-ui-font-sizer/,
				selectorRegex: /(atom-workspace)|([.]tree-view)/
			});
			this._gblKeysConfig = 'noGbl';

		} else if (shouldGblBeEnabled && this._gblKeysConfig != 'all') {
			const thisPkg = atom.packages.activePackages['bg-ui-font-sizer'];
			if (thisPkg && typeof thisPkg.activateKeymaps == 'function') {
				// we have to set keymapActivated to false to trick activateKeymaps() into doing the work again.
				thisPkg.keymapActivated = false;
				thisPkg.activateKeymaps()
				this._gblKeysConfig = 'all';
			}
		} else
			return; // avoid notifying the settings page below if nothing changed

		// if the settings tab is open, notify it that we disabled some keybindings so that it can update its view
		var settingsView = atom.workspace.getItemByURI('atom://config');
		if (settingsView && settingsView.packageManager && settingsView.packageManager.emitter)
			settingsView.packageManager.emitter.emit('package-updated', {pack: {name: 'bg-ui-font-sizer'}});
	}
};

//"configSchema":
BGUIFontSizerAtomPlugin.config =  {
	"showWelcomeOnActivation": {
		"type": "boolean",
		"default": true,
		"title": "Show Welcome Tutorial",
		"description": "Checking this will activate the welcome dialog one more time"
	},
	"enable-global-keymaps": {
		"type": "boolean",
		"default": true,
		"title": "Enable Global Keymaps",
		"description": "Deselecting this will disable only some of the the keymaps provided by this package.  Only the ones associated with this package's modal dialog will remain."
	}
}

export default BGAtomPlugin.Export(BGUIFontSizerAtomPlugin);
