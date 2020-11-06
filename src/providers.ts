//================================= providers.ts =================================//

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

import path = require("path");
import * as vscode from "vscode";
import { SyntaxError } from "./SyntaxError";
import * as tools from "./tools"

//--------------------------------------------------------------------------------//

//------------------------------- Global Variables -------------------------------//

export var errors: SyntaxError[] = [];
var methodsTable: { [id: string]: { name: string, nbParams: number } } = {};
var variablesTable: { [id: string]: { name: string, type: string } } = {};

//--------------------------------------------------------------------------------//


//----------------------------------- Functions ----------------------------------//

/**
   * Description : Provides auto-compltion for the Nilnovi language
   * @returns The provider to push
   * @author Adam RIVIERE
*/
export function autoCompletion() {
    return vscode.languages.registerCompletionItemProvider('nilnovi', {
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) {
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

/**
   * Description : Provides hovers for the Nilnovi functions
   * @returns The provider to push
   * @author Adam RIVIERE
*/
export function hovers() {
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


/**
 * @description updates the diagnostic ollection of a document with the errors spotted in it
 * @param document document to analyze
 * @param collection collection to update
 * @author Sébastien HERT
 * @author Adam RIVIERE
 */
export function updateDiags(document: vscode.TextDocument, collection: vscode.DiagnosticCollection[]) {
    // For each error spotted in the document
    for (let i = 0; i < errors.length; i++) {

        var diag_coll = vscode.languages.createDiagnosticCollection('nilnovi');
        var error = errors[i];

        // creation of a diagnostic where the errors was spotted
        let diag: vscode.Diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(error.line - 1, 0), new vscode.Position(error.line - 1, 30)), error.message, vscode.DiagnosticSeverity.Error);
        diag.source = 'nilnovi';
        diag.code = error.code;

        // checking if the document's extension is '.nn'
        var docNameRegexp = new RegExp(/.*\.nn$/mg);
        if (document && docNameRegexp.test(path.basename(document.uri.fsPath))) {
            diag_coll.set(document.uri, [diag]);
        } else {
            diag_coll.clear();
        }

        // updating the collection
        collection.push(diag_coll);
    }
}

/**
 * @description analyzes a file and checks the syntax errors
 * @param String File to analyze
 * @author Sébastien HERT
 * @author Adam RIVIERE
 */
export function setErrors(file: string) {

    // Reseting our tables
    errors = [];
    resetTables();

    // We should now remove the comments from the indexed file, which is a single-line string
    var lines: string[] = [];
    file = tools.removeComments(tools.indexingFile(file));
    lines = file.split(/\r?\n/);

    // Now, for each line, we need to check for errors
    for (let i = 0; i < lines.length; i++) {
        var lineFeatures = tools.splittingLine(lines[i]);
        var currentLine: string = lineFeatures["content"]
        var nbLine: number = lineFeatures["index"]

        const regexSemiColon = new RegExp(/^(?!begin|end|if|elif|else|while|for|procedure|function).*(?<!\;)$/);
        const regexUnexpectedChar = new RegExp(/^[a-zA-Z0-9\+\*\-\/<>=:\(\)_ ;,]*$/);
        // const regexAffectation = new RegExp(/.*:=.*$/);
        // const regexDefinition = new RegExp(/.*:\s*(integer|boolean)$/);
        // const regexTwoPoints = new RegExp(/.*:.*/);
        // const regexKeyWord = new RegExp(/^(begin|end|if|elif|else|while|for|procedure|function|return|loop|to|from|then|is|true|false|integer|boolean|or|and|not)(?!(_|[a-zA-Z0-9]))/);

        if (currentLine.length != 0) {

            // ';' is missing
            if (regexSemiColon.test(currentLine)) { errors.push(new SyntaxError(401, "; expected", nbLine)); }

            // Unknown character is spotted
            if (!regexUnexpectedChar.test(currentLine)) { errors.push(new SyntaxError(402, "Unexpected character", nbLine)); }

            // if procedure or function
            if (new RegExp(/^(procedure|function)/).test(currentLine)) {
                // it's a procedure
                if (new RegExp(/^procedure/).test(currentLine)) { checkingError_Procedure(currentLine, nbLine) }

                // it's a function
                else { checkingError_Function(currentLine, nbLine) }
            }
        }

    };
}

/**
 * @description Resets the methods and the variables tables
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function resetTables() {
    methodsTable = {};
    methodsTable["put"] = { name: "put", nbParams: 1 };
    methodsTable["get"] = { name: "get", nbParams: 1 };
    variablesTable = {};
}

//--------------------------------------------------------------------------------//


//-------------------------------- Errors Methods --------------------------------//


/**
 * @description checks errors for procedure
 * @param string currentLine
 * @param number nbLine
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function checkingError_Procedure(currentLine: string, nbLine: number) {
    const regexProcedureFormat = new RegExp(/^procedure\s*[a-zA-Z][a-zA-Z0-9_]*\(.*\)\s*is\s*$/);
    const regexDefinition = new RegExp(/.*:\s*(integer|boolean)$/);
    const regexTwoPoints = new RegExp(/.*:.*/);

    // If the procedure format isnt right
    if (!regexProcedureFormat.test(currentLine)) { errors.push(new SyntaxError(408, "Wrong procedure block format", nbLine)); }

    // it is supposed to be exact
    else {
        // Let's count how many parentheses there is
        // if there is more than one parenthesis of each type
        if ((currentLine.match(new RegExp(/\(/g)) || []).length > 1 || (currentLine.match(new RegExp(/\)/g)) || []).length > 1) {
            errors.push(new SyntaxError(412, "too many parentheses in procedure definition", nbLine))
        }
        // Else let's check the parameter(s)
        else {
            // Getting the parameters between parentheses and the name of the procedure
            var params = currentLine.split("(")[1].split(")")[0].trim();
            var methodName = currentLine.split("procedure")[1].split("(")[0].trim();

            // If there is at least one valid parameter
            if (regexTwoPoints.test(params)) {

                // Cheking if it has the correct format -> x : integer
                // if not, raise an error, else add it to our methodsTable
                if (!regexDefinition.test(params)) { errors.push(new SyntaxError(403, "Undefined type", nbLine)); }
                else { methodsTable[methodName] = { name: methodName, nbParams: params.split(",").length } }
            }

            // If there is no valid parameters
            else {

                // If the parameter(s) isn't empty, raise an error besause it's not valid
                if (params.length != 0) { errors.push(new SyntaxError(408, "Wrong procedure block format", nbLine)); }

                // else add it to our table
                else { methodsTable[methodName] = { name: methodName, nbParams: 0 }; }
            }
        }
    }
}

/**
 * @description checks errors for function
 * @param string line to check
 * @param number number of the line checked
 * @author Sébastien HERT
 * @author Adam RIVIERE
 */
function checkingError_Function(currentLine: string, nbLine: number) {
    const regexFunctionFormat = new RegExp(/^function\s*[a-zA-Z][a-zA-Z0-9_]*\(.*\)\s*return\s*.*\s*is\s*$/);
    const regexDefinition = new RegExp(/.*:\s*(integer|boolean)$/);
    const regexTwoPoints = new RegExp(/.*:.*/);

    // if the function format isn't right
    if (!regexFunctionFormat.test(currentLine)) {
        errors.push(new SyntaxError(407, "Wrong function block format", nbLine));
    } else {

        // Here the format is right, we count the number of parentheses
        if ((currentLine.match(new RegExp(/\(/g)) || []).length > 1 || (currentLine.match(new RegExp(/\)/g)) || []).length > 1) {
            errors.push(new SyntaxError(412, "too many parentheses in function definition", nbLine))
        } else {

            // We get the parameters and the method's name
            var params = currentLine.split("(")[1].split(")")[0].trim();
            var methodName = currentLine.split("function")[1].split("(")[0].trim();

            // If we see ':' between the parentheses
            if (regexTwoPoints.test(params)) {

                // If the type of the parameter is undefined
                if (!regexDefinition.test(params)) { errors.push(new SyntaxError(403, "Undefined type", nbLine));}
                else {

                    // Here we check if the return type is valid
                    var outputs = currentLine.split("return")[1].split("is")[0].trim();
                    if (!new RegExp(/^(integer|boolean)$/).test(outputs)) {errors.push(new SyntaxError(403, "Undefined type", nbLine));}
                    // If everything is right, we register the function
                    else {
                        var nbParamsMethod = params.split(",").length;
                        methodsTable[methodName] = { name: methodName, nbParams: nbParamsMethod };
                    }
                }
            } else {

                // If there is not ':' between the parentheses
                // If there is something between the parentheses
                if (params.length != 0) {
                    errors.push(new SyntaxError(407, "Wrong function block format", nbLine));
                } else {

                    // Here we check if the return type is valid
                    var outputs = currentLine.split("return")[1].split("is")[0].trim();
                    if (!new RegExp(/^(integer|boolean)$/).test(outputs)) {errors.push(new SyntaxError(403, "Undefined type", nbLine));}

                    // If everything is right, we register the function
                    else {methodsTable[methodName] = { name: methodName, nbParams: 0 };}
                }
            }
        }
    }
}

//--------------------------------------------------------------------------------//

//================================================================================//