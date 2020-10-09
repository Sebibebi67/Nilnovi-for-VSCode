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
const fs_1 = require("fs");
//--------------------------------------------------------------------------------//
class PileWebViewPanel {
    // private constructor(){
    //     this.panel = vscode.window.createWebviewPanel(
    //         "pile",
    //         "Pile éxecution",
    //         vscode.ViewColumn.Two,
    //         {
    //             enableScripts: true,
    //             retainContextWhenHidden: true,
    //             localResourceRoots: [vscode.Uri.file(path.join(__dirname, '../src/Webview'))]
    //         });
    //     console.log(__dirname+'/../src/Webview');
    //     readFile(__dirname + '/../src/Webview/temp.html','utf8', (err, data) => {
    //         if (err) { console.error(err) }
    //         this.panel.webview.html = data;
    //     });
    //     this.panel.onDidDispose(()=>{
    //         PileWebViewPanel.dispose();
    //     })
    //     // A utiliser si l'on souhaite envoyer un message depuis la webview vers le reste de l'extension
    //     // this.panel.webview.onDidReceiveMessage(
    //     //     message => {
    //     //         switch (message.command) {
    //     //             case 'alert':
    //     //                 vscode.window.showErrorMessage(message.text);
    //     //                 return;
    //     //         }
    //     //     },
    //     //     undefined
    //     // );
    // }
    constructor(context) {
        this.panel = vscode.window.createWebviewPanel("pile", "Pile éxecution", vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, '/src/Webview'))]
        });
        const onDiskPathStyle = vscode.Uri.file(path.join(context.extensionPath, 'src/Webview', 'style.css'));
        const onDiskPathNyan = vscode.Uri.file(path.join(context.extensionPath, 'src/Webview', 'nyan.gif'));
        const styleSrc = this.panel.webview.asWebviewUri(onDiskPathStyle);
        const nyanSrc = this.panel.webview.asWebviewUri(onDiskPathNyan);
        console.log(path.join(context.extensionPath, '/src/Webview'));
        fs_1.readFile(__dirname + '/../src/Webview/temp.html', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            }
            this.panel.webview.html = data;
        });
        // this.panel.webview.html = this.getWebviewContent(nyanSrc, styleSrc);
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
    getWebviewContent(nyanSrc, styleSrc) {
        return `
        <!DOCTYPE html>
            <html lang="fr">

            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <!-- <link rel="stylesheet" type="text/css" href="./style.css"> -->
                <link rel="stylesheet" type="text/css" href="${styleSrc}">
                <!-- <style>
                    body {
                    background-color: white;
                    font-family: Verdana, sans-serif;
                    font-size: 100%;
                    }
                </style> -->
                <title>Cat Coding</title>
            </head>

            <body>
                <img src="${nyanSrc}" width="300" />
                <h1 id="lines-of-code-counter">0</h1>

                <div>
                    <ul id='myItemList'>
                        <li>Elem1</li>
                    </ul>
                </div>

                <script>
                    const vscode = acquireVsCodeApi();
                    const counter = document.getElementById('lines-of-code-counter');

                    

                    let count = 0;
                    setInterval(() => {
                        counter.textContent = count++;
                    }, 100);

                    // Handle the message inside the webview
                    window.addEventListener('message', event => {
                        const message = event.data; // The JSON data our extension sent

                        switch (message.command) {
                            // case 'coucou':
                            //     li = document.createElement('li');
                            //     li.innerHTML = message.text;
                            //     let ul = document.getElementById('myItemList');
                            //     ul.appendChild(li);
                            //     break;

                            case 'testprim':
                                ul = document.getElementById('myItemList');
                                let array = message.args
                                array.forEach(item => {
                                    li = document.createElement('li');
                                    li.innerHTML = item.toString();
                                    ul.insertBefore(li, ul.children[0]);
                                });
                                break;

                            case 'testbis':
                                ul = document.getElementById('myItemList');
                                num = message.args[0];
                                ul.children[num].innerHTML = message.text;
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