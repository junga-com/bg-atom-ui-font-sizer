import { DispatchCommand } from 'bg-atom-utils';
import { Component, Button, OneShotButton, Panel } from 'bg-dom';

// BGFontSizeControlModalDialog is a modal dialog box that can pop up to let the user adjust the font size and line height of the
// tree-view and tabs. Some users wont want to devote a lot of keymaps to changing the font size so this gives them easy access
// to all the commands provided by this package. When the modal has the focus, its keymaps temporariliy override the keymaps
export class BGFontSizeControlModalDialog  {
	constructor() {

		const buttonOpts = {
			tabindex: -1
		}

		this.panel = new Panel(".bg-ui-font-sizer-dialog", [
			new Component('$div.panel-heading <div><h1>Keyboard Mode to Adjust Pane Tab Sizes in the 4 Docks</h1>'+
			       '<div>use <kbd class="key-binding">Escape</kbd> when done.'+
				   'Left side controls which Dock is being changed. Right side show what keys are available </div></div>', {tabindex:1}),
			new Component('leftSide:$div.inset-panel', [
				new OneShotButton("left: <p>Left Dock</p>"   ,(dockSelection)=>this.setSelectedDock(dockSelection), buttonOpts),
				new OneShotButton(
					'center: <div>Workspace Center</div>'+
					'<div><kbd class="key-binding">(shift-)tab</kbd><span>cycle thru Docks</span></div>'+
					'<div><kbd class="key-binding">up/down/left/right</kbd><span>select Dock</span></div>'
				 	,(dockSelection)=>this.setSelectedDock(dockSelection), buttonOpts),
				new OneShotButton("right: <p>Right Dock</p>"  ,(dockSelection)=>this.setSelectedDock(dockSelection), buttonOpts),
				new OneShotButton("bottom: Bottom Dock" ,(dockSelection)=>this.setSelectedDock(dockSelection), buttonOpts)
			]),
			new Component('rightSide:$div.inset-panel', [
				new Button('escape:      <kbd class="key-binding">escape</kbd>   <span>close this window</span>',     ()=>DispatchCommand('bg-tabs:toggle-size-dialog'),   buttonOpts ),
				new Button('reset:       <kbd class="key-binding">Ctrl-0</kbd>   <span>reset to default size</span>', ()=>DispatchCommand('bg-tabs:reset-font-size'),      buttonOpts ),
				new Button('fontBigger:  <kbd class="key-binding">Ctrl-+</kbd>   <span>Bigger Font</span>',           ()=>DispatchCommand('bg-tabs:increase-font-size'),   buttonOpts ),
				new Button('fontSmaller: <kbd class="key-binding">Ctrl--</kbd>   <span>Smaller Font</span>',          ()=>DispatchCommand('bg-tabs:decrease-font-size'),   buttonOpts ),
				new Button('lineShorter: <kbd class="key-binding">Ctrl-up</kbd>  <span>Shorter Line</span>',          ()=>DispatchCommand('bg-tabs:decrease-line-height'), buttonOpts ),
				new Button('lineTaller:  <kbd class="key-binding">Ctrl-down</kbd><span>Taller Line</span>',           ()=>DispatchCommand('bg-tabs:increase-line-height'), buttonOpts )
			])
		]);
		this.modalPanel = atom.workspace.addModalPanel({item: this.panel.el, visible: false, autoFocus:true});
		this.modalPanel.getElement().classList.add("bg-ui-font-sizer-dialog");

		this.setSelectedDock("center");
	}

	setSelectedDock(dockSelection) {
		this.selectedDock = dockSelection;
		for (const dockName of ["left","center","right","bottom"]) {
			this.panel.leftSide[dockName].setPressedState(this.selectedDock=='all' || dockName==this.selectedDock);
		}
	}

	getSelectedDock() {return this.selectedDock;}

	cycleSelectedDock(direction) {
		var next;
		switch (this.getSelectedDock()) {
			case "center": next = (direction) ? "right"  :  "left"    ; break;
			case "left":   next = (direction) ? "center" :  "all"     ; break;
			case "right":  next = (direction) ? "bottom" :  "center"  ; break;
			case "bottom": next = (direction) ? "all"    :  "right"   ; break;
			case "all":    next = (direction) ? "left"   :  "bottom"     ; break;
		}
		this.setSelectedDock(next);
	}

	selectDockWithDirectionKey(direction) {
		var next = this.getSelectedDock();
		switch (direction) {
			case "up":     next = (next!='center') ? "center" : "all"   ; break;
			case "down":   next = (next!='bottom') ? "bottom" : "all"   ; break;
			case "left":   next = (next=='right')  ? "center" : "left"  ; break;
			case "right":  next = (next=='left')   ? "center" : "right" ; break;
		}
		this.setSelectedDock(next);
	}

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
