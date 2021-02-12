//================================ Class Executor ================================//

//--------------------------------- Description ----------------------------------//
//
// This class describes how the nilnovi executor should work
//
//--------------------------------------------------------------------------------//

//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Simon JOURDAN
// Adam RIVIERE
//
//--------------------------------------------------------------------------------//

//----------------------------------- Imports ------------------------------------//

import * as vscode from "vscode";
import { Instruction } from "./compiler/Instruction";
import { Loader } from "./Loader";

//--------------------------------------------------------------------------------//

export class Executor {
	//------------------------------- Class Variables --------------------------------//


	public currentLineCpt = 0;
	public cptPile = 0;
	public pile: { value: number, type: string }[] = [];
	public base = -1;
	public output: vscode.OutputChannel;

	public instructions: Instruction[]

	private end = false;
	private panel: vscode.WebviewPanel;

	private maxRec = 100;
	private traRec : { [id: number]: {nbRec:number} } = {};
	private delay = 200;

	public onPause = false;

	private loader : Loader[]= [];

	//--------------------------------------------------------------------------------//

	//--------------------------------- Constructor ----------------------------------//

	constructor(instructions: Instruction[], output: vscode.OutputChannel, panel: vscode.WebviewPanel, delay: number = 200, maxRec:number = 100) {
		this.output = output;
		this.instructions = instructions;
		this.panel = panel;
		this.delay = delay;
		this.maxRec = maxRec;
	}

	//--------------------------------------------------------------------------------//

	//-------------------------------- Public Methods --------------------------------//

	/**
	   * @description Runs all the file line by line
	   * @author Sébastien HERT
	   */
	public async run() {

		// while not "FinProg" or error
		while (!this.end && !this.onPause) {
			
			// We need a copy of the pile
			let copyPile: { value: number, type: string }[] = [];
			this.pile.forEach(element => {
				copyPile.push({value : element.value, type:element.type});
			});

			// Storing the values
			this.loader.push(new Loader(this.currentLineCpt, this.cptPile, copyPile, this.base));

			// Evaluating current line
			let returnValue = await this.eval(this.instructions[this.currentLineCpt]);

			// An error occurs
			if (returnValue != 0) { this.stop(); }

			//We now need to update the web View
			this.updateWebView();

			// Then wait for the delay which is in ms
			await this.sleep(this.delay);
		}
	}

	//--------------------------------------------------------------------------------//

	//------------------------------ Processing Methods ------------------------------//

	/**
	 * @description evaluates Instruction.
	 * @param Instruction the instruction
	 * @returns the output status
	 * @author Sébastien HERT
	 */
	private async eval(instruction: Instruction) {

		let type = instruction.type;
		let method = "";

		// we need to format properly the method which will be called
		if (type !== undefined) { method = instruction.machineCode.replace(");", ",\"" + type + "\")"); }
		else { method = instruction.machineCode.replace(");", ")"); }

		// And then evaluate it and returning the output status
		const returnValue = await eval("this.evaluable_" + method);
		return returnValue;
	}

	/**
	 * @description stops the process
	 * @author Sébastien HERT
	 */
	public stop() { this.end = true; }

	/**
	 * @description resumes the process
	 * @author Sébastien HERT
	 */
	public resume() { this.onPause = false; this.run(); }

	/**
	 * @description pauses the process
	 * @author Sébastien HERT
	 */
	public pause(){ this.onPause = true; }

	/**
	 * @description execute the next line
	 * @author Sébastien HERT
	 * @author Adam RIVIERE
	 */
	public async next(){

		// if the program is paused and not ended
		if (this.onPause && !this.end){

			// We need a copy of the pile
			let copyPile: { value: number, type: string }[] = [];
			this.pile.forEach(element => {
				copyPile.push({value : element.value, type:element.type});
			});

			this.loader.push(new Loader(this.currentLineCpt, this.cptPile, copyPile, this.base));
	
			// Evaluating current line
			let returnValue = await this.eval(this.instructions[this.currentLineCpt]);
	
			// An error occurs
			if (returnValue != 0) { this.stop(); }

			//We now need to update the web View
			this.updateWebView();
	
		}
	}


	/**
	 * @description loads the previous status of pile
	 * @author Sébastien HERT
	 */
	public previous(){
		let loadingConfig = this.loader.pop();
		if (loadingConfig === undefined){return 0;}

		this.currentLineCpt = loadingConfig.currentLineCpt;
		this.cptPile = loadingConfig.cptPile;
		this.base = loadingConfig.base;
		this.pile = loadingConfig.pile;

		//We now need to update the web View
		this.updateWebView();
	}
	
	/**
	 * @description adds a couple in the pile
	 * @param number the value to add
	 * @param string the type of the value (boolean, integer, address...)
	 * @author Sébastien HERT
	 */
	private addToPile(value: number, type: string) { this.pile.push({ value: value, type: type }); }

	/**
	 * @description updates the webView
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 */
	private updateWebView() {
		this.panel.webview.postMessage({
			command: "showPile",
			pile: this.pile,
			pointer: this.cptPile,
			instructionLine: this.loader[this.loader.length -1].currentLineCpt +1
		});
	}

	/**
	 * @description sleeps for few ms
	 * @param number the delay in ms
	 * @returns Promise
	 * @author Sébastien HERT
	 */
	private sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * @description displays a string in the output channel
	 * @param string the string to display
	 * @author Sébastien HERT
	 */
	private display(str: string) {
		this.output.appendLine(str);
		this.output.show(true);
	}

	//--------------------------------------------------------------------------------//


	//-------------------------------- Errors Methods --------------------------------//

	/**
	 * @description raises an error with the pile
	 * @param string the message to display
	 * @author Sébastien HERT
	 */
	private pileError(str: string) {
		const currentLine = this.currentLineCpt + 1;
		this.display("ERROR at instruction " + currentLine + " : " + str);
	}

	/**
	 * @description raises an error if user tries to divide by zero
	 * @author Sébastien HERT
	 */
	private zeroDivisionError() {
		const currentLine = this.currentLineCpt + 1;
		this.display(
			"ERROR at instruction " + currentLine + " : division by zero."
		);
	}

	/**
	 * @description raises an error if the string given is not a number
	 * @param string the string which is not a number (can be undefined)
	 * @author Sébastien HERT
	 */
	private notNumberError(str: string | undefined) {
		const currentLine = this.currentLineCpt + 1;
		this.display(
			"ERROR at instruction " + currentLine + " : '" + str + "' is not a integer."
		);
	}

	/**
	 * @description raises an error if the maximum recursion has been reached
	 * @author Sébastien HERT
	 */
	private maxRecursionError() {
		const currentLine = this.currentLineCpt + 1;
		this.display(
			"ERROR at instruction " + currentLine + " :  Maximum recursion reached."
		);
	}


	/**
	 * @description raises an unknown error
	 * @param string the error
	 * @author Sébastien HERT
	 */
	private unknownError(error : string) {
		const currentLine = this.currentLineCpt + 1;
		this.display("ERROR at instruction " + currentLine + ".");
	}


	//--------------------------------------------------------------------------------//

	//-------------------------------- Nilnovi Methods -------------------------------//

	/**
	* @description Enables the beginning of the program
	* @return 0 (output status)
	* @author Sébastien HERT
	* @author Adam RIVIÈRE
	*/
	private evaluable_debutProg() {
		this.display("Début de Programme");
		this.currentLineCpt++;
		return 0;
	}

	/**
	* @description Enables the end of the program
	* @return 0 (output status)
	* @author Sébastien HERT
	* @author Adam RIVIÈRE
	*/
	private evaluable_finProg() {
		this.display("Fin de Programme");
		this.stop();
		return 0;
	}

	/**
	* @description Reserves n slots in the pile
	* @param number the number of slots to reserve
	* @param string the type as a string
	* @return 0 (output status)
	* @author Sébastien HERT
	* @author Adam RIVIÈRE
	*/
	private evaluable_reserver(n: number, type: string) {

		// Let's add n "0" in the pile with their corresponding type
		for (let i = 0; i < n; i++) { this.addToPile(0, type); }
		this.cptPile += n;
		this.currentLineCpt++;
		return 0;
	}

	/**
	* @description stacks the value n at the top of the pile
	* @param number the number to stack
	* @param type the type of the number to stack
	* @return 0 (output status)
	* @author Sébastien HERT
	* @author Adam RIVIÈRE
	*/
	private evaluable_empiler(n: number, type: string) {
		this.addToPile(n, type);
		this.cptPile++;
		this.currentLineCpt++;
		return 0;
	}

	/**
	 * @description affects the last value in the pile to the penultimate value
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_affectation() {

		// Let's imagine we have a := b

		// First we need to get a and b
		const b = this.pile.pop();
		const a = this.pile.pop();


		// Then we check if everything is ok (it should be)
		if (
			a === undefined ||
			a.value < 0 ||
			a.value > this.pile.length ||
			b === undefined
		) {
			this.pileError("Address isn't is the pile");
			return 1;
		}

		// then we change the value of the address of a
		try { this.pile[a.value].value = b.value; }
		catch (error) {
			this.unknownError(error);
			return 1;
		}
		this.cptPile -= 2;
		this.currentLineCpt++;
		return 0;
	}

	/**
	 * @description gets the value of the top of the pile considered as a address
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_valeurPile() {

		// the address is a the top of the pile
		const address = this.pile.pop();
		this.cptPile--;

		// We need to check if everything is ok
		if (address === undefined || address.value < 0 || address.value > this.pile.length) {
			this.pileError("Address isn't is the pile");
			return 1;
		}

		// Then it is, we need now to get the value and the pile of the variable which has this address
		const newVariable = this.pile[address.value];
		return this.evaluable_empiler(newVariable.value, newVariable.type);
	}

	/**
	 * @description waits for the user input and affects if to the corresponding variable, which has its address on top of the pile
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private async evaluable_get() {

		// Let's define a function to get the input entered by the user.
		async function getInputValue() {
			let res = await vscode.window.showInputBox({
				placeHolder: "",
				prompt: "Please enter an integer.",
			});
			if (res === undefined) { return ""; }
			else { return res; }
		}

		// Then let's wait for the input
		let inputString = await getInputValue();

		// First we need to be sure there is no problem with the input string
		if (inputString === undefined) {
			return 1;
		}

		// We now need to parse our inputString
		let inputNumber: number = parseInt(inputString);
		let inputFloat: number = parseFloat(inputString);

		// If it's not a number
		if (isNaN(inputNumber) || inputNumber != inputFloat) {
			this.notNumberError(inputString);
			return 1;
		}

		// It's a number, so let's get the variable address
		const address = this.pile.pop();
		this.cptPile--;

		// Now we want to be sure the address is in the pile
		if (address === undefined || address.value < 0 || address.value > this.pile.length) {
			this.pileError("Address isn't is the pile");
			return 1;
		}

		// Finally, we could change the variable value
		this.pile[address.value].value = inputNumber;
		this.currentLineCpt++;

		return 0;
	}

	/**
	 * @description displays a which is the top of the pile
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_put() {

		// Get a
		const a = this.pile.pop();

		// Check if a exists (if not, we need to raise an error)
		if (a === undefined) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		this.cptPile--;
		this.currentLineCpt++;

		// if a is boolean, we want to see "true" or "false" and not 1 or 0
		if (a.type == "boolean") {
			if (a.value == 0) { this.display("false"); }
			else { this.display("true"); }
		}

		// else a is integer, we just need to display it
		else { this.display(a.value.toString()); }

		return 0;
	}

	/**
	 * @description stacks -a on top of the pile, where a is on top of the pile
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_moins() {

		// First, checking the length of the pile
		if (this.pile.length < 1) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		// let's get a
		let a = this.pile.pop();
		this.cptPile--;
		if (a === undefined) { return 1; }

		return this.evaluable_empiler(-a.value, "integer");
	}


	/**
	 * @description stacks a - b on top of the pile, where b is on top of the pile and a just below
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_sous() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(a.value - b.value, "integer");
	}


	/**
	 * @description stacks a + b on top of the pile, where b is on top of the pile and a just below
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_add() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(a.value + b.value, "integer");
	}

	/**
	 * @description stacks a * b on top of the pile, where b is on top of the pile and a just below
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_mult() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(a.value * b.value, "integer");
	}

	/**
	 * @description stacks a // b on top of the pile, where b is on top of the pile, a just below and // is the euclidean division 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_div() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }

		if (b.value == 0) {
			this.zeroDivisionError();
			return 1;
		}
		return this.evaluable_empiler(Math.floor(a.value / b.value), "integer");
	}

	/**
	 * @description stacks a == b on top of the pile, where b is on top of the pile, a just below 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_egal() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(Number(a.value == b.value), "boolean");
	}

	/**
	 * @description stacks a != b on top of the pile, where b is on top of the pile, a just below 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_diff() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(Number(!(a.value == b.value)), "boolean");
	}

	/**
	 * @description stacks a < b on top of the pile, where b is on top of the pile, a just below 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_inf() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(Number(a.value < b.value), "boolean");
	}

	/**
	 * @description stacks a <= b on top of the pile, where b is on top of the pile, a just below 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_infeg() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }

		return this.evaluable_empiler(Number(a.value <= b.value), "boolean");
	}

	/**
	 * @description stacks a > b on top of the pile, where b is on top of the pile, a just below 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_sup() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(Number(a.value > b.value), "boolean");
	}

	/**
	 * @description stacks a >= b on top of the pile, where b is on top of the pile, a just below 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_supeg() {
		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(Number(a.value >= b.value), "boolean");
	}

	/**
	 * @description stacks a && b on top of the pile, where b is on top of the pile, a just below 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_et() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(Number(a.value && b.value), "boolean");
	}

	/**
	 * @description stacks a || b on top of the pile, where b is on top of the pile, a just below 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Adam RIVIÈRE
	 */
	private evaluable_ou() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		return this.evaluable_empiler(Number(a.value || b.value), "boolean");
	}

	/**
	 * @description stacks !a on top of the pile, where a is on top of the pile 
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 * @author Adam RIVIÈRE
	 */
	private evaluable_non() {

		if (this.pile.length < 1) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let a = this.pile.pop();

		this.cptPile -= 1;

		if (a === undefined) { return 1; }
		return this.evaluable_empiler(Number(!a.value), "boolean");
	}

	/**
	 * @description jumps to the line n
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 * @author Adam RIVIÈRE
	 */
	private evaluable_tra(n: number) {

		// if it's the first time we see this tra
		if (this.traRec[n] === undefined){
			this.traRec[n] = {nbRec : 1}
		}
		
		// else if we have reached the maximum recursion
		else if (this.traRec[n].nbRec == this.maxRec){
			this.maxRecursionError();
			return 1
		}

		// else let's increments the counter of this tra
		else { this.traRec[n].nbRec++; }

		this.currentLineCpt = n - 1;
		return 0;
	}

	/**
	 * @description jumps to the line if the condition on top of the pile is false
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 * @author Adam RIVIÈRE
	 */
	private evaluable_tze(n: number) {
		
		let a = this.pile.pop();
		this.cptPile -= 1;

		if (a === undefined) { return 1; }

		if (a.value == 0) {return this.evaluable_tra(n); }
		else {
			this.currentLineCpt++;
			return 0;
		}
	}

	/**
	 * @description stacks the local value of the variable which has the local address n (used in methods)
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 * @author Adam RIVIÈRE
	 */
	private evaluable_empilerAd(n: number) { return this.evaluable_empiler(this.base + 2 + n, "address"); }

	/**
	 * @description stacks the global value of the variable which has the local address n (used in methods)
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 * @author Adam RIVIÈRE
	 */
	private evaluable_empilerParam(n: number) {
		// Let's read the variable which has the local address n, which is n + 2 (length of our linking block) + base (length of the main block)
		let v = this.pile[this.base + 2 + n];
		return this.evaluable_empiler(v.value, v.type);
	}

	/**
	 * @description indicates the end of a procedure
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 * @author Adam RIVIÈRE
	 */
	private evaluable_retourProc() {

		// First we need to erase the local value from the current procedure block
		while (this.pile[this.cptPile - 1].type != "topBlock") {
			this.pile.pop();
			this.cptPile -= 1;
		}

		// Now, on top of the pile, we have 2 elements

		// the topBlock which contains the next line of the next line
		let topBlock = this.pile.pop();
		this.cptPile -= 1;
		if (topBlock === undefined) { return 1; }
		let returnValue = this.evaluable_tra(topBlock.value);
		if (returnValue != 0) { return 1; }

		// the bottomBlock which contains the line which refers to the base which called the function
		let b = this.pile.pop();
		this.cptPile -= 1;
		if (b === undefined) { return 1; }
		this.base = b.value;

		return 0;
	}

	/**
	 * @description indicates the end of a function
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 * @author Adam RIVIÈRE
	 * @see evaluable_retourProc
	 */
	private evaluable_retourFonct() {

		// very similar to evaluable_retourProc() but we also need to get the element on top of the pile before removing all the values, and at the end stack this element again
		let a = this.pile.pop();
		this.cptPile--;
		let returnValue = this.evaluable_retourProc();
		if (returnValue != 0 || a === undefined) { return 1; }
		this.currentLineCpt--;
		return this.evaluable_empiler(a.value, a.type);
	}

	/**
	 * @description allocates 2 slots for a block (before calling methods)
	 * @param Type description
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 * @author Adam RIVIÈRE
	 * @see evaluable_traStat
	 */
	private evaluable_reserverBloc() {

		// the bottomBlock stacks the reference to the current base
		let returnValue = this.evaluable_empiler(this.base, "bottomBlock");
		if (returnValue != 0) { return 1; }

		// the topBlock stacks the next line (which will be affected in evaluable_traStat())
		returnValue = this.evaluable_empiler(0, "topBlock");
		if (returnValue != 0) { return 1; }

		this.currentLineCpt--;
		return 0;
	}

	/**
	 * @description refers to a method line with nbParam parameters
	 * @param number l the line of the method
	 * @param number p the number of parameters
	 * @returns output status
	 * @author Sébastien HERT
	 * @author Simon JOURDAN
	 * @author Adam RIVIÈRE
	 * @see evaluable_tra
	 */
	private evaluable_traStat(line: number, nbParam: number) {
		// Let's affect the topBlock value
		this.pile[this.cptPile - nbParam - 1].value = this.currentLineCpt + 2; //affectation topBlock
		this.base = (this.cptPile - nbParam) - 2;
		return this.evaluable_tra(line);
	}

	//--------------------------------------------------------------------------------//
}
//================================================================================//
