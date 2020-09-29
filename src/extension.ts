// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PythonShell } from "python-shell";
import path = require("path");
import { readFileSync } from "fs";
import { Executor } from "./Executor";
import { exec } from "child_process";

let executor = new Executor();
// let output = vscode.window.createOutputChannel("Nilnovi - Output");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => {
    console.log(vscode.window.activeTextEditor);
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
    var fileNamePath = vscode.window.activeTextEditor.document.uri.fsPath;
    if (fileNamePath.endsWith(".nn")) {
		executor.loadingFile(readFileSync(fileNamePath, "utf-8"));
		executor.run();
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
export function deactivate() {}
