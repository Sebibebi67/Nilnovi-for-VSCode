//============================ Class PileWebViewPanel ============================//


//--------------------------------- Description ----------------------------------//
//
// This class describes a webview used to show the execution pile
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Simon JOURDAN
//
//--------------------------------------------------------------------------------//


//----------------------------------- Imports ------------------------------------//

import * as vscode from "vscode";
import * as path from 'path';
import { readFileSync } from "fs";
import { Context } from "mocha";

//--------------------------------------------------------------------------------//


export class PileWebViewPanel {


    //------------------------------- Class Variables --------------------------------//

    private static instance: PileWebViewPanel | undefined = undefined;
    private panel: vscode.WebviewPanel;

    //--------------------------------------------------------------------------------//


    //--------------------------------- Constructor ----------------------------------//

    private constructor(context: vscode.ExtensionContext) {
        this.panel = vscode.window.createWebviewPanel(
            "pile",
            "Pile éxecution",
            { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: []
            });

        this.panel.webview.html = this.getWebviewContent(context);
        
        this.panel.onDidDispose(() => { PileWebViewPanel.dispose(); })

    }
    //--------------------------------------------------------------------------------//


    //----------------------------------- Methods ------------------------------------//

    /**
     * @description Returns the panel
     * @param vscode.ExtensionContext context
     * @returns the panel
     * @author Simon JOURDAN
     */
    public static get(context: vscode.ExtensionContext) {
        if (!this.instance) {
            this.instance = new PileWebViewPanel(context);
        }
        return this.instance.panel;
    }

    /**
     * @description Closes the window
     * @author Simon JOURDAN
     */
    private static dispose() {
        this.instance = undefined;
    }

    /**
     * @description Returns the html file
     * @returns the html file
     * @author Sébastien HERT
     * @author Simon JOURDAN
     */
    private getWebviewContent(context: vscode.ExtensionContext) {
        return readFileSync(path.join(context.extensionPath, './src/Webview/pileDisplay.html'), { encoding: 'utf8' });
    }

    //--------------------------------------------------------------------------------//


}
//================================================================================//