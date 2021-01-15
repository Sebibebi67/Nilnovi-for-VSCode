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

import * as tools from "../tools"
import { MethodList } from "./MethodList";
import { VariableList } from "./VariableList";
import { Method } from "./Method";
import { Variable } from "./Variable";
import { Instruction } from "./Instruction";
import { CompilationError } from "./CompilationError";
import * as vscode from "vscode";
import { setError } from "./CompilationError";
import { features } from "process";
import { captureRejectionSymbol } from "events";

//--------------------------------------------------------------------------------//


export class Compiler {


	//------------------------------- Class Variables --------------------------------//

	private nilnoviProgram: string[] = [];
	private nbLine: number = 0;

	private blockScope = 0;

	public instructions: Instruction[] = [];

	private methodList: MethodList;
	private variableList: VariableList;

	private traCompleted = false;

	private currentMethodName: string = "pp";

	private opDict: { [id: string]: { machineCode: string, inType: string, outType: string, isBinary: boolean } } = {}
	private currentExpressionList: string[] = [];

	private ifTraList: [number, number][] = [];

	private outputChannel: vscode.OutputChannel;

	private currentLineNb: number = 0;

	private returnRead: boolean = false;

	//--------------------------------------------------------------------------------//


	//--------------------------------- Constructor ----------------------------------//

	/**
	 * @description constructor
	 * @param string the file
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	constructor(file: string, output: vscode.OutputChannel) {

		setError(false);

		this.outputChannel = output;
		this.outputChannel.clear();
		this.outputChannel.show(true);

		// Initializing the lists of Methods and Variables
		this.methodList = new MethodList();
		this.variableList = new VariableList();

		//Init the dictionary of Operators
		this.initDict();

		// First we need to prepare the array which will contain our NilNovi Program
		file = tools.removeComments(tools.indexingFile(file));
		this.nilnoviProgram = tools.removeEmptyLines(file.split(/\r?\n/));

		// if the file is empty 
		if (this.nilnoviProgram.length == 0) {
			setError(true);
			vscode.window.showErrorMessage("Compilation failed : empty file");
		}

		// From now, all the useless lines have been removed
		else {
			// We will just eval the first, the entire program will be a recursive call
			let returnValue = this.compile();

			// If something get wrong
			if (returnValue != 0) { vscode.window.showErrorMessage("Compilation failed : check Nilnovi-Output for more information"); }
			else { vscode.window.showInformationMessage("Compilation ran successfully") }
		}



		// Printing part

		// for (let i = 0; i < this.instructions.length; i++) {
		// 	console.log(i + 1, this.instructions[i].toString());
		// }

		// this.methodList.display();
		// this.variableList.display();


	}

	//--------------------------------------------------------------------------------//


	//--------------------------------- Compilation ----------------------------------//

	/**
	 * @description evaluates and compiles all the lines
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	   */
	private compile() {

		// Adding the begin and the "tra" at the beginning of the instructions
		this.instructions.push(new Instruction("debutProg();"));
		this.instructions.push(new Instruction("tra(x);"));

		// define the method name
		this.methodList.add(new Method("pp", "none", -1, []));
		this.blockScope++;

		while (this.nbLine < this.nilnoviProgram.length - 1) {
			// recursive calling
			this.nbLine++;
			var returnValue = this.eval(this.nilnoviProgram[this.nbLine]);

			// Something got wrong
			if (returnValue != 0) { return 1; }
		}

		// End of the program
		this.instructions.push(new Instruction("finProg();"));
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

		// Let's prepare the effective content
		let lineFeatures = tools.splittingLine(currentLine);
		currentLine = lineFeatures["content"];
		this.currentLineNb = lineFeatures["index"];

		// The line shouldn't be empty, but to be sure
		if (currentLine === undefined) { return 0 }

		// We can now get a list of words
		let words = tools.lineToWordsList(currentLine)


		// We need to link our first "tra()" 
		if (this.blockScope == 1 && !this.traCompleted && words[0] != "function" && words[0] != "procedure") {
			let traLine = this.instructions.length + 1;

			if (traLine != 3) { this.instructions[1] = new Instruction("tra(" + traLine + ");"); }
			else { this.instructions.pop(); }

			this.traCompleted = true;
		}

		// if it's a "procedure" or "function"
		if (words[0] == "function" || words[0] == "procedure") {

			// it's a "procedure"
			if (words[0] == "procedure") { return this.createProcedure(words); }

			// it's a "function"
			else { return this.createFunction(words); }
		}

		// if it's a block "if" or "elif"
		else if (words[0] == "if" || words[0] == "elif") { return this.generateIf(words); }

		// if it's a "else" block
		else if (words[0] == "else") { return this.generateElse(); }

		// if it's a "while" block
		else if (words[0] == "while") { return this.generateWhile(words) }

		// if it's a "for" block
		else if (words[0] == "for") { return this.generateFor(words) }

		// else if it is an affectation
		else if (new RegExp(/.*:=.*/).test(currentLine)) { return this.affectation(words); }

		// if it includes ":" but is not an affectation, then it's a variable declaration
		else if (words.includes(":")) { return this.variableDeclaration(words); }

		// if "begin" is read
		else if (words[0] == "begin") { return 0; }

		// if "end" is read
		else if (words[0] == "end") { return this.generateEnd(); }

		// if "return" is read
		else if (words[0] == "return") { return this.generateReturn(words) }

		// if a "put" is read
		else if (words[0] == "put") { return this.generatePut(words) }

		// if a "get" is read
		else if (words[0] == "get") { return this.generateGet(words); }

		// else we analyze the line:
		else {
			words = tools.removeFromWords(words, 0, 1);

			let returnValue = this.analyzer(this.concatWords(words));
			if (returnValue != 0) { return returnValue; }

			returnValue = this.syntaxAnalyzer(this.currentExpressionList);

			if (returnValue != 0) { return returnValue; }

			returnValue = this.generateInstructions(this.currentExpressionList, false);

			if (returnValue != 0) { return returnValue; }

			return 0;
		}
	}

	//--------------------------------------------------------------------------------//


	//------------------------------ Structure Blocks --------------------------------//

	/**
	 * @description creates a procedure and registers it
	 * @param string[] the line to consider
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private createProcedure(words: string[]) {

		// we update the global variables with the new procedure
		const name = words[1];
		this.blockScope++;
		this.currentMethodName = name

		// we get the names of the eventual parameters of the procedure
		let params: string[] = this.getParamNames(words);

		// we register the procedure in the method's list
		this.methodList.add(new Method(name, "none", this.instructions.length, params)),
			this.parameterLoading(words);

		// then we pass to the next line
		let blockScopeBeforeProc = this.blockScope;

		// while the procedure is not terminated
		while (!(new RegExp(/^\$[0-9]+\$\s*end$/).test(this.nilnoviProgram[this.nbLine + 1].trim()) && blockScopeBeforeProc == this.blockScope)) {
			this.nbLine++;
			// we evaluate each line and checks the eventual errors
			let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
			if (returnValue != 0) { return 1; }
		}

		this.nbLine++;

		// then we update the blockScope
		this.blockScope--;

		// and we create the procedure ending instruction and we update the current method's name
		this.instructions.push(new Instruction("retourProc();"));
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
	private createFunction(words: string[]) {

		this.returnRead = false;

		// we update the global variables with the new function
		const name = words[1];
		const returnType = words[words.length - 2];
		this.blockScope++;
		this.currentMethodName = name;

		// we get the names of the eventual parameters of the function
		var params: string[] = this.getParamNames(words);

		// we register the function in the method's list
		this.methodList.add(new Method(name, returnType, this.instructions.length, params));
		this.parameterLoading(words);

		// then we pass to the next line
		let blockScopeBeforeFunc = this.blockScope;

		// while the function is not terminated
		while (!(new RegExp(/^\$[0-9]+\$\s*end$/).test(this.nilnoviProgram[this.nbLine + 1].trim()) && blockScopeBeforeFunc == this.blockScope)) {
			this.nbLine++;
			let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);
			if (returnValue != 0) { return 1; }
		}

		// then we update the blockScope
		this.blockScope--;

		// and we create the function ending instruction and we update the current method's name
		this.instructions.push(new Instruction("retourFonct();"));
		this.currentMethodName = "pp";

		if (this.returnRead == false) {
			this.displayError(new CompilationError(511, "function should have at least one 'return'", this.currentLineNb));
			return 1;
		}


		return 0;
	}

	/**
	 * @description checks for errors and generates the instructions for a block "while"
	 * @param string[] the words
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private generateWhile(words: string[]) {
		// we keep the while condition
		words = tools.removeFromWords(words, 1, 1);
		// we analyze it
		let returnValue = this.analyzer(this.concatWords(words));
		if (returnValue != 0) { return returnValue; }



		// we check its type
		returnValue = this.syntaxAnalyzer(this.currentExpressionList, "boolean");


		if (returnValue != 0) { return returnValue; }

		// then we generate the corresponding instructions
		let whileLine = this.instructions.length + 1;
		returnValue = this.generateInstructions(this.currentExpressionList, false);
		if (returnValue != 0) { return returnValue; }

		// then we create the jump instruction
		this.instructions.push(new Instruction("tze(x);"));

		// and we keep the current line number for the callback
		let tzeLine = this.instructions.length - 1;

		// we keep the current blockScope
		let blockScopeBeforeWhile = this.blockScope;
		while (!(new RegExp(/^\$[0-9]+\$\s*end$/).test(this.nilnoviProgram[this.nbLine + 1].trim()) && blockScopeBeforeWhile == this.blockScope)) {

			// recursive calling
			this.nbLine++;
			let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);

			// Something got wrong
			if (returnValue != 0) { return 1; }
		}

		// we create the callback instruction with the line of the beginning of the block
		this.instructions.push(new Instruction("tra(" + whileLine + ");"));

		// finally we update the jump instruction with the current line number
		this.instructions[tzeLine] = new Instruction("tze(" + (this.instructions.length + 1) + ");");
		return 0;
	}

	/**
	 * @description checks for errors and generates the instructions for a block "for"
	 * @param string[] the words
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private generateFor(words: string[]) {
		// we keep the name or the increment
		let variable = words[1];

		let spliceIndex = words.indexOf("to");

		// we keep that the two bounds
		let lowerBound = words.splice(3, spliceIndex - 3);
		let upperBound = words.splice(4, words.length - 5);

		// we create a fake affectation line to initialize the increment with the lower bound
		let affectationToLowerBoundLine = (variable + ":=" + lowerBound + ";").replace(/\,/g, "");

		// we keep the stopping condition
		let condition = [variable, "<"].concat(upperBound);

		// then we evaluate it
		let returnValue: number = this.eval(affectationToLowerBoundLine);

		// Something got wrong
		if (returnValue != 0) { return 1; }

		// then we analyze the stopping condition
		returnValue = this.analyzer(this.concatWords(condition));
		if (returnValue != 0) { return returnValue; }

		// we check that the condition is a boolean
		returnValue = this.syntaxAnalyzer(this.currentExpressionList, "boolean");

		if (returnValue != 0) { return returnValue; }

		let forLine = this.instructions.length + 1;

		// then we generate the instructions corresponding to the condition
		returnValue = this.generateInstructions(this.currentExpressionList, false);
		if (returnValue != 0) { return returnValue; }

		// then we create the jump instruction
		this.instructions.push(new Instruction("tze(x);"));

		// and we keep the current line number for the callback
		let tzeLine = this.instructions.length - 1;

		// we keep the current blockScope
		let blockScopeBeforeWhile = this.blockScope;
		while (!(new RegExp(/^\$[0-9]+\$\s*end$/).test(this.nilnoviProgram[this.nbLine + 1].trim()) && blockScopeBeforeWhile == this.blockScope)) {
			// recursive calling
			this.nbLine++;
			let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);

			// Something got wrong
			if (returnValue != 0) { return 1; }
		}

		// then we add 1 to the increment variable
		let finalIncrementLine = variable + ":=" + variable + "+" + "1;";
		returnValue = this.eval(finalIncrementLine);

		// Something got wrong
		if (returnValue != 0) { return 1; }

		// we create the callback instruction with the line of the beginning of the block
		this.instructions.push(new Instruction("tra(" + forLine + ");"));

		// finally we update the jump instruction with the current line number
		this.instructions[tzeLine] = new Instruction("tze(" + (this.instructions.length + 1) + ");");

		return 0;
	}

	/**
	 * @description checks for errors and generates the instructions for a block "if"
	 * @param string[] the words
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private generateIf(words: string[]) {

		// If it's the beginning of the block
		if (words[0] == "if") { this.blockScope++; }

		// Let's remove "if" or "elif" and "loop" from the list of words. it should only remain the condition
		words = tools.removeFromWords(words, 1, 1);

		// Let's analyze the condition
		let returnValue = this.analyzer(this.concatWords(words));
		if (returnValue != 0) { return returnValue; }

		returnValue = this.syntaxAnalyzer(this.currentExpressionList, "boolean");
		if (returnValue != 0) { return returnValue; }

		// Then generate the instructions
		returnValue = this.generateInstructions(this.currentExpressionList, false);
		if (returnValue != 0) { return returnValue; }

		// We need to add the "tze" method, which is a jump if the condition on top of pile is false, and store the ref to the corresponding line
		this.instructions.push(new Instruction("tze(x);"));
		let tzeLine = this.instructions.length - 1;

		// We also need to store the current Block scope before the recursive calls 
		let blockScopeBeforeWhile = this.blockScope;

		// While it's not the end of the current "if"/"elif"
		while (!(new RegExp(/^\$[0-9]+\$\s*(end$|else$|elif\s+)/).test(this.nilnoviProgram[this.nbLine + 1].trim()) && blockScopeBeforeWhile == this.blockScope)) {
			// recursive calling
			this.nbLine++;
			let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);

			// Something got wrong
			if (returnValue != 0) { return 1; }
		}

		// Now we jump to the end of the whole block, store the reference and change the value of the "tze"
		this.instructions.push(new Instruction("tra(x);"));
		this.ifTraList.push([this.instructions.length - 1, this.blockScope]);
		this.instructions[tzeLine] = new Instruction("tze(" + (this.instructions.length + 1) + ");");

		return 0;
	}

	/**
	 * @description generate instructions in the block "else"
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private generateElse() {

		// we keep the current blockScope
		let blockScopeBeforeWhile = this.blockScope;
		while (!(new RegExp(/^\$[0-9]+\$\s*(end$)/).test(this.nilnoviProgram[this.nbLine + 1].trim()) && this.blockScope == blockScopeBeforeWhile)) {
			// recursive calling
			this.nbLine++;
			let returnValue = this.eval(this.nilnoviProgram[this.nbLine]);

			// Something got wrong
			if (returnValue != 0) { return 1; }
		}
		return 0;
	}

	//--------------------------------------------------------------------------------//


	//----------------------------- Expression Handling ------------------------------//

	/**
	 * @description checks for errors and generates the instructions for a "get" line
	 * @param string[] the words
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private generateGet(words: string[]) {

		// we check that there's one and only one parameter
		if (words.length != 5) {
			this.displayError(new CompilationError(508, "The method 'get' needs a unique parameter which is a variable", this.currentLineNb));
			return 1;
		}

		// we keep the variable to affect
		let variable = words[2];

		// we check that the given variable is defined
		if (!this.isVar(this.fullVariableName(variable))) {
			this.displayError(new CompilationError(508, "The method 'get' needs a unique parameter which is a variable", this.currentLineNb));
			return 1;
		}

		this.generateEmpiler(this.variableList.get(this.fullVariableName(variable)))

		// then we generate the "get" instruction
		this.instructions.push(new Instruction("get();"));

		// finally we update the variable with the fact that it has been affected
		this.variableList.get(this.fullVariableName(variable)).hasBeenAffected = true;
		return 0;
	}

	/**
	 * @description checks for errors and generates the instructions for a "put" line
	 * @param string[] the words
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private generatePut(words: string[]) {
		// we only keep the value to display
		words = tools.removeFromWords(words, 2, 2);

		// "put" need an unique parameter...
		if (words.length == 0) {
			this.displayError(new CompilationError(512, "The method 'put' needs a unique parameter", this.currentLineNb));
			return 1;
		}

		// ... which cannot be a procedure
		if (this.methodList.get(words[0]) !== undefined && this.methodList.get(words[0]).type == "none") {
			this.displayError(new CompilationError(512, "The method 'put' cannot call a procedure", this.currentLineNb));
			return 1;
		}

		// we analyze it
		let returnValue = this.analyzer(this.concatWords(words));
		if (returnValue != 0) { return returnValue; }

		// we check if there's any type error
		returnValue = this.syntaxAnalyzer(this.currentExpressionList);

		if (returnValue != 0) { return returnValue; }

		// we generate the corresponding instructions
		returnValue = this.generateInstructions(this.currentExpressionList, false);
		if (returnValue != 0) { return returnValue; }

		// finally we create the "put" instruction
		this.instructions.push(new Instruction("put();"));
		return 0;
	}

	/**
	 * @description defines the affectation
	 * @param string[] the list of words
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private affectation(words: string[]) {
		// the first word id our variable
		let variable = words[0];

		// Does it exist ?
		if (!this.isVar(this.fullVariableName(variable))) {
			console.log(variable);
			console.log(this.variableList);
			this.displayError(new CompilationError(503, variable + " is not defined", this.currentLineNb));
			return 1;
		}

		// Does it have the correct format ? (x := 4)
		let affectation = words[1] + words[2];
		if (affectation != ":=") {
			this.displayError(new CompilationError(502, ":= expected", this.currentLineNb));
			return 1;
		}

		// Let's remove the 3 first words (x, :, =) and the ";"
		words.splice(0, 3);
		words = tools.removeFromWords(words, 0, 1);

		let returnValue = this.analyzer(this.concatWords(words));
		if (returnValue != 0) { return returnValue; }

		// Now let's analyze the line and compare it to the corresponding type of our variable
		returnValue = this.syntaxAnalyzer(this.currentExpressionList, this.variableList.get(this.fullVariableName(variable)).type);

		// Something get wrong
		if (returnValue != 0) { return 1; }

		let fullVariableName = this.variableList.get(this.fullVariableName(variable));

		this.generateEmpiler(fullVariableName);


		returnValue = this.generateInstructions(this.currentExpressionList, false);
		if (returnValue != 0) { return returnValue; }
		this.instructions.push(new Instruction("affectation();"))

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
	private variableDeclaration(words: string[]) {

		// a tmp list which will contain the all the names of the variables
		var nameList: string[] = []

		// for each word in the given list
		words.forEach(word => {
			// if the word is "," or ":", do nothing
			if (word == "," || word == ":") { }

			// if the word is a type
			else if (word == "boolean" || word == "integer") {

				// for each saved names
				nameList.forEach(name => {

					// we will need to add the variable to the list
					this.variableList.add(new Variable(name, this.currentMethodName, word, false, this.methodList.get(this.currentMethodName).fakePileLength));
					this.methodList.get(this.currentMethodName).fakePileLength++;
				});

				// Then we need to save as much slots as variables 
				this.instructions.push(new Instruction("reserver(" + nameList.length + ");", word));
			}

			// else it's a variable
			else { nameList.push(word) }
		});

		return 0;
	}

	/**
	 * @description checks for errors and generates the instructions for an "end" line
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private generateEnd() {

		// for each "tra(x)" created before
		for (let i = this.ifTraList.length - 1; i >= 0; i--) {
			// for (const i in this.ifTraList) {
			let [tra, blockScope] = this.ifTraList[i];

			// if the instruction's scope is equal to the current blockScope
			if (blockScope == this.blockScope) {

				// if the jump is useful we update the "tra" with the right line number
				if (tra + 1 != this.instructions.length) {
					this.instructions[tra] = new Instruction("tra(" + (this.instructions.length + 1) + ");");

					// if it's not we remove the useless instruction
				} else {
					this.instructions.pop();

					//get the last tze
					let lastIndexTze = 0;
					for (let j = 0; j < this.instructions.length; j++) {
						let instruction = this.instructions[j];
						if (new RegExp(/tze\([0-9]+\)\;/).test(instruction.machineCode)) {
							lastIndexTze = j;
						}
					}

					// finally if an instruction was removed, we update the last "tze" to jump to the right line
					let nbLineTze: number = +this.instructions[lastIndexTze].machineCode.split("(")[1].split(")")[0];
					this.instructions[lastIndexTze].machineCode = "tze(" + (nbLineTze - 1) + ");";
				}
				this.ifTraList.pop();
			}
		}
		this.blockScope--;
		return 0;
	}

	/**
	 * @description checks for errors and generates the instructions for a "return" line
	 * @param string[] the words
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private generateReturn(words: string[]) {

		// Checking if it's a procedure
		if (this.methodList.get(this.currentMethodName).type == "none") {
			this.displayError(new CompilationError(510, "'return' cannot be used in a procedure", this.currentLineNb));
			return 1;
		}

		// we keep only the return value
		words = tools.removeFromWords(words, 1, 1);

		// then we analyse it
		let returnValue = this.analyzer(this.concatWords(words));
		if (returnValue != 0) { return returnValue; }

		// we check if there's any type error
		returnValue = this.syntaxAnalyzer(this.currentExpressionList, this.methodList.get(this.currentMethodName).type);

		if (returnValue != 0) { return returnValue; }

		// finally we generate the corresponding instructions
		returnValue = this.generateInstructions(this.currentExpressionList, false);
		this.returnRead = true;
		return returnValue;
	}

	//--------------------------------------------------------------------------------//


	//------------------------------- Syntax Analyzer --------------------------------//
	/**
		 * @description converts a list of ordered word into a list (left-right travelling of a binary tree) : [8,-,(,1,+,3,),*,4] => [8,1,3, +, 4,*,-]
		 * @param string the expression to consider
		 * @returns the output status
		 * @author Sébastien HERT
		 * @author Adam RIVIÈRE
		 */
	private analyzer(words: string[]) {

		// if the expression is composed of a single word
		if (words.length == 1) {

			// if the word is already known (method, variable, number or boolean)
			if (this.isValidNumber(words[0]) || this.isVar(this.fullVariableName(words[0])) || this.isMethod(words[0].split('(')[0]) || words[0] == "true" || words[0] == "false") {

				// we add it to the tree
				this.currentExpressionList.push(words[0]);
				return 0;
			}

			// else this is an error
			else {
				this.displayError(new CompilationError(501, words[0] + " is an unknown word", this.currentLineNb));
				return 1;
			}
		}

		if (words[0] == "-") { words[0] = "!" }

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
				words = tools.removeFromWords(words, 1, 1);
				let returnValue: number = this.analyzer(words);
				return returnValue;
			} else if (words[0] == "not") {
				words = tools.removeFromWords(words, 1, 0);
				let returnValue: number = this.analyzer(words);
				this.currentExpressionList.push("not");
				return returnValue;
			} else if (words[0] === undefined) { return 0 }
			else if (words.length == 2 && words[0] == "!") {
				let returnValue: number = this.analyzer(tools.removeFromWords(words, 1, 0));
				this.currentExpressionList.push("!");
				return returnValue;
			}

			// else, we should raise an error
			else { this.displayError(new CompilationError(501, words[0] + " is an unknown word", this.currentLineNb)); return 1; }
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
		for (let element of expression) {

			// if the word is a variable
			if (this.isVar(this.fullVariableName(element))) {

				// Let's check if it has already been affected to get its type
				if (!this.isAffected(this.fullVariableName(element))) {
					this.displayError(new CompilationError(504, element + " has not been affected before", this.currentLineNb));
					return 1;
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
		}

		// for each element in the list
		for (let i = 0; i < expressionCopy.length; i++) {
			let element = expressionCopy[i];

			// if the element is a known operator
			if (this.opDict[element] != undefined) {

				if (!this.opDict[element].isBinary) {

					// we split the expression in 2 : the operator and the term
					let typeA = expressionCopy[i - 1];
					let typeOp = this.opDict[element].inType

					if (typeA == typeOp) {
						expressionCopy[i] = this.opDict[element].outType;
						expressionCopy[i - 1] = "none";
					}
					else {
						if (element == "!") { element = "-"; }
						if (typeOp == "integer") { typeOp = "an " + typeOp; }
						this.displayError(new CompilationError(505, "wrong type : operator " + element + " requires " + typeOp, this.currentLineNb));
						return 1;
					}

				}

				else {
					// we split the expression in 3 : the operator and the two terms
					let typeA = expressionCopy[i - 2];
					let typeB = expressionCopy[i - 1];
					let typeOp = this.opDict[element].inType


					// if the types match
					if (typeA == typeB && (typeOp == "both" || typeOp == typeA)) {
						expressionCopy[i] = this.opDict[element].outType;
						expressionCopy[i - 1] = "none";
						expressionCopy[i - 2] = "none";
					}

					// else there is an error
					else {
						if (typeOp == "both") { typeOp = "2 integers or 2 booleans"; }
						else { typeOp = "2 " + typeOp + "s" }
						if (element == "!") { element = "-"; }
						this.displayError(new CompilationError(505, "wrong type : operator " + element + " requires " + typeOp, this.currentLineNb));
						return 1;
					}
				}


			}
		}

		// if the operator's out type isn't right
		if (expectedType !== undefined) {
			if (expectedType != expressionCopy.pop()) {
				this.displayError(new CompilationError(506, "Wrong expression type", this.currentLineNb));
				return 1;
			}
		}

		return 0;
	}

	//--------------------------------------------------------------------------------//


	//--------------------------- Instructions Generation ----------------------------//

	/**
		 * @description generates the instructions to translate the given expression
		 * @param string[] expression to translate
		 * @param boolean is it a parameter which is "in out" ?
		 * @param number (optional) the number of the parameter which has been read
		 * @param string (optional) the methodName 
		 * @returns the output status
		 * @author Sébastien HERT
		 * @author Adam RIVIÈRE
		 */
	private generateInstructions(expression: string[], isOut: boolean, nbParam?: number, methodName?: string) {

		let returnValue = 0;
		// for each word in the expression
		for (let i = 0; i < expression.length; i++) {
			let word = expression[i];

			// if the word is a valid number
			if (this.isValidNumber(word)) {
				if (isOut) {
					this.displayError(new CompilationError(509, "the method " + methodName + " requires a variable as its parameter nb " + nbParam, this.currentLineNb));
					return 1;
				}
				else { this.instructions.push(new Instruction("empiler(" + word + ");", "integer")); }

			}

			// if the word is a known operator
			else if (this.opDict[word] != undefined) {
				this.instructions.push(new Instruction(this.opDict[word].machineCode));
			}

			// if the word is a known variable
			else if (this.isVar(this.fullVariableName(word))) {
				let variable = this.variableList.get(this.fullVariableName(word));

				this.generateEmpiler(variable);

				// If we are waiting for valeurPile();
				if (!isOut) {
					this.instructions.push(new Instruction("valeurPile();"));
				}
			}

			// if the word is a boolean
			else if (word == "true") {
				this.instructions.push(new Instruction("empiler(1);", "boolean"));
			}
			else if (word == "false") {
				this.instructions.push(new Instruction("empiler(0);", "boolean"));
			}

			// else it's a method, we create a space in the instructions line to place those of the method
			else {

				// We need a blank currentExpressionList in order to call generateInstructionsMethod

				// First we need to store the values on a tmpList
				let tmp = this.currentExpressionList;

				// Then reset the currentExpressionList
				this.currentExpressionList = [];

				// And generate the instructions for the method
				returnValue = this.generateInstructionsMethod(word);
				if (returnValue != 0) { return 1 }

				// And then change currentExpressionList again
				this.currentExpressionList = tmp;

			}
		}

		// finally we reset the current expression
		this.currentExpressionList = [];
		return returnValue;
	}

	/**
	 * @description generates the instructions to call the given method with its parameters
	 * @param string method to call
	 * @returns the output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private generateInstructionsMethod(method: string) {

		// we split the method in words
		let words = tools.lineToWordsList(method);

		// if the list is empty we stop
		if (words.length == 0) { return 0; }

		// else we keep the list of parameters for the method
		let methodName = words[0];

		words = tools.removeFromWords(words, 2, 1);
		words = this.concatWords(words);

		let nbParamsRead = 0;
		let nbParamsExpected = this.methodList.get(methodName).params.length;
		let tmpWordsList: string[] = [];

		// we create the instruction to reserve a block in the pile before calling the method
		this.instructions.push(new Instruction("reserverBloc();"));

		// for each word
		for (let word of words) {

			// if the word is ","
			if (word == ",") {

				// we analyse the previous parameter as an expression
				let returnValue = this.analyzer(this.concatWords(tmpWordsList));
				if (returnValue != 0) { return returnValue; }

				// then we verify that there isn't too much parameters
				if (nbParamsRead >= nbParamsExpected) {
					this.displayError(new CompilationError(507, "the method " + methodName + " requires " + nbParamsExpected + " parameter(s) but got at least " + (nbParamsExpected + 1), this.currentLineNb));
					return 1;
				}

				// then we check the type of these parameters
				returnValue = this.syntaxAnalyzer(this.currentExpressionList,
					this.variableList.get(methodName + "." + this.methodList.get(methodName).params[nbParamsRead]).type);

				if (returnValue != 0) { return returnValue; }

				// finally we generate the instructions to get this parameter
				let isOut = this.variableList.get(methodName + "." + this.methodList.get(methodName).params[nbParamsRead]).isOut;
				if (isOut) { returnValue = this.generateInstructions(this.currentExpressionList, isOut, nbParamsRead, methodName); }
				else { returnValue = this.generateInstructions(this.currentExpressionList, isOut); }
				if (returnValue != 0) { return returnValue; }

				nbParamsRead++;
				tmpWordsList = [];
			}

			// else the word is a part of a parameter
			else { tmpWordsList.push(word); }

		}

		if (words.length > 0) { nbParamsRead++; }

		// then we process the last parameter as we did for the others
		let returnValue = this.analyzer(this.concatWords(tmpWordsList));

		if (returnValue != 0) { return returnValue; }

		// we check if there isn't too few parameters
		if (nbParamsRead != nbParamsExpected) {
			this.displayError(new CompilationError(507, "the method " + methodName + " requires " + nbParamsExpected + " parameter(s) but got " + (nbParamsRead), this.currentLineNb));
			return 1;
		}

		if (nbParamsExpected != 0) {
			returnValue = this.syntaxAnalyzer(this.currentExpressionList,
				this.variableList.get(methodName + "." + this.methodList.get(methodName).params[nbParamsRead - 1]).type);
			if (returnValue != 0) { return returnValue; }
		}

		if (nbParamsRead > 0) {
			let isOut = this.variableList.get(methodName + "." + this.methodList.get(methodName).params[nbParamsRead - 1]).isOut;
			// we generate the instructions for the method's parameters
			if (isOut) { returnValue = this.generateInstructions(this.currentExpressionList, isOut, nbParamsRead, methodName); }
			else { returnValue = this.generateInstructions(this.currentExpressionList, isOut); }

			if (returnValue != 0) { return returnValue; }
		}

		tmpWordsList = [];

		// finally we create the instruction to call the method with its beginning line and the number of parameters to get
		let methodLine = this.methodList.get(methodName).refLine + 1;
		this.instructions.push(new Instruction("traStat(" + methodLine + "," + nbParamsExpected + ");"));
		return 0;
	}

	private generateEmpiler(variable: Variable) {
		// if it's a parameter
		if (variable.isParameter) {
			// in out parameter
			if (variable.isOut) { this.instructions.push(new Instruction("empilerParam(" + variable.addPile + ");", "address")); }

			// in parameter
			else { this.instructions.push(new Instruction("empilerAd(" + variable.addPile + ");", "address")); }
		}

		else if (variable.methodName != "pp") { this.instructions.push(new Instruction("empilerAd(" + variable.addPile + ");", "address")); }

		// else if not
		else { this.instructions.push(new Instruction("empiler(" + variable.addPile + ");", "address")); }
	}

	//--------------------------------------------------------------------------------//


	//------------------------------------ Tools -------------------------------------//

	/**
	 * @description inits the dictionary of operators
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private initDict() {

		// we define every possible operator (boolean or integer)
		this.opDict["+"] = { inType: "integer", outType: "integer", machineCode: "add();", isBinary: true };
		this.opDict["-"] = { inType: "integer", outType: "integer", machineCode: "sous();", isBinary: true };
		this.opDict["*"] = { inType: "integer", outType: "integer", machineCode: "mult();", isBinary: true };
		this.opDict["/"] = { inType: "integer", outType: "integer", machineCode: "div();", isBinary: true };

		this.opDict["!"] = { inType: "integer", outType: "integer", machineCode: "moins();", isBinary: false };

		this.opDict["<"] = { inType: "integer", outType: "boolean", machineCode: "inf();", isBinary: true };
		this.opDict["<="] = { inType: "integer", outType: "boolean", machineCode: "infeg();", isBinary: true };
		this.opDict[">"] = { inType: "integer", outType: "boolean", machineCode: "sup();", isBinary: true };
		this.opDict[">="] = { inType: "integer", outType: "boolean", machineCode: "supeg();", isBinary: true };

		this.opDict["="] = { inType: "both", outType: "boolean", machineCode: "egal();", isBinary: true };
		this.opDict["/="] = { inType: "both", outType: "boolean", machineCode: "diff();", isBinary: true };

		this.opDict["and"] = { inType: "boolean", outType: "boolean", machineCode: "et();", isBinary: true };
		this.opDict["or"] = { inType: "boolean", outType: "boolean", machineCode: "ou();", isBinary: true };
		this.opDict["not"] = { inType: "boolean", outType: "boolean", machineCode: "non();", isBinary: false };
	}

	/**
	 * @description loads all parameters in the lists
	 * @param string[] the list of words
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 * @see variableDeclaration
	 */
	private parameterLoading(words: string[]) {

		// this function is pretty similar to variableDeclaration defined just above


		let nameList: string[] = []
		let isOut: boolean = false;

		// This time, we need a list of know words
		const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")", "return", "in", "out"]
		words.forEach(word => {
			let indexParam = 0;

			// If the word is a type
			if (word == "integer" || word == "boolean") {

				nameList.forEach(name => {
					this.variableList.add(new Variable(name, this.currentMethodName, word, true, this.methodList.get(this.currentMethodName).fakePileLength, indexParam, isOut));
					this.methodList.get(this.currentMethodName).fakePileLength++;
					indexParam++;
				});
				nameList = [];
				isOut = false;
			}
			if (word == "out") { isOut = true; }
			// else if it's a not a known word
			else if (!notParamList.includes(word) && word != words[1]) { nameList.push(word) }
		});
	}

	/**
	 * @description gets the parameters names
	 * @param string[] the line to consider
	 * @returns the names of the parameters
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private getParamNames(words: string[]) {
		let names: string[] = [];
		const notParamList = [",", ":", "integer", "boolean", "procedure", "function", "is", "(", ")", "return", "in", "out"]

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
	 * @description checks if an expression is a valid number
	 * @param string the expression to consider
	 * @returns a boolean
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private isValidNumber(str: string) { return new RegExp(/^[0-9]+$/).test(str); }

	/**
	 * @description checks if an expression is a known variable
	 * @param string the expression to consider
	 * @returns a boolean
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private isVar(str: string) { return (this.variableList.get(str) !== undefined); }

	/**
	 * @description checks if an expression is a known method
	 * @param string the expression to consider
	 * @returns a boolean
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private isMethod(str: string) { return (this.methodList.get(str) !== undefined); }

	/**
	 * @description checks if a variable already has a value
	 * @param string the variable to check
	 * @returns a boolean
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private isAffected(str: string) { return (this.variableList.get(str).hasBeenAffected); }

	/**
	 * @description gets the full name of a variable (method.variable)
	 * @param string the variable name
	 * @returns a boolean
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private fullVariableName(str: string) { return this.currentMethodName + "." + str; }

	/**
	 * @description groups the words meant to be together (methods with their parameters or two-characters operators)
	 * @param string the words to analyze
	 * @returns the new line
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
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

				// if it forms an operator with the next word
				if ((word == "<" || word == ">" || word == "/") && words[i + 1] == "=") {
					line.push(word + "=");
					i++;
				}
				else { line.push(word) }

			}

			// else if it's a method
			else if (this.isMethod(word) && words[i + 1] == "(") {
				inMethod = true;
				method += word;
			}

			else if (this.isVar(this.fullVariableName(word)) && !inMethod) {
				line.push(word);
			}

			// else we are in a method
			else {

				// we count the number of parentheses to catch the end of the method
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


	private displayError(error: CompilationError) {
		this.outputChannel.appendLine(error.message);
		this.outputChannel.show(true);
	}

	public displayInstructions() {
		let instructions = "";
		for (let i of this.instructions) {
			instructions += i.machineCode + "\n";
		}
		return instructions;
	}

	//--------------------------------------------------------------------------------//

}

//================================================================================//