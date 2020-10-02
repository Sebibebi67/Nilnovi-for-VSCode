"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hovers = exports.autoCompletion = void 0;
const vscode = require("vscode");
function autoCompletion() {
    return vscode.languages.registerCompletionItemProvider('nilnovi', {
        provideCompletionItems(document, position, token, context) {
            const completions = [];
            completions.push(new vscode.CompletionItem('debutProg();', 1));
            completions.push(new vscode.CompletionItem('finProg();', 1));
            completions.push(new vscode.CompletionItem('reserver();', 1));
            completions.push(new vscode.CompletionItem('empiler();', 1));
            completions.push(new vscode.CompletionItem('affectation();', 1));
            completions.push(new vscode.CompletionItem('valeurPile();', 1));
            completions.push(new vscode.CompletionItem('get();', 1));
            completions.push(new vscode.CompletionItem('put();', 1));
            completions.push(new vscode.CompletionItem('moins();', 1));
            completions.push(new vscode.CompletionItem('sous();', 1));
            completions.push(new vscode.CompletionItem('add();', 1));
            completions.push(new vscode.CompletionItem('mult();', 1));
            completions.push(new vscode.CompletionItem('div();', 1));
            completions.push(new vscode.CompletionItem('egal();', 1));
            completions.push(new vscode.CompletionItem('diff();', 1));
            completions.push(new vscode.CompletionItem('inf();', 1));
            completions.push(new vscode.CompletionItem('infeg();', 1));
            completions.push(new vscode.CompletionItem('sup();', 1));
            completions.push(new vscode.CompletionItem('supeg();', 1));
            completions.push(new vscode.CompletionItem('et();', 1));
            completions.push(new vscode.CompletionItem('ou();', 1));
            completions.push(new vscode.CompletionItem('non();', 1));
            completions.push(new vscode.CompletionItem('tra();', 1));
            completions.push(new vscode.CompletionItem('tze();', 1));
            completions.push(new vscode.CompletionItem('erreur();', 1));
            completions.push(new vscode.CompletionItem('empilerAd();', 1));
            completions.push(new vscode.CompletionItem('empilerParam();', 1));
            completions.push(new vscode.CompletionItem('retourFonct();', 1));
            completions.push(new vscode.CompletionItem('retourProc();', 1));
            completions.push(new vscode.CompletionItem('reserverBloc();', 1));
            completions.push(new vscode.CompletionItem('traStat();', 1));
            return completions;
        }
    });
}
exports.autoCompletion = autoCompletion;
function hovers() {
    return vscode.languages.registerHoverProvider('nilnovi', {
        provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
            switch (word) {
                case "debutProg":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO1"
                    });
                    break;
                case "finProg":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO2"
                    });
                    break;
                case "reserver":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO3"
                    });
                    break;
                case "empiler":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "affectation":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "valeurPile":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "get":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "put":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "moins":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "sous":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "add":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "mult":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "div":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "egal":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "diff":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "inf":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "infeg":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "sup":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "supeg":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "et":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "ou":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "non":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "tra":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "tze":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "erreur":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "empilerAd":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "empilerParam":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "retourFonct":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "retourProc":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "reserverBloc":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
                case "traStat":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "TODO"
                    });
                    break;
            }
        }
    });
}
exports.hovers = hovers;
//# sourceMappingURL=providers.js.map