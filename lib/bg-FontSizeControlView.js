'use babel';

import { CompositeDisposable } from 'atom';
import { BGAtomView } from 'bg-atom-utils';
import { ToggleButton, Button, Toolbar, ToolGroup, Panel } from 'bg-atom-redom-ui';
import { el, list, mount, unmount, setAttr } from 'redom';

// Main Atom Plugin Class
export class BGFontSizeControlView  {
	constructor() {
		t = this; console.log("t is the test var");
		this.panel = new Panel({
		  children: [
			["bar", new Toolbar({
			  children: [
				["bar", new ToolGroup({
				  attr: {class: '.btn-group-xs'},
				  children: [
					["btn1", new Button("one", ()=>{}, {attr: {class: 'icon icon-gear inline-block-tight'}})],
					["btn2", new ToggleButton("icon-arrow-left")]
				  ]
				})],
				["btn3", new Button("three")]
			  ]
			})]
		  ]
		});
		this.modalPanel = atom.workspace.addModalPanel({item: this.panel.el, visible: false, autoFocus:true});
	}

	toggle() {
		this.modalPanel.isVisible() ? this.hide() : this.show()
	}

	show() {
		// TODO: calculate a dynamic position
		this.modalPanel.getElement().style.top = '100px'
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
