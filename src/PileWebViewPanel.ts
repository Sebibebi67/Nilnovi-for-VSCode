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

import * as vscode from "vscode";
import * as path from 'path';
import { readFile, readFileSync } from "fs";
import { dirname } from "path";
import { Context } from "vm";

//--------------------------------------------------------------------------------//

export class PileWebViewPanel {

    private static instance: PileWebViewPanel | undefined = undefined;
    private panel: vscode.WebviewPanel;

    private constructor(context: vscode.ExtensionContext) {
        this.panel = vscode.window.createWebviewPanel(
            "pile",
            "Pile éxecution",
            { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, './Webview'))]
            });

        this.panel.webview.html = this.getWebviewContent(this.panel.webview, context);

        this.panel.onDidDispose(() => {
            PileWebViewPanel.dispose();
        })

    }

    public static get(context: vscode.ExtensionContext) {
        if (!this.instance) {
            this.instance = new PileWebViewPanel(context);
        }
        return this.instance.panel;
    }

    private static dispose() {
        this.instance = undefined;
    }

    private getWebviewContent(webview: vscode.Webview, context: Context) {
        let htmlFile = readFileSync("./src/Webview/pileDisplay.html", "utf-8");
        console.log(webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/Webview', 'style.css'))));
        return htmlFile;
    }
}