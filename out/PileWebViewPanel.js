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
const fs_1 = require("fs");
//--------------------------------------------------------------------------------//
class PileWebViewPanel {
    constructor() {
        this.text = "";
        this.panel = vscode.window.createWebviewPanel("pile", "Pile éxecution", vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        fs_1.readFile(__dirname + '/../src/temp.html', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            }
            this.panel.webview.html = data;
        });
        this.panel.onDidDispose(() => {
            PileWebViewPanel.dispose();
        });
        // A utiliser si l'on souhaite envoyer un message depuis la webview vers le reste de l'extension
        // this.panel.webview.onDidReceiveMessage(
        //     message => {
        //         switch (message.command) {
        //             case 'alert':
        //                 vscode.window.showErrorMessage(message.text);
        //                 return;
        //         }
        //     },
        //     undefined
        // );
    }
    static get() {
        if (!this.instance) {
            this.instance = new PileWebViewPanel();
        }
        return this.instance.panel;
    }
    static dispose() {
        this.instance = undefined;
    }
}
exports.PileWebViewPanel = PileWebViewPanel;
PileWebViewPanel.instance = undefined;
//# sourceMappingURL=PileWebViewPanel.js.map