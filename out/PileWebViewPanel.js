"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PileWebViewPanel = void 0;
//================================ Class Executor ================================//
//--------------------------------- Description ----------------------------------//
//
// This class describes a webview used to show the execution pile
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Simon Jourdan
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
const vscode = require("vscode");
//--------------------------------------------------------------------------------//
class PileWebViewPanel {
    constructor() {
        this.panel = vscode.window.createWebviewPanel("pile", "Pile éxecution", vscode.ViewColumn.Two, {});
        this.panel.webview.html = this.getWebviewContent();
    }
    static get() {
        if (!this.active) {
            this.instance = new PileWebViewPanel();
            this.active = true;
        }
        return this.instance.panel;
    }
    getWebviewContent() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Cat Coding</title>
        </head>
        <body>
            <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
        </body>
        </html>`;
    }
}
exports.PileWebViewPanel = PileWebViewPanel;
PileWebViewPanel.active = false;
//# sourceMappingURL=PileWebViewPanel.js.map