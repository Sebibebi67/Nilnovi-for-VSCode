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
                        value: "Description : Enables the begining of the program\nInput : None\nOutput : None"
                    });
                    break;
                case "finProg":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Enables the end of the program\nInput : None\nOutput : None"
                    });
                    break;
                case "reserver":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Reserve n slots in the stack\nInput : - n : Number of slots to reserve\nOutput : None"
                    });
                    break;
                case "empiler":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Adds the n value at the top of the stack\nInput : - n : value to stack\nOutput : None"
                    });
                    break;
                case "affectation":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Performs the assignment Ad(a):=n where Ad(a) is the address of a and n is the new value of a, both at the top of the stack.\nInput : None\nOutput : None"
                    });
                    break;
                case "valeurPile":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Searches for the value a, located at address n, with n given at the top of the stack\nInput : None\nOutput : None"
                    });
                    break;
                case "get":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : TODO\nInput : None\nOutput : None"
                    });
                    break;
                case "put":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Displays the top of the stack\nInput : None\nOutput : None"
                    });
                    break;
                case "moins":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"-a\" where a is the value of the top of the stack interpreted as an integer, and stacks the result as an integer\nInput : None\nOutput : None"
                    });
                    break;
                case "sous":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a-b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as an integer\nInput : None\nOutput : None"
                    });
                    break;
                case "add":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a+b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as an integer\nInput : None\nOutput : None"
                    });
                    break;
                case "mult":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a*b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as an integer\nInput : None\nOutput : None"
                    });
                    break;
                case "div":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a/b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as an integer\nInput : None\nOutput : None"
                    });
                    break;
                case "egal":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a=b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as a boolean\nInput : None\nOutput : None"
                    });
                    break;
                case "diff":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a!=b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as a boolean\nInput : None\nOutput : None"
                    });
                    break;
                case "inf":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a<b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as a boolean\nInput : None\nOutput : None"
                    });
                    break;
                case "infeg":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a<=b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as a boolean\nInput : None\nOutput : None"
                    });
                    break;
                case "sup":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a>b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as a boolean\nInput : None\nOutput : None"
                    });
                    break;
                case "supeg":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"a>=b\" where a and b are the two values at the top of the stack interpreted as integers, and stacks the result as a boolean\nInput : None\nOutput : None"
                    });
                    break;
                case "et":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"bool1 and bool2\" where bool1 and bool2 are the two values at the top of the stack interpreted as booleans, and stacks the result as a boolean\nInput : None\nOutput : None"
                    });
                    break;
                case "ou":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"bool1 or bool2\" where bool1 and bool2 are the two values at the top of the stack interpreted as booleans, and stacks the result as a boolean\nInput : None\nOutput : None"
                    });
                    break;
                case "non":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Evaluates the expression \"non bool1\" where bool1 is the value of the top of the stack interpreted as a boolean, and stacks the result as a boolean\nInput : None\nOutput : None"
                    });
                    break;
                case "tra":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Jumps to line n\nInput : - n : Line to jump at\nOutput : None"
                    });
                    break;
                case "tze":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Jumps to row n if the boolean at the top of the stack is false\nInput : - n : Line to jump at\nOutput : None"
                    });
                    break;
                case "erreur":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Displays the exp error and ends the program\nInput : - exp : expression to dislay\nOutput : None"
                    });
                    break;
                case "empilerAd":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Stacks the global address n\nInput : - n : address to stack\nOutput : None"
                    });
                    break;
                case "empilerParam":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Stacks the local address n\nInput : - n : address to stack\nOutput : None"
                    });
                    break;
                case "retourFonct":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Signals the end of a function\nInput : None\nOutput : None"
                    });
                    break;
                case "retourProc":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Signals the end of a method\nInput : None\nOutput : None"
                    });
                    break;
                case "reserverBloc":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : TODO\nInput : None\nOutput : None"
                    });
                    break;
                case "traStat":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Calls line n with t parameters\nInput : - n : Next line to execute\n\t    - t : Number of parameters\nOutput : None"
                    });
                    break;
            }
        }
    });
}
exports.hovers = hovers;
//# sourceMappingURL=providers.js.map