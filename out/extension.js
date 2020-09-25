"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const python_shell_1 = require("python-shell");
const path = require("path");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => {
        console.log(vscode.window.activeTextEditor);
        if (vscode.window.activeTextEditor) {
            var fileNamePath = vscode.window.activeTextEditor.document.uri.fsPath;
            if (fileNamePath.endsWith(".nn")) {
                var options = {
                    scriptPath: __dirname + "/../src/",
                    args: [fileNamePath],
                };
                console.log(fileNamePath);
                python_shell_1.PythonShell.run("exec.py", options, function (err, results) {
                    if (err) {
                        console.log(err);
                        vscode.window.showErrorMessage("A python error occurs : " + err.message + "\n" + err.traceback);
                    }
                    else {
                        vscode.window.showInformationMessage("Running successfully " + path.basename(fileNamePath));
                    }
                    console.log(results);
                });
            }
            else {
                vscode.window.showErrorMessage(path.basename(fileNamePath) + " is not a Nilnovi file, please use the\".nn\" extension");
            }
        }
        else {
            vscode.window.showErrorMessage("No current file");
        }
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map