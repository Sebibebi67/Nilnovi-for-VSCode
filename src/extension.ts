// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PythonShell } from "python-shell";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "launcher" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  // let disposable = vscode.commands.registerCommand(
  //   "nilnovi-for-vscode.helloWorld",
  //   () => {
  //     // The code you place here will be executed every time your command is executed

  //     // Display a message box to the user
  //     vscode.window.showInformationMessage("Hello World from launcher!");
  //   }
  // );

  // context.subscriptions.push(disposable);

  let run = vscode.commands.registerCommand("nilnovi-for-vscode.run", () => {
    var options = {
      scriptPath: __dirname + "/../src/",
      args: [__dirname + "/../files/test.nn"],
    };
    vscode.window.showInformationMessage("YEET");

    console.log(__filename);
    // let pyshell = new pythonShell('test.py');
    PythonShell.run("exec.py", options, function (err, results) {
      // console.log('finished');
      console.log(err, results);
    });

    // let pyshell = new PythonShell('src/test.py');

    // // pyshell.send('hello');

    // pyshell.on('print', function (message) {
    // 	// received a message sent from the Python script (a simple "print" statement)
    // 	console.log("toto");
    // 	console.log(message);
    // });

    vscode.window.showInformationMessage("YEET YEET");

    // pyshell.on('message', function (message: any) {

    // console.log(message);
    // });
  });

  let pile = vscode.commands.registerCommand("nilnovi-for-vscode.pile", () => {
    const panel = vscode.window.createWebviewPanel(
      'pile',
      'Pile éxecution',
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

// this method is called when your extension is deactivated
export function deactivate() {}
