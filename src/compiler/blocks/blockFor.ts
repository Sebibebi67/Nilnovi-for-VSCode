//================================ Class blockFor ================================//



//--------------------------------- Description ----------------------------------//
//
// This is a structure which describes the block For
//
//--------------------------------------------------------------------------------//


//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
// Adam RIVIÈRE
//
//--------------------------------------------------------------------------------//


//----------------------------------- Imports ------------------------------------//

import { Variable } from "../tables/Variable";
import { blockWhile } from "./blockWhile";

//--------------------------------------------------------------------------------//


export class blockFor extends blockWhile{


	//------------------------------- Class Variables --------------------------------//	
	
	public variable : Variable;

	//--------------------------------------------------------------------------------//
	
	
	//--------------------------------- Constructor ----------------------------------//
	
		constructor(variable : Variable){
			super();
			this.variable = variable;
		}
	
	//--------------------------------------------------------------------------------//
	
	
	//----------------------------------- Methods ------------------------------------//
	//
	//--------------------------------------------------------------------------------//
	
	
	}
	//================================================================================//