"use strict";
//============================= Class SemiColonError =============================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemiColonError = void 0;
//--------------------------------- Description ----------------------------------//
//
// Specific subClass error, which occurs if a line ends without a ";"
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
class SemiColonError extends Error_1.Error {
    //--------------------------------- Constructor ----------------------------------//
    constructor(output, line) {
        super(output, line, "End of line requires ';'.");
        this.display();
    }
}
exports.SemiColonError = SemiColonError;
//================================================================================//
//# sourceMappingURL=SemiColonError.js.map