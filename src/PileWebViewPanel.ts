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
            {viewColumn: vscode.ViewColumn.Beside, preserveFocus: true},
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
                    <h1>Pile d'exécution</h1>
                    <table id='pileExecution'>
                        <thead><tr><td>Indice pile</td><td>Pile d'exécution</td></tr></thead>
                        <tbody  id='pileBody'></tbody>
                    </table>
                </div>
                <table id='legende'><tbody>
                    <tr>
                        <td>Couleurs:</td>
                        <td class='int'>Entier</td>
                        <td class='bool'>Booléen</td>
                        <td class='link'>Adresse</td>
                        <td class='block'>Bloc de liaison</td>
                    </tr>
                </tbody></table>

                <script>

                    const vscode = acquireVsCodeApi();
                    // Handle the message inside the webview

                    window.addEventListener('message', event => {

                        const message = event.data; // The JSON data our extension sent

                        switch (message.command) {

                            case 'showPile':
                                table = document.getElementById('pileExecution');
                                tableBody = document.getElementById('pileBody');
                                message.pile.forEach(element => {
                                    let tr = document.createElement('tr');
                                    let num = document.createElement('td');
                                    num.innerHTML = table.rows.length - 1;
                                    if(message.pointer == num.innerHTML){
                                        num.innerHTML = 'ip -> '+num.innerHTML;
                                    }
                                    tr.appendChild(num);
                                    let content = document.createElement('td');
                                    if(element.type != 'link'){
                                        content.innerHTML = "<span class=" + element.type + ">" + element.value + "</span>";
                                    }else{
                                        content.innerHTML = 
                                            "<span class=" + element.type + ">" + element.value + "</span>" + 
                                            " -> (" +
                                            "<span class=" + message.pile[element.value]['type'] +">" + message.pile[element.value]['value'] + "</span>)";
                                    }
                                    tr.appendChild(content);
                                    tableBody.insertBefore(tr, tableBody.firstChild);
                                })
                                break;
                        }

                    });
                </script>

            </body>

        </html>`
    }
}