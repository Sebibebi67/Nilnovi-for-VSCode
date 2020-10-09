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

//--------------------------------------------------------------------------------//

export class PileWebViewPanel {

    private static instance: PileWebViewPanel | undefined = undefined;
    private panel: vscode.WebviewPanel;
    public text: string = "";

    private constructor(){
        this.panel = vscode.window.createWebviewPanel(
            "pile",
            "Pile éxecution",
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            });
        readFile(__dirname + '/../src/temp.html','utf8', (err, data) => {
            if (err) { console.error(err) }
            this.panel.webview.html = data;
        });

        this.panel.onDidDispose(()=>{
            PileWebViewPanel.dispose();
        })
        
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
    
    public static get(){
        if(!this.instance){
            this.instance = new PileWebViewPanel();
        }
        return this.instance.panel;
    }

    private static dispose(){
        this.instance = undefined;
    }
}