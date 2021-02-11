//================================= Class Method =================================//



//--------------------------------- Description ----------------------------------//
//
// This is a structure which describes the fields of a function or a procedure 
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//

export class Method {


	//------------------------------- Class Variables --------------------------------//

	public name: string;
	public type: string;
	public refLine: number;
	public params: string[];
	public fakePileLength = 0;


	//--------------------------------------------------------------------------------//


	//--------------------------------- Constructor ----------------------------------//

	constructor(name: string, type: string, refLine: number, params: string[]) {
		this.name = name;
		this.type = type;
		this.refLine = refLine;
		this.params = params;
	}

	//--------------------------------------------------------------------------------//

}
//================================================================================//