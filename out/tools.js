"use strict";
//=================================== tools.ts ===================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeComments = exports.indexingFile = exports.splittingLine = void 0;
//--------------------------------- Description ----------------------------------//
//
// The files gives some tools used in different files
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
const providers_1 = require("./providers");
const SyntaxError_1 = require("./SyntaxError");
//--------------------------------------------------------------------------------//
//------------------------------- Global Variables -------------------------------//
//
//--------------------------------------------------------------------------------//
//---------------------------------- Functions -----------------------------------//
/**
 * @description returns the line content and the line index
 * @param string the line
 * @returns {content : currentLine, index : nbLine} the content and the index of the line
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function splittingLine(line) {
    // $ is used to indicate the line number
    var splitedLine = line.trim().split("$");
    // if there is more than one "$"
    if (splitedLine.length > 2) {
        // the line number is at this end of the line
        var nbLine = parseInt(splitedLine[splitedLine.length - 1]);
        // and we need to merge each part of the splited line (except the last one) in order to look for more errors
        var currentLine = "";
        for (let i = 0; i < splitedLine.length - 2; i++) {
            currentLine += splitedLine[i].trim();
        }
        // And don't forget to raise an error
        providers_1.errors.push(new SyntaxError_1.SyntaxError(402, "Unexpected character", nbLine));
    }
    // else everything is right
    else {
        var nbLine = parseInt(splitedLine[1]);
        var currentLine = splitedLine[0].trim();
    }
    return { content: currentLine, index: nbLine };
}
exports.splittingLine = splittingLine;
/**
 * @description Adds index before the end of the line
 * @param String file
 * @returns the indexed file as a String
 * @author Sébastien HERT
 * @author Adam RIVIÈRE
 */
function indexingFile(file) {
    // We need a list of line
    var parsedFile = file.split(/\r?\n/);
    var indexedFile = "";
    var i = 1;
    // Then for each line, we recreate a single-line string with the current line and le line number
    for (let index = 0; index < parsedFile.length; index++) {
        var line = parsedFile[index];
        indexedFile = indexedFile + line + "$" + i + "\n";
        i++;
    }
    return indexedFile;
}
exports.indexingFile = indexingFile;
/**
 * @description removes the comments from a file
 * @param string file to clean
 * @returns the file without comments
 * @author Sébastien HERT
 */
function removeComments(file) {
    var regexpComment = /(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\#.*)/gm;
    return file.replace(regexpComment, "");
}
exports.removeComments = removeComments;
//--------------------------------------------------------------------------------//
//------------------------------------- Main -------------------------------------//
//
//--------------------------------------------------------------------------------//
//================================================================================//
//# sourceMappingURL=tools.js.map