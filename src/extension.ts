//================================= extension.ts =================================//


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

import * as vscode from "vscode";
import path = require("path");
import { readFileSync, writeFileSync } from "fs";
import { Executor } from "./Executor";
import { PileWebViewPanel } from "./PileWebViewPanel";
import * as syntaxError from "./syntax/SyntaxError";
import * as compilationError from "./compiler/CompilationError"


import { autoCompletion, setErrors, updateDiags } from "./syntax/providers";
import { hovers } from "./syntax/providers";
import { Compiler } from "./compiler/Compiler";

//--------------------------------------------------------------------------------//


//------------------------------- Global Variables -------------------------------//

let outputChannel = vscode.window.createOutputChannel("Nilnovi - Output");
let executor : Executor;
let onRun = false;
let onPause = false;

//--------------------------------------------------------------------------------//


//----------------------------------- Activate -----------------------------------//

/**
 * @description defines the commands and the actions of the extension
 * @param vscode.ExtensionContext context of the extension
 * @author Sébastien HERT
 * @author Adam RIVIERE
 */
export function activate(context: vscode.ExtensionContext) {

	// if the run command has been activate
	let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => { if (!onRun) {runNilnovi(context);} });
	let halt = vscode.commands.registerCommand("nilnovi-for-vscode.stop", () => { stop(); });
	let pause = vscode.commands.registerCommand("nilnovi-for-vscode.resume", () => { resume(); });

	// creation of the diagnostic collection
	var diag_list: vscode.DiagnosticCollection[] = [];

	// we keep the active text editor
	var editor = vscode.window.activeTextEditor;

	// if the editor exists
	if (editor !== undefined) {

		// we get the path to the current file
		var fileNamePath = editor.document.uri.fsPath;

		// if the file is a NilNovi file (.nn extension)
		if (fileNamePath.endsWith(".nn")) {

			// we check the errors and complete the diagnostic collection
			setErrors(editor.document.getText());
			updateDiags(editor.document, diag_list);
		}
	}

	// each time the document is modified
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(
		(e: vscode.TextDocumentChangeEvent | undefined) => {

			// if the event is not undefined
			if (e !== undefined) {

				// we get the path to the current file
				var fileNamePath = e.document.uri.fsPath;

				// if the file is a NilNovi file (.nn extension)
				if (fileNamePath.endsWith(".nn")) {

					// we clear the previous diagnostic collection
					diag_list.forEach(diag => diag.clear());

					// we check the errors and complete the diagnostic collection
					setErrors(e.document.getText());
					updateDiags(e.document, diag_list);
				}
			}
		}
	));

	// we generate the auto completion and the hovers
	context.subscriptions.push(autoCompletion(), hovers());
}

//--------------------------------------------------------------------------------//


//---------------------------------- Functions -----------------------------------//


/**
 * @description runs the compilation and the execution of a nilnovi Program
 * @param vscode.ExtensionContext context
 * @author Sébastien HERT
 */
function runNilnovi(context: vscode.ExtensionContext) {

	// checks if there is an activeTextEditor
	if (vscode.window.activeTextEditor) {

		// Then, the file should have the ".nn" extension to be runnable
		var fileNamePath = vscode.window.activeTextEditor.document.uri.fsPath;
		if (fileNamePath.endsWith(".nn")) {

			// If providers have already raised an error
			if (syntaxError.isError) { vscode.window.showErrorMessage("An error occurred before compilation. Please correct the syntax before trying again"); }

			// Else we can compile the program
			else {
				vscode.window.showInformationMessage("Compilation in progress");
				var compiler = new Compiler(readFileSync(fileNamePath, "utf-8"), outputChannel);

				// if an error occurred
				if (compilationError.isError) { vscode.window.showErrorMessage("Execution aborted : An error occurred during compilation."); }

				// if not
				else {

					// Let's write the instructions in a new file (or override if it already exists) with the same name, and the ".machine_code" extension
					let outputFile = vscode.window.activeTextEditor.document.uri.fsPath.replace(".nn", ".machine_code");
					writeFileSync(outputFile, compiler.displayInstructions());

					// Now we could display the pile
					let panel: vscode.WebviewPanel = PileWebViewPanel.get(context);
					panel.webview.postMessage({
						command: "showInstructionList",
						list: compiler.instructions
					});

					// And execute those instructions
					
					executor = new Executor(compiler.instructions, outputChannel, panel);
					onRun = true;
					executor.run().then(() => {
						if (executor.onPause == false){console.log("end");onRun = false}
					});
				}
			}
		}

		// else its not a ".nn" file
		else { vscode.window.showErrorMessage(path.basename(fileNamePath) + ' is not a Nilnovi file, please use the".nn" extension'); }
	}

	// else there is no current file
	else { vscode.window.showErrorMessage("No current file"); }
}

function stop(){
	if (onRun){
		executor.stop();
		onRun = false
	}
}

function resume(){
	if (onRun && !onPause) {
		executor.pause();
		onPause = true;
	}

	else if (onRun && onPause){
		executor.resume();
		onPause = false;
	}
}

export function deactivate() { }

//--------------------------------------------------------------------------------//


//================================================================================//


