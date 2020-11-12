"use strict";
//================================ Class Compiler ================================//
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compiler = void 0;
//--------------------------------- Description ----------------------------------//
//
// This class describes how the compiler should work.
//
//--------------------------------------------------------------------------------//
//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//
//----------------------------------- Imports ------------------------------------//
// import { Method } from "./tables/Method";
// import { Variable } from "./tables/Variable";
const tools = require("../tools");
//--------------------------------------------------------------------------------//
class Compiler {
    // public currentLine : string ="";
    // public instructions: string[] = [];
    // public currentScope = 0;
    // public alreadyBegun = false;
    // public fakePileLength: number = 0;
    // public varTable: Variable[] = [];
    // public methodTable: Method[] = [];
    // public blockList: Object[] = [];
    // private OpDict = new Map<string, string>();
    // private currentExpressionList: string[] = [];
    //--------------------------------------------------------------------------------//
    //--------------------------------- Constructor ----------------------------------//
    /**
     * @description constructor
     * @param string the file
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    constructor(file) {
        // initialize the dictionary of operator
        // this.initDict();
        //------------------------------- Class Variables --------------------------------//
        this.nilnoviProgram = [];
        this.nilnoviProgramIndex = 0;
        this.nbLine = 0;
        this.blockScope = 0;
        // We should now remove the comments from the indexed file, which is a single-line string
        // let lines: string[] = [];
        file = tools.removeComments(tools.indexingFile(file));
        this.nilnoviProgram = file.split(/\r?\n/);
        // console.log(this.nilnoviProgram);
        this.compile();
        // for (let i = 0; i < lines.length; i++) {
        // 	let lineFeatures = tools.splittingLine(lines[i]);
        // 	currentLine = lineFeatures["content"]
        // 	nbLine : lineFeatures["index"]
        // }
        // // adding line number
        // var parsedFile = file.split(/\r?\n/);
        // var indexedFile = "";
        // var i = 1;
        // for (let index = 0; index < parsedFile.length; index++) {
        // 	var line = parsedFile[index];
        // 	indexedFile = indexedFile + line + "$" + i + "\n";
        // 	i++;
        // }
        // // removing Comments
        // indexedFile = this.removeComments(indexedFile);
        // splitting file (as a string) into a List of lines
        // this.nilnoviProgram = indexedFile.split(/\r?\n/);
        // // removing empty line and trimming
        // this.removeEmptyLines();
        // console.log(this.nilnoviProgram);
        // var returnValue = this.compile();
        // // console.log((returnValue));
        // if (returnValue != 0) {
        // 	console.error("Error");
        // } else {
        // 	console.log(this.instructions)
        // }
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    compile() {
        while (this.nilnoviProgramIndex < this.nilnoviProgram.length) {
            let lineFeatures = tools.splittingLine(this.nilnoviProgram[this.nilnoviProgramIndex]);
            let currentLine = lineFeatures["content"];
            this.nbLine = lineFeatures["index"];
            var returnValue = this.eval(currentLine);
            if (returnValue != 0) {
                return 1;
            }
            this.nilnoviProgramIndex++;
        }
        return 0;
    }
    /**
     * @description evaluates the current line
     * @param string the current line
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    eval(currentLine) {
        //Scope? nb Param? type Param? validExpression?
        if (currentLine.length != 0) {
            // if procedure or function
            if (new RegExp(/^(procedure|function)/).test(currentLine)) {
                // it's a procedure
                if (new RegExp(/^procedure/).test(currentLine)) { }
                // it's a function
                else { }
            }
            else if (new RegExp(/^(if|for|while|elif|else)/).test(currentLine)) {
                // "if" or "elif" read
                if (new RegExp(/^(if|elif)/).test(currentLine)) { }
                // "while" read
                else if (new RegExp(/^while/).test(currentLine)) { }
                // "for" read
                else if (new RegExp(/^for/).test(currentLine)) { }
                // "else" read
                else { }
            }
            else if (new RegExp(/.*:=.*/).test(currentLine)) { }
            else if (new RegExp(/.*:.*/).test(currentLine)) { }
            else if (new RegExp(/^begin/).test(currentLine)) { }
            else if (new RegExp(/^end/).test(currentLine)) {
                this.blockScope--;
            }
        }
        // console.log(syntaxError.isError);
        return 0;
    }
}
exports.Compiler = Compiler;
//================================================================================//
//# sourceMappingURL=Compiler.js.map