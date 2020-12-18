// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PythonShell } from "python-shell";
import path = require("path");
import { readFileSync, writeFile, writeFileSync } from "fs";
import { Executor } from "./Executor";
import { PileWebViewPanel } from "./PileWebViewPanel";
import { exec } from "child_process";
import * as syntaxError from "./syntax/SyntaxError";
import * as compilationError from "./compiler/CompilationError"

let outputChannel = vscode.window.createOutputChannel("Nilnovi - Output");
import { autoCompletion, errors, setErrors, updateDiags } from "./syntax/providers";
import { hovers } from "./syntax/providers";
import { Compiler } from "./compiler/Compiler";
import { CompilationError } from "./compiler/CompilationError";

// var pileExec: { value: number, type: string }[] = [{ value: 51, type: 'int' }, { value: 0, type: 'link' }, { value: 17, type: 'int' }, { value: 22, type: 'int' }, { value: 97, type: 'int' }, { value: 10, type: 'bottomBlock' }, { value: 6, type: 'topBlock' }, { value: 0, type: 'bool' }, { value: 4, type: 'int' }];
// let pointerPile = 0;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => {
		// console.log(vscode.window.activeTextEditor);
		runNilnovi(context);
	});

	// let pile = vscode.commands.registerCommand("nilnovi-for-vscode.showPile", () => {
	// 	let panel: vscode.WebviewPanel = PileWebViewPanel.get(context);
	// 	panel.webview.postMessage({ command: "showPile", pile: pileExec, pointer: pointerPile })
	// });

	var diag_list: vscode.DiagnosticCollection[] = [];
	// var diag_list = vscode.languages.createDiagnosticCollection('nilnovi');
	// var diag_coll = vscode.languages.createDiagnosticCollection('nilnovi');
	var editor = vscode.window.activeTextEditor;
	if (editor !== undefined) {

		var fileNamePath = editor.document.uri.fsPath;
		if (fileNamePath.endsWith(".nn")) {
			// updateDiags(editor.document, diag_coll);
			setErrors(editor.document.getText());
			// diag_coll = updateDiags(editor.document, diag_coll);
			updateDiags(editor.document, diag_list);
			// console.log("done opening")
		}
	}


	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(
		(e: vscode.TextDocumentChangeEvent | undefined) => {
			// editor = vscode.window.activeTextEditor;
			if (e !== undefined) {
				var fileNamePath = e.document.uri.fsPath;
				if (fileNamePath.endsWith(".nn")) {
					diag_list.forEach(diag => diag.clear());
					setErrors(e.document.getText());
					updateDiags(e.document, diag_list);
				}
			}
		}
	));

	context.subscriptions.push(autoCompletion(), hovers());
}

function runNilnovi(context: vscode.ExtensionContext) {
	if (vscode.window.activeTextEditor) {
		var fileNamePath = vscode.window.activeTextEditor.document.uri.fsPath;
		if (fileNamePath.endsWith(".nn")) {
			if (syntaxError.isError) {
				vscode.window.showErrorMessage("An error occurred before compilation. Please correct the syntax before trying again");
			} else {
				vscode.window.showInformationMessage("Compilation in progress");
				var compiler = new Compiler(readFileSync(fileNamePath, "utf-8"), outputChannel);
				if (compilationError.isError) {
					vscode.window.showErrorMessage("Execution aborted : An error occurred during compilation.");
				}
				else {
					let outputFile = vscode.window.activeTextEditor.document.uri.fsPath.replace(".nn", ".machine_code");
					writeFileSync(outputFile, compiler.displayInstructions());

					let panel: vscode.WebviewPanel = PileWebViewPanel.get(context);
					panel.webview.postMessage({
						command: "showInstructionList",
						list: compiler.instructions
					});

					let executor = new Executor(compiler.instructions, outputChannel, panel);
				}





				// vscode.workspace.openTextDocument(outputFile)
				// let filePanel = vscode.window.showTextDocument(vscode.workspace.openTextDocument(outputFile), vscode.ViewColumn.One);


				// vscode.workspace.fs.writeFile()
				// vscode.window.showTextDocument()

			}


			// executor.output.clear();
			// executor.output.appendLine("Running "+path.basename(fileNamePath)+"\n");
			// executor.loadingFile(readFileSync(fileNamePath, "utf-8"));
			// executor.run();

			//   executor = new Executor(readFileSync(fileNamePath, "utf-8"));
			//   output.appendLine("Hello there");
			//   console.log(executor.currentLineCpt);
			//   for (let line of file){
			// 	  console.log(line);
			// 	  break;
			//   }
			//   console.log(file);
			// var options = {
			//   scriptPath: __dirname + "/../src/",
			//   args: [fileNamePath],
			// };
			// PythonShell.run("exec.py", options, function (err, results) {
			//   if (err){
			//     console.log(err);
			//     vscode.window.showErrorMessage("A python error occurs : "+err.message+"\n"+err.traceback);
			//   }else{
			//     vscode.window.showInformationMessage("Running successfully "+path.basename(fileNamePath))
			//   }
			//   console.log(results);
			// });
		} else {
			vscode.window.showErrorMessage(
				path.basename(fileNamePath) +
				' is not a Nilnovi file, please use the".nn" extension'
			);
		}
	} else {
		vscode.window.showErrorMessage("No current file");
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
