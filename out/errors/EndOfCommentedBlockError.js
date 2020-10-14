"use strict";
//======================== Class EndOfCommentedBlockError ========================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndOfCommentedBlockError = void 0;
//--------------------------------- Description ----------------------------------//
//
// Specific subClass error, which occurs if a block of comments doesn't end at the
// end of the file.
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
class EndOfCommentedBlockError extends Error_1.Error {
    //------------------------------- Class Variables --------------------------------//
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    constructor(output, line) {
        super(output, line, "End of comment block is missing.");
        this.display();
    }
}
exports.EndOfCommentedBlockError = EndOfCommentedBlockError;
//================================================================================//
//# sourceMappingURL=EndOfCommentedBlockError.js.map