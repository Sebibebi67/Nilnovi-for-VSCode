//================================= Class Loader =================================//


//--------------------------------- Description ----------------------------------//
//
// This class allows us to save the status of the pile after each instructions,
// which is very useful for the next and the previous step.
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
//
//--------------------------------------------------------------------------------//



export class Loader {


	//------------------------------- Class Variables --------------------------------//

	public currentLineCpt: number;
	public cptPile: number;
	public pile: { value: number, type: string }[];
	public base: number;

	//--------------------------------------------------------------------------------//


	//--------------------------------- Constructor ----------------------------------//

	constructor(currentLineCpt: number, cptPile: number, pile: { value: number, type: string }[], base: number) {
		this.currentLineCpt = currentLineCpt;
		this.cptPile = cptPile;
		this.pile = pile;
		this.base = base;
	}
	//--------------------------------------------------------------------------------//

}
//================================================================================//