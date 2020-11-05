"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxError = exports.isError = exports.referencedErrors = void 0;
exports.referencedErrors = [
    // /^(?!begin|end|if|elif|else|while|for).*(?<!\;)$/
    [401, , "; expected"],
    [402, , "Unexpected character"],
    [403, , "Undefined type"],
    [404, , "Method not found"],
    [406, , "Not an expression"],
    [407, , "Not a boolean"],
    [408, , "Wrong function formation"],
    [409, , "Wrong procedure formation"],
    [410, , "Wrong block formation (if)"],
    [411, , "Wrong block formation (while)"],
    [412, , "Wrong block formation (for)"],
    [413, , "Missing parenthesis"],
    [414, , "Wrong number of parameters"],
    [415, , ""]
];
exports.isError = false;
class SyntaxError {
    constructor(code, message, line) {
        this.code = code;
        this.message = "SyntaxError : " + message + " at line " + line;
        this.line = line;
        exports.isError = true;
    }
}
exports.SyntaxError = SyntaxError;
//# sourceMappingURL=SyntaxError.js.map