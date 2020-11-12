import * as vscode from "vscode";

export const referencedErrors = [
    // /^(?!begin|end|if|elif|else|while|for).*(?<!\;)$/
    // [401, ,"; expected"],
    // [402, , "Unexpected character"],
    // [403, , "Undefined type"],
    [404, , "Method not found"],
    [405, , "Not an expression"],
    [406, , "Not a boolean"],
    // [408, , "Wrong function formation"],
    // [409, , "Wrong procedure formation"],
    // [409, , "Wrong block formation (if)"],
    [412, , "Missing parenthesis"],
    [413, , "Wrong number of parameters"],
    [414, , "Variable undefined"],
    // [415, , "is not a valid bound"],
    // [416, , "variable already defined"],
    // [417, , "is not a valid variable name"],
    [418, , "Wrong type"],
    // [419, , "variables must be defined before the 'begin' statement"]
]

export var isError : boolean = false;

export class SyntaxError {

    public code : number;
    public message : string;
    public line : number;

    constructor(code: number, message: string, line : number){
        this.code = code;
        this.message = "SyntaxError at line "+line+" : "+message
        // this.message = "SyntaxError : "+message+" at line "+line;
        this.line = line;
        isError = true;
    }

}