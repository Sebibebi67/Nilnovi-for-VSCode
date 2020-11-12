"use strict";
// import * as vscode from "vscode";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxError = exports.isError = void 0;
exports.isError = false;
class SyntaxError {
    constructor(code, message, line) {
        this.code = code;
        this.message = "SyntaxError at line " + line + " : " + message;
        // this.message = "SyntaxError : "+message+" at line "+line;
        this.line = line;
        exports.isError = true;
    }
}
exports.SyntaxError = SyntaxError;
//# sourceMappingURL=SyntaxError.js.map