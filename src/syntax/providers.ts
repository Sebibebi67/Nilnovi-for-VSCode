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
import * as syntaxError from "./SyntaxError";
import * as tools from "../tools";
import { VariableList } from "../compiler/VariableList";

//--------------------------------------------------------------------------------//

//------------------------------- Global Variables -------------------------------//

export var errors: SyntaxError[] = [];
var methodsTable: { [id: string]: { name: string, nbParams: number, returnType: string } } = {};
var variablesTable: { [id: string]: { name: string, type: string, group: string } } = {};
var declarationOk = false;
var mainDeclarationFlag = false;
var blockScope = 0;
var knownWords = ["put", "get"];

let currentMethod : string = "pp";

//--------------------------------------------------------------------------------//


//----------------------------------- Functions ----------------------------------//

/**
   * Description : Provides auto-completion for the Nilnovi language
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
            completions.push(new vscode.CompletionItem('in', vscode.CompletionItemKind.Keyword));
            completions.push(new vscode.CompletionItem('out', vscode.CompletionItemKind.Keyword));
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
                case "get":
                    return new vscode.Hover({
                        language: "NilNovi",
                        value: "Description : Gets the value given by the user and affect it to the given variable\nInput : Variable to affect\nOutput : None"
                    });
            }
        }
    });
}


/**
 * @description updates the diagnostic collection of a document with the errors spotted in it
 * @param document document to analyze
 * @param collection collection to update
 * @author Sébastien HERT
 * @author Adam RIVIERE
 */
export function updateDiags(document: vscode.TextDocument, collection: vscode.DiagnosticCollection[]) {
    // For each error spotted in the document
    for (let i = 0; i < errors.length; i++) {

        let diag_coll = vscode.languages.createDiagnosticCollection('nilnovi');
        let error = errors[i];

        // creation of a diagnostic where the errors was spotted
        let diag: vscode.Diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(error.line - 1, 0), new vscode.Position(error.line - 1, 100)), error.message, vscode.DiagnosticSeverity.Error);
        diag.source = 'nilnovi';
        diag.code = error.code;

        // checking if the document's extension is '.nn'
        const docNameRegexp = new RegExp(/.*\.nn$/mg);
        if (document && docNameRegexp.test(path.basename(document.uri.fsPath))) { diag_coll.set(document.uri, [diag]); }
        else { diag_coll.clear(); }

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

    // Resetting our tables
    errors = [];
    resetTables();
    syntaxError.setError(false);


    // We should now remove the comments from the indexed file, which is a single-line string
    let lines: string[] = [];
    file = tools.removeComments(tools.indexingFile(file));
    lines = tools.removeEmptyLines(file.split(/\r?\n/));


    // Now, for each line, we need to check for errors
    for (let i = 0; i < lines.length; i++) {
        let lineFeatures = tools.splittingLine(lines[i]);
        let currentLine: string = lineFeatures["content"]
        let nbLine: number = lineFeatures["index"]

        const regexSemiColon = new RegExp(/^(?!begin|end|if|elif|else|while|for|procedure|function).*(?<!\;)$/);
        const regexUnexpectedChar = new RegExp(/^[a-zA-Z0-9\+\*\-\/<>=:\(\)_ ;,]*$/);


        if (i == 0 && !(new RegExp(/^procedure\s+([a-zA-Z][a-zA-Z0-9_]*)\(\s*\)\s+is$/).test(currentLine))) {
            errors.push(new SyntaxError(422, "first line format error (use format 'procedure pp() is'", nbLine));
        }

        // ';' is missing
        if (regexSemiColon.test(currentLine)) { errors.push(new SyntaxError(401, "; expected", nbLine)); }

        // Unknown character is spotted
        if (!regexUnexpectedChar.test(currentLine)) { errors.push(new SyntaxError(402, "Unexpected character", nbLine)); }

        // if procedure or function
        if (new RegExp(/^(procedure|function)/).test(currentLine)) {
            if (mainDeclarationFlag == true) { errors.push(new SyntaxError(419, "Cannot define a method after main variable declaration", nbLine)); }
            else {
                // it's a procedure
                if (new RegExp(/^procedure/).test(currentLine)) {
                    if (blockScope > 1) { errors.push(new SyntaxError(420, "Cannot define a method in another method", nbLine)) }
                    else { checkingError_Procedure(currentLine, nbLine) }
                }

                // it's a function
                else {
                    if (blockScope > 1) { errors.push(new SyntaxError(420, "Cannot define a method in another method", nbLine)) }
                    else { checkingError_Function(currentLine, nbLine) }
                }
            }
        }

        else if (new RegExp(/^(if|for|while|elif|else)/).test(currentLine)) {

            // "if" or "elif" read
            if (new RegExp(/^(if|elif)/).test(currentLine)) { checkingError_If(currentLine, nbLine) }

            // "while" read
            else if (new RegExp(/^while/).test(currentLine)) { checkingError_While(currentLine, nbLine) }

            // "for" read
            else if (new RegExp(/^for/).test(currentLine)) { checkingError_For(currentLine, nbLine) }

            // "else" read
            else { checkingError_Else(currentLine, nbLine); }
        }
        else if (new RegExp(/.*:=.*/).test(currentLine)) { checkingError_Affectation(currentLine, nbLine) }
        else if (new RegExp(/.*:.*/).test(currentLine)) { checkingError_VariableDeclaration(currentLine, nbLine) }
        else if (new RegExp(/^begin/).test(currentLine)) { declarationOk = false }
        else if (new RegExp(/^end/).test(currentLine)) {
            blockScope--;
            if (blockScope == 1) { removeFromTables(currentMethod); currentMethod = "pp" }
        }
        checkingError_UnknownWord(currentLine, nbLine);
        checkingError_MissingParenthesis(currentLine, nbLine);

    }
    if (blockScope != 0) {
        errors.push(new SyntaxError(413, "End of file read", lines.length - 1));
    }
}

/**
 * @description Resets the methods and the variables tables
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function resetTables() {
    mainDeclarationFlag = false
    blockScope = 0;
    methodsTable = {};
    methodsTable["put"] = { name: "put", nbParams: 1, returnType: "void" };
    methodsTable["get"] = { name: "get", nbParams: 1, returnType: "void" };
    variablesTable = {};
    knownWords = ["put", "get"];
}

/**
 * @description checks if it a potential boolean expression. It doesn't check if it is correct
 * @param string expression
 * @param number line number
 * @returns true | false
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function expressionIsBoolean(expression: string, nbLine: number) {
    const regexContainsBooleanInstructions = new RegExp(/(or|and|<|>|=|true|false)/);
    if (regexContainsBooleanInstructions.test(expression)) { return true }
    const regexIsFunction = new RegExp(/^([a-zA-Z][a-zA-Z0-9_]*)\(.*\);$/);
    if (regexIsFunction.test(expression)) {
        const methodName = expression.split("(")[0].trim();
        const methodDef = methodsTable[methodName];
        if (!methodExists(methodName)) {
            errors.push(new SyntaxError(404, "Method " + methodName + " not found", nbLine))
            return false
        }
        return methodDef.returnType == "boolean";
    }
    const regexIsVariable = new RegExp(/^([a-zA-Z][a-zA-Z0-9_]*);$/);
    if (regexIsVariable.test(expression)) {
        const variableName = expression.split(";")[0].trim();
        const variableDef = variablesTable[currentMethod + "." + variableName];
        if (!variableExists(variableName)) {
            errors.push(new SyntaxError(414, "Variable " + variableName + " not found", nbLine))
            return false;
        }
        return variableDef.type == "boolean";
    }
    return false;
}

/**
 * @description checks if a variable exists
 * @param string name of the variable
 * @returns true | false
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function variableExists(variable: string) { return (variablesTable[currentMethod + "." + variable] !== undefined) }


/**
 * @description checks if a variable has a correct name
 * @param string variable
 * @returns true | false
 * @author Sébastien HERT
 */
function hasCorrectName(variable: string) {
    const regexCorrectName = new RegExp(/^[a-zA-Z][a-zA-Z0-9_]*$/);
    return (regexCorrectName.test(variable) && !isKeyWord(variable))
}

/**
 * @description checks if the method given exists
 * @param string method
 * @returns true | false
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function methodExists(method: string) { return (methodsTable[method] !== undefined); }


/**
 * @description checks if it's potential valid bound
 * @param string bound
 * @returns true | false
 * @author Sébastien HERT
 */
function validBound(bound: string) {
    // if it's a valid variable
    if (variableExists(bound)) { return true; }

    // else it is supposed to be a number
    else {
        try { parseInt(bound); return true; }
        catch (error) { return false; }
    }
}

// /**
//  * @description get the last element of method table
//  * @returns the object method : { name: string, nbParams: number, returnType : string } }
//  * @author Sébastien HERT
//  */
// function getLastMethod() {
//     return methodsTable[Object.keys(methodsTable)[Object.keys(methodsTable).length - 1]]
// }


/**
 * @description remove the method and its list of variables from the tables
 * @param String the method name
 * @author Sébastien HERT
 */
function removeFromTables(methodName: string) {
    for (var key in variablesTable) {
        if (variablesTable[key].group == methodName) { delete variablesTable[key] }
    }
}


/**
 * @description Checks if a word has already been seen
 * @param string the word to test
 * @returns true | false
 * @author Sébastien HERT
 */
function isKnownWord(word: string) {
    return (knownWords.includes(word) || word == "" || (new RegExp(/^[0-9]+$/).test(word)));
}

function isKeyWord(word: string) {
    const keyWordList = ["begin", "end", "if", "elif", "else", "while", "for", "procedure", "function", "then", "from", "to", "loop", "is", "or", "not", "and", "true", "false", "return", "integer", "boolean", "in", "out"];
    return keyWordList.includes(word);
}

//--------------------------------------------------------------------------------//


//-------------------------------- Error Methods --------------------------------//


/**
 * @description checks errors for procedure
 * @param string currentLine
 * @param number nbLine
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function checkingError_Procedure(currentLine: string, nbLine: number) {
    const regexProcedureFormat = new RegExp(/^procedure\s*[a-zA-Z][a-zA-Z0-9_]*\(.*\)\s*is\s*$/);
    const regexDefinition = new RegExp(/.*:\s*(in|in\s+out)\s+(integer|boolean)$/);
    const regexTwoPoints = new RegExp(/.*:.*/);

    // If the procedure format isn't right
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
            let params = currentLine.split("(")[1].split(")")[0].trim();
            let methodName = currentLine.split("procedure")[1].split("(")[0].trim();

            // If there is at least one valid parameter
            if (regexTwoPoints.test(params)) {

                // Checking if it has the correct format -> x : integer
                // if not, raise an error, else add it to our methodsTable
                if (!regexDefinition.test(params)) { errors.push(new SyntaxError(403, "Undefined type", nbLine)); }
                else if (!hasCorrectName(methodName) || isKnownWord(methodName)) { errors.push(new SyntaxError(423, "Method " + methodName + " is already defined", nbLine)); }
                else {
                    methodsTable[methodName] = { name: methodName, nbParams: params.split(",").length, returnType: "void" };
                    declarationOk = true;
                    blockScope++;
                    knownWords.push(methodName);
                    checkingError_Parameters(nbLine, params, methodName);
                    currentMethod = methodName;
                }
            }

            // If there is no valid parameters
            else {

                // If the parameter(s) isn't empty, raise an error because it's not valid
                if (params.length != 0) { errors.push(new SyntaxError(408, "Wrong procedure block format", nbLine)); }
                else if (!hasCorrectName(methodName) || isKnownWord(methodName)) { errors.push(new SyntaxError(423, "Method " + methodName + " is already defined", nbLine)); }
                // else add it to our table
                else {
                    methodsTable[methodName] = { name: methodName, nbParams: 0, returnType: "void" };
                    declarationOk = true;
                    blockScope++;
                    knownWords.push(methodName);
                    currentMethod = methodName;
                }
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
    const regexDefinition = new RegExp(/.*:\s*(in|in\s+out)\s+(integer|boolean)$/);
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
            let params = currentLine.split("(")[1].split(")")[0].trim();
            let methodName = currentLine.split("function")[1].split("(")[0].trim();

            // If we see ':' between the parentheses
            if (regexTwoPoints.test(params)) {

                // If the type of the parameter is undefined
                if (!regexDefinition.test(params)) { errors.push(new SyntaxError(403, "Undefined type", nbLine)); }
                else {

                    // Here we check if the return type is valid
                    let outputs = currentLine.split("return")[1].split("is")[0].trim();
                    if (!new RegExp(/^(integer|boolean)$/).test(outputs)) { errors.push(new SyntaxError(403, "Undefined type", nbLine)); }

                    else if (!hasCorrectName(methodName) || isKnownWord(methodName)) { errors.push(new SyntaxError(423, "Method " + methodName + " is already defined", nbLine)); }
                    // If everything is right, we register the function
                    else {
                        let nbParamsMethod = params.split(",").length;
                        methodsTable[methodName] = { name: methodName, nbParams: nbParamsMethod, returnType: outputs };
                        knownWords.push(methodName);
                        declarationOk = true;
                        blockScope++;
                        checkingError_Parameters(nbLine, params, methodName);
                        currentMethod = methodName;
                    }
                }
            } else {

                // If there is not ':' between the parentheses
                // If there is something between the parentheses
                if (params.length != 0) {
                    errors.push(new SyntaxError(407, "Wrong function block format", nbLine));
                } else {

                    // Here we check if the return type is valid
                    let outputs = currentLine.split("return")[1].split("is")[0].trim();
                    if (!new RegExp(/^(integer|boolean)$/).test(outputs)) { errors.push(new SyntaxError(403, "Undefined type", nbLine)); }
                    else if (!hasCorrectName(methodName) || isKnownWord(methodName)) { errors.push(new SyntaxError(423, "Method " + methodName + " is already defined", nbLine)); }
                    // If everything is right, we register the function
                    else {
                        methodsTable[methodName] = { name: methodName, nbParams: 0, returnType: outputs };
                        declarationOk = true; blockScope++;
                        knownWords.push(methodName);
                        currentMethod = methodName;
                    }
                }
            }
        }
    }
}



/**
 * @description checks error on an 'if' or 'elif' line
 * @param string line to check
 * @param number number of the line checked
 * @author Adam RIVIERE
 */
function checkingError_If(currentLine: string, nbLine: number) {
    const regexIfFormat = new RegExp(/^(if|elif)\s+.+\s+then$/);
    // if the format isn't correct
    if (!regexIfFormat.test(currentLine)) { errors.push(new SyntaxError(409, "Wrong 'if/elif' block format", nbLine)); }
    else {
        // if the condition isn't correct
        let condition = currentLine.split("if")[1].split("then")[0].trim();
        if (!expressionIsBoolean(condition, nbLine)) { errors.push(new SyntaxError(406, condition + " is not boolean", nbLine)); }
        else {
            const regexIf = new RegExp(/^if/);
            if (regexIf.test(currentLine)) { blockScope++; }
        }
    }
}

/**
 * @description checks error on a 'while' line
 * @param string line to check
 * @param number number of the line checked
 * @author Sébastien HERT
 */
function checkingError_While(currentLine: string, nbLine: number) {
    const regexWhileFormat = new RegExp(/^while\s+.+\s+loop$/);
    // if the format isn't correct
    if (!regexWhileFormat.test(currentLine)) { errors.push(new SyntaxError(410, "Wrong 'while' block format", nbLine)) }
    // the format is correct
    else {
        let condition = currentLine.split("while")[1].split("loop")[0].trim();
        if (!expressionIsBoolean(condition, nbLine)) { errors.push(new SyntaxError(406, condition + " is not a boolean", nbLine)) }
        else { blockScope++; }
    }
}

/**
 * @description checks error on an 'else' line
 * @param string line to check
 * @param number number of the line checked
 * @author Adam RIVIERE
 */
function checkingError_Else(currentLine: string, nbLine: number) {
    if (!new RegExp(/^else$/).test(currentLine)) { errors.push(new SyntaxError(409, "Wrong 'else' block format", nbLine)); }
}

/**
 * @description checks error on a 'for' line
 * @param string line to check
 * @param number number of the line checked
 * @author Sébastien HERT
 */
function checkingError_For(currentLine: string, nbLine: number) {
    const regexForFormat = new RegExp(/^for\s+.+\s+from\s+.+\s+to\s+.+loop$/);
    // if the format isn't correct
    if (!regexForFormat.test(currentLine)) { errors.push(new SyntaxError(411, "Wrong 'for' block format", nbLine)) }

    // the format is correct
    else {
        let variable = currentLine.split("for")[1].split("from")[0].trim();
        let upperBound = currentLine.split("from")[1].split("to")[0].trim();
        let lowerBound = currentLine.split("to")[1].trim();
        if (!variableExists(variable)) { errors.push(new SyntaxError(414, variable + " is not defined", nbLine)); }
        else if (!validBound(upperBound)) { errors.push(new SyntaxError(415, upperBound + " is not a valid bound", nbLine)) }
        else if (!validBound(lowerBound)) { errors.push(new SyntaxError(415, lowerBound + " is not a valid bound", nbLine)) }
        else { blockScope++; }
    }
}

/**
 * @description checks error on a variable declaration line
 * @param string line to check
 * @param number number of the line checked
 * @author Adam RIVIERE
 */
function checkingError_VariableDeclaration(currentLine: string, nbLine: number) {
    // If variable declaration is not ok and if we are in the main procedure
    if (!declarationOk && (blockScope != 1)) { errors.push(new SyntaxError(419, "variables must be defined before the 'begin' statement of the method", nbLine)) }

    // If variable declaration is ok
    else {

        // If the declared type is not valid
        const regexDefinition = new RegExp(/.*:\s*(integer|boolean)\s*;$/);
        if (!regexDefinition.test(currentLine)) { errors.push(new SyntaxError(403, "Undefined type", nbLine)); }

        // If it is valid
        else {

            // We get the variable list and their type
            let variables = currentLine.split(":")[0].split(",");
            let type = currentLine.split(":")[1].trim();

            // For each variable declaration
            for (let i = 0; i < variables.length; i++) {
                let variable = variables[i].trim();

                // If the variable name is already used
                if (variableExists(variable)) { errors.push(new SyntaxError(416, variable + " is already defined", nbLine)); }

                // If that is not a valid variable name
                else if (!hasCorrectName(variable)) { errors.push(new SyntaxError(417, variable + "is not a valid variable name", nbLine)); }
                else {

                    // Else we register the variable
                    variablesTable[currentMethod + "." + variable] = { name: variable, type: type.split(";")[0], group: currentMethod };
                    knownWords.push(variable);

                    // We check if we are beginning the main procedure
                    if (blockScope == 1) { mainDeclarationFlag = true; }
                }
            }
        }
    }
}

/**
 * @description checks errors in affectation
 * @param string the line
 * @param number the line number
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function checkingError_Affectation(currentLine: string, nbLine: number) {

    // First we need the variable
    let variable = currentLine.split(":=")[0].trim();

    // Then if it doesn't exist
    if (!variableExists(variable)) { errors.push(new SyntaxError(414, variable + " is not defined", nbLine)); }

    // else it exists
    else {
        // Get the type of the variable and the expression
        let type = variablesTable[currentMethod + "." + variable].type;
        let exp = currentLine.split(":=")[1].trim();

        // if the variable is supposed to be a boolean but the expression cannot be a boolean
        if (type == "boolean" && !expressionIsBoolean(exp, nbLine)) { errors.push(new SyntaxError(406, "Expression is not boolean", nbLine)); }

        // if the variable is supposed to be an integer but the expression cannot be an integer
        else if (type == "integer" && expressionIsBoolean(exp, nbLine)) { errors.push(new SyntaxError(405, "Expression is not a number", nbLine)); }
    }
}

/**
 * @description loads the parameters given in a method declaration into our table of variable
 * @param number nbLine
 * @param string all the parameters as a string
 * @param string the name of the method
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function checkingError_Parameters(nbLine: number, params: string, methodName: string) {

    // First we need to create a list of parameters
    const listParams = params.split(/(:|,)/);

    // We also need a list of current variables, which stores the name of the current variables read for a corresponding type
    var currentVarList: string[] = []

    //For each element in the created list
    listParams.forEach(element => {
        element = element.trim();

        // If it's a type
        if (new RegExp(/^in\s*(out)?\s*(integer|boolean)$/).test(element)) {
            // if (element == "boolean" || element == "integer") {

            // We need to loads all the variables stored in our local list into our global list
            currentVarList.forEach(param => {
                let elementInWords = element.split(" ");
                variablesTable[methodName + "." + param] = { name: param, group: methodName, type: elementInWords[elementInWords.length - 1] }
            });

            // And then resets it
            currentVarList = []
        }
        // If the element is ':'/','/"in"/"out" we do nothing
        else if (element == ":" || element == "," || element == "in" || element == "out") { }

        // Else the element is a parameter's name
        else {

            // If the name given is not a valid parameter name
            if (!hasCorrectName(element)) { errors.push(new SyntaxError(417, element + " is not a valid parameter name", nbLine)); }

            // Else we keep the name
            else {
                currentVarList.push(element);
                knownWords.push(element);
            }
        }
    });
}


// /**
//  * @description checks the number of parameters when calling a method
//  * @param number the number of line
//  * @param string the method and all its params
//  * @author Sébastien HERT
//  * @author Adam RIVIÈRE
//  */
// function checkingError_CallingMethod(nbLine : number, expression:string){
//     const methodName = expression.split("(")[0].trim();

//     // Checks if the the method is defined 
//     if (!methodExists(methodName)){
//         errors.push(new SyntaxError(404,"Method "+methodName+" not found", nbLine));
//     }
//     else{

//         // Let's check if there et least one parameter
//         const regexNoParameter = new RegExp(/\(\)/);
//         if (!regexNoParameter.test(expression)){

//             // We need to be sure there are even parameters in description in our table
//             const nbParam = expression.split(',').length;
//             const realNbParam = methodsTable[methodName].nbParams;
//             if (realNbParam != nbParam){
//                 errors.push(new SyntaxError(413, "Wrong number of parameters", nbLine));
//             }
//         }
//     }
// }


/**
 * @description Checks if the word has already been seen
 * @param string the line
 * @param number the nb of the line
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function checkingError_UnknownWord(currentLine: string, nbLine: number) {

    // We need to define all the potential parsers and all the keywords known
    const regexParser = new RegExp(/ |,|\+|\-|\/|\*|>|<|=|:|;|\(|\)/);
    const keyWordList = ["begin", "end", "if", "elif", "else", "while", "for", "procedure", "function", "then", "from", "to", "loop", "is", "or", "not", "and", "true", "false", "return", "integer", "boolean", "in", "out"];

    // We also need to split our currentLine
    var wordsList = currentLine.split(regexParser);

    // For each word
    wordsList.forEach(word => {

        // if it is not known
        if (!(keyWordList.includes(word) || isKnownWord(word))) { errors.push(new SyntaxError(418, word + " is an unknown word", nbLine)); }
    });
}

/**
 * @description Checks if there is no missing parenthesis
 * @param string the line
 * @param number the nb of the line
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function checkingError_MissingParenthesis(currentLine: string, nbLine: number) {

    // We check the number of open and closed parenthesis
    const openParenthesisNb = currentLine.split("(").length;
    const closedParenthesisNb = currentLine.split(")").length;

    if (openParenthesisNb != closedParenthesisNb) {
        errors.push(new SyntaxError(412, "a parenthesis is missing", nbLine));
    }
}

//--------------------------------------------------------------------------------//

//================================================================================//