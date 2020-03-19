'use babel';

import { CompositeDisposable } from 'atom';
import { bgAsyncSleep, BGAtomPlugin, BGAtomTreeItemFontSizer, BGAtomTabFontSizer, BGRemoveKeybindings, BGFindWorkspaceItemFromURI } from 'bg-atom-utils';
import { BGFontSizeControlView } from './bg-fontSizeDialog.js'

// Main Class for Atom Plugin 
// BGUIFontSizerAtomPlugin provides control over the font size and lineHeight in the tree-view and in the tab bars of the 4 pane containers
// (WorkspaceCenter, and Left,Right, and Bottom Docks). Changing the font size of UI controls has the effect of zooming and its 
// useful on high resolution monitors to be able to decide how big each of these UI elements should be.
class BGUIFontSizerAtomPlugin extends BGAtomPlugin {
	constructor() {
		super();
		this.tabsDialog = null;
		//bgUIFontSizer = this; console.log("the global variable 'bgUIFontSizer' is available on the console to hack with the bg-ui-font-sizer package code");
	}

	async activate(state) {
		state = state || {}
		this.tabsDialog = new BGFontSizeControlView();

		this.addCommand('bg-ui-font-sizer:removeGlobalKeymaps', ()=>this.removeGlobalKeymaps());

		// Tree-view stuff
		this.treeViewEl = document.querySelector('.tree-view.tool-panel');
		if (this.treeViewEl) {
			this.treeItemFontSizer = new BGAtomTreeItemFontSizer(this.treeViewEl, (state["treeItemFontSizer"] : null));
			this.subscriptions.add(this.treeItemFontSizer);

			// register the tree-view commands. note the bg-tree-view:.. lables to associate the commands more strongly with tree-view.
			this.addCommand("bg-tree-view:increase-font-size",   ()=>this.treeItemFontSizer.adjustFontSize( 1 ));
			this.addCommand("bg-tree-view:decrease-font-size",   ()=>this.treeItemFontSizer.adjustFontSize(-1 ));
			this.addCommand("bg-tree-view:reset-font-size",      ()=>this.treeItemFontSizer.resetFontSize());
			this.addCommand("bg-tree-view:increase-line-height", ()=>this.treeItemFontSizer.adjustItemLineHightPercentage( 10 ));
			this.addCommand("bg-tree-view:decrease-line-height", ()=>this.treeItemFontSizer.adjustItemLineHightPercentage(-10 ));
		}

		// Tabs stuff
		this.subscriptions.add(this.tabFontSizerWorkSpcCenter = new BGAtomTabFontSizer(
			'atom-workspace-axis.vertical > atom-pane-container.panes',
			(state["tabFontSizerWorkSpcCenter"] : null)
		));

		this.subscriptions.add(this.tabFontSizerLeftDock = new BGAtomTabFontSizer(
			'atom-dock.left', 
			(state["tabFontSizerLeftDock"] : null)
		));

		this.subscriptions.add(this.tabFontSizerRightDock = new BGAtomTabFontSizer(
			'atom-dock.right', 
			(state["tabFontSizerRightDock"] : null)
		));

		this.subscriptions.add(this.tabFontSizerBottomDock = new BGAtomTabFontSizer(
			'atom-dock.bottom', 
			(state["tabFontSizerBottomDock"] : null)
		));

		// create an aggregate object instance that calls each of the for tabFontSizers
		this.tabFontSizerAllTabs={
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

		// register the tab font size commands
		this.addCommand("bg-tabs:increase-font-size",   ()=>this.getActiveSizer().adjustFontSize( 1 ));
		this.addCommand("bg-tabs:decrease-font-size",   ()=>this.getActiveSizer().adjustFontSize(-1 ));
		this.addCommand("bg-tabs:reset-font-size",      ()=>this.getActiveSizer().resetFontSize());
		this.addCommand("bg-tabs:increase-line-height", ()=>this.getActiveSizer().adjustBarHeight( 1 ));
		this.addCommand("bg-tabs:decrease-line-height", ()=>this.getActiveSizer().adjustBarHeight(-1 ));

		this.addCommand("bg-tabs:toggle-size-dialog",   ()=>{this.toggleModalDialog();});
		this.addCommand("bg-tabs:size-dialog-next",     ()=>{this.cycleTabsLocation(true);});
		this.addCommand("bg-tabs:size-dialog-previous", ()=>{this.cycleTabsLocation(false);});

		// maintain the enable-global-keymaps configuration options
		if (!atom.config.get('bg-ui-font-sizer.enable-global-keymaps')) {
			this.removeGlobalKeymaps();
		}
		this.subscriptions.add(atom.config.onDidChange('bg-ui-font-sizer.enable-global-keymaps', {}, ({newValue, oldValue})=>{
			if (!newValue)
				this.removeGlobalKeymaps();
			else
				this.restoreGlobalKeymaps();
		}));
		this.subscriptions.add(atom.config.onDidChange('core.packagesWithKeymapsDisabled', {}, ({newValue, oldValue})=>{
			if (newValue && !atom.config.get('bg-ui-font-sizer.enable-global-keymaps')) {
				this.removeGlobalKeymaps();
			}
		}));
	}

	toggleModalDialog() {
		this.tabsDialog.setSelectedTabLocation(atom.workspace.getActivePaneContainer().getLocation());
		this.tabsDialog.toggle();
	}

	// the tab commands all use this to determine which tab bar to operate on
	getActiveSizer() {
		switch (this.getTabsLocationToChange()) {
			case "center": return this.tabFontSizerWorkSpcCenter;   break;
		  	case "left":   return this.tabFontSizerLeftDock;        break;
		 	case "right":  return this.tabFontSizerRightDock;       break;
			case "bottom": return this.tabFontSizerBottomDock;      break;
			case "all":    return this.tabFontSizerAllTabs;         break;
			default:       return this.tabFontSizerWorkSpcCenter;
		}
	}

	// when the tabsDialog is closed, we use the place where the user has the focus
	// when the tabsDialog is open, we use its explicit selected location
	getTabsLocationToChange() {
		if (this.tabsDialog.isShown())
			return this.tabsDialog.getSelectedTabLocation();
		else
			return atom.workspace.getActivePaneContainer().getLocation();
	}

	cycleTabsLocation(direction) {
		var next;
		switch (this.tabsDialog.getSelectedTabLocation()) {
			case "center": next = (direction) ? "right"  :  "left"    ; break;
			case "left":   next = (direction) ? "center" :  "all"     ; break;
			case "right":  next = (direction) ? "bottom" :  "center"  ; break;
			case "bottom": next = (direction) ? "all"    :  "right"   ; break;
			case "all":    next = (direction) ? "left"   :  "bottom"     ; break;
		}
		this.tabsDialog.setSelectedTabLocation(next);
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

	// this supports the enable-global-keymaps config option
	removeGlobalKeymaps() {
		if ((atom.config.get('core.packagesWithKeymapsDisabled') || []).includes('bg-ui-font-sizer'))
			return

		var removeCount = BGRemoveKeybindings({
			sourceRegex:   /bg-ui-font-sizer/,
			selectorRegex: /(atom-workspace)|([.]tree-view)/
		});

		// if the settings tab is open, notify it that we disabled some keybindings so that it can update its view
		var settingsView = BGFindWorkspaceItemFromURI('atom://config');
		if (settingsView && settingsView.packageManager && settingsView.packageManager.emitter)
			settingsView.packageManager.emitter.emit('package-updated', {pack: {name: 'bg-ui-font-sizer'}});
	}

	restoreGlobalKeymaps() {
		if ((atom.config.get('core.packagesWithKeymapsDisabled') || []).includes('bg-ui-font-sizer'))
			return

		if (atom.packages.activePackages['bg-ui-font-sizer'] && typeof atom.packages.activePackages['bg-ui-font-sizer'].activateKeymaps == 'function' && typeof atom.packages.activePackages['bg-ui-font-sizer'].deactivateKeymaps == 'function') {
			atom.packages.activePackages['bg-ui-font-sizer'].keymapActivated = false;
			atom.packages.activePackages['bg-ui-font-sizer'].activateKeymaps()
			// if the settings tab is open, notify it that we disabled some keybindings so that it can update its view
			var settingsView = BGFindWorkspaceItemFromURI('atom://config');
			if (settingsView && settingsView.packageManager && settingsView.packageManager.emitter)
				settingsView.packageManager.emitter.emit('package-updated', {pack: {name: 'bg-ui-font-sizer'}});
			
		} else {
			console.log("Restart Atom to make the enable global keymaps take effect. Package bg-ui-font-sizer: enabling the global key maps did not work, possibly the package needs to be updated for a newer Atom version.");
			atom.notifications.addWarning("Restart Required. restoring the keymaps at runtime did not work. Maybe the package needs to be updated for this Atom version");
		}
	}


	//"configSchema":
	config =  {
		"enable-global-keymaps": {
			"type": "boolean",
			"default": true,
			"title": "Enable Global Keymaps",
			"description": "Deselecting this will disable only some of the the keymaps provided by this package.  Only the ones associated with this package's modal dialog will remain."
		}
	}
};

export default new BGUIFontSizerAtomPlugin
