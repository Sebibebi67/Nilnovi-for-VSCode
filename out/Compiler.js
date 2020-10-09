"use strict";
//================================ Class Compiler ================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
//--------------------------------- Description ----------------------------------//
//
//
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// @Sebibebi
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
//
//--------------------------------------------------------------------------------//
class Compiler {
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    //
    constructor() {
        //------------------------------- Class Variables --------------------------------//
        this.dictLines = new Map();
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
            console.log("error");
            return 1;
        }
        this.removeEmptyLines();
        // this.checkingSemiColon();
        this.dictLines.forEach(function (value, key) {
            console.log(`${key} : ${value}`);
        });
    }
    reset() {
        this.dictLines = new Map();
    }
    removeComments() {
        var isOneLineCommented = false;
        var isMultiLineCommented = false;
        var isQuoted = false;
        // this.dictLines.forEach((line) => {
        for (var k = 1; k < this.dictLines.size + 1; k++) {
            var line = this.dictLines.get(k);
            if (line == undefined) {
                return 1;
            }
            for (var i = 0; i < line.length; i++) {
                var char = line.charAt(i);
                switch (char) {
                    case "#":
                        if (!isQuoted && !isMultiLineCommented) {
                            isOneLineCommented = true;
                        }
                        break;
                    case '"':
                        var lastChar = line.charAt(i - 1);
                        if (lastChar != "\\") {
                            isQuoted = !isQuoted;
                        }
                        break;
                    case "/":
                        var nextChar = line.charAt(i + 1);
                        if (nextChar == "*" && !isQuoted && !isMultiLineCommented) {
                            isMultiLineCommented = true;
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
                console.log(isQuoted);
                if (isQuoted) {
                    return 1;
                }
                if ((isOneLineCommented || isMultiLineCommented) &&
                    char != "\r" &&
                    char != "\n") {
                    line = line.substring(0, i) + line.substring(i + 1, line.length);
                    i--;
                }
            }
            line = line.trim();
            this.dictLines.set(k, line);
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
        this.dictLines.forEach(function (line, key) {
            // if ( value.length == 0 || value.startsWith("#") || value.startsWith("/*") || value.endsWith("*/")){
            // dictLines.delete(key);
            if (line.endsWith(";")) {
                return 0;
            }
            // if (line.includes)
        });
    }
}
exports.Compiler = Compiler;
//================================================================================//
//# sourceMappingURL=Compiler.js.map