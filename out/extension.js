"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const python_shell_1 = require("python-shell");
const path = require("path");
const providers_1 = require("./providers");
const providers_2 = require("./providers");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => {
        console.log(vscode.window.activeTextEditor);
        __dirname = (path.resolve(__dirname));
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
    let pile = vscode.commands.registerCommand("nilnovi-for-vscode.pile", () => {
        const panel = vscode.window.createWebviewPanel('pile', 'Pile éxecution', vscode.ViewColumn.Two, {});
        panel.webview.html = getWebviewContent();
    });
    context.subscriptions.push(providers_1.autoCompletion(), providers_2.hovers());
}
exports.activate = activate;
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
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map