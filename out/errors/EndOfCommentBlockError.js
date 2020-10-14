"use strict";
//========================= Class EndOfCommentBlockError =========================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndOfCommentBlockError = void 0;
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
class EndOfCommentBlockError extends Error_1.Error {
    //--------------------------------- Constructor ----------------------------------//
    constructor(output, line) {
        super(output, line, "End of comment block missing.");
        this.display();
    }
}
exports.EndOfCommentBlockError = EndOfCommentBlockError;
//================================================================================//
//# sourceMappingURL=EndOfCommentBlockError.js.map