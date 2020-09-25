// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PythonShell } from "python-shell";
import path = require("path");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


  let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => {

    console.log(vscode.window.activeTextEditor);
    __dirname = (path.resolve(__dirname));
    
    if (vscode.window.activeTextEditor){
      var fileNamePath = vscode.window.activeTextEditor.document.uri.fsPath;
      if (fileNamePath.endsWith(".nn")){
        var options = {
          scriptPath: __dirname + "/../src/",
          args: [fileNamePath],
        };
      
        console.log(fileNamePath);
        PythonShell.run("exec.py", options, function (err, results) {
          if (err){
            console.log(err);
            vscode.window.showErrorMessage("A python error occurs : "+err.message+"\n"+err.traceback);
          }else{
            vscode.window.showInformationMessage("Running successfully "+path.basename(fileNamePath))
          }
          console.log(results);
        });
      }else{
        vscode.window.showErrorMessage(path.basename(fileNamePath)+" is not a Nilnovi file, please use the\".nn\" extension");
      }
      
    }else{
      vscode.window.showErrorMessage("No current file");
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
