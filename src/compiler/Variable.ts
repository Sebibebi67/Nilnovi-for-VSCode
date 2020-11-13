//================================ Class Variable=== =============================//

//--------------------------------- Description ----------------------------------//
//
// This is a structures which describes the fields of a variable
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

export class Variable {
	//------------------------------- Class Variables --------------------------------//

	public name: string;
	public addPile: number;
	public methodName : string
	// public scope: number = -1;
	public type: string;
	public isParameter: boolean;
	public parameterIndex: number = -1;

	//--------------------------------------------------------------------------------//

	//--------------------------------- Constructor ----------------------------------//

	constructor(name: string, methodName : string, type: string, isParameter: boolean, addPile: number, parameterIndex?:number) {
		this.name = name;
		this.type = type;
		this.methodName = methodName;
		if (!(parameterIndex === undefined)) { this.parameterIndex = parameterIndex; }
		this.addPile = addPile;
		// if (!(scope === undefined)) { this.scope = scope; }
		this.isParameter = isParameter;

		if (isParameter){}
	}

	//--------------------------------------------------------------------------------//

	//----------------------------------- Methods ------------------------------------//
	//
	//--------------------------------------------------------------------------------//
}
  //================================================================================//