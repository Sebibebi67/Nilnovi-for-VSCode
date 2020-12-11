"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");
const fs_1 = require("fs");
const Executor_1 = require("./Executor");
const PileWebViewPanel_1 = require("./PileWebViewPanel");
let executor = new Executor_1.Executor();
// let output = vscode.window.createOutputChannel("Nilnovi - Output");
const providers_1 = require("./syntax/providers");
const providers_2 = require("./syntax/providers");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => {
        console.log(vscode.window.activeTextEditor);
        runNilnovi();
    });
    let pile = vscode.commands.registerCommand("nilnovi-for-vscode.pile", () => {
        let panel = PileWebViewPanel_1.PileWebViewPanel.get();
    });
    var diag_list = [];
    // var diag_list = vscode.languages.createDiagnosticCollection('nilnovi');
    // var diag_coll = vscode.languages.createDiagnosticCollection('nilnovi');
    var editor = vscode.window.activeTextEditor;
    if (editor !== undefined) {
        // updateDiags(editor.document, diag_coll);
        providers_1.setErrors(editor.document.getText());
        // diag_coll = updateDiags(editor.document, diag_coll);
        providers_1.updateDiags(editor.document, diag_list);
        // console.log("done opening")
    }
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        if (e !== undefined) {
            diag_list.forEach(diag => diag.clear());
            providers_1.setErrors(e.document.getText());
            providers_1.updateDiags(e.document, diag_list);
        }
    }));
    context.subscriptions.push(providers_1.autoCompletion(), providers_2.hovers());
}
exports.activate = activate;
function runNilnovi() {
    if (vscode.window.activeTextEditor) {
        var fileNamePath = vscode.window.activeTextEditor.document.uri.fsPath;
        if (fileNamePath.endsWith(".nn")) {
            executor.output.clear();
            executor.output.appendLine("Running " + path.basename(fileNamePath) + "\n");
            executor.loadingFile(fs_1.readFileSync(fileNamePath, "utf-8"));
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
        }
        else {
            vscode.window.showErrorMessage(path.basename(fileNamePath) +
                ' is not a Nilnovi file, please use the".nn" extension');
        }
    }
    else {
        vscode.window.showErrorMessage("No current file");
    }
}
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map