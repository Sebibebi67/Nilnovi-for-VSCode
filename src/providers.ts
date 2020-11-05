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

//--------------------------------------------------------------------------------//

var methodsTable : {[id:string] : {name:string, nbParams:number}}= {};
// methodsTable["toto"] = {name : "toto", nbParams: 4}
// console.log(methodsTable["tata"] === undefined)
// console.log(methodsTable["toto"]["nbParams"])

var variablesTable : {[id:string] : {name:string, type:string}}= {};
// variablesTable["toto"] = {name : "toto", type: "integer"}

//------------------------------------ Methods -----------------------------------//

/**
   * Description : Provides auto-compltion for the Nilnovi language
   *
   * @returns The provider to push
   *
   * @author Adam RIVIERE
*/

export function autoCompletion(){
    return vscode.languages.registerCompletionItemProvider('nilnovi',{
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext){
          const completions = [];
          
          // Here we define every word we want to be auto-completed and we give it a category
          completions.push(new vscode.CompletionItem('begin', vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('end',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('return',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('if',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('elif',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('else',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('while',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('for',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('loop',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('then',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('from',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('to',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('is',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('procedure',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('function',vscode.CompletionItemKind.Keyword));
          completions.push(new vscode.CompletionItem('or',vscode.CompletionItemKind.Operator));
          completions.push(new vscode.CompletionItem('and',vscode.CompletionItemKind.Operator));
          completions.push(new vscode.CompletionItem('not',vscode.CompletionItemKind.Operator));
          completions.push(new vscode.CompletionItem('integer',vscode.CompletionItemKind.TypeParameter));
          completions.push(new vscode.CompletionItem('boolean',vscode.CompletionItemKind.TypeParameter));
          completions.push(new vscode.CompletionItem('true',vscode.CompletionItemKind.Constant));
          completions.push(new vscode.CompletionItem('false',vscode.CompletionItemKind.Constant));
          completions.push(new vscode.CompletionItem('get',vscode.CompletionItemKind.Function));
          completions.push(new vscode.CompletionItem('put',vscode.CompletionItemKind.Function));
          return completions;
        }
    });
}

/**
   * Description : Provides hovers for the Nilnovi functions
   *
   * @returns The provider to push
   *
   * @author Adam RIVIERE
*/

export function hovers(){
    return vscode.languages.registerHoverProvider('nilnovi', {
        provideHover(document, position, token) {
    
            // First we get the position of the user's cursor to display the hover
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);

            // Then we define the hover to display (only for the two existing Nilnovi functions)
            switch(word){
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

export var errors : SyntaxError[] = [];

export function updateDiags(document: vscode.TextDocument, collection: vscode.DiagnosticCollection[]) {
    // console.log(errors.length);
    for(let i = 0;i < errors.length;i++){
        var diag_coll = vscode.languages.createDiagnosticCollection('nilnovi');
        var error = errors[i];
        // console.log(error.line-1);
        let diag : vscode.Diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(error.line-1, 0), new vscode.Position(error.line-1, 30)), error.message, vscode.DiagnosticSeverity.Error);
        diag.source = 'nilnovi';
        //diag.relatedInformation = [new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(error.line, 0), new vscode.Position(error.line, 30))), error.message)];
        diag.code = error.code;
        var docNameRegexp = new RegExp(/.*\.nn$/mg);
        if(document && docNameRegexp.test(path.basename(document.uri.fsPath))){
            // console.log(document.uri, [diag]);
            diag_coll.set(document.uri, [diag]);
        }else{
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

export function setErrors(file : string) {
    errors = [];
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
    var lines: string[] = [];
    file = removeComments(indexedFile);
    lines = file.split(/\r?\n/);

    // console.log(lines);

    // Now, for each line, we need to check for errors
    for (let i = 0; i < lines.length; i++) {
        var splitedLine = lines[i].trim().split("$");
        if (splitedLine.length > 2){
            var nbLine = parseInt(splitedLine[splitedLine.length-1])
            var currentLine = "";
            for (let i = 0; i < splitedLine.length-2; i++){
                currentLine += splitedLine[i];
            }
            errors.push(new SyntaxError(402, "Unexpected character", nbLine));
        }
        else{
            var nbLine = parseInt(splitedLine[1]);
            var currentLine = splitedLine[0];
        }

        const regexSemiColon = new RegExp(/^(?!begin|end|if|elif|else|while|for|procedure|function).*(?<!\;)$/);
        const regexUnexpectedChar = new RegExp(/^[a-zA-Z0-9\+\*\-\/<>=:\(\)_ ;,]*$/);
        const regexAffectation = new RegExp(/.*:=.*$/);
        const regexDefinition = new RegExp(/.*:\s*(integer|boolean)$/);
        const regexTwoPoints = new RegExp(/.*:.*/);
        // const regexIf = new RegExp(/^[iI][fF] /);
        const regexKeyWord = new RegExp(/^(begin|end|if|elif|else|while|for|procedure|function|return|loop|to|from|then|is|true|false|integer|boolean|or|and|not)(?!(_|[a-zA-Z0-9]))/);
        
        if (currentLine.length != 0){

            // ';' is missing
            if(regexSemiColon.test(currentLine)){errors.push(new SyntaxError(401,"; expected",nbLine));}

            // Unknown character is spotted
            if(!regexUnexpectedChar.test(currentLine)){ errors.push(new SyntaxError(402, "Unexpected character", nbLine));}

            // //if it's a block 'if
            // if (regexIf.test(currentLine)){
                
            // }

            // if procedure or function
            if (new RegExp(/^(procedure|function)/).test(currentLine)){
                // it'sa procedure
                if (new RegExp(/^procedure/).test(currentLine)){
                    // console.log("procedure");

                    // If the procedure format isnt right
                    if (!new RegExp(/^procedure\s*[a-zA-Z][a-zA-Z0-9_]*\(.*\)\s*is\s*$/).test(currentLine)){
                        errors.push(new SyntaxError(408, "Wrong procedure block format",nbLine));
                    }

                    // it is supposed to be exact
                    else{
                        // console.log(currentLine.match(new RegExp(/\(/g)));
                        // console.log(cu);
                        // console.log((currentLine.match(new RegExp(/\(/g)) || []).length > 1 || (currentLine.match(new RegExp(/\)/g)) || []).length > 1);
                        // console.log("correctFormat");
                        // Let's count how many parentheses there is
                        // if there is more than One parenthesis of each type
                        if ((currentLine.match(new RegExp(/\(/g)) || []).length > 1 || (currentLine.match(new RegExp(/\)/g)) || []).length > 1){
                            // console.log("pb");
                            errors.push(new SyntaxError(412, "to many parentheses in procedure definition", nbLine))
                        }
                        // Else let's check the parameter(s)
                        else{
                            // console.log("() ok");
                            var params = currentLine.split("(")[1].split(")")[0].trim();
                            if (regexTwoPoints.test(params)){
                                // console.log(":");
                                if (! regexDefinition.test(params)){
                                    errors.push(new SyntaxError(403, "Undefined type", nbLine));
                                }else{
                                    // TODO REGISTER
                                    // console.log("isok");
                                }
                            }else{
                                // console.log("nothing to hide");
                                if(params.length != 0){
                                    errors.push(new SyntaxError(408, "Wrong procedure block format",nbLine));
                                }else{
                                    // console.log("isok");
                                    //TODO REGISTER
                                }
                            }
                        }
                    }
                }else{
                    //if the function format isn't right
                    if (!new RegExp(/^function\s*[a-zA-Z][a-zA-Z0-9_]*\(.*\)\s*return\s*.*\s*is\s*$/).test(currentLine)){
                        errors.push(new SyntaxError(407, "Wrong function block format",nbLine));
                    }else{
                        if ((currentLine.match(new RegExp(/\(/g)) || []).length > 1 || (currentLine.match(new RegExp(/\)/g)) || []).length > 1){
                            errors.push(new SyntaxError(412, "to many parentheses in function definition", nbLine))
                        }else{
                            var params = currentLine.split("(")[1].split(")")[0].trim();
                            if(regexTwoPoints.test(params)){
                                if(!regexDefinition.test(params)){
                                    errors.push(new SyntaxError(403, "Undefined type", nbLine));
                                }else{
                                    var outputs = currentLine.split("return")[1].split("is")[0].trim();
                                    if(!new RegExp(/^(integer|boolean)$/).test(outputs)){
                                        errors.push(new SyntaxError(403, "Undefined type", nbLine));
                                    }else{
                                        // TODO REGISTER
                                    }
                                }
                            }else{
                                if(params.length != 0){
                                    errors.push(new SyntaxError(407, "Wrong function block format",nbLine));
                                }else{
                                    var outputs = currentLine.split("return")[1].split("is")[0].trim();
                                    if(!new RegExp(/^(integer|boolean)$/).test(outputs)){
                                        errors.push(new SyntaxError(403, "Undefined type", nbLine));
                                    }else{
                                        // TODO REGSTER
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // console.log("yeet");


            // if line contains ':'
            // if(regexTwoPoints.test(currentLine)){
            //     // if line doesn't conatains ':='
            //     if(!regexAffectation.test(currentLine)){
            //         // if line is not a proper variable definition
            //         if(!regexDefinition.test(currentLine)){
            //             errors.push(new SyntaxError(403, "Undefined type", nbLine));
            //         }
            //     }
            // }
        }
        
    };
}

function removeComments(file: string) {
    var regexpComment = /(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\#.*)/gm;
    return file.replace(regexpComment, "");
}


//--------------------------------------------------------------------------------//

//================================================================================//