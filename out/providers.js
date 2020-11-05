"use strict";
//================================= providers.ts =================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.setErrors = exports.updateDiags = exports.errors = exports.hovers = exports.autoCompletion = void 0;
//--------------------------------- Description ----------------------------------//
//
// This file regroups the methods used to provide some user-friendly features
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Adam RIVIERE
// Sébastien HERT
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
const path = require("path");
const vscode = require("vscode");
const SyntaxError_1 = require("./SyntaxError");
//--------------------------------------------------------------------------------//
//------------------------------------ Methods -----------------------------------//
/**
   * Description : Provides auto-compltion for the Nilnovi language
   *
   * @returns The provider to push
   *
   * @author Adam RIVIERE
*/
function autoCompletion() {
    return vscode.languages.registerCompletionItemProvider('nilnovi', {
        provideCompletionItems(document, position, token, context) {
            const completions = [];
            // Here we define every word we want to be auto-completed and we give it a category
            completions.push(new vscode.CompletionItem('begin', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('end', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('return', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('if', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('elif', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('else', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('while', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('for', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('loop', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('then', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('from', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('to', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('is', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('procedure', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('function', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('or', vscode.CompletionItemKind.Operator));
            completions.push(new vscode.CompletionItem('and', vscode.CompletionItemKind.Operator));
            completions.push(new vscode.CompletionItem('not', vscode.CompletionItemKind.Operator));
            completions.push(new vscode.CompletionItem('integer', vscode.CompletionItemKind.TypeParameter));
            completions.push(new vscode.CompletionItem('boolean', vscode.CompletionItemKind.TypeParameter));
            completions.push(new vscode.CompletionItem('true', vscode.CompletionItemKind.Constant));
            completions.push(new vscode.CompletionItem('false', vscode.CompletionItemKind.Constant));
            completions.push(new vscode.CompletionItem('get', vscode.CompletionItemKind.Function));
            completions.push(new vscode.CompletionItem('put', vscode.CompletionItemKind.Function));
            return completions;
        }
    });
}
exports.autoCompletion = autoCompletion;
/**
   * Description : Provides hovers for the Nilnovi functions
   *
   * @returns The provider to push
   *
   * @author Adam RIVIERE
*/
function hovers() {
    return vscode.languages.registerHoverProvider('nilnovi', {
        provideHover(document, position, token) {
            // First we get the position of the user's cursor to display the hover
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
            // Then we define the hover to display (only for the two existing Nilnovi functions)
            switch (word) {
                case "put":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Prints the given value\nInput : Value to print\nOutput : None"
                    });
                    break;
                case "get":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Gets the value given by the user and affect it to the given variable\nInput : Variable to affect\nOutput : None"
                    });
                    break;
            }
        }
    });
}
exports.hovers = hovers;
exports.errors = [];
function updateDiags(document, collection) {
    // console.log(errors.length);
    for (let i = 0; i < exports.errors.length; i++) {
        var diag_coll = vscode.languages.createDiagnosticCollection('nilnovi');
        var error = exports.errors[i];
        // console.log(error.line-1);
        let diag = new vscode.Diagnostic(new vscode.Range(new vscode.Position(error.line - 1, 0), new vscode.Position(error.line - 1, 30)), error.message, vscode.DiagnosticSeverity.Error);
        diag.source = 'nilnovi';
        //diag.relatedInformation = [new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(error.line, 0), new vscode.Position(error.line, 30))), error.message)];
        diag.code = error.code;
        var docNameRegexp = new RegExp(/.*\.nn$/mg);
        if (document && docNameRegexp.test(path.basename(document.uri.fsPath))) {
            // console.log(document.uri, [diag]);
            diag_coll.set(document.uri, [diag]);
        }
        else {
            diag_coll.clear();
        }
        collection.push(diag_coll);
        // collection.forEach(diag => console.log(diag.get(document.uri)));
        // console.log(collection.values);
        // console.log("yeet");
    }
    // console.log(diag_coll);
    // return diag_coll;
}
exports.updateDiags = updateDiags;
function setErrors(file) {
    exports.errors = [];
    // var cpt = 0
    // First, let's index our file
    // We nned a list of line
    var parsedFile = file.split(/\r?\n/);
    var indexedFile = "";
    var i = 1;
    // then for each line, we recreate a single-line string with the current line and le line number
    for (let index = 0; index < parsedFile.length; index++) {
        var line = parsedFile[index];
        indexedFile = indexedFile + line + "$" + i + "\n";
        i++;
    }
    // We should now remove the comments from the file, which is a single-line string
    var lines = [];
    file = removeComments(indexedFile);
    lines = file.split(/\r?\n/);
    // console.log(lines);
    // Now, for each line, we need to check for errors
    for (let i = 0; i < lines.length; i++) {
        var splitedLine = lines[i].trim().split("$");
        if (splitedLine.length > 2) {
            var nbLine = parseInt(splitedLine[splitedLine.length - 1]);
            var currentLine = "";
            for (let i = 0; i < splitedLine.length - 2; i++) {
                currentLine += splitedLine[i];
            }
            exports.errors.push(new SyntaxError_1.SyntaxError(402, "Unexpected character", nbLine));
        }
        else {
            var nbLine = parseInt(splitedLine[1]);
            var currentLine = splitedLine[0];
        }
        const regexSemiColon = new RegExp(/^(?!begin|end|if|elif|else|while|for|procedure|function).*(?<!\;)$/);
        const regexUnexpectedChar = new RegExp(/^[a-zA-Z0-9\+\*\-\/<>=:\(\)_ ;,]*$/);
        const regexAffectation = new RegExp(/.*:=.*$/);
        const regexDefinition = new RegExp(/.*: *(integer|boolean)/);
        const regexTwoPoints = new RegExp(/.*:.*/);
        if (currentLine.length != 0) {
            if (regexSemiColon.test(currentLine)) {
                exports.errors.push(new SyntaxError_1.SyntaxError(401, "; expected", nbLine));
            }
            if (!regexUnexpectedChar.test(currentLine)) {
                exports.errors.push(new SyntaxError_1.SyntaxError(402, "Unexpected character", nbLine));
            }
            if (regexTwoPoints.test(currentLine)) {
                if (!regexAffectation.test(currentLine)) {
                    if (!regexDefinition.test(currentLine)) {
                        exports.errors.push(new SyntaxError_1.SyntaxError(403, "Undefined type", nbLine));
                    }
                }
            }
        }
    }
    ;
}
exports.setErrors = setErrors;
function removeComments(file) {
    var regexpComment = /(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\#.*)/gm;
    return file.replace(regexpComment, "");
}
//--------------------------------------------------------------------------------//
//================================================================================//
//# sourceMappingURL=providers.js.map