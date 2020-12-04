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
const Instruction_1 = require("./Instruction");
//--------------------------------------------------------------------------------//
class Compiler {
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
        // public varTable: Variable[] = [];
        // public methodTable: Method[] = [];
        // public blockList: Object[] = [];
        // private OpDict = new Map<string, string>();
        this.opDict = {};
        this.currentExpressionList = [];
        this.methodList = new MethodList_1.MethodList();
        this.variableList = new VariableList_1.VariableList();
        file = tools.removeComments(tools.indexingFile(file));
        this.nilnoviProgram = tools.removeEmptyLines(file.split(/\r?\n/));
        this.initDict();
        var returnValue = this.compile();
        if (returnValue != 0) {
            console.error("something got wrong");
        }
        this.instructions.forEach(instruction => {
            console.log(instruction.toString());
        });
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
            let traLine = this.instructions.length + 1;
            this.instructions[1] = new Instruction_1.Instruction("tra(" + traLine + ");");
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
        else if (new RegExp(/.*:=.*/).test(currentLine)) {
            let variable = words[0];
            if (!this.isVar(this.fullVariableName(variable))) {
                console.error(variable + " is not defined", this.currentMethodName);
                return 1;
            }
            let affectation = words[1] + words[2];
            if (affectation != ":=") {
                console.error(":= expected");
                return 1;
            }
            words.splice(0, 3);
            words.pop();
            let returnValue = this.analyzer(this.concatWords(words));
            if (returnValue != 0) {
                console.error("analyzer error");
                return returnValue;
            }
            returnValue = this.syntaxAnalyzer(this.currentExpressionList, this.variableList.get(this.fullVariableName(variable)).type);
            if (returnValue != 0) {
                console.error("syntaxAnalyzer");
                return returnValue;
            }
            this.instructions.push(new Instruction_1.Instruction("empiler(" + this.variableList.get(this.fullVariableName(variable)).addPile + ");", "address"));
            this.generateInstructions(this.currentExpressionList);
            this.instructions.push(new Instruction_1.Instruction("affectation();"));
            this.variableList.get(this.fullVariableName(variable)).hasBeenAffected = true;
            return 0;
            // this.nbLine++;
            // var returnValue: number = this.analyzer(this.concatMethod(words));
            // return returnValue;
        }
        if (words.includes(":")) {
            let returnValue = this.variableDeclaration(words);
            return returnValue;
        }
        // else if (new RegExp(/.*:.*/).test(currentLine)) { }
        else if (new RegExp(/^begin/).test(currentLine)) {
            // this.nbLine++;
            // var returnValue: number = this.eval(this.nilnoviProgram[this.nbLine]);
            return 0;
        }
        else if (new RegExp(/^end/).test(currentLine)) {
            this.blockScope--;
            return 0;
        }
        else if (new RegExp(/^return/).test(currentLine)) {
            // this.blockScope--;
            // this.nbLine++;
        }
        else {
            words.pop();
            let returnValue = this.analyzer(this.concatWords(words));
            if (returnValue != 0) {
                console.error("analyzer error");
                return returnValue;
            }
            returnValue = this.syntaxAnalyzer(this.currentExpressionList);
            if (returnValue != 0) {
                console.error("syntaxAnalyzer");
                return returnValue;
            }
            this.generateInstructions(this.currentExpressionList);
            // this.nbLine++;
            return 0;
        }
        return 0;
    }
    evalFirstLine() {
        // Adding the begin and the "tra" at the beginning of the instructions
        this.instructions.push(new Instruction_1.Instruction("debutProg();"));
        this.instructions.push(new Instruction_1.Instruction("tra(x);"));
        this.methodList.add(new Method_1.Method("pp", "none", -1, []));
        this.blockScope++;
        // recursive calling
        this.nbLine++;
        var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
        // Something got wrong
        if (returnValue != 0) {
            return 1;
        }
        while (this.nbLine < this.nilnoviProgram.length - 1) {
            this.nbLine++;
            // recursive calling
            var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
            // Something got wrong
            if (returnValue != 0) {
                return 1;
            }
        }
        // End of the program
        this.instructions.push(new Instruction_1.Instruction("finProg();"));
        return 0;
    }
    variableDeclaration(words) {
        var nameList = [];
        words.forEach(word => {
            if (word == "," || word == ":") { }
            else if (word == "boolean" || word == "integer") {
                nameList.forEach(name => {
                    this.variableList.add(new Variable_1.Variable(name, this.currentMethodName, word, false, this.methodList.get(this.currentMethodName).fakePileLength));
                    this.methodList.get(this.currentMethodName).fakePileLength++;
                });
                this.instructions.push(new Instruction_1.Instruction("reserver(" + nameList.length + ");", "empty"));
            }
            else {
                nameList.push(word);
            }
        });
        // recursive calling
        // this.nbLine++;
        // var returnValue: number = this.eval(this.nilnoviProgram[this.nbLine]);
        // // Something got wrong
        // return returnValue;
        return 0;
    }
    parameterLoading(words) {
        var nameList = [];
        const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")", "return"];
        words.forEach(word => {
            var indexParam = 0;
            if (word == "integer" || word == "boolean") {
                nameList.forEach(name => {
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
        const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")", "return"];
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
        let params = this.getParamNames(words);
        this.methodList.add(new Method_1.Method(name, "none", this.instructions.length, params)),
            this.parameterLoading(words);
        // recursive calling
        // this.nbLine++;
        // var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
        this.nbLine++;
        while (!new RegExp(/^end/).test(this.nilnoviProgram[this.nbLine].trim())) {
            let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
            if (returnValue != 0) {
                return 1;
            }
            this.nbLine++;
        }
        this.blockScope--;
        this.instructions.push(new Instruction_1.Instruction("retourProc();"));
        this.currentMethodName = "pp";
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
        while (!new RegExp(/^end/).test(this.nilnoviProgram[this.nbLine].trim())) {
            let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
            if (returnValue != 0) {
                return 1;
            }
            this.nbLine++;
        }
        this.blockScope--;
        this.instructions.push(new Instruction_1.Instruction("retourFonct();"));
        this.currentMethodName = "pp";
        return 0;
    }
    /**
     * @description inits the dictionary of operators
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    initDict() {
        this.opDict["+"] = { inType: "integer", outType: "integer", machineCode: "add();" };
        this.opDict["-"] = { inType: "integer", outType: "integer", machineCode: "sous();" };
        this.opDict["*"] = { inType: "integer", outType: "integer", machineCode: "mult();" };
        this.opDict["/"] = { inType: "integer", outType: "integer", machineCode: "div();" };
        this.opDict["<"] = { inType: "integer", outType: "boolean", machineCode: "inf();" };
        this.opDict["<="] = { inType: "integer", outType: "boolean", machineCode: "infeg();" };
        this.opDict[">"] = { inType: "integer", outType: "boolean", machineCode: "sup();" };
        this.opDict[">="] = { inType: "integer", outType: "boolean", machineCode: "supeg();" };
        this.opDict["="] = { inType: "integer", outType: "boolean", machineCode: "egal();" };
        this.opDict["/="] = { inType: "integer", outType: "boolean", machineCode: "diff();" };
        this.opDict["and"] = { inType: "boolean", outType: "boolean", machineCode: "and();" };
        this.opDict["or"] = { inType: "boolean", outType: "boolean", machineCode: "or();" };
        this.opDict["not"] = { inType: "boolean", outType: "boolean", machineCode: "not();" };
    }
    /**
     * @description checks if an expression is a valid number
     * @param string the expression to consider
     * @returns a boolean
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    isValidNumber(str) { return new RegExp(/^[0-9]+$/).test(str); }
    isVar(str) { return (this.variableList.get(str) !== undefined); }
    isMethod(str) { return (this.methodList.get(str) !== undefined); }
    isAffected(str) { return (this.variableList.get(str).hasBeenAffected); }
    fullVariableName(str) { return this.currentMethodName + "." + str; }
    concatWords(words) {
        let line = [];
        let method = "";
        let inMethod = false;
        let openParenthesesNb = 0;
        // for each word
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            // If it's not the name of a method and if we aren't in one
            if (!this.isMethod(word) && !inMethod) {
                if ((word == "<" || word == ">" || word == "/") && words[i + 1] == "=") {
                    line.push(word + "=");
                    i++;
                }
                line.push(word);
            }
            // Else if it's a method
            else if (this.isMethod(word)) {
                inMethod = true;
                method += word;
            }
            // Else we are in a method
            else {
                if (word == '(') {
                    openParenthesesNb++;
                    method += '(';
                }
                else if (word == ')') {
                    openParenthesesNb--;
                    method += ')';
                    if (openParenthesesNb == 0) {
                        line.push(method);
                        method = "";
                        inMethod = false;
                    }
                }
                else {
                    method += word;
                }
            }
        }
        return line;
    }
    /**
     * @description converts a list of ordered word into a list (left-right travelling of a binary tree) : [8,-,(,1,+,3,),*,4] => [8,1,3, +, 4,*,-]
     * @param string the expression to consider
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    analyzer(words) {
        if (words.length == 1) {
            if (this.isValidNumber(words[0]) || this.isVar(this.fullVariableName(words[0])) || this.isMethod(words[0].split('(')[0]) || words[0] == "true" || words[0] == "false") {
                this.currentExpressionList.push(words[0]);
                return 0;
            }
            else {
                console.error("word " + words[0] + " unknown");
                return 1;
            }
        }
        let betweenParentheses = 0;
        let lastAddition = -1;
        let lastMultiplication = -1;
        let lastBooleanOperator = -1;
        let lastComparator = -1;
        // let lastNot = -1
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            // if the word is...
            switch (word) {
                // a parenthesis
                case "(":
                    betweenParentheses++;
                    break;
                case ")":
                    betweenParentheses--;
                    break;
                // a "+" or a "-"
                case "+":
                case "-":
                    if (betweenParentheses == 0) {
                        lastAddition = i;
                    }
                    break;
                // a "*" or a "/"
                case "*":
                case "/":
                    if (betweenParentheses == 0) {
                        lastMultiplication = i;
                    }
                    break;
                // a comparator symbol
                case "<":
                case "<=":
                case ">":
                case ">=":
                case "=":
                case "/=":
                    if (betweenParentheses == 0) {
                        lastComparator = i;
                    }
                    break;
                // a "not"
                case "not":
                    // Do nothing
                    break;
                // a boolean operator
                case "and":
                case "or":
                    if (betweenParentheses == 0) {
                        lastBooleanOperator = i;
                    }
                    break;
                default: break;
            }
        }
        // no addition and no multiplication have been seen
        if (lastAddition == -1 && lastMultiplication == -1 && lastComparator == -1 && lastBooleanOperator == -1) {
            // if the expression is surrounded by parentheses
            if (words[0] == "(" && words[words.length - 1] == ")") {
                words.shift();
                words.pop();
                let returnValue = this.analyzer(words);
                return returnValue;
            }
            else if (words[0] == "not") {
                words.shift();
                let returnValue = this.analyzer(words);
                this.currentExpressionList.push("not");
                return returnValue;
            }
            // else, we should raise an error
            else {
                console.error(words[0], "is undefined");
                return 1;
            }
        }
        let consideredIndex = -1;
        // else there is at least one addition / multiplication / Boolean Operator / comparator
        // if there is at least one BooleanOperator (and/or) (less priority first)
        if (lastBooleanOperator != -1) {
            consideredIndex = lastBooleanOperator;
        }
        // else if there is at least one comparator (>,<,...)
        else if (lastComparator != -1) {
            consideredIndex = lastComparator;
        }
        // else if there is at least one addition
        else if (lastAddition != -1) {
            consideredIndex = lastAddition;
        }
        // else there is at least one multiplication
        else if (lastMultiplication != -1) {
            consideredIndex = lastMultiplication;
        }
        // Get the corresponding operator
        var op = words[consideredIndex];
        // We need to analyze the first part of the list of words
        let returnValue = this.analyzer(words.slice(0, consideredIndex));
        if (returnValue != 0) {
            return 1;
        }
        // We analyze the second part of the expression
        returnValue = this.analyzer(words.slice(consideredIndex + 1));
        if (returnValue != 0) {
            return 1;
        }
        // And finally push the corresponding operator
        this.currentExpressionList.push(op);
        return 0;
    }
    /**
     * @description analyzes the expression as a list and checks if it's correct, according to the type given
     * @param string expected type (integer or boolean)
     * @param string[] the expression to analyze
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    syntaxAnalyzer(expression, expectedType) {
        // Let's make a copy of the list, allowing us to modify this copy
        var expressionCopy = [];
        expression.forEach(element => {
            // if the word is a variable
            if (this.isVar(this.fullVariableName(element))) {
                // Let's check if it has already been affected to get its type
                if (!this.isAffected(this.fullVariableName(element))) {
                    console.error(element + " has not been affected");
                }
                let type = this.variableList.get(this.fullVariableName(element)).type;
                element = type;
            }
            // if the world is a method
            else if (this.isMethod(element.split("(")[0])) {
                let methodName = element.split("(")[0];
                let type = this.methodList.get(methodName).type;
                element = type;
            }
            // if it's a boolean
            else if (element == "true" || element == "false") {
                element = "boolean";
            }
            // if it's an integer
            else if (this.isValidNumber(element)) {
                element = "integer";
            }
            // then we push the element
            expressionCopy.push(element);
        });
        // for each element in the list
        for (let i = 0; i < expressionCopy.length; i++) {
            const element = expressionCopy[i];
            if (this.opDict[element] != undefined) {
                let typeA = expressionCopy[i - 2];
                let typeB = expressionCopy[i - 1];
                let typeOp = this.opDict[element].inType;
                if (typeA == typeB && typeA == typeOp) {
                    expressionCopy[i] = this.opDict[element].outType;
                }
                else {
                    console.error("wrong type : operator " + element + " requires 2 " + typeOp + "s");
                    return 1;
                }
            }
        }
        if (expectedType !== undefined) {
            if (expectedType != expressionCopy.pop()) {
                console.error("wrong type");
                return 1;
            }
        }
        return 0;
    }
    generateInstructions(expression) {
        for (let i = 0; i < expression.length; i++) {
            let word = expression[i];
            if (this.isValidNumber(word)) {
                this.instructions.push(new Instruction_1.Instruction("empiler(" + word + ");", "integer"));
            }
            else if (this.opDict[word] != undefined) {
                this.instructions.push(new Instruction_1.Instruction(this.opDict[word].machineCode));
            }
            else if (this.isVar(this.fullVariableName(word))) {
                this.instructions.push(new Instruction_1.Instruction("empiler(" + this.variableList.get(this.fullVariableName(word)).addPile + ");", "address"));
                this.instructions.push(new Instruction_1.Instruction("valeurPile();"));
            }
            else if (word == "true") {
                this.instructions.push(new Instruction_1.Instruction("empiler(1);", "boolean"));
            }
            else if (word == "false") {
                this.instructions.push(new Instruction_1.Instruction("empiler(0);", "boolean"));
            }
            else {
                let end = this.currentExpressionList.slice(i + 1);
                this.currentExpressionList = this.currentExpressionList.slice(0, i);
                this.generateInstructionsMethod(word);
                this.currentExpressionList = this.currentExpressionList.concat(end);
            }
        }
        this.currentExpressionList = [];
        return 0;
    }
    generateInstructionsMethod(method) {
        // double ( double ( 4 ), toto ) 
        let words = tools.lineToWordsList(method);
        if (words.length == 0) {
            return 0;
        }
        let methodName = words[0];
        words.shift();
        words.shift();
        words.pop();
        words = this.concatWords(words);
        let nbParamsRead = 0;
        let nbParamsExpected = this.methodList.get(methodName).params.length;
        let tmpWordsList = [];
        for (let index in words) {
            let word = words[index];
            if (word == ",") {
                let returnValue = this.analyzer(this.concatWords(tmpWordsList));
                if (returnValue != 0) {
                    console.error("analyzer error");
                    return returnValue;
                }
                if (nbParamsRead >= nbParamsExpected) {
                    console.error("too many parameters");
                    return 1;
                }
                returnValue = this.syntaxAnalyzer(tmpWordsList, this.variableList.get(methodName + "." + this.methodList.get(methodName).params[nbParamsRead]).type);
                nbParamsRead++;
                if (returnValue != 0) {
                    console.error("syntaxAnalyzer");
                    return returnValue;
                }
                this.generateInstructions(this.currentExpressionList);
                tmpWordsList = [];
            }
            else {
                tmpWordsList.push(word);
            }
        }
        let returnValue = this.analyzer(this.concatWords(tmpWordsList));
        if (returnValue != 0) {
            console.error("analyzer error");
            return returnValue;
        }
        if (nbParamsRead >= nbParamsExpected) {
            console.error("too many parameters");
            return 1;
        }
        else if (nbParamsRead + 1 != nbParamsExpected) {
            console.error("not enough parameters");
            return 1;
        }
        returnValue = this.syntaxAnalyzer(tmpWordsList, this.variableList.get(methodName + "." + this.methodList.get(methodName).params[nbParamsRead]).type);
        if (returnValue != 0) {
            console.error("syntaxAnalyzer");
            return returnValue;
        }
        this.instructions.push(new Instruction_1.Instruction("reserverBloc();", "bloc"));
        this.generateInstructions(this.currentExpressionList);
        tmpWordsList = [];
        let methodLine = this.methodList.get(methodName).refLine + 1;
        this.instructions.push(new Instruction_1.Instruction("traStat(" + methodLine + "," + nbParamsExpected + ");"));
        return 0;
    }
}
exports.Compiler = Compiler;
//================================================================================//
//# sourceMappingURL=Compiler.js.map