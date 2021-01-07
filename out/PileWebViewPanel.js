"use strict";
//================================ Class Executor ================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.PileWebViewPanel = void 0;
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
const path = require("path");
const fs_1 = require("fs");
//--------------------------------------------------------------------------------//
class PileWebViewPanel {
    constructor(context) {
        this.panel = vscode.window.createWebviewPanel("pile", "Pile éxecution", { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, './Webview'))]
        });
        this.panel.webview.html = this.getWebviewContent(this.panel.webview, context);
        this.panel.onDidDispose(() => {
            PileWebViewPanel.dispose();
        });
    }
    static get(context) {
        if (!this.instance) {
            this.instance = new PileWebViewPanel(context);
        }
        return this.instance.panel;
    }
    static dispose() {
        this.instance = undefined;
    }
    getWebviewContent(webview, context) {
        let htmlFile = fs_1.readFileSync("./src/Webview/pileDisplay.html", "utf-8");
        console.log(webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/Webview', 'style.css'))));
        return htmlFile;
    }
}
exports.PileWebViewPanel = PileWebViewPanel;
PileWebViewPanel.instance = undefined;
//# sourceMappingURL=PileWebViewPanel.js.map