//============================== Class Instruction ===============================//


//--------------------------------- Description ----------------------------------//
//
// This object contains both the machine code and the type of the potential value
// on the top of the pile
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//

export class Instruction {


	//------------------------------- Class Variables --------------------------------//

	public machineCode: string;
	public type: string | undefined = undefined;


	//--------------------------------------------------------------------------------//


	//--------------------------------- Constructor ----------------------------------//

	constructor(machineCode: string, type?: string) {
		this.machineCode = machineCode;
		if (type !== undefined) { this.type = type }
	}

	//--------------------------------------------------------------------------------//


	//----------------------------------- Methods ------------------------------------//

	public toString(): string {
		if (this.type === undefined){return this.machineCode}
		else{return this.machineCode + ' -> ' + this.type;}
	}

	//--------------------------------------------------------------------------------//


}
//================================================================================//