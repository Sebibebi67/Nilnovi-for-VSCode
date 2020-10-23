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
const Method_1 = require("./tables/Method");
const Variable_1 = require("./tables/Variable");
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
        this.instructions = [];
        this.currentScope = 0;
        this.alreadyBegun = false;
        this.nilnoviProgram = [];
        this.fakePileLength = 0;
        this.currentLine = 0;
        this.varTable = [];
        this.methodTable = [];
        this.blockList = [];
        this.OpDict = new Map();
        this.currentExpressionList = [];
        // initialize the dictionary of operator
        this.initDict();
        // adding line number
        var parsedFile = file.split(/\r?\n/);
        var indexedFile = "";
        var i = 1;
        for (let index = 0; index < parsedFile.length; index++) {
            var line = parsedFile[index];
            indexedFile = indexedFile + line + "$" + i + "\n";
            i++;
        }
        // removing Comments
        indexedFile = this.removeComments(indexedFile);
        // splitting file (as a string) into a List of lines
        this.nilnoviProgram = indexedFile.split(/\r?\n/);
        // removing empty line and trimming
        this.removeEmptyLines();
        console.log(this.nilnoviProgram);
        var returnValue = this.compile();
        // console.log((returnValue));
        if (returnValue != 0) {
            console.error("Error");
        }
        else {
            console.log(this.instructions);
        }
    }
    //--------------------------------------------------------------------------------//
    //----------------------------------- Methods ------------------------------------//
    /**
     * @description inits the dictionary of operators
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    initDict() {
        this.OpDict.set("+", "add();");
        this.OpDict.set("-", "sous();");
        this.OpDict.set("*", "mult();");
        this.OpDict.set("/", "div();");
    }
    /**
     * @description removes the comments from the file
     * @param string the file
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    removeComments(file) {
        var regexpComment = /(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\#.*)/gm;
        return file.replace(regexpComment, "");
    }
    /**
     * @description removes empty lines and trims them
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    removeEmptyLines() {
        for (let i = 0; i < this.nilnoviProgram.length; i++) {
            this.nilnoviProgram[i] = this.nilnoviProgram[i].trim();
            let line = this.nilnoviProgram[i];
            if (typeof line === undefined || (line === null || line === void 0 ? void 0 : line.length) == 0 || new RegExp(/^\$[0-9]*$/).test(line)) {
                this.nilnoviProgram.splice(i, 1);
                i--;
            }
        }
    }
    /**
     * @description compiles each lines of the program
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    compile() {
        while (this.currentLine < this.nilnoviProgram.length) {
            var returnValue = this.eval(this.nilnoviProgram[this.currentLine]);
            if (returnValue != 0) {
                return 1;
            }
            this.currentLine++;
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
    eval(line) {
        // getting lineNb (in order to print a potential error)
        var lineNb = line.split("$").pop();
        line = line.split("$")[0];
        // let's define the different shapes a line can take
        // line = "procedure my_procedure() is"
        var regexProcedure = /^procedure ((.)*\((.)*\)) is$/;
        if (line.match(regexProcedure)) {
            // we need the name and params to create a procedure
            var name = line.split("(")[0].split("procedure")[1].trim();
            var params = this.generateParams(line.split("(")[1].split(")")[0].trim(), true);
            // Saving the new method and creating a new procedure
            this.methodTable.push(new Method_1.Method(name, this.currentScope, "procedure", this.instructions.length, params));
            var returnValue = this.createProcedureFunction();
            return returnValue;
        }
        // line = "begin"
        else if (line.match(/^begin$/)) {
            var returnValue = this.readingBegin();
            return returnValue;
        }
        // line = "end"
        else if (line.match(/^end$/)) {
            this.readingEnd();
        }
        // line = "a := expression;"
        else if (line.includes(":=")) {
            // create a list which contains all the symbols potentially used in an affectation
            // ex : 1+3 => [1, 3, +]
            // ex : (1+3)*5+6 => [1, 3, +, 5, *, 6, +]
            this.currentExpressionList = [];
            // Checking "a" is a valid variable in
            var variable = line.split(":=")[0].trim();
            // if not, error
            if (!this.isVar(variable)) {
                console.error(("error, not a var"));
                return 1;
            }
            // removing the ";"
            var expression = line.split(":=")[1].replace(";", "");
            // Let's analyze the expression and update the currentExpression
            var returnValue = this.analyzer(expression);
            if (returnValue != 0) {
                return 1;
            }
            // Checking if an error occurs
            returnValue = this.syntaxAnalyzer(this.getVariable(variable).type, this.currentExpressionList);
            if (returnValue != 0) {
                return 1;
            }
            // We can now stack "a" in the pile and affect the entire expression to it
            this.instructions.push("empiler(" + this.getVariable(variable).addPile + ");");
            this.readExpressionList(this.currentExpressionList);
            this.instructions.push("affectation();");
            // We still are in a block, we should evaluate the next line
            this.currentLine++;
            var returnValue = this.eval(this.nilnoviProgram[this.currentLine]);
            return returnValue;
        }
        // line = "x, y : integer;"
        else if (line.includes(":")) {
            // let's load the name of "x" and "y" in the table
            var vars = this.generateParams(line.split(";")[0].trim(), false);
            for (let i = 0; i < vars.length; i++) {
                // in order to use "tra(x)" correctly, we need to simulate the length of the pile which will be added in the table of Variables as the address of the variable
                vars[i].addPile = this.fakePileLength;
                this.fakePileLength++;
                // we also need the current scope
                vars[i].scope = this.currentScope;
                // then merge the temporary table to the global one
                this.varTable.push(vars[i]);
            }
            // if it's the beginning of the program 
            if (this.currentScope == 0 && !this.alreadyBegun) {
                // we need to update the line number where the jump should send to
                this.instructions[1] = "tra(" + (this.instructions.length) + ");";
                this.alreadyBegun = true;
            }
            // in all cases, we need to reserve as much slots as there are variables
            this.instructions.push("reserver(" + vars.length + ");");
            // finally, let's evaluate the next line
            this.currentLine++;
            var returnValue = this.eval(this.nilnoviProgram[this.currentLine]);
            return returnValue;
        }
        return 0;
    }
    /**
     * @description creates a procedure or a function
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    createProcedureFunction() {
        // checking if it's the main procedure (procédure principale)
        var isPP = (this.methodTable[this.methodTable.length - 1].name == "pp");
        // getting the name of the procedure
        var type = this.methodTable[this.methodTable.length - 1].type;
        // if it's the main procedure
        if (isPP) {
            this.instructions.push("debutProg();");
            this.instructions.push("tra(x);");
        }
        // if not
        else {
            this.currentScope++;
        }
        // Now we need to evaluates the next line
        this.currentLine++;
        var returnValue = this.eval(this.nilnoviProgram[this.currentLine]);
        if (returnValue != 0) {
            return 1;
        }
        // if the procedure was yhe main procedure
        if (isPP) {
            this.instructions.push("finProg();");
        }
        else {
            // else it's another procedure
            if (type == "procedure") {
                this.instructions.push("retourProc();");
            }
            // or a procedure
            else if (type == "function") {
                this.instructions.push("retourFonct();");
            }
        }
        return 0;
    }
    /**
     * @description checks if a string is a variable in the Table
     * @param string the expression to check
     * @returns None
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    isVar(expression) {
        for (let i = 0; i < this.varTable.length; i++) {
            if (this.varTable[i].name == expression) {
                return true;
            }
        }
        return false;
    }
    /**
     * @description the keyword "begin" as been read
     * @returns output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    readingBegin() {
        if (this.currentScope == 0 && !this.alreadyBegun) {
            this.instructions[1] = "tra(" + (this.instructions.length) + ");";
            this.alreadyBegun = true;
        }
        this.currentLine++;
        var returnValue = this.eval(this.nilnoviProgram[this.currentLine]);
        return returnValue;
    }
    /**
     * @description the keyword "end" as been read
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    readingEnd() {
        this.currentScope--;
    }
    /**
     * @description gets the variable without the given name
     * @param string the variable name
     * @returns the considered variable
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    getVariable(variableName) {
        for (let i = 0; i < this.varTable.length; i++) {
            if (this.varTable[i].name == variableName) {
                return this.varTable[i];
            }
        }
        return new Variable_1.Variable("", "", false);
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
     * @description converts expression into a list : (1+3)*4 => [1,3, +, 4, *]
     * @param string the expression to consider
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    analyzer(expression) {
        // lastAddition, let's trim the expression
        expression = expression.trim();
        // if the expression is a valid number
        if (this.isValidNumber(expression)) {
            this.currentExpressionList.push(expression);
            return 0;
        }
        // if the expression is a variable already define
        if (this.isVar(expression)) {
            this.currentExpressionList.push(expression);
            return 0;
        }
        // else we need to check each char of the expression
        // those var describes the number of parentheses, the position of the last addition and the last multiplication
        var betweenParentheses = 0;
        var lastAddition = -1;
        var lastMultiplication = -1;
        for (let i = 0; i < expression.length; i++) {
            var char = expression.charAt(i);
            // if the char is...
            switch (char) {
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
                default: break;
            }
        }
        // no addition and no multiplication have been seen
        if (lastAddition == -1 && lastMultiplication == -1) {
            // if the expression is surrounded by parentheses
            if (new RegExp(/^\(.*\)$/).test(expression)) {
                // let's try it again without them
                var newExpression = expression.replace(/^\(/, "").replace(/\)$/, "");
                var returnValue = this.analyzer(newExpression);
                return returnValue;
            }
            // else, we should raise an error
            else {
                console.error(expression, "is undefined");
                return 1;
            }
        }
        // else there is at least one addition or one multiplication
        // if there is at least one addition (less priority before)
        if (lastAddition != -1) {
            // let's cut the expression into 2 and use the analyzer function on both sides, and then push the operator in the list
            var op = expression.charAt(lastAddition);
            // analyzer on the first part 
            var returnValue = this.analyzer(expression.substring(0, lastAddition));
            if (returnValue != 0) {
                return 1;
            }
            // analyzer on the second part
            returnValue = this.analyzer(expression.substring(lastAddition + 1, expression.length));
            if (returnValue != 0) {
                return 1;
            }
            // then pushing the operator on the list
            this.currentExpressionList.push(op);
        }
        // else there is at least one multiplication, and it's the same process as explained before
        else if (lastMultiplication != -1) {
            var op = expression.charAt(lastMultiplication);
            var returnValue = this.analyzer(expression.substring(0, lastMultiplication));
            if (returnValue != 0) {
                return 1;
            }
            returnValue = this.analyzer(expression.substring(lastMultiplication + 1, expression.length));
            if (returnValue != 0) {
                return 1;
            }
            this.currentExpressionList.push(op);
        }
        return 0;
    }
    /**
     * @description creates a list of variables from a expression such as :
     * "x, y : integer"
     * @param string expression
     * @param boolean is it a parameter (true) or a variable (false)
     * @returns a list of variable
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    generateParams(expression, isParam) {
        var params = [];
        var isValue = true;
        var isType = false;
        var currentType = "";
        var currentName = "";
        var nameList = [];
        // We are going to read every char, and check what it could be
        for (var i = 0; i < expression.length; i++) {
            var char = expression.charAt(i);
            // ":" means the next world is supposed to be a type (integer or boolean)
            if (char == ":") {
                // isValue should switch from true to false 
                isValue = !isValue;
                // isType should switch from false to true
                isType = !isType;
                // we also need to push the currentName in the list (and trim it)
                nameList.push(currentName.trim());
                currentName = "";
            }
            // "," means we have a new variable/parameter defined
            else if (char == ",") {
                // if we were reading a value, ex => "x,y[:integer]"
                if (isValue) {
                    // we need to push the name in the list
                    nameList.push(currentName.trim());
                    currentName = "";
                }
                // if we were reading a type, ex => "x:integer, y[:integer]"
                else if (isType) {
                    // we need to check that all names and all types in the list are correct, before pushing the variable in our temporary list
                    for (let i = 0; i < nameList.length; i++) {
                        var name = nameList[i];
                        if (!this.isValidName(name)) {
                            console.error("Not valid name");
                        }
                        currentType.trim();
                        if (!this.isValidType(currentType)) {
                            console.error("not valid type");
                        }
                        params.push(new Variable_1.Variable(name, currentType, isParam));
                    }
                    currentType = "";
                }
            }
            //for any other char, we add it to the currentName /currentType
            else {
                if (isValue) {
                    currentName += char;
                }
                else if (isType) {
                    currentType += char;
                }
            }
        }
        // finally, we need to push all the names in our temporary list
        for (let i = 0; i < nameList.length; i++) {
            var name = nameList[i];
            if (!this.isValidName(name)) {
                console.error("Not valid name");
            }
            currentType.trim();
            if (!this.isValidType(currentType)) {
                console.error("not valid type");
            }
            params.push(new Variable_1.Variable(name, currentType, isParam));
        }
        return params;
    }
    /**
     * @description checks if the name is valid (either for procedure, function, parameter and variable)
     * @param string name
     * @returns a boolean
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    isValidName(name) {
        // the name contains at least one char, and only letters (upper and lower case), numbers (not at the beginning) and "_"
        return (name.match(/([a-zA-Z0-9]|_)+/) && !name.match(/^\d/));
    }
    /**
     * @description checks if the type given is allowed (integer or boolean)
     * @param string type
     * @returns a boolean
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    isValidType(type) { return (type == "boolean" || type == "integer"); }
    /**
     * @description analyzes the expression as a list and checks if it's correct, according to the type given
     * @param string expected type (integer or boolean)
     * @param string[] the expression to analyze
     * @returns the output status
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    syntaxAnalyzer(expectedType, expression) {
        // Let's make a copy of the list, allowing us to modify this copy
        var expressionCopy = [];
        expression.forEach(element => {
            if (this.isVar(element)) {
                element = "1";
            }
            expressionCopy.push(element);
        });
        // for each element in the list
        let i = 0;
        while (i < expressionCopy.length) {
            const element = expressionCopy[i];
            if (this.OpDict.has(element)) {
                // evaluating char "a ? b" where a and b are element i-2 and i-1 and ? is the operator (result is rounded up)
                var a = expressionCopy[i - 2];
                var b = expressionCopy[i - 1];
                expressionCopy.splice(i + 1, 0, eval("Math.floor(" + a + element + b + ")"));
            }
            i++;
        }
        // the supposed output is the last element
        var output = expressionCopy.pop();
        // we need to be sure it's defined and it's a number
        if (output === undefined || !this.isValidNumber(output)) {
            console.error("Error at line X : TypeError : Only Integers and Booleans are allowed");
            return 1;
        }
        // then checks if it's the correct type
        else {
            if (expectedType == "boolean" && (output != "0" && output != "1")) {
                console.error("Error at line X : TypeError : not a boolean");
                return 1;
            }
        }
        return 0;
    }
    /**
     * @description generates the machine code for a given expression
     * @param string[] expression in a list
     * @author Sébastien HERT
     * @author Adam RIVIÈRE
     */
    readExpressionList(expressionList) {
        // for each element in the list
        for (let index = 0; index < expressionList.length; index++) {
            const element = expressionList[index];
            // if it's a number, we just need to stack it
            if (this.isValidNumber(element)) {
                this.instructions.push("empiler(" + element + ");");
            }
            // if it's a operator defined in the operators dictionary, we need to get the corresponding instruction (also in the dictionary) and stack it
            else if (this.OpDict.has(element)) {
                var instruction = this.OpDict.get(element);
                if (instruction === undefined) {
                    // Error which cannot be seen
                }
                else {
                    this.instructions.push(instruction);
                }
            }
            // else it's variable or a parameter and we need to stack its address in order to get its value
            else {
                this.instructions.push("empiler(" + this.getVariable(element).addPile + ");");
                this.instructions.push("valeurPile();");
            }
        }
    }
}
exports.Compiler = Compiler;
//================================================================================//
//# sourceMappingURL=Compiler.js.map