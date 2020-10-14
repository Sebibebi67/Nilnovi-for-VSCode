// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import path = require("path");
import { readFileSync } from "fs";
import { Executor } from "./Executor";
import { Compiler } from "./Compiler";
import {autoCompletion} from "./providers";
import {hovers} from "./providers";

let output = vscode.window.createOutputChannel("Nilnovi Executor Output");
output.show(true);
let executor = new Executor(output);
let compiler = new Compiler(output);

// let output = vscode.window.createOutputChannel("Nilnovi - Output");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => {
    // console.log(vscode.window.activeTextEditor);
    runNilnovi();
  });

  let pile = vscode.commands.registerCommand("nilnovi-for-vscode.pile", () => {
    const panel = vscode.window.createWebviewPanel(
      "pile",
      "Pile éxecution",
      vscode.ViewColumn.Two,
      {}
    );
    panel.webview.html = getWebviewContent();
  });

  context.subscriptions.push(autoCompletion(), hovers());
}


//fonction webviewcontent
function getWebviewContent() {
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

function runNilnovi() {
  if (vscode.window.activeTextEditor) {
    // var fileNamePath = vscode.window.activeTextEditor.document.uri.fsPath;
    var file = vscode.window.activeTextEditor.document;
    if (file.languageId == "nilnovi") {
    // executor.output.clear();
    // executor.output.appendLine("Running "+path.basename(fileNamePath)+"\n");
		compiler.compile(file.getText());
    } else {
      vscode.window.showErrorMessage(
        file.fileName +
          ' is not a Nilnovi file, please use the".nn" extension'
      );
    }
  } else {
    vscode.window.showErrorMessage("No current file");
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
