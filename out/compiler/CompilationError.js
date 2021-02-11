"use strict";
//============================ Class CompilationError ============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilationError = exports.setError = exports.isError = void 0;
//--------------------------------- Description ----------------------------------//
//
// This class stores all the data used for each error for the compiler.
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//
exports.isError = false;
function setError(bool) {
    exports.isError = bool;
}
exports.setError = setError;
class CompilationError {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(code, message, line) {
        this.code = code;
        this.message = "Compilation error at line " + line + " : " + message + ".";
        this.line = line;
        exports.isError = true;
    }
}
exports.CompilationError = CompilationError;
//================================================================================//
//# sourceMappingURL=CompilationError.js.map