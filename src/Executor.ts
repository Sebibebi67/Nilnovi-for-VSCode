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

//--------------------------------------------------------------------------------//

export class Executor {
	//------------------------------- Class Variables --------------------------------//

	public currentLineCpt = 0;
	public cptPile = 0;
	// public pile: [number, string][] = [];
	public pile: { value: number, type: string }[] = [];
	public base = -1;
	public output: vscode.OutputChannel;


	public instructions: Instruction[]

	private lines: string[] = [];
	private end = false;
	private panel:vscode.WebviewPanel;

	//--------------------------------------------------------------------------------//

	//--------------------------------- Constructor ----------------------------------//

	constructor(instructions: Instruction[], output: vscode.OutputChannel, panel:vscode.WebviewPanel) {
		this.output = output;
		this.instructions = instructions;
		this.panel = panel;

		this.run(1000);

	}

	//--------------------------------------------------------------------------------//

	//-------------------------------- Public Methods --------------------------------//



	/**
	   * @description Runs the file previously loaded
	   * @param number (Optional) The delay
	   * @author Sébastien HERT
	   */
	public async run(delay?: number) {

		// resets the global values
		this.reset();

		// while not "FinProg" or error
		while (!this.end) {

			// Evaluating current line
			let returnValue = await this.eval(this.instructions[this.currentLineCpt]);
			// An error occurs
			if (delay !== undefined){await this.delay(delay);}

			if (returnValue != 0) {
				// console.log(this.pile);
				this.stop();
			}
			
			this.updateWebView();


			// await this.delay(delay);
		}
	}

	//--------------------------------------------------------------------------------//

	//-------------------------------- Private Methods -------------------------------//

	private async eval(instruction: Instruction) {
		// console.log(instruction)


		let type = instruction.type;
		let method = "";

		// console.log(type);
		
		if (type !== undefined) { method = instruction.machineCode.replace(");", ",\"" + type + "\")"); }
		else { method = instruction.machineCode.replace(");", ")"); }

		// console.log(method);

		console.log(method);
		const returnValue = await eval("this.evaluable_" + method);
		if (returnValue != 0) { return 1; }
		return 0;
	}

	private stop() {
		this.end = true;
	}

	private reset() {
		this.end = false;
		this.currentLineCpt = 0;
		// this.commentedState = this.commentedStates.NOT_COMMENTED;
	}

	private pileError(str: string) {
		const currentLine = this.currentLineCpt + 1;
		this.output.appendLine("ERROR at line " + currentLine + " : " + str);
	}

	private zeroDivisionError() {
		const currentLine = this.currentLineCpt + 1;
		this.output.appendLine(
			"ERROR at line " + currentLine + " : division by zero."
		);
	}

	private addToPile(value:number, type:string){
		this.pile.push({value:value, type : type});
	}

	private updateWebView(){
		this.panel.webview.postMessage({ command: "showPile", pile: this.pile, pointer: this.cptPile, instructionLine : this.currentLineCpt+1, instruction :this.instructions[this.currentLineCpt].machineCode });
	}

	private delay(ms: number) {
		return new Promise( resolve => setTimeout(resolve, ms) );
	}

	//--------------------------------------------------------------------------------//

	//-------------------------------- Nilnovi Methods -------------------------------//

	/**
	* @description Enables the beginning of the program
	* @return output status
	* @author Sébastien HERT
	*/
	private evaluable_debutProg() {
		this.output.appendLine("Début de Programme");
		this.currentLineCpt++;
		return 0;
	}

	/**
	* @description Enables the end of the program
	* @return output status
	* @author Sébastien HERT
	*/
	private evaluable_finProg() {
		this.output.appendLine("Fin de Programme");
		this.stop();
		return 0;
	}

	/**
	* @description Reserves n slots in the pile
	* @param number the number of slots to reserve
	* @return output status
	* @author Sébastien HERT
	*/
	private evaluable_reserver(n: number, type: string) {
		for (let i = 0; i < n; i++) {
			this.addToPile(0, type);
		}
		this.cptPile += n;
		this.currentLineCpt++;
		return 0;
	}

	/**
	* @description stacks the value n at the top of the pile
	* @param number the number to stack
	* @param type the type of the number to stack
	* @return output status
	* @author Sébastien HERT
	*/
	private evaluable_empiler(n: number, type: string) {
		// let type = this.instructions[this.currentLineCpt].type;addToPile(
		this.addToPile(n, type);
		this.cptPile++;
		this.currentLineCpt++;
		return 0;
	}

	private evaluable_affectation() {

		const value = this.pile.pop();
		const address = this.pile.pop();

		// if (value === undefined || address === undefined) {
		// 	console.error("affectation problem");
		// 	return 1;
		// }

		if (
			address === undefined ||
			address.value < 0 ||
			address.value > this.pile.length ||
			value === undefined
		) {
			this.pileError("Address isn't is the pile");
			return 1;
		}

		try {
			this.pile[address.value].value = value.value;
		} catch (error) {
			console.log(error);
			this.stop();
			return 1;
		}
		this.cptPile -= 2;
		this.currentLineCpt++;
		return 0;
	}

	private evaluable_valeurPile() {

		const address = this.pile.pop();
		this.cptPile--;

		if (address === undefined || address.value < 0 || address.value > this.pile.length) {
			this.pileError("Address isn't is the pile");
			return 1;
		}

		// if (address === undefined) {
		// 	console.error("valeurPile problem");
		// 	return 1;
		// }

		const value = this.pile[address.value].value;
		const type = this.pile[address.value].type;
		return this.evaluable_empiler(value, type);
	}

	private async evaluable_get() {

		// if (this.pile.length < 1) {
		// 	this.pileError("Pile doesn't have enough elements.");
		// 	return 1;
		// }

		async function getInputValue() {
			let res = await vscode.window.showInputBox({
				placeHolder: "",
				prompt: "Please enter an integer.",
			});
			if (res === undefined) { return ""; }
			else { return res; }
		}

		let inputString = await getInputValue();

		if (inputString === undefined) {
			console.log("inputBox is undefined");
			this.currentLineCpt++;
			return 0;
		}

		let inputNumber: number = parseInt(inputString);

		// if (isNaN(inputNumber)) {
		// 	this.notNumberError(inputString);
		// 	return 1;
		// }

		const address = this.pile.pop();
		this.cptPile--;

		if (address === undefined || address.value < 0 || address.value > this.pile.length) {
			this.pileError("Address isn't is the pile");
			return 1;
		}

		// if (address === undefined){return 1}

		this.pile[address.value].value = inputNumber;
		this.currentLineCpt++;

		return 0;
	}

	private evaluable_put() {
		const value = this.pile.pop();

		if (value === undefined) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		this.cptPile--;
		this.currentLineCpt++;
		if (value.type == "boolean") {
			if (value.value == 0) {this.output.appendLine("false");}
			else{this.output.appendLine("true");}
		}
		else{this.output.appendLine(value.value.toString());}
		
		return 0;
	}

	private evaluable_moins() {

		if (this.pile.length < 1) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let value = this.pile.pop();
		this.cptPile--;
		if (value === undefined) { return 1; }

		return this.evaluable_empiler(-value, "integer");
	}

	private evaluable_sous() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }

		return this.evaluable_empiler(b.value - a.value, "integer");
	}

	private evaluable_add() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }

		return this.evaluable_empiler(b.value + a.value, "integer");
	}

	private evaluable_mult() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }

		return this.evaluable_empiler(b.value * a.value, "integer");
	}
	private evaluable_div() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }

		if (a.value == 0) {
			this.zeroDivisionError();
			return 1;
		}

		return this.evaluable_empiler(Math.floor(b.value / a.value), "integer");
	}

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

	private evaluable_inf() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }

		// console.log(a.value < b.value);
		// console.log(Number(a.value < b.value));

		return this.evaluable_empiler(Number(a.value < b.value), "boolean");
	}

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

	private evaluable_et() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		//   if (a[0] != 0 && a[0] != 1) {
		// 	this.notBooleanError(a);
		// 	return 1;
		//   }
		//   if (b[0] != 0 && b[0] != 1) {
		// 	this.notBooleanError(b);
		// 	return 1;
		//   }

		return this.evaluable_empiler(Number(b.value && a.value), "boolean");
	}

	private evaluable_ou() {

		if (this.pile.length < 2) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let b = this.pile.pop();
		let a = this.pile.pop();

		this.cptPile -= 2;

		if (a === undefined || b === undefined) { return 1; }
		//   if (a[0] != 0 && a[0] != 1) {
		// 	this.notBooleanError(a);
		// 	return 1;
		//   }
		//   if (b[0] != 0 && b[0] != 1) {
		// 	this.notBooleanError(b);
		// 	return 1;
		//   }

		return this.evaluable_empiler(Number(b.value || a.value), "boolean");
	}

	//Simon à partir d'ici

	private evaluable_non() {

		if (this.pile.length < 1) {
			this.pileError("Pile doesn't have enough elements.");
			return 1;
		}

		let a = this.pile.pop();

		this.cptPile -= 1;

		if (a === undefined) { return 1; }
		//   if (a[0] != 0 && a[0] != 1) {
		// 	this.notBooleanError(a);
		// 	return 1;
		//   }

		return this.evaluable_empiler(Number(!a.value), "boolean");
	}

	private evaluable_tra(n: number) {
		this.currentLineCpt = n - 1;
		return 0;
	}

	private evaluable_tze(n: number) {
		let a = this.pile.pop();

		this.cptPile -= 1;

		if (a === undefined) { return 1; }

		if (a.value == 0) { return this.evaluable_tra(n); }
		else {
			this.currentLineCpt++;
			return 0;
		}

	}

	// private evaluable_erreur(exp: string) {
	// 	this.output.appendLine("TODO");
	// 	this.currentLineCpt++;
	// 	return 0;
	// }

	private evaluable_empilerAd(n: number) {
		// this.currentLineCpt++;
		return this.evaluable_empiler(this.base + 2 + n, "address");
	}

	private evaluable_empilerParam(n: number) {
		let v = this.pile[this.base + 2 + n]; //On lit le couple situé à l'adresse n au dessus du bloc courant
		// this.currentLineCpt++;
		return this.evaluable_empiler(v.value, v.type);
	}

	private evaluable_retourProc() {
		while (this.pile[this.cptPile - 1].type != "topBlock") {	//Efface les valeurs au dessus du bloc de liaison
			this.pile.pop();
			this.cptPile -= 1;
		}

		let t = this.pile.pop();	//Traitement du topBlock
		this.cptPile -= 1;
		if (t === undefined) { return 1; }
		let returnValue = this.evaluable_tra(t.value);
		if (returnValue != 0) { return 1; }

		let b = this.pile.pop();	//Traitement du bottomBlock
		this.cptPile -= 1;
		if (b === undefined) { return 1; }
		this.base = b.value;

		return 0;
	}

	private evaluable_retourFonct() {
		let a = this.pile.pop();
		this.cptPile--;
		let returnValue = this.evaluable_retourProc();
		if (returnValue != 0 || a === undefined) { return 1; }
		this.currentLineCpt--;
		return this.evaluable_empiler(a.value, a.type);
	}

	private evaluable_reserverBloc() {
		let returnValue = this.evaluable_empiler(this.base, "bottomBlock");
		if (returnValue != 0) { return 1; }
		returnValue = this.evaluable_empiler(0, "topBlock");
		if (returnValue != 0) { return 1; }
		this.currentLineCpt--;
		return 0;
	}

	private evaluable_traStat(n: number, t: number) {
		this.pile[this.cptPile - t - 1].value = this.currentLineCpt + 2; //affectation topBlock
		this.base = (this.cptPile - t) - 2;
		return this.evaluable_tra(n);
	}

	//--------------------------------------------------------------------------------//
}
//================================================================================//
