'use babel';

import { CompositeDisposable } from 'atom';
import { bgAsyncSleep, BGAtomPlugin, BGAtomTreeItemFontSizer, BGAtomTabFontSizer } from 'bg-atom-utils';
import { BGFontSizeControlView } from './bg-FontSizeControlView'

// Main Atom Plugin Class
class BGUIFontSizerAtomPlugin extends BGAtomPlugin {
	constructor() {
		super();
		this.tabsDialog = null;
		bgUIFontSizer = this; console.log("the global variable 'bgUIFontSizer' is available on the console to hack with the bg-ui-font-sizer package code");
	}

	async activate(state) {
		this.tabsDialog = new BGFontSizeControlView();

		this.treeViewEl = document.querySelector('.tree-view.tool-panel');
		if (this.treeViewEl) {
			this.treeItemFontSizer = new BGAtomTreeItemFontSizer(this.treeViewEl, (state ? state.treeItemFontSizer : null));
			this.subscriptions.add(this.treeItemFontSizer);

			// register the tree-view commands. note the bg-tree-view:.. lables to associate the commands more strongly with tree-view.
			this.addCommand("bg-tree-view:increase-font-size",   ()=>this.treeItemFontSizer.adjustFontSize( 1 ));
			this.addCommand("bg-tree-view:decrease-font-size",   ()=>this.treeItemFontSizer.adjustFontSize(-1 ));
			this.addCommand("bg-tree-view:reset-font-size",      ()=>this.treeItemFontSizer.resetFontSize());
			this.addCommand("bg-tree-view:increase-line-height", ()=>this.treeItemFontSizer.adjustItemLineHightPercentage( 10 ));
			this.addCommand("bg-tree-view:decrease-line-height", ()=>this.treeItemFontSizer.adjustItemLineHightPercentage(-10 ));
		}

		this.tabFontSizerWorkSpcCenter = new BGAtomTabFontSizer('atom-workspace-axis.vertical > atom-pane-container.panes', (state ? state.tabFontSizerWorkSpcCenter : null))
		this.subscriptions.add(this.tabFontSizerWorkSpcCenter);

		this.tabFontSizerLeftDock = new BGAtomTabFontSizer('atom-dock.left', (state ? state.tabFontSizerLeftDock : null))
		this.subscriptions.add(this.tabFontSizerLeftDock);

		this.tabFontSizerRightDock = new BGAtomTabFontSizer('atom-dock.right', (state ? state.tabFontSizerRightDock : null))
		this.subscriptions.add(this.tabFontSizerRightDock);

		this.tabFontSizerBottomDock = new BGAtomTabFontSizer('atom-dock.bottom', (state ? state.tabFontSizerBottomDock : null))
		this.subscriptions.add(this.tabFontSizerBottomDock);

		// register the tree-view commands. note the bg-tree-view:.. lables to associate the commands more strongly with tree-view.
		this.addCommand("bg-tabs:increase-font-size",   ()=>this.adjustTabFontSizeForActiveDock( 1 ));
		this.addCommand("bg-tabs:decrease-font-size",   ()=>this.adjustTabFontSizeForActiveDock(-1 ));
		this.addCommand("bg-tabs:reset-font-size",      ()=>this.resetTabFontSizeForActiveDock());
		this.addCommand("bg-tabs:increase-bar-height",  ()=>this.adjustTabBarHeightForActiveDock( 1 ));
		this.addCommand("bg-tabs:decrease-bar-height",  ()=>this.adjustTabBarHeightForActiveDock(-1 ));
		this.addCommand("bg-tabs:toggle-size-dialog",   ()=>{this.tabsDialog.toggle();});
	}

	adjustTabFontSizeForActiveDock(delta) {
		this.getActiveSizer().adjustFontSize(delta);
	}

	adjustTabBarHeightForActiveDock(delta) {
		this.getActiveSizer().adjustBarHeight(delta);
	}

	resetTabFontSizeForActiveDock() {
		this.getActiveSizer().resetFontSize();
	}


	getActiveSizer() {
		var dock = atom.workspace.getActivePaneContainer();
		if (dock === atom.workspace.getCenter())         	return this.tabFontSizerWorkSpcCenter;
		else if (dock === atom.workspace.getLeftDock())  	return this.tabFontSizerLeftDock;
		else if (dock === atom.workspace.getRightDock()) 	return this.tabFontSizerRightDock;
		else if (dock === atom.workspace.getBottomDock())	return this.tabFontSizerBottomDock;
	}

	// save our state so that Atom can provide consistency between restarts
	serialize() {
		return {
			treeItemFontSizer: (this.treeItemFontSizer) ? this.treeItemFontSizer.serialize() : null,
			tabFontSizerWorkSpcCenter:      (this.tabFontSizerWorkSpcCenter)      ? this.tabFontSizerWorkSpcCenter.serialize()      : null,
			tabFontSizerLeftDock:           (this.tabFontSizerLeftDock)           ? this.tabFontSizerLeftDock.serialize()           : null,
			tabFontSizerRightDock:          (this.tabFontSizerRightDock)          ? this.tabFontSizerRightDock.serialize()          : null,
			tabFontSizerBottomDock:         (this.tabFontSizerBottomDock)         ? this.tabFontSizerBottomDock.serialize()         : null
		};
	}
};

export default new BGUIFontSizerAtomPlugin
