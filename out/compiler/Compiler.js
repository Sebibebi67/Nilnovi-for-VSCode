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
const MethodList_1 = require("./MethodList");
const VariableList_1 = require("./VariableList");
const Method_1 = require("./Method");
const Variable_1 = require("./Variable");
//--------------------------------------------------------------------------------//
class Compiler {
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
        //------------------------------- Class Variables --------------------------------//
        this.nilnoviProgram = [];
        this.nilnoviProgramIndex = 1;
        this.nbLine = 0;
        this.blockScope = 0;
        // public currentLine : string ="";
        this.instructions = [];
        this.traCompleted = false;
        // private fakePileLength: number = 0;
        this.currentMethodName = "pp";
        this.methodList = new MethodList_1.MethodList();
        this.variableList = new VariableList_1.VariableList();
        file = tools.removeComments(tools.indexingFile(file));
        this.nilnoviProgram = tools.removeEmptyLines(file.split(/\r?\n/));
        var returnValue = this.compile();
        if (returnValue != 0) {
            console.error("something got wrong");
        }
        console.log(this.instructions);
        this.methodList.display();
        this.variableList.display();
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    compile() {
        let returnValue = this.evalFirstLine();
        if (returnValue != 0) {
            return 1;
        }
        // // Just for the tests
        // while (this.nilnoviProgramIndex < this.nilnoviProgram.length) {
        // 	let lineFeatures = tools.splittingLine(this.nilnoviProgram[this.nilnoviProgramIndex]);
        // 	let currentLine = lineFeatures["content"];
        // 	this.nbLine = lineFeatures["index"];
        // 	returnValue = this.eval(currentLine);
        // 	if (returnValue != 0) { return 1; }
        // 	this.nilnoviProgramIndex++;
        // }
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
        let lineFeatures = tools.splittingLine(currentLine);
        currentLine = lineFeatures["content"];
        //Scope? nb Param? type Param? validExpression?
        if (currentLine === undefined) {
            return 0;
        }
        var words = tools.lineToWordsList(currentLine);
        // if procedure or function
        if (words[0] == "function" || words[0] == "procedure") {
            // it's a procedure
            if (words[0] == "procedure") {
                let returnValue = this.createProcedure(words);
                return returnValue;
            }
            // it's a function
            else {
                let returnValue = this.createFunction(words);
                return returnValue;
            }
        }
        else if (this.blockScope == 1 && !this.traCompleted) {
            this.instructions[1] = "tra(" + this.instructions.length + ")";
            this.traCompleted = true;
        }
        // else if (new RegExp(/^(if|for|while|elif|else)/).test(currentLine)) {
        // 	// "if" or "elif" read
        // 	if (new RegExp(/^(if|elif)/).test(currentLine)) { }
        // 	// "while" read
        // 	else if (new RegExp(/^while/).test(currentLine)) { }
        // 	// "for" read
        // 	else if (new RegExp(/^for/).test(currentLine)) { }
        // 	// "else" read
        // 	else { }
        // }
        // if (words.includes())
        if (new RegExp(/.*:=.*/).test(currentLine)) {
            return 0;
        }
        if (words.includes(":")) {
            let returnValue = this.variableDeclaration(words);
            return returnValue;
        }
        // else if (new RegExp(/.*:.*/).test(currentLine)) { }
        // else if (new RegExp(/^begin/).test(currentLine)) { }
        // else if (new RegExp(/^end/).test(currentLine)) {
        // 	this.blockScope--;
        // }
        return 0;
    }
    evalFirstLine() {
        // Adding the begin and the "tra" at the beginning of the instructions
        this.instructions.push("debutProg();");
        this.instructions.push("tra(x);");
        this.methodList.add(new Method_1.Method("pp", "none", -1, []));
        this.blockScope++;
        // recursive calling
        this.nbLine++;
        var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
        // Something got wrong
        if (returnValue != 0) {
            return 1;
        }
        // End of the program
        this.instructions.push("finProg();");
        return 0;
    }
    variableDeclaration(words) {
        var nameList = [];
        words.forEach(word => {
            if (word == "," || word == ":") { }
            else if (word == "boolean" || word == "integer") {
                nameList.forEach(name => {
                    this.variableList.add(new Variable_1.Variable(name, this.currentMethodName, word, false, this.methodList.get(this.currentMethodName).fakePileLength));
                });
                this.instructions.push("reserver(" + nameList.length + ");");
                this.methodList.get(this.currentMethodName).fakePileLength += nameList.length;
            }
            else {
                nameList.push(word);
            }
        });
        // recursive calling
        this.nbLine++;
        var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
        // Something got wrong
        return returnValue;
    }
    parameterLoading(words) {
        var nameList = [];
        const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")"];
        words.forEach(word => {
            var indexParam = 0;
            if (word == "integer" || word == "boolean") {
                nameList.forEach(name => {
                    console.log(this.currentMethodName, this.methodList.get(this.currentMethodName).fakePileLength);
                    this.variableList.add(new Variable_1.Variable(name, this.currentMethodName, word, true, this.methodList.get(this.currentMethodName).fakePileLength, indexParam));
                    this.methodList.get(this.currentMethodName).fakePileLength++;
                    indexParam++;
                });
                nameList = [];
            }
            else if (!notParamList.includes(word) && word != words[1]) {
                nameList.push(word);
            }
        });
    }
    getParamNames(words) {
        let names = [];
        const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")"];
        words.forEach(word => {
            if (!notParamList.includes(word) && word != words[1]) {
                names.push(word);
            }
        });
        return names;
    }
    createProcedure(words) {
        const name = words[1];
        this.blockScope++;
        this.currentMethodName = name;
        //procedure toto ( x , y : integer , a : boolean ) is
        var params = this.getParamNames(words);
        this.methodList.add(new Method_1.Method(name, "none", this.instructions.length, params)),
            this.parameterLoading(words);
        // recursive calling
        this.nbLine++;
        var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
        if (returnValue != 0) {
            return 1;
        }
        this.instructions.push("retourProc();");
        return 0;
    }
    createFunction(words) {
        const name = words[1];
        const returnType = words[words.length - 2];
        this.blockScope++;
        this.currentMethodName = name;
        // function toto ( a , b : boolean , c , d : integer ) returns integer is
        var params = this.getParamNames(words);
        this.methodList.add(new Method_1.Method(name, returnType, this.instructions.length, params));
        this.parameterLoading(words);
        // recursive calling
        this.nbLine++;
        var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
        if (returnValue != 0) {
            return 1;
        }
        this.instructions.push("retourFonct();");
        return 0;
    }
}
exports.Compiler = Compiler;
//================================================================================//
//# sourceMappingURL=Compiler.js.map