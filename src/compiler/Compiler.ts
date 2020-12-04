//================================ Class Compiler ================================//


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
import * as tools from "../tools"
import { MethodList } from "./MethodList";
import { VariableList } from "./VariableList";
import { Method } from "./Method";
import { Variable } from "./Variable";
import { ENGINE_METHOD_EC } from "constants";
import { Instruction } from "./Instruction";
import { open } from "inspector";

//--------------------------------------------------------------------------------//


export class Compiler {


	//------------------------------- Class Variables --------------------------------//

	private nilnoviProgram: string[] = [];
	private nilnoviProgramIndex: number = 1;
	private nbLine: number = 0;

	private blockScope = 0;
	// public currentLine : string ="";


	private instructions: Instruction[] = [];

	private methodList: MethodList;
	private variableList: VariableList;

	private traCompleted = false;
	// private fakePileLength: number = 0;

	private currentMethodName: string = "pp";


	// public varTable: Variable[] = [];
	// public methodTable: Method[] = [];
	// public blockList: Object[] = [];

	// private OpDict = new Map<string, string>();
	private opDict: { [id: string]: { machineCode: string, inType: string, outType: string } } = {}
	private currentExpressionList: string[] = [];

	//--------------------------------------------------------------------------------//


	//--------------------------------- Constructor ----------------------------------//

	/**
	 * @description constructor
	 * @param string the file
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	constructor(file: string) {

		this.methodList = new MethodList();
		this.variableList = new VariableList();

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

	private compile() {

		let returnValue = this.evalFirstLine();
		if (returnValue != 0) { return 1; }

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
	private eval(currentLine: string) {

		let lineFeatures = tools.splittingLine(currentLine);
		currentLine = lineFeatures["content"];
		//Scope? nb Param? type Param? validExpression?

		if (currentLine === undefined) { return 0 }


		var words = tools.lineToWordsList(currentLine)


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
			this.instructions[1] = new Instruction("tra(" + traLine + ");");
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

			this.instructions.push(new Instruction("empiler(" + this.variableList.get(this.fullVariableName(variable)).addPile + ");", "address"));
			this.generateInstructions(this.currentExpressionList);
			this.instructions.push(new Instruction("affectation();"))

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

	private evalFirstLine() {

		// Adding the begin and the "tra" at the beginning of the instructions
		this.instructions.push(new Instruction("debutProg();"));
		this.instructions.push(new Instruction("tra(x);"));

		this.methodList.add(new Method("pp", "none", -1, []));
		this.blockScope++;

		// recursive calling
		this.nbLine++;
		var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);

		// Something got wrong
		if (returnValue != 0) { return 1; }

		while (this.nbLine < this.nilnoviProgram.length - 1) {
			this.nbLine++;
			// recursive calling
			var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);

			// Something got wrong
			if (returnValue != 0) { return 1; }
		}



		// End of the program
		this.instructions.push(new Instruction("finProg();"));

		return 0;
	}

	private variableDeclaration(words: string[]) {

		var nameList: string[] = []
		words.forEach(word => {
			if (word == "," || word == ":") { }
			else if (word == "boolean" || word == "integer") {
				nameList.forEach(name => {
					this.variableList.add(new Variable(name, this.currentMethodName, word, false, this.methodList.get(this.currentMethodName).fakePileLength));
					this.methodList.get(this.currentMethodName).fakePileLength++;
				});
				this.instructions.push(new Instruction("reserver(" + nameList.length + ");", "empty"));
			} else { nameList.push(word) }
		});

		// recursive calling
		// this.nbLine++;
		// var returnValue: number = this.eval(this.nilnoviProgram[this.nbLine]);

		// // Something got wrong
		// return returnValue;
		return 0;
	}

	private parameterLoading(words: string[]) {
		var nameList: string[] = []
		const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")", "return"]
		words.forEach(word => {
			var indexParam = 0;

			if (word == "integer" || word == "boolean") {

				nameList.forEach(name => {
					this.variableList.add(new Variable(name, this.currentMethodName, word, true, this.methodList.get(this.currentMethodName).fakePileLength, indexParam));
					this.methodList.get(this.currentMethodName).fakePileLength++;
					indexParam++;
				});
				nameList = [];
			} else if (!notParamList.includes(word) && word != words[1]) { nameList.push(word) }
		});
	}

	private getParamNames(words: string[]) {
		let names: string[] = [];
		const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")", "return"]
		words.forEach(word => {
			if (!notParamList.includes(word) && word != words[1]) {
				names.push(word);
			}
		})
		return names;
	}

	private createProcedure(words: string[]) {
		const name = words[1];
		this.blockScope++;
		this.currentMethodName = name

		//procedure toto ( x , y : integer , a : boolean ) is


		let params: string[] = this.getParamNames(words);

		this.methodList.add(new Method(name, "none", this.instructions.length, params)),
			this.parameterLoading(words);

		// recursive calling
		// this.nbLine++;
		// var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
		this.nbLine++;

		while (!new RegExp(/^end/).test(this.nilnoviProgram[this.nbLine].trim())) {
			let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
			if (returnValue != 0) { return 1; }
			this.nbLine++;
		}
		this.blockScope--;

		this.instructions.push(new Instruction("retourProc();"));
		this.currentMethodName = "pp";
		return 0;
	}

	private createFunction(words: string[]) {
		const name = words[1];
		const returnType = words[words.length - 2];
		this.blockScope++;
		this.currentMethodName = name;

		// function toto ( a , b : boolean , c , d : integer ) returns integer is

		var params: string[] = this.getParamNames(words);

		this.methodList.add(new Method(name, returnType, this.instructions.length, params));
		this.parameterLoading(words);

		// recursive calling
		this.nbLine++;

		while (!new RegExp(/^end/).test(this.nilnoviProgram[this.nbLine].trim())) {
			let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
			if (returnValue != 0) { return 1; }
			this.nbLine++;
		}
		this.blockScope--;

		this.instructions.push(new Instruction("retourFonct();"));
		this.currentMethodName = "pp";
		return 0;
	}


	/**
	 * @description inits the dictionary of operators
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private initDict() {
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
	private isValidNumber(str: string) { return new RegExp(/^[0-9]+$/).test(str); }

	private isVar(str: string) { return (this.variableList.get(str) !== undefined); }

	private isMethod(str: string) { return (this.methodList.get(str) !== undefined); }

	private isAffected(str: string) { return (this.variableList.get(str).hasBeenAffected); }

	private fullVariableName(str: string) { return this.currentMethodName + "." + str; }

	private concatWords(words: string[]) {
		let line: string[] = [];
		let method: string = "";
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
				line.push(word)
			}

			// Else if it's a method
			else if (this.isMethod(word)) {
				inMethod = true;
				method += word;
			}

			// Else we are in a method
			else {
				if (word == '(') { openParenthesesNb++; method += '(' }
				else if (word == ')') {
					openParenthesesNb--;
					method += ')';
					if (openParenthesesNb == 0) {
						line.push(method);
						method = ""
						inMethod = false;
					}
				}
				else { method += word }
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
	private analyzer(words: string[]) {

		if (words.length == 1) {
			if (this.isValidNumber(words[0]) || this.isVar(this.fullVariableName(words[0])) || this.isMethod(words[0].split('(')[0]) || words[0] == "true" || words[0] == "false") {
				this.currentExpressionList.push(words[0]);
				return 0;
			} else {
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
				case "(": betweenParentheses++; break;
				case ")": betweenParentheses--; break;

				// a "+" or a "-"
				case "+":
				case "-":
					if (betweenParentheses == 0) { lastAddition = i; }
					break;

				// a "*" or a "/"
				case "*":
				case "/":
					if (betweenParentheses == 0) { lastMultiplication = i; }
					break;

				// a comparator symbol
				case "<":
				case "<=":
				case ">":
				case ">=":
				case "=":
				case "/=":
					if (betweenParentheses == 0) { lastComparator = i; }
					break;

				// a "not"
				case "not":
					// Do nothing
					break;

				// a boolean operator
				case "and":
				case "or":
					if (betweenParentheses == 0) { lastBooleanOperator = i; }
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
				let returnValue: number = this.analyzer(words);
				return returnValue;
			} else if (words[0] == "not") {
				words.shift();
				let returnValue: number = this.analyzer(words);
				this.currentExpressionList.push("not");
				return returnValue;
			}



			// else, we should raise an error
			else { console.error(words[0], "is undefined"); return 1; }
		}


		let consideredIndex = -1;

		// else there is at least one addition / multiplication / Boolean Operator / comparator

		// if there is at least one BooleanOperator (and/or) (less priority first)
		if (lastBooleanOperator != -1) { consideredIndex = lastBooleanOperator; }

		// else if there is at least one comparator (>,<,...)
		else if (lastComparator != -1) { consideredIndex = lastComparator; }

		// else if there is at least one addition
		else if (lastAddition != -1) { consideredIndex = lastAddition; }

		// else there is at least one multiplication
		else if (lastMultiplication != -1) { consideredIndex = lastMultiplication; }

		// Get the corresponding operator
		var op = words[consideredIndex];

		// We need to analyze the first part of the list of words
		let returnValue = this.analyzer(words.slice(0, consideredIndex));
		if (returnValue != 0) { return 1; }

		// We analyze the second part of the expression
		returnValue = this.analyzer(words.slice(consideredIndex + 1));
		if (returnValue != 0) { return 1; }

		// And finally push the corresponding operator
		this.currentExpressionList.push(op);

		return 0
	}

	/**
	 * @description analyzes the expression as a list and checks if it's correct, according to the type given
	 * @param string expected type (integer or boolean)
	 * @param string[] the expression to analyze
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private syntaxAnalyzer(expression: string[], expectedType?: string) {
		// Let's make a copy of the list, allowing us to modify this copy
		var expressionCopy: string[] = [];
		expression.forEach(element => {

			// if the word is a variable
			if (this.isVar(this.fullVariableName(element))) {

				// Let's check if it has already been affected to get its type
				if (!this.isAffected(this.fullVariableName(element))) {
					console.error(element + " has not been affected")
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
			else if (element == "true" || element == "false") { element = "boolean"; }

			// if it's an integer
			else if (this.isValidNumber(element)) { element = "integer"; }

			// then we push the element
			expressionCopy.push(element)
		});

		// for each element in the list

		for (let i = 0; i < expressionCopy.length; i++) {
			const element = expressionCopy[i];
			if (this.opDict[element] != undefined) {
				let typeA = expressionCopy[i - 2];
				let typeB = expressionCopy[i - 1];
				let typeOp = this.opDict[element].inType
				if (typeA == typeB && typeA == typeOp) {
					expressionCopy[i] = this.opDict[element].outType;
				} else {
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

	private generateInstructions(expression: string[]) {

		for (let i = 0; i < expression.length; i++) {
			let word = expression[i];
			if (this.isValidNumber(word)) { this.instructions.push(new Instruction("empiler(" + word + ");", "integer")); }

			else if (this.opDict[word] != undefined) {
				this.instructions.push(new Instruction(this.opDict[word].machineCode));
			}

			else if (this.isVar(this.fullVariableName(word))) {
				this.instructions.push(new Instruction("empiler(" + this.variableList.get(this.fullVariableName(word)).addPile + ");", "address"));
				this.instructions.push(new Instruction("valeurPile();"));
			}

			else if (word == "true") {
				this.instructions.push(new Instruction("empiler(1);", "boolean"));
			}

			else if (word == "false") {
				this.instructions.push(new Instruction("empiler(0);", "boolean"));
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

	private generateInstructionsMethod(method: string) {
		// double ( double ( 4 ), toto ) 
		let words = tools.lineToWordsList(method);
		if (words.length == 0) { return 0; }
		let methodName = words[0];
		words.shift();
		words.shift();
		words.pop();
		words = this.concatWords(words);

		let nbParamsRead = 0;
		let nbParamsExpected = this.methodList.get(methodName).params.length;
		let tmpWordsList: string[] = [];
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
				returnValue = this.syntaxAnalyzer(tmpWordsList,
					this.variableList.get(methodName + "." + this.methodList.get(methodName).params[nbParamsRead]).type);

				nbParamsRead++;

				if (returnValue != 0) {
					console.error("syntaxAnalyzer");
					return returnValue;
				}

				this.generateInstructions(this.currentExpressionList);

				tmpWordsList = [];
			}

			else { tmpWordsList.push(word); }

		}
		let returnValue = this.analyzer(this.concatWords(tmpWordsList));
		if (returnValue != 0) {
			console.error("analyzer error");
			return returnValue;
		}

		if (nbParamsRead >= nbParamsExpected) {
			console.error("too many parameters");
			return 1;
		} else if (nbParamsRead + 1 != nbParamsExpected) {
			console.error("not enough parameters");
			return 1;
		}

		returnValue = this.syntaxAnalyzer(tmpWordsList,
			this.variableList.get(methodName + "." + this.methodList.get(methodName).params[nbParamsRead]).type);
		if (returnValue != 0) {
			console.error("syntaxAnalyzer");
			return returnValue;
		}

		this.instructions.push(new Instruction("reserverBloc();", "bloc"));

		this.generateInstructions(this.currentExpressionList);
		tmpWordsList = [];

		let methodLine = this.methodList.get(methodName).refLine + 1;
		this.instructions.push(new Instruction("traStat(" + methodLine + "," + nbParamsExpected + ");"));

		return 0;

	}





	// /**
	//  * @description evaluates the current line
	//  * @param string the current line
	//  * @returns the output status
	//  * @author Sébastien HERT
	//  * @author Adam RIVIÈRE
	//  */
	// private eval(line: string) {

	// 	// getting lineNb (in order to print a potential error)
	// 	var lineNb = line.split("$").pop();
	// 	line = line.split("$")[0];

	// 	// let's define the different shapes a line can take

	// 	// line = "procedure my_procedure() is"
	// 	var regexProcedure = /^procedure ((.)*\((.)*\)) is$/;
	// 	if (line.match(regexProcedure)) {
	// 		// we need the name and params to create a procedure
	// 		var name = line.split("(")[0].split("procedure")[1].trim();
	// 		var params = this.generateParams(line.split("(")[1].split(")")[0].trim(), true);

	// 		// Saving the new method and creating a new procedure
	// 		this.methodTable.push(new Method(name, this.currentScope, "procedure", this.instructions.length, params));
	// 		var returnValue = this.createProcedureFunction();
	// 		return returnValue
	// 	}
	// 	// line = "begin"
	// 	else if (line.match(/^begin$/)) { var returnValue: number = this.readingBegin(); return returnValue; }

	// 	// line = "end"
	// 	else if (line.match(/^end$/)) { this.readingEnd(); }

	// 	// line = "a := expression;"
	// 	else if (line.includes(":=")) {
	// 		// create a list which contains all the symbols potentially used in an affectation
	// 		// ex : 1+3 => [1, 3, +]
	// 		// ex : (1+3)*5+6 => [1, 3, +, 5, *, 6, +]
	// 		this.currentExpressionList = []

	// 		// Checking "a" is a valid variable in
	// 		var variable = line.split(":=")[0].trim();
	// 		// if not, error
	// 		if (!this.isVar(variable)) {
	// 			console.error(("error, not a var"));
	// 			return 1;
	// 		}

	// 		// removing the ";"
	// 		var expression = line.split(":=")[1].replace(";", "");

	// 		// Let's analyze the expression and update the currentExpression
	// 		var returnValue = this.analyzer(expression);
	// 		if (returnValue != 0) { return 1; }

	// 		// Checking if an error occurs
	// 		returnValue = this.syntaxAnalyzer(this.getVariable(variable).type, this.currentExpressionList);
	// 		if (returnValue != 0) {
	// 			return 1;
	// 		}

	// 		// We can now stack "a" in the pile and affect the entire expression to it
	// 		this.instructions.push("empiler(" + this.getVariable(variable).addPile + ");");
	// 		this.readExpressionList(this.currentExpressionList);
	// 		this.instructions.push("affectation();");

	// 		// We still are in a block, we should evaluate the next line
	// 		this.currentLine++;
	// 		var returnValue = this.eval(this.nilnoviProgram[this.currentLine]);
	// 		return returnValue;
	// 	}
	// 	// line = "x, y : integer;" 
	// 	else if (line.includes(":")) {
	// 		// let's load the name of "x" and "y" in the table
	// 		var vars = this.generateParams(line.split(";")[0].trim(), false);
	// 		for (let i = 0; i < vars.length; i++) {
	// 			// in order to use "tra(x)" correctly, we need to simulate the length of the pile which will be added in the table of Variables as the address of the variable
	// 			vars[i].addPile = this.fakePileLength;
	// 			this.fakePileLength++;

	// 			// we also need the current scope
	// 			vars[i].scope = this.currentScope;

	// 			// then merge the temporary table to the global one
	// 			this.varTable.push(vars[i])
	// 		}

	// 		// if it's the beginning of the program 
	// 		if (this.currentScope == 0 && !this.alreadyBegun) {
	// 			// we need to update the line number where the jump should send to
	// 			this.instructions[1] = "tra(" + (this.instructions.length) + ");";
	// 			this.alreadyBegun = true;
	// 		}

	// 		// in all cases, we need to reserve as much slots as there are variables
	// 		this.instructions.push("reserver(" + vars.length + ");");

	// 		// finally, let's evaluate the next line
	// 		this.currentLine++;
	// 		var returnValue = this.eval(this.nilnoviProgram[this.currentLine]);
	// 		return returnValue
	// 	}
	// 	return 0;
	// }



	// /**
	//  * @description checks if an expression is a valid number
	//  * @param string the expression to consider
	//  * @returns a boolean
	//  * @author Sébastien HERT
	//  * @author Adam RIVIÈRE
	//  */
	// private isValidNumber(str: string) { return new RegExp(/^[0-9]+$/).test(str); }


	// /**
	//  * @description converts expression into a list : (1+3)*4 => [1,3, +, 4, *]
	//  * @param string the expression to consider
	//  * @returns the output status
	//  * @author Sébastien HERT
	//  * @author Adam RIVIÈRE
	//  */
	// private analyzer(expression: string) {

	// 	// lastAddition, let's trim the expression
	// 	expression = expression.trim();

	// 	// if the expression is a valid number
	// 	if (this.isValidNumber(expression)) {
	// 		this.currentExpressionList.push(expression);
	// 		return 0;
	// 	}

	// 	// if the expression is a variable already define
	// 	if (this.isVar(expression)) {
	// 		this.currentExpressionList.push(expression);
	// 		return 0;
	// 	}

	// 	// else we need to check each char of the expression

	// 	// those var describes the number of parentheses, the position of the last addition and the last multiplication
	// 	var betweenParentheses = 0;
	// 	var lastAddition = -1;
	// 	var lastMultiplication = -1;

	// 	for (let i = 0; i < expression.length; i++) {
	// 		var char = expression.charAt(i);

	// 		// if the char is...
	// 		switch (char) {

	// 			// a parenthesis
	// 			case "(": betweenParentheses++; break;
	// 			case ")": betweenParentheses--; break;

	// 			// a "+" or a "-"
	// 			case "+":
	// 			case "-":
	// 				if (betweenParentheses == 0) { lastAddition = i; }
	// 				break;

	// 			// a "*" or a "/"
	// 			case "*":
	// 			case "/":
	// 				if (betweenParentheses == 0) { lastMultiplication = i; }
	// 				break;

	// 			default: break;
	// 		}
	// 	}

	// 	// no addition and no multiplication have been seen
	// 	if (lastAddition == -1 && lastMultiplication == -1) {

	// 		// if the expression is surrounded by parentheses
	// 		if (new RegExp(/^\(.*\)$/).test(expression)) {

	// 			// let's try it again without them
	// 			var newExpression = expression.replace(/^\(/, "").replace(/\)$/, "");
	// 			var returnValue: number = this.analyzer(newExpression);
	// 			return returnValue;
	// 		}

	// 		// else, we should raise an error
	// 		else { console.error(expression, "is undefined"); return 1; }
	// 	}

	// 	// else there is at least one addition or one multiplication
	// 	// if there is at least one addition (less priority before)
	// 	if (lastAddition != -1) {
	// 		// let's cut the expression into 2 and use the analyzer function on both sides, and then push the operator in the list
	// 		var op = expression.charAt(lastAddition);

	// 		// analyzer on the first part 
	// 		var returnValue = this.analyzer(expression.substring(0, lastAddition));
	// 		if (returnValue != 0) { return 1; }

	// 		// analyzer on the second part
	// 		returnValue = this.analyzer(expression.substring(lastAddition + 1, expression.length));
	// 		if (returnValue != 0) { return 1; }
	// 		// then pushing the operator on the list
	// 		this.currentExpressionList.push(op);
	// 	}
	// 	// else there is at least one multiplication, and it's the same process as explained before
	// 	else if (lastMultiplication != -1) {
	// 		var op = expression.charAt(lastMultiplication);
	// 		var returnValue = this.analyzer(expression.substring(0, lastMultiplication));
	// 		if (returnValue != 0) { return 1; }

	// 		returnValue = this.analyzer(expression.substring(lastMultiplication + 1, expression.length));
	// 		if (returnValue != 0) { return 1; }

	// 		this.currentExpressionList.push(op);
	// 	}
	// 	return 0;
	// }



	// /**
	//  * @description checks if the name is valid (either for procedure, function, parameter and variable)
	//  * @param string name
	//  * @returns a boolean
	//  * @author Sébastien HERT
	//  * @author Adam RIVIÈRE
	//  */
	// private isValidName(name: string) {
	// 	// the name contains at least one char, and only letters (upper and lower case), numbers (not at the beginning) and "_"
	// 	return (name.match(/([a-zA-Z0-9]|_)+/) && !name.match(/^\d/))
	// }

	// /**
	//  * @description checks if the type given is allowed (integer or boolean)
	//  * @param string type
	//  * @returns a boolean
	//  * @author Sébastien HERT
	//  * @author Adam RIVIÈRE
	//  */
	// private isValidType(type: string) { return (type == "boolean" || type == "integer"); }


	// /**
	//  * @description analyzes the expression as a list and checks if it's correct, according to the type given
	//  * @param string expected type (integer or boolean)
	//  * @param string[] the expression to analyze
	//  * @returns the output status
	//  * @author Sébastien HERT
	//  * @author Adam RIVIÈRE
	//  */
	// private syntaxAnalyzer(expectedType: string, expression: string[]) {
	// 	// Let's make a copy of the list, allowing us to modify this copy
	// 	var expressionCopy: string[] = [];
	// 	expression.forEach(element => {
	// 		if (this.isVar(element)) { element = "1"; }
	// 		expressionCopy.push(element)
	// 	});

	// 	// for each element in the list
	// 	let i = 0;
	// 	while (i < expressionCopy.length) {
	// 		const element = expressionCopy[i];
	// 		if (this.OpDict.has(element)) {

	// 			// evaluating char "a ? b" where a and b are element i-2 and i-1 and ? is the operator (result is rounded up)
	// 			var a = expressionCopy[i - 2];
	// 			var b = expressionCopy[i - 1];
	// 			expressionCopy.splice(i + 1, 0, eval("Math.floor("+a + element + b+")"));
	// 		}
	// 		i++;
	// 	}

	// 	// the supposed output is the last element
	// 	var output = expressionCopy.pop();

	// 	// we need to be sure it's defined and it's a number
	// 	if (output === undefined || !this.isValidNumber(output)) {
	// 		console.error("Error at line X : TypeError : Only Integers and Booleans are allowed");
	// 		return 1;
	// 	}
	// 	// then checks if it's the correct type
	// 	else {
	// 		if (expectedType == "boolean" && (output != "0" && output != "1")) {
	// 			console.error("Error at line X : TypeError : not a boolean");
	// 			return 1;
	// 		}
	// 	}
	// 	return 0;
	// }

	// /**
	//  * @description generates the machine code for a given expression
	//  * @param string[] expression in a list
	//  * @author Sébastien HERT
	//  * @author Adam RIVIÈRE
	//  */
	// private readExpressionList(expressionList: string[]) {

	// 	// for each element in the list
	// 	for (let index = 0; index < expressionList.length; index++) {
	// 		const element = expressionList[index];

	// 		// if it's a number, we just need to stack it
	// 		if (this.isValidNumber(element)) {
	// 			this.instructions.push("empiler(" + element + ");");
	// 		}

	// 		// if it's a operator defined in the operators dictionary, we need to get the corresponding instruction (also in the dictionary) and stack it
	// 		else if (this.OpDict.has(element)) {
	// 			var instruction = this.OpDict.get(element);
	// 			if (instruction === undefined) {
	// 				// Error which cannot be seen
	// 			} else {
	// 				this.instructions.push(instruction);
	// 			}
	// 		}
	// 		// else it's variable or a parameter and we need to stack its address in order to get its value
	// 		else {
	// 			this.instructions.push("empiler(" + this.getVariable(element).addPile + ");");
	// 			this.instructions.push("valeurPile();");
	// 		}
	// 	}
	// }

	//--------------------------------------------------------------------------------//


}
//================================================================================//