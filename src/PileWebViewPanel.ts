import { debug, timeStamp } from "console";
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
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, '/src/Webview'))]
            });

        this.panel.webview.html = this.getWebviewContent(this.panel.webview, context);

        this.panel.onDidDispose(() => {
            PileWebViewPanel.dispose();
        })

    }

    public static get(context: vscode.ExtensionContext){
        if(!this.instance){
            this.instance = new PileWebViewPanel(context);
        }
        return this.instance.panel;
    }

    private static dispose(){
        this.instance = undefined;
    }

    private getWebviewContent(webview: vscode.Webview, context: Context) {
        return`
        <!DOCTYPE html>
            <html lang="fr">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" type="text/css" href="${webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/Webview', 'style.css')))}">
                <title>Cat Coding</title>
            </head>

            <body>

                <div>
                    <ul id='pileExecution'></ul>
                </div>
                <p id='debug'>debug</p>

                <script>

                    const vscode = acquireVsCodeApi();
                    // Handle the message inside the webview
                    window.addEventListener('message', event => {
                        const message = event.data; // The JSON data our extension sent
                        document.getElementById('debug').innerHTML = message.command;
                        switch (message.command) {

                            case 'showPile':
                                ul = document.getElementById('pileExecution');
                                message.pile.forEach(element => {
                                    let li = document.createElement('li');
                                    li.innerHTML = element;
                                    ul.insertBefore(li, ul.firstChild);
                                })
                                break;
                        }

                    });
                </script>

            </body>

        </html>`
    }
}