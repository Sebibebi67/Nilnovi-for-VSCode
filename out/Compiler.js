"use strict";
//================================ Class Compiler ================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
const EndOfCommentBlockError_1 = require("./errors/EndOfCommentBlockError");
const EndOfStringError_1 = require("./errors/EndOfStringError");
const error = require("./errors/errorsDeclaration");
const SemiColonError_1 = require("./errors/SemiColonError");
//--------------------------------------------------------------------------------//
class Compiler {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    //
    constructor(output) {
        //------------------------------- Class Variables --------------------------------//
        this.dictLines = new Map();
        this.output = output;
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    compile(file) {
        // reseting the data
        this.reset();
        // Spliting file string
        var lines = file.split(/\r?\n/);
        // Creating dictionary
        for (let i = 0; i < lines.length; i++) {
            this.dictLines.set(i + 1, lines[i].trim());
        }
        var returnCommentsValue = this.removeComments();
        if (returnCommentsValue != 0) {
            return 1;
        }
        this.removeEmptyLines();
        var returnSemiColonValue = this.checkingSemiColon();
        if (returnSemiColonValue != 0) {
            return 1;
        }
        this.checkingMethodError();
        // this.dictLines.forEach(function (value, key) {
        //   console.log(`${key} : ${value}`);
        // });
    }
    reset() {
        this.dictLines = new Map();
    }
    removeComments() {
        var _a;
        var isOneLineCommented = false;
        var isMultiLineCommented = false;
        var isQuoted = false;
        var lastOpenBlockLine = 0;
        for (var k = 1; k < this.dictLines.size + 1; k++) {
            isOneLineCommented = false;
            var line = (_a = this.dictLines) === null || _a === void 0 ? void 0 : _a.get(k);
            if (line == undefined) {
                return 1;
            }
            var i = 0;
            while (i < line.length) {
                var char = line.charAt(i);
                switch (char) {
                    case "#":
                        if (!isQuoted && !isMultiLineCommented) {
                            isOneLineCommented = true;
                        }
                        break;
                    case '"':
                        var lastChar = line.charAt(i - 1);
                        if (lastChar != "\\" &&
                            !isMultiLineCommented &&
                            !isOneLineCommented) {
                            isQuoted = !isQuoted;
                        }
                        break;
                    case "/":
                        var nextChar = line.charAt(i + 1);
                        if (nextChar == "*" && !isQuoted && !isMultiLineCommented) {
                            line =
                                line.substring(0, i + 1) + line.substring(i + 2, line.length);
                            // i--;
                            isMultiLineCommented = true;
                            lastOpenBlockLine = k;
                        }
                        break;
                    case "*":
                        var nextChar = line.charAt(i + 1);
                        if (nextChar == "/" && !isQuoted && isMultiLineCommented) {
                            line = line.substring(0, i) + line.substring(i + 2, line.length);
                            i--;
                            isMultiLineCommented = false;
                        }
                        break;
                    default:
                        break;
                }
                if (isOneLineCommented || isMultiLineCommented) {
                    line = line.substring(0, i) + line.substring(i + 1, line.length);
                }
                else {
                    i++;
                }
            }
            if (isQuoted) {
                new EndOfStringError_1.EndOfStringError(this.output, k);
                return error.ERROR_END_OF_STRING;
            }
            line = line.trim();
            this.dictLines.set(k, line);
        }
        if (isMultiLineCommented) {
            new EndOfCommentBlockError_1.EndOfCommentBlockError(this.output, lastOpenBlockLine);
            return error.ERROR_END_OF_COMMENTED_BLOCK;
        }
        return 0;
    }
    removeEmptyLines() {
        var size = this.dictLines.size + 1;
        for (let i = 1; i < size; i++) {
            let line = this.dictLines.get(i);
            if (typeof line === undefined || (line === null || line === void 0 ? void 0 : line.length) == 0) {
                this.dictLines.delete(i);
            }
        }
    }
    checkingSemiColon() {
        for (let [nb, line] of this.dictLines) {
            if (!line.endsWith(";")) {
                new SemiColonError_1.SemiColonError(this.output, nb);
                return error.ERROR_SEMICOLON_EXPECTED;
            }
        }
        return 0;
    }
    checkingMethodError() {
        var regex = /^((debutProg|finProg|affectation|valeurPile|get|put|moins|sous|add|mult|div|egal|diff|inf|infeg|sup|supeg|et|ou|non|retourProc|retourFonct|reserverBloc)\(\)|(reserver|empiler|tra|tze|empilerAd|empilerParam)\([0-9]+\)|(trastat\([0-9]+,[0-9]+\))|(erreur\(".*"\)));$/gm;
        for (let [nb, line] of this.dictLines) {
            var copiedLine = line.replace(" ", "");
            if (!copiedLine.match(regex)) {
                // Syntax error
                if (!copiedLine.match(/[a-zA-Z]*\(.*\);/)) {
                    console.error("Syntax Error" + nb);
                    return 1;
                }
                var method = copiedLine.split("(")[0];
                if (method.match(/^(debutProg|finProg|affectation|valeurPile|get|put|moins|sous|add|mult|div|egal|diff|inf|infeg|sup|supeg|et|ou|non|retourProc|retourFonct|reserverBloc)$/)) {
                    if (copiedLine.split(",").length - 1 != 0) {
                        console.error("wrong number of parameters");
                    }
                    else {
                        console.error("wrong Type");
                    }
                }
                else if (method.match(/^(reserver|empiler|tra|tze|empilerAd|empilerParam)$/)) {
                    if (copiedLine.split(",").length - 1 != 1) {
                        console.error("wrong number of parameters");
                    }
                    else {
                        console.error("wrong Type");
                    }
                }
                else if (method.match(/^trastat$/)) {
                    if (copiedLine.split(",").length - 1 != 2) {
                        console.error("wrong number of parameters");
                    }
                    else {
                        console.error("wrong Type");
                    }
                }
                else if (method.match(/^erreur$/)) {
                    console.log("TODO");
                    console.error(nb + "4");
                }
                else {
                    console.error("Method doesn't match");
                }
                return 1;
                // if (!method.match(/debutProg|finProg|affectation|valeurPile|get|put|moins|sous|add|mult|div|egal|diff|inf|infeg|sup|supeg|et|ou|non|retourProc|retourFonct|reserverBloc|reserver|empiler|tra|tze|empilerAd|empilerParam|trastat|erreur/))
            }
        }
        console.log("isok");
        return 0;
        //   var method =
        // eval("this.test(4, 3)");
    }
}
exports.Compiler = Compiler;
//================================================================================//
//# sourceMappingURL=Compiler.js.map