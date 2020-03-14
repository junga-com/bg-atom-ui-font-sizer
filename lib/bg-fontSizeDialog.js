'use babel';

import { CompositeDisposable } from 'atom';
import { BGAtomView, DispatchCommand } from 'bg-atom-utils';
import { Component, ToggleButton, Button, OneShotButton, Toolbar, ToolGroup, Panel } from 'bg-atom-redom-ui';
import { el, list, mount, unmount, setAttr, text } from 'redom';

// BGFontSizeControlView is a modal dialog box that can pop up to let the user adjust the font size and line height of the 
// tree-view and tabs. Some users wont want to devote a lot of keymaps to changing the font size so this gives them easy access
// to all the commands provided by this package. When the modal has the focus, its keymaps temporariliy override the keymaps 
export class BGFontSizeControlView  {
	constructor() {
		// bgModalDialog = this; console.log("bgModalDialog is the test var in the console");

		const buttonOpts = {
			tabindex: -1
		}

		this.panel = new Panel({
		  class: "bg-ui-font-sizer-dialog",
		  children: [
			[new Component('div.panel-heading', {children: el("h1","Keyboard Mode to Adjust Pane Tab Sizes - 'Escape' when done", {tabindex:1})})],
			["leftSide", new Component('div.inset-panel', {
			  children: [
					["left",   new OneShotButton("<p>Left Dock</p>"   ,(dockSelection)=>this.setSelectedTabLocation(dockSelection), buttonOpts)],
					["center", new OneShotButton(
						'<div>Workspace Center</div>'+
						'<div><kbd class="key-binding">tab</kbd><span>next Dock</span></div>'+
						'<div><kbd class="key-binding">shift-tab</kbd><span>previous Dock</span></div>'
					 	,(dockSelection)=>this.setSelectedTabLocation(dockSelection), buttonOpts)],
					["right",  new OneShotButton("<p>Right Dock</p>"  ,(dockSelection)=>this.setSelectedTabLocation(dockSelection), buttonOpts)],
					["bottom", new OneShotButton("Bottom Dock" ,(dockSelection)=>this.setSelectedTabLocation(dockSelection), buttonOpts)]
			  ]
			})],
			["rightSide", new Component('div.inset-panel', {
  			  children: [
					["escape",      new Button('<kbd class="key-binding">escape   </kbd><span>close this window</span>',     ()=>DispatchCommand('bg-tabs:toggle-size-dialog'),   buttonOpts )],
					["reset",       new Button('<kbd class="key-binding">Ctrl-0   </kbd><span>reset to default size</span>', ()=>DispatchCommand('bg-tabs:reset-font-size'),      buttonOpts )],
  					["fontBigger",  new Button('<kbd class="key-binding">Ctrl-+   </kbd><span>Bigger Font</span>',           ()=>DispatchCommand('bg-tabs:increase-font-size'),   buttonOpts )],
  					["fontSmaller", new Button('<kbd class="key-binding">Ctrl--   </kbd><span>Smaller Font</span>',          ()=>DispatchCommand('bg-tabs:decrease-font-size'),   buttonOpts )],
					["lineShorter", new Button('<kbd class="key-binding">Ctrl-up  </kbd><span>Shorter Line</span>',          ()=>DispatchCommand('bg-tabs:decrease-line-height'), buttonOpts )],
  					["lineTaller",  new Button('<kbd class="key-binding">Ctrl-down</kbd><span>Taller Line</span>',           ()=>DispatchCommand('bg-tabs:increase-line-height'), buttonOpts )]
  			  ]
			})]
		  ]
		});
		this.modalPanel = atom.workspace.addModalPanel({item: this.panel.el, visible: false, autoFocus:true});
		this.modalPanel.getElement().classList.add("bg-ui-font-sizer-dialog");

		this.setSelectedTabLocation("center");
	}

	setSelectedTabLocation(dockSelection) {
		this.selectedDock = dockSelection;
		for (const dockName of ["left","center","right","bottom"]) {
			this.panel.leftSide[dockName].setPressedState(this.selectedDock=='all' || dockName==this.selectedDock);
		}
	}

	getSelectedTabLocation() {return this.selectedDock;}

	isShown() {
		return this.modalPanel.isVisible();
	}

	toggle() {
		this.isShown() ? this.hide() : this.show()
	}

	show() {
		this.modalPanel.show();
	}
	
	hide() {
		this.modalPanel.hide();
	}

	serialize() {}

	destroy() {
		this.modalPanel.destroy();
	}

	getElement() {return this.el;}

}
