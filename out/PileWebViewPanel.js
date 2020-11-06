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
const path = require("path");
//--------------------------------------------------------------------------------//
class PileWebViewPanel {
    constructor(context) {
        this.panel = vscode.window.createWebviewPanel("pile", "Pile éxecution", vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, '/src/Webview'))]
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
        return `
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
                <p id='debug'>debug</p>

                <script>

                    const vscode = acquireVsCodeApi();
                    // Handle the message inside the webview
                    window.addEventListener('message', event => {
                        const message = event.data; // The JSON data our extension sent
                        document.getElementById('debug').innerHTML = message.command;
                        switch (message.command) {

                            case 'showPile':
                                table = document.getElementById('pileExecution');
                                tablebody = document.getElementById('pileBody');
                                message.pile.forEach(element => {
                                    let tr = document.createElement('tr');
                                    let num = document.createElement('td');
                                    num.innerHTML = table.rows.length - 1;
                                    tr.appendChild(num);
                                    let content = document.createElement('td');
                                    content.innerHTML = element.value;
                                    content.id = element.type;
                                    tr.appendChild(content);
                                    tablebody.insertBefore(tr, tablebody.firstChild);
                                })
                                break;
                        }

                    });
                </script>

            </body>

        </html>`;
    }
}
exports.PileWebViewPanel = PileWebViewPanel;
PileWebViewPanel.instance = undefined;
//# sourceMappingURL=PileWebViewPanel.js.map