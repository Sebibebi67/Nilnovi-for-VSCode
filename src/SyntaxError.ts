import * as vscode from "vscode";

export class SyntaxError {

    public code : number;
    public message : string;
    public severity : string;
    public line : number;

    constructor(code: number, message: string, severity: string, line : number){
        this.code = code;
        this.message = message;
        this.severity = severity;
        this.line = line;
    }

}