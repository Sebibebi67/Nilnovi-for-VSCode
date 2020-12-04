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
        this.instructions = [];
        this.traCompleted = false;
        this.currentMethodName = "pp";
        this.opDict = {};
        this.currentExpressionList = [];
        // Initializing the lists of Methods and Variables
        this.methodList = new MethodList_1.MethodList();
        this.variableList = new VariableList_1.VariableList();
        //Init the dictionary of Operators
        this.initDict();
        // First we need to prepare the array which will contain our NilNovi Program
        file = tools.removeComments(tools.indexingFile(file));
        this.nilnoviProgram = tools.removeEmptyLines(file.split(/\r?\n/));
        // From now, all the useless lines have been removed
        // We will just eval the first, the entire program will be a recursive call
        let returnValue = this.evalFirstLine();
        // If something get wrong
        if (returnValue != 0) {
            console.error("something got wrong");
        }
        // Printing part
        for (let i = 0; i < this.instructions.length; i++) {
            console.log(i + 1, this.instructions[i].toString());
        }
        this.methodList.display();
        this.variableList.display();
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    /**
     * @description evaluates the current line
     * @param string the current line
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    eval(currentLine) {
        // Let's prepare the effective content
        let lineFeatures = tools.splittingLine(currentLine);
        currentLine = lineFeatures["content"];
        // The line shouldn't be empty, but to be sure
        if (currentLine === undefined) {
            return 0;
        }
        // We can now get a list of words
        let words = tools.lineToWordsList(currentLine);
        // We need to link our first "tra()" 
        if (this.blockScope == 1 && !this.traCompleted && words[0] != "function" && words[0] != "procedure") {
            let traLine = this.instructions.length + 1;
            this.instructions[1] = new Instruction_1.Instruction("tra(" + traLine + ");");
            this.traCompleted = true;
        }
        // if it's a "procedure" or "function"
        if (words[0] == "function" || words[0] == "procedure") {
            // it's a "procedure"
            if (words[0] == "procedure") {
                let returnValue = this.createProcedure(words);
                return returnValue;
            }
            // it's a "function"
            else {
                let returnValue = this.createFunction(words);
                return returnValue;
            }
        }
        // else if it is an affectation
        else if (new RegExp(/.*:=.*/).test(currentLine)) {
            let returnValue = this.affectation(words);
            return returnValue;
        }
        if (words.includes(":")) {
            let returnValue = this.variableDeclaration(words);
            return returnValue;
        }
        // if "begin" is read
        else if (new RegExp(/^begin/).test(currentLine)) {
            return 0;
        }
        // if "end" is read
        else if (new RegExp(/^end/).test(currentLine)) {
            this.blockScope--;
            return 0;
        }
        // if "return" is read
        else if (new RegExp(/^return/).test(currentLine)) {
            return 0;
        }
        // else :
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
    }
    /**
     * @description evaluates the first line (main procedure definition)
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    evalFirstLine() {
        // Adding the begin and the "tra" at the beginning of the instructions
        this.instructions.push(new Instruction_1.Instruction("debutProg();"));
        this.instructions.push(new Instruction_1.Instruction("tra(x);"));
        // define the method name
        this.methodList.add(new Method_1.Method("pp", "none", -1, []));
        this.blockScope++;
        while (this.nbLine < this.nilnoviProgram.length - 1) {
            // recursive calling
            this.nbLine++;
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
    /**
     * @description defines the affectation
     * @param string[] the list of words
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    affectation(words) {
        // the first word id our variable
        let variable = words[0];
        // Does it exist ?
        if (!this.isVar(this.fullVariableName(variable))) {
            console.error(variable + " is not defined", this.currentMethodName);
            return 1;
        }
        // Does it have the correct format ? (x := 4)
        let affectation = words[1] + words[2];
        if (affectation != ":=") {
            console.error(":= expected");
            return 1;
        }
        // Let's remove the 3 first words (x, :, =) and the ";"
        words.splice(0, 3);
        words.pop();
        let returnValue = this.analyzer(this.concatWords(words));
        if (returnValue != 0) {
            console.error("analyzer error");
            return returnValue;
        }
        // Now let's analyze the line and compare it to the corresponding type of our variable
        returnValue = this.syntaxAnalyzer(this.currentExpressionList, this.variableList.get(this.fullVariableName(variable)).type);
        // Something get wrong
        if (returnValue != 0) {
            console.error("syntaxAnalyzer");
            return 1;
        }
        // TODO (upgrade)
        this.instructions.push(new Instruction_1.Instruction("empiler(" + this.variableList.get(this.fullVariableName(variable)).addPile + ");", "address"));
        this.generateInstructions(this.currentExpressionList);
        this.instructions.push(new Instruction_1.Instruction("affectation();"));
        // Let's inform the compiler that the variable has been affected
        this.variableList.get(this.fullVariableName(variable)).hasBeenAffected = true;
        return 0;
    }
    /**
     * @description describes the affectation of variable
     * @param string[] the list of words
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    variableDeclaration(words) {
        // a tmp list which will contain the all the names of the variables
        var nameList = [];
        // for each word in the given list
        words.forEach(word => {
            // if the word is "," or ":", do nothing
            if (word == "," || word == ":") { }
            // if the word is a type
            else if (word == "boolean" || word == "integer") {
                // for each saved names
                nameList.forEach(name => {
                    // we will need to add the variable to the list
                    this.variableList.add(new Variable_1.Variable(name, this.currentMethodName, word, false, this.methodList.get(this.currentMethodName).fakePileLength));
                    this.methodList.get(this.currentMethodName).fakePileLength++;
                });
                // Then we need to save as much slots as variables 
                this.instructions.push(new Instruction_1.Instruction("reserver(" + nameList.length + ");", "empty"));
            }
            // else it's a variable
            else {
                nameList.push(word);
            }
        });
        return 0;
    }
    //TODO
    /**
     * @description loads all parameters in the lists
     * @param string[] the list of words
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     * @see variableDeclaration
     */
    parameterLoading(words) {
        // this function is pretty similar to variableDeclaration defined just above
        var nameList = [];
        // This time, we need a list of know words
        const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")", "return"];
        words.forEach(word => {
            var indexParam = 0;
            // If the word is a type
            if (word == "integer" || word == "boolean") {
                nameList.forEach(name => {
                    this.variableList.add(new Variable_1.Variable(name, this.currentMethodName, word, true, this.methodList.get(this.currentMethodName).fakePileLength, indexParam));
                    this.methodList.get(this.currentMethodName).fakePileLength++;
                    indexParam++;
                });
                nameList = [];
            }
            // else if it's a not a known word
            else if (!notParamList.includes(word) && word != words[1]) {
                nameList.push(word);
            }
        });
    }
    /**
     * @description gets the parameters names
     * @param string[] the line to consider
     * @returns the names of the parameters
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    getParamNames(words) {
        let names = [];
        const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")", "return"];
        // for each word
        words.forEach(word => {
            // if the word isn't a key word or a separator
            if (!notParamList.includes(word) && word != words[1]) {
                // then it's a parameter
                names.push(word);
            }
        });
        return names;
    }
    /**
     * @description creates a procedure and registers it
     * @param string[] the line to consider
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    createProcedure(words) {
        // we update the global variables with the new procedure
        const name = words[1];
        this.blockScope++;
        this.currentMethodName = name;
        // we get the names of the eventual parameters of the procedure
        let params = this.getParamNames(words);
        // we register the procedure in the method's list
        this.methodList.add(new Method_1.Method(name, "none", this.instructions.length, params)),
            this.parameterLoading(words);
        // then we pass to the next line
        this.nbLine++;
        // while the procedure is not terminated
        while (!new RegExp(/^end/).test(this.nilnoviProgram[this.nbLine].trim())) {
            // we evaluate each line and checks the eventual errors
            let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
            if (returnValue != 0) {
                return 1;
            }
            this.nbLine++;
        }
        // then we update the blockScope
        this.blockScope--;
        // and we create the procedure ending instruction and we update the current method's name
        this.instructions.push(new Instruction_1.Instruction("retourProc();"));
        this.currentMethodName = "pp";
        return 0;
    }
    /**
     * @description creates a function and registers it
     * @param string[] the line to consider
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    createFunction(words) {
        // we update the global variables with the new function
        const name = words[1];
        const returnType = words[words.length - 2];
        this.blockScope++;
        this.currentMethodName = name;
        // we get the names of the eventual parameters of the function
        var params = this.getParamNames(words);
        // we register the function in the method's list
        this.methodList.add(new Method_1.Method(name, returnType, this.instructions.length, params));
        this.parameterLoading(words);
        // then we pass to the next line
        this.nbLine++;
        // while the function is not terminated
        while (!new RegExp(/^end/).test(this.nilnoviProgram[this.nbLine].trim())) {
            let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
            if (returnValue != 0) {
                return 1;
            }
            this.nbLine++;
        }
        // then we update the blockScope
        this.blockScope--;
        // and we create the function ending instruction and we update the current method's name
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
        // we define every possible operator (boolean or integer)
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
    /**
     * @description checks if an expression is a known variable
     * @param string the expression to consider
     * @returns a boolean
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    isVar(str) { return (this.variableList.get(str) !== undefined); }
    /**
     * @description checks if an expression is a known method
     * @param string the expression to consider
     * @returns a boolean
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    isMethod(str) { return (this.methodList.get(str) !== undefined); }
    /**
     * @description checks if a variable already has a value
     * @param string the variable to check
     * @returns a boolean
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    isAffected(str) { return (this.variableList.get(str).hasBeenAffected); }
    /**
     * @description gets the full name of a variable (method.variable)
     * @param string the variable name
     * @returns a boolean
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    fullVariableName(str) { return this.currentMethodName + "." + str; }
    /**
     * @description groups the words meant to be together (methods with their parameters or two-characters operators)
     * @param string the words to analyze
     * @returns the new line
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
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
                // if it forms an operator with the next word
                if ((word == "<" || word == ">" || word == "/") && words[i + 1] == "=") {
                    line.push(word + "=");
                    i++;
                }
                line.push(word);
            }
            // else if it's a method
            else if (this.isMethod(word)) {
                inMethod = true;
                method += word;
            }
            // else we are in a method
            else {
                // we count the number of parentheses to catch the end of the method
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
        // if the expression is composed of a single word
        if (words.length == 1) {
            // if the word is already known (method, variable, number or boolean)
            if (this.isValidNumber(words[0]) || this.isVar(this.fullVariableName(words[0])) || this.isMethod(words[0].split('(')[0]) || words[0] == "true" || words[0] == "false") {
                // we add it to the tree
                this.currentExpressionList.push(words[0]);
                return 0;
            }
            // else the is an error
            else {
                console.error("word " + words[0] + " unknown");
                return 1;
            }
        }
        // if the expression is composed of several words we establish the priority of the calculations
        let betweenParentheses = 0;
        let lastAddition = -1;
        let lastMultiplication = -1;
        let lastBooleanOperator = -1;
        let lastComparator = -1;
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
            // if the element is a known operator
            if (this.opDict[element] != undefined) {
                // we split the expression in 3 : the operator and the two terms
                let typeA = expressionCopy[i - 2];
                let typeB = expressionCopy[i - 1];
                let typeOp = this.opDict[element].inType;
                // if teh types match
                if (typeA == typeB && typeA == typeOp) {
                    expressionCopy[i] = this.opDict[element].outType;
                }
                // else there is an error
                else {
                    console.error("wrong type : operator " + element + " requires 2 " + typeOp + "s");
                    return 1;
                }
            }
        }
        // if the operator's out type isn't right
        if (expectedType !== undefined) {
            if (expectedType != expressionCopy.pop()) {
                console.error("wrong type");
                return 1;
            }
        }
        return 0;
    }
    /**
     * @description generates the instructions to translate the given expression
     * @param string[] expression to translate
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    generateInstructions(expression) {
        // for each word in the expression
        for (let i = 0; i < expression.length; i++) {
            let word = expression[i];
            // if the word is a valid number
            if (this.isValidNumber(word)) {
                this.instructions.push(new Instruction_1.Instruction("empiler(" + word + ");", "integer"));
            }
            // if the word is a known operator
            else if (this.opDict[word] != undefined) {
                this.instructions.push(new Instruction_1.Instruction(this.opDict[word].machineCode));
            }
            // if the word is a known variable
            else if (this.isVar(this.fullVariableName(word))) {
                this.instructions.push(new Instruction_1.Instruction("empiler(" + this.variableList.get(this.fullVariableName(word)).addPile + ");", "address"));
                this.instructions.push(new Instruction_1.Instruction("valeurPile();"));
            }
            // if the word is a boolean
            else if (word == "true") {
                this.instructions.push(new Instruction_1.Instruction("empiler(1);", "boolean"));
            }
            else if (word == "false") {
                this.instructions.push(new Instruction_1.Instruction("empiler(0);", "boolean"));
            }
            // else it's a method, we create a space in the instructions line to place those of the method
            else {
                let end = this.currentExpressionList.slice(i + 1);
                this.currentExpressionList = this.currentExpressionList.slice(0, i);
                this.generateInstructionsMethod(word);
                this.currentExpressionList = this.currentExpressionList.concat(end);
            }
        }
        // finally we reset the current expression
        this.currentExpressionList = [];
        return 0;
    }
    /**
     * @description generates the instructions to call the given method with its parameters
     * @param string method to call
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    generateInstructionsMethod(method) {
        // we split the method in words
        let words = tools.lineToWordsList(method);
        // if the list is empty we stop
        if (words.length == 0) {
            return 0;
        }
        // else we keep the list of parameters for the method
        let methodName = words[0];
        words.shift();
        words.shift();
        words.pop();
        words = this.concatWords(words);
        let nbParamsRead = 0;
        let nbParamsExpected = this.methodList.get(methodName).params.length;
        let tmpWordsList = [];
        // for each word
        for (let index in words) {
            let word = words[index];
            // if the word is ","
            if (word == ",") {
                // we analyse the previous parameter as an expression
                let returnValue = this.analyzer(this.concatWords(tmpWordsList));
                if (returnValue != 0) {
                    console.error("analyzer error");
                    return returnValue;
                }
                // then we verify that there isn't too much parameters
                if (nbParamsRead >= nbParamsExpected) {
                    console.error("too many parameters");
                    return 1;
                }
                // then we check the type of these parameters
                returnValue = this.syntaxAnalyzer(tmpWordsList, this.variableList.get(methodName + "." + this.methodList.get(methodName).params[nbParamsRead]).type);
                nbParamsRead++;
                if (returnValue != 0) {
                    console.error("syntaxAnalyzer");
                    return returnValue;
                }
                // finally we generate the instructions to get this parameter
                this.generateInstructions(this.currentExpressionList);
                tmpWordsList = [];
            }
            // else the word is a part of a parameter
            else {
                tmpWordsList.push(word);
            }
        }
        // then we process the last parameter as we did for the others
        let returnValue = this.analyzer(this.concatWords(tmpWordsList));
        if (returnValue != 0) {
            console.error("analyzer error");
            return returnValue;
        }
        // we check if there isn't too few parameters
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
        // we create the instruction to reserve a block in the pile before calling the method
        this.instructions.push(new Instruction_1.Instruction("reserverBloc();", "bloc"));
        // we generate the instructions for the method's parameters
        this.generateInstructions(this.currentExpressionList);
        tmpWordsList = [];
        // finally we create the instruction to call the method with its beginning line and the number of parameters to get
        let methodLine = this.methodList.get(methodName).refLine + 1;
        this.instructions.push(new Instruction_1.Instruction("traStat(" + methodLine + "," + nbParamsExpected + ");"));
        return 0;
    }
}
exports.Compiler = Compiler;
//================================================================================//
//# sourceMappingURL=Compiler.js.map