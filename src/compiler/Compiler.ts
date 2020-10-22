//================================ Class Compiler ================================//


// import { createProcedureFunction, readingBegin, readingEnd } from "./codeGenerator";
import { Method } from "./tables/Method";
import { Variable } from "./tables/Variable";


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
//
//--------------------------------------------------------------------------------//


export class Compiler {


	//------------------------------- Class Variables --------------------------------//

	public instructions: string[] = [];
	public currentScope = 0;
	public alreadyBegun = false;
	public nilnoviProgram: string[] = [];
	public fakePileLength: number = 0;

	public currentLine: number = 0;

	public varTable: Variable[] = [];
	public methodTable: Method[] = [];
	public blockList: Object[] = [];

	private OpDict = new Map<string, string>();

	//--------------------------------------------------------------------------------//


	//--------------------------------- Constructor ----------------------------------//

	constructor(file: string) {

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

		if (returnValue != 0) {
			console.log("Error");
		} else {
			console.log(this.instructions)
		}
	}

	//--------------------------------------------------------------------------------//


	//----------------------------------- Methods ------------------------------------//


	/**
	 * @description inits the dictionary of operators
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private initDict() {
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
	private removeComments(file: string) {
		var regexpComment = /(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\#.*)/gm;
		return file.replace(regexpComment, "");
	}

	/**
	 * @description removes empty lines and trims them
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private removeEmptyLines() {
		for (let i = 0; i < this.nilnoviProgram.length; i++) {
			this.nilnoviProgram[i] = this.nilnoviProgram[i].trim();
			let line = this.nilnoviProgram[i];
			if (typeof line === undefined || line?.length == 0 || new RegExp(/^\$[0-9]*$/).test(line)) {
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
	private compile() {

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
	public eval(line: string) {

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
			this.methodTable.push(new Method(name, this.currentScope, "procedure", this.instructions.length, params));
			this.createProcedureFunction();
		}
		// line = "begin"
		else if (line.match(/^begin$/)) { this.readingBegin(this); }

		// line = "end"
		else if (line.match(/^end$/)) { this.readingEnd(this); }

		// line = "a := expression;"
		else if (line.includes(":=")) {
			// create a list which contains all the symbols potentially used in an affectation
			// ex : 1+3 => [1, 3, +]
			// ex : (1+3)*5+6 => [1, 3, +, 5, *, 6, +]
			var currentExpression: string[] = []

			// Checking "a" is a valid variable in
			var variable = line.split(":=")[0].trim();
			// if not, error
			if (!this.isVar(variable)) {
				console.log(("error, not a var"));
				return 1;
			}

			// removing the ";"
			var expression = line.split(":=")[1].replace(";", "");

			// Let's analyze the expression and update the currentExpression
			currentExpression = this.analyzer(expression, currentExpression);

			// Checking if an error occurs
			var returnValue = this.syntaxAnalyzer(this.getVariable(variable).type, currentExpression);
			if (returnValue != 0) {
				return 1;
			}

			// We can now stack "a" in the pile and affect the entire expression to it
			this.instructions.push("empiler(" + this.getVariable(variable).addPile + ");");
			this.readExpressionList(currentExpression);
			this.instructions.push("affectation();");

			// We still are in a block, we should evaluate the next line
			this.currentLine++;
			this.eval(this.nilnoviProgram[this.currentLine]);
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
				this.varTable.push(vars[i])
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
			this.eval(this.nilnoviProgram[this.currentLine]);
		}
		return 0;

	}

	createProcedureFunction() {

		var isPP = (this.methodTable[this.methodTable.length - 1].name == "pp");
		var type = this.methodTable[this.methodTable.length - 1].type;

		if (isPP) {
			this.instructions.push("debutProg();")
			this.instructions.push("tra(x);")
			// compiler.alreadyBegun = true;
		} else {
			this.currentScope++;
		}

		this.currentLine++;
		this.eval(this.nilnoviProgram[this.currentLine]);

		if (isPP) {
			this.instructions.push("finProg();")
		} else {
			// var type = compiler.me
			if (type == "procedure") {
				this.instructions.push("retourProc();");
			} else if (type == "function") {
				this.instructions.push("retourFonct();");
			}
		}
	}

	public isVar(expression: string) {
		for (let i = 0; i < this.varTable.length; i++) {
			if (this.varTable[i].name == expression) {
				return true;
			}
		}
		return false;
	}

	readingBegin(compiler : Compiler) {
		// console.log(compiler.currentScope);
		if (compiler.currentScope == 0 && !compiler.alreadyBegun){
			compiler.instructions[1] = "tra("+(compiler.instructions.length)+");";
			compiler.alreadyBegun = true;
		}
		compiler.currentLine++;
		compiler.eval(compiler.nilnoviProgram[compiler.currentLine]);
	}
	
	readingEnd(compiler: Compiler) {
		compiler.currentScope--;
	}

	public getVariable(variable: string) {
		for (let i = 0; i < this.varTable.length; i++) {
			if (this.varTable[i].name == variable) {
				return this.varTable[i];
			}
		}
		return new Variable("", "", false);
	}

	public isValidNumber(str: string) {
		return new RegExp(/^[0-9]+$/).test(str);
	}


	public analyzer(expression: string, currentExpression: string[]) {
		expression = expression.trim();

		// console.log(expression);

		if (this.isValidNumber(expression)) {
			// console.log("is integer");
			currentExpression.push(expression);
			return currentExpression;
		}

		if (this.isVar(expression)) {
			// console.log("is var");
			currentExpression.push(expression);
			return currentExpression;
		}
		// console.log(this.varTable);
		// console.log(expression);

		var betweenParentheses = 0;
		var firstAddition = -1;
		var firstMultiplication = -1;
		// var warningFl

		for (let i = 0; i < expression.length; i++) {
			var char = expression.charAt(i);


			switch (char) {
				case "(":
					betweenParentheses++;
					break;
				case ")":
					betweenParentheses--;
					break;

				case "+":
				case "-":
					if (betweenParentheses == 0) {
						firstAddition = i;
					}
					break;

				case "*":
				case "/":
					if (betweenParentheses == 0) {
						firstMultiplication = i;
					}
					break;

				default:
					break;
			}
		}
		// console.log(firstAddition);
		// console.log(firstMultiplication);

		if (firstAddition == -1 && firstMultiplication == -1) {
			if (new RegExp(/^\(.*\)$/).test(expression)) {
				var newExpression = expression.replace(/^\(/, "").replace(/\)$/, "");
				currentExpression.concat(this.analyzer(newExpression, currentExpression));
			} else {
				console.log(expression, "is undefined");
			}
			return currentExpression;
		}

		if (firstAddition != -1) {
			var op = expression.charAt(firstAddition);
			currentExpression.concat(this.analyzer(expression.substring(0, firstAddition), currentExpression));
			currentExpression.concat(this.analyzer(expression.substring(firstAddition + 1, expression.length), currentExpression));
			currentExpression.push(op);
		} else if (firstMultiplication != -1) {
			var op = expression.charAt(firstMultiplication);
			currentExpression.concat(this.analyzer(expression.substring(0, firstMultiplication), currentExpression));
			currentExpression.concat(this.analyzer(expression.substring(firstMultiplication + 1, expression.length), currentExpression));
			currentExpression.push(op);
		}


		return currentExpression;
	}


	private generateParams(str: string, isParam: boolean) {
		var params: Variable[] = [];
		var isValue = true;
		var isType = false;
		var currentType = "";
		var currentName = "";
		var nameList = [];

		for (var i = 0; i < str.length; i++) {
			var char = str.charAt(i);
			// alert(str.charAt(i));
			if (char == ":") {
				isValue = !isValue;
				isType = !isType;
				nameList.push(currentName.trim());
				currentName = "";
			} else if (char == ",") {
				if (isValue) {
					nameList.push(currentName.trim());
					currentName = "";
				} else if (isType) {
					for (let i = 0; i < nameList.length; i++) {
						var name = nameList[i];
						if (!this.isValidName(name)) {
							console.log("Not valid name")
						}
						currentType.trim();
						if (!this.isValidType(currentType)) {
							console.log("not valid type")
						}

						params.push(new Variable(name, currentType, isParam));
					}
					currentType = "";
				}
			} else {
				if (isValue) {
					currentName += char;
				} else if (isType) {
					currentType += char;
				}
			}
		}
		for (let i = 0; i < nameList.length; i++) {
			var name = nameList[i];
			// console.log(name);
			if (!this.isValidName(name)) {
				console.log("Not valid name")
			}
			currentType.trim();
			if (!this.isValidType(currentType)) {
				console.log("not valid type")
			}
			params.push(new Variable(name, currentType, isParam));
		}

		return params;
	}


	private isValidName(str: string) {
		if (!(str.match(/([a-zA-Z0-9]|_)+/))) { return false; }
		if (str.match(/^\d/)) { return false; }
		return true;
	}

	private isValidType(str: string) { return (str == "boolean" || str == "integer"); }

	private syntaxAnalyzer(expectedType: string, expression: string[]) {
		// console.log(expression);

		// console.log(this.OpDict);
		var expressionCopy: string[] = [];
		expression.forEach(element => {
			if (this.isVar(element)) {
				element = "1";
			}
			expressionCopy.push(element)
		});


		let i = 0;
		while (i < expressionCopy.length) {
			const element = expressionCopy[i];
			// console.log(element,this.OpDict.has(element));
			if (this.OpDict.has(element)) {
				var a = expressionCopy[i - 1];
				var b = expressionCopy[i - 2];
				expressionCopy.splice(i + 1, 0, eval(a + element + b));
			}
			i++;
		}
		var output = expressionCopy.pop();
		if (output === undefined || !this.isValidNumber(output)) {
			console.log("Error at line X : TypeError : Only Integers and Booleans are allowed");
			// console.log(output)
			return 1;
		} else {
			if (expectedType == "boolean" && (output != "0" && output != "1")) {
				console.log("Error at line X : TypeError : not a boolean");
				return 1;
			}
		}
		// console.log(expression);
		return 0;
	}

	private readExpressionList(expressionList: string[]) {
		// console.log(expressionList);
		for (let index = 0; index < expressionList.length; index++) {
			const element = expressionList[index];
			// console.log(element);
			if (this.isValidNumber(element)) {
				this.instructions.push("empiler(" + element + ");");
			} else if (this.OpDict.has(element)) {
				var instruction = this.OpDict.get(element);
				if (instruction === undefined) {
					console.log("Impossible Error", element, "undefined");
				} else {
					this.instructions.push(instruction);
				}
			} else {
				this.instructions.push("empiler(" + this.getVariable(element).addPile + ");");
				this.instructions.push("valeurPile();");
			}
		}
	}

	//--------------------------------------------------------------------------------//


}
//================================================================================//