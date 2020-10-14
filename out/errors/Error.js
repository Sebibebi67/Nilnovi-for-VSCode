"use strict";
//================================== Class Error =================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Error = void 0;
//--------------------------------------------------------------------------------//
class Error {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(output, line, message) {
        this.line = line;
        this.message = message;
        this.output = output;
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    display() {
        this.output.appendLine("ERROR at line " + this.line + " : " + this.message);
    }
}
exports.Error = Error;
//================================================================================//
//# sourceMappingURL=Error.js.map