"use strict";
//============================ Class EndOfStringError ============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndOfStringError = void 0;
//--------------------------------- Description ----------------------------------//
//
// Specific subClass error, which occurs if a string doesn't end at the end of the
// line.
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
const Error_1 = require("./Error");
//--------------------------------------------------------------------------------//
class EndOfStringError extends Error_1.Error {
    //--------------------------------- Constructor ----------------------------------//
    constructor(output, line) {
        super(output, line, "End of string missing.");
        this.display();
    }
}
exports.EndOfStringError = EndOfStringError;
//================================================================================//
//# sourceMappingURL=EndOfStringError.js.map