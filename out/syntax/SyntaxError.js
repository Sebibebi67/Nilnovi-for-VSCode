"use strict";
//============================== Class SyntaxError ===============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxError = exports.isError = void 0;
//--------------------------------- Description ----------------------------------//
//
// This class stores all the data used for each error.
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
exports.isError = false;
//--------------------------------------------------------------------------------//
class SyntaxError {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(code, message, line) {
        this.code = code;
        this.message = "SyntaxError at line " + line + " : " + message;
        this.line = line;
    }
}
exports.SyntaxError = SyntaxError;
//================================================================================//
//# sourceMappingURL=SyntaxError.js.map