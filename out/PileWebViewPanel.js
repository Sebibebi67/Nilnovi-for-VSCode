"use strict";
//============================ Class PileWebViewPanel ============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.PileWebViewPanel = void 0;
//--------------------------------- Description ----------------------------------//
//
// This class describes a webview used to show the execution pile
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Simon JOURDAN
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
const vscode = require("vscode");
const fs_1 = require("fs");
//--------------------------------------------------------------------------------//
class PileWebViewPanel {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(context) {
        this.panel = vscode.window.createWebviewPanel("pile", "Pile éxecution", { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: []
        });
        this.panel.webview.html = this.getWebviewContent();
        this.panel.onDidDispose(() => { PileWebViewPanel.dispose(); });
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    /**
     * @description Returns the panel
     * @param vscode.ExtensionContext context
     * @returns the panel
     * @author Simon JOURDAN
     */
    static get(context) {
        if (!this.instance) {
            this.instance = new PileWebViewPanel(context);
        }
        return this.instance.panel;
    }
    /**
     * @description Closes the window
     * @author Simon JOURDAN
     */
    static dispose() {
        this.instance = undefined;
    }
    /**
     * @description Returns the html file
     * @returns the html file
     * @author Sébastien HERT
     * @author Simon JOURDAN
     */
    getWebviewContent() {
        return fs_1.readFileSync("./src/Webview/pileDisplay.html", "utf-8");
    }
}
exports.PileWebViewPanel = PileWebViewPanel;
//------------------------------- Class Variables --------------------------------//
PileWebViewPanel.instance = undefined;
//================================================================================//
//# sourceMappingURL=PileWebViewPanel.js.map