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
//--------------------------------------------------------------------------------//
class PileWebViewPanel {
    constructor(context) {
        this.panel = vscode.window.createWebviewPanel("pile", "Pile éxecution", { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, {
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
                <div class='div'>
                    <div>
                        <h1>Code Machine</h1>
                        <p id='instruction'></p>
                        <table id='instructionList'>
                            <tbody id = 'instructionListBody'></tbody>
                        </table>
                    </div>
                    <div>
                        <h1>Pile d'exécution</h1>
                        <table id='pileExecution'>
                            <thead><tr><td>Indice pile</td><td>Pile d'exécution</td></tr></thead>
                            <tbody  id='pileBody'></tbody>
                        </table>
                        <table id='legende'><tbody>
                            <tr>
                                <td>Couleurs:</td>
                                <td class='integer'>Entier</td>
                                <td class='boolean'>Booléen</td>
                                <td class='address'>Adresse</td>
                                <td class='block'>Bloc de liaison</td>
                            </tr>
                        </tbody></table>
                    </div> 
                </div>

                <script>

                    const vscode = acquireVsCodeApi();
                    // Handle the message inside the webview

                    window.addEventListener('message', event => {

                        const message = event.data; // The JSON data our extension sent

                        switch (message.command) {

                            case 'showPile':
                                table = document.getElementById('pileExecution');
                                tableBody = document.getElementById('pileBody');
                                tableBody.innerHTML = "" //Reset Pile
                                
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
                                
                                let highlighted = document.getElementById('highlighted');
                                highlighted.classList.remove('highlighted');
                                highlighted.removeAttribute("id");
                                document.getElementById('instructionListBody').children[message.instructionLine-1].classList.add('highlighted');
                                document.getElementById('instructionListBody').children[message.instructionLine-1].id = "highlighted";
                                break;

                            case 'showInstructionList':

                            
                                let instructionListBody = document.getElementById('instructionListBody');
                                let debug = document.getElementById('debug');


                                instructionListBody.innerHTML = "";

                                for (let i = 0; i< message.list.length; i++){

                                    let instruction = message.list[i];    
                                                                 
                                    let num = document.createElement('td');
                                    num.classList.add("num");
                                    
                                    num.innerHTML = (i+1)+" - ";

                                    let tr = document.createElement('tr');
                                    let line = document.createElement('td');

                                    line.innerHTML = instruction.machineCode;
              
                                    tr.appendChild(num);
                                    tr.appendChild(line);
                                    instructionListBody.appendChild(tr);
                                    
                                }
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