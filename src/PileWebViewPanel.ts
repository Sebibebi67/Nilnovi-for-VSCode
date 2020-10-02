import { timeStamp } from "console";
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

//--------------------------------------------------------------------------------//

export class PileWebViewPanel {

    private static instance: PileWebViewPanel;
    private panel: vscode.WebviewPanel;
    private static active: boolean = false;

    private constructor(){
        this.panel = vscode.window.createWebviewPanel("pile","Pile éxecution",vscode.ViewColumn.Two,{});
        this.panel.webview.html = this.getWebviewContent();
    }
    
    public static get(){
        if(!this.active){
            this.instance = new PileWebViewPanel();
            this.active = true;
        }
        return this.instance.panel;
    }

    private getWebviewContent(){
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