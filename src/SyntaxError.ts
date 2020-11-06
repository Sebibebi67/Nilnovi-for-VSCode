import * as vscode from "vscode";

export const referencedErrors = [
    // /^(?!begin|end|if|elif|else|while|for).*(?<!\;)$/
    // [401, ,"; expected"],
    // [402, , "Unexpected character"],
    // [403, , "Undefined type"],
    [404, , "Method not found"],
    [406, , "Not an expression"],
    [407, , "Not a boolean"],
    // [408, , "Wrong function formation"],
    // [409, , "Wrong procedure formation"],
    [410, , "Wrong block formation (if)"],
    [411, , "Wrong block formation (while)"],
    [412, , "Wrong block formation (for)"],
    [413, , "Missing parenthesis"],
    [414, , "Wrong number of parameters"],
    [415, , ""]
]

export var isError : boolean = false;

export class SyntaxError {

    public code : number;
    public message : string;
    public line : number;

    constructor(code: number, message: string, line : number){
        this.code = code;
        this.message = "SyntaxError : "+message+" at line "+line;
        this.line = line;
        isError = true;
    }

}