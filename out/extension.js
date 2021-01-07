"use strict";
//================================= extension.ts =================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
//--------------------------------- Description ----------------------------------//
//
// This file contains the main scripts to run the application
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Simon JOURDAN
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
const vscode = require("vscode");
const path = require("path");
const fs_1 = require("fs");
const Executor_1 = require("./Executor");
const PileWebViewPanel_1 = require("./PileWebViewPanel");
const syntaxError = require("./syntax/SyntaxError");
const compilationError = require("./compiler/CompilationError");
const providers_1 = require("./syntax/providers");
const providers_2 = require("./syntax/providers");
const Compiler_1 = require("./compiler/Compiler");
//--------------------------------------------------------------------------------//
//------------------------------- Global Variables -------------------------------//
let outputChannel = vscode.window.createOutputChannel("Nilnovi - Output");
//--------------------------------------------------------------------------------//
//----------------------------------- Activate -----------------------------------//
/**
 * @description defines the commands and the actions of the extension
 * @param vscode.ExtensionContext context of the extension
 * @author Sébastien HERT
 * @author Adam RIVIERE
 */
function activate(context) {
    toolBarInit();
    // if the run command has been activate
    let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => { runNilnovi(context); });
    let toto = vscode.commands.registerCommand("nilnovi-for-vscode.launch", () => { launch(context); });
    // creation of the diagnostic collection
    var diag_list = [];
    // we keep the active text editor
    var editor = vscode.window.activeTextEditor;
    // if the editor exists
    if (editor !== undefined) {
        // we get the path to the current file
        var fileNamePath = editor.document.uri.fsPath;
        // if the file is a NilNovi file (.nn extension)
        if (fileNamePath.endsWith(".nn")) {
            // we check the errors and complete the diagnostic collection
            providers_1.setErrors(editor.document.getText());
            providers_1.updateDiags(editor.document, diag_list);
        }
    }
    // each time the document is modified
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        // if the event is not undefined
        if (e !== undefined) {
            // we get the path to the current file
            var fileNamePath = e.document.uri.fsPath;
            // if the file is a NilNovi file (.nn extension)
            if (fileNamePath.endsWith(".nn")) {
                // we clear the previous diagnostic collection
                diag_list.forEach(diag => diag.clear());
                // we check the errors and complete the diagnostic collection
                providers_1.setErrors(e.document.getText());
                providers_1.updateDiags(e.document, diag_list);
            }
        }
    }));
    // we generate the auto completion and the hovers
    context.subscriptions.push(providers_1.autoCompletion(), providers_2.hovers());
}
exports.activate = activate;
//--------------------------------------------------------------------------------//
//---------------------------------- Functions -----------------------------------//
/**
 * @description runs the compilation and the execution of a nilnovi Program
 * @param vscode.ExtensionContext context
 * @author Sébastien HERT
 */
function runNilnovi(context) {
    // checks if there is an activeTextEditor
    if (vscode.window.activeTextEditor) {
        // Then, the file should have the ".nn" extension to be runnable
        var fileNamePath = vscode.window.activeTextEditor.document.uri.fsPath;
        if (fileNamePath.endsWith(".nn")) {
            // If providers have already raised an error
            if (syntaxError.isError) {
                vscode.window.showErrorMessage("An error occurred before compilation. Please correct the syntax before trying again");
            }
            // Else we can compile the program
            else {
                vscode.window.showInformationMessage("Compilation in progress");
                var compiler = new Compiler_1.Compiler(fs_1.readFileSync(fileNamePath, "utf-8"), outputChannel);
                // if an error occurred
                if (compilationError.isError) {
                    vscode.window.showErrorMessage("Execution aborted : An error occurred during compilation.");
                }
                // if not
                else {
                    // Let's write the instructions in a new file (or override if it already exists) with the same name, and the ".machine_code" extension
                    let outputFile = vscode.window.activeTextEditor.document.uri.fsPath.replace(".nn", ".machine_code");
                    fs_1.writeFileSync(outputFile, compiler.displayInstructions());
                    // Now we could display the pile
                    let panel = PileWebViewPanel_1.PileWebViewPanel.get(context);
                    panel.webview.postMessage({
                        command: "showInstructionList",
                        list: compiler.instructions
                    });
                    // And execute those instructions
                    let executor = new Executor_1.Executor(compiler.instructions, outputChannel, panel);
                }
            }
        }
        // else its not a ".nn" file
        else {
            vscode.window.showErrorMessage(path.basename(fileNamePath) + ' is not a Nilnovi file, please use the".nn" extension');
        }
    }
    // else there is no current file
    else {
        vscode.window.showErrorMessage("No current file");
    }
}
function launch(context) {
    console.log("launched");
}
function toolBarInit() {
    let commandArray = [];
}
function deactivate() { }
exports.deactivate = deactivate;
//--------------------------------------------------------------------------------//
//================================================================================//
//# sourceMappingURL=extension.js.map