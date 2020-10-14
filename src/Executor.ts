//================================ Class Executor ================================//

//--------------------------------- Description ----------------------------------//
//
// This class describes how the nilnovi executor should work
//
//--------------------------------------------------------------------------------//

//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
//
//--------------------------------------------------------------------------------//

//----------------------------------- Imports ------------------------------------//

import * as vscode from "vscode";

//--------------------------------------------------------------------------------//

export class Executor {
  //------------------------------- Class Variables --------------------------------//

  public currentLineCpt = 0;
  public pile: number[] = [];
  public base = -1;
  public cptPile = -1;
  public output: vscode.OutputChannel;

  private lines: string[] = [];
  private end = false;

  //--------------------------------------------------------------------------------//

  //--------------------------------- Constructor ----------------------------------//

  constructor(output : vscode.OutputChannel) {
    
    this.output = output;
  }

  //--------------------------------------------------------------------------------//

  //-------------------------------- Public Methods --------------------------------//

  /**
   * @description Loads and converts the file into an array of strings, one string per line. It also removes the block of comments
   * @param String The file which should be loaded
   * @author Sébastien HERT
   */
  public loadingFile(file: string) {
    // First, we will remove all the blocks of comments and replace them by empty lines, then filling our array of lines
    // const regex = /\/\*(.|[\r\n])*\*\//;
    this.lines = file.split(/\r?\n/);

    var commentedBlock = false;

    this.lines.forEach((line) => {
      line.trim();
      if (line.includes("/*") && commentedBlock == false) {
        if (!line.startsWith('erreur("')) {
          line.replace("/*", "#");
          commentedBlock = true;
        } else {
        }
      }
    });
    console.log(this.lines);
  }

  /**
   * @async
   * @description Runs the file previously loaded
   * @param Number The delay (optional)
   * @author Sébastien HERT
   */
  public async run(delay?: number) {
    // resets the global values
    this.reset();

    // while not "FinProg" or error
    while (!this.end) {
      // Evaluating current line
      const returnValue = await this.eval(this.lines[this.currentLineCpt]);

      // An error occurs
      if (returnValue != 0) {
        this.stop();
      }
    }
  }

  //--------------------------------------------------------------------------------//

  //-------------------------------- Private Methods -------------------------------//

  /**
   * @async
   * @description evaluates the current line
   * @param String line
   * @author Sébastien HERT
   */
  private async eval(line: string) {
    // First, we need to remove the spaces at begin and end of the line
    line = line.trim();

    // if the line is empty or commented
    if (line.length == 0 || line.startsWith("#")) {
      this.currentLineCpt++;
      return 0;
    }

    let method = line.split(";")[0].split("=>")[0];
    // User cannot use word "undefined", except for the "erreur" method
    let arg = line.split("(")[1].split(")")[0];
    if (arg.includes("undefined") && !method.includes("erreur")) {
      this.wordUndefinedUseError();
      return 1;
    }

    // checks if the line is commented or empty
    if (!(line.length == 0) && !line.startsWith("#")) {
      try {
        const returnValue = await eval("this.evaluable_" + method);
        if (returnValue != 0) {
          return 1;
        }
      } catch (error) {
        if (error.message.endsWith("is not a function")) {
          this.functionNotDefinedError(method.split("(")[0]);
          return 1;
        }

        if (error.name == "SyntaxError") {
          this.syntaxError();
          return 1;
        }

        if (error.name == "ReferenceError") {
          this.referenceError(error.message);
          return 1;
        }

        this.unknownError();
        console.log(error);
        return 1;
      }
    } else {
      // else, we should increase the currentLineCpt
      this.currentLineCpt++;
    }
    return 0;
  }

  /**
   * @description ends the program
   * @author Sébastien HERT
   */
  private stop() {
    this.end = true;
  }

  /**
   * @description Resets the class values
   * @author Sébastien HERT
   */
  private reset() {
    this.end = false;
    this.currentLineCpt = 0;
    this.pile = [];
    this.cptPile = 0;
    this.base = -1;
  }

  private paramsError(name: string, nbOfParams: number) {
    const currentLine = this.currentLineCpt + 1;
    const methodName = name.split("_")[1];
    this.output.appendLine(
      "ERROR at line " +
        currentLine +
        " : Method " +
        methodName +
        " requires " +
        nbOfParams +
        " parameter(s)."
    );
    this.stop();
  }

  private wordUndefinedUseError() {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine(
      "ERROR at line " +
        currentLine +
        ' : Please do not use the word "undefined"'
    );
    this.stop();
  }

  private functionNotDefinedError(name: string) {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine(
      "ERROR at line " + currentLine + " : Method " + name + " is not defined."
    );
  }

  private syntaxError() {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine("ERROR at line " + currentLine + " : Syntax Error.");
  }

  private referenceError(message: string) {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine("ERROR at line " + currentLine + " : " + message);
  }

  private notValidNumberError(n: number) {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine(
      "ERROR at line " + currentLine + " : " + n + " is not a valid number."
    );
  }

  private pileError(str: string) {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine("ERROR at line " + currentLine + " : " + str);
  }

  private notNumberError(str: string | undefined) {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine(
      "ERROR at line " + currentLine + " : '" + str + "' is not a number."
    );
  }
  private zeroDivisionError() {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine(
      "ERROR at line " + currentLine + " : division by zero."
    );
  }

  private notBooleanError(n: number) {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine(
      "ERROR at line " +
        currentLine +
        " : " +
        n +
        " is not a valid value of Boolean.\nPlease use 0 or 1."
    );
  }

  private unknownError() {
    const currentLine = this.currentLineCpt + 1;
    this.output.appendLine("ERROR at line " + currentLine + ".");
  }

  //--------------------------------------------------------------------------------//

  //-------------------------------- Nilnovi Methods -------------------------------//

  /**
   * Description : Enables the beginning of the program
   *
   * Input :
   * * No parameter should be given
   * * (The parameter error checks if no argument has been given)
   *
   * Output:
   * * The return status 1 | 0
   *
   * Authors:
   * * Sébastien HERT
   */
  private evaluable_debutProg(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_debutProg.name, 0);
      return 1;
    }
    this.output.appendLine("Début de Programme");
    // this.output.show();
    this.currentLineCpt++;
    return 0;
  }

  /**
   * Description : Enables the end of the program
   *
   * Input:
   * * No parameter should be given
   * * (The parameter error checks if no argument has been given)
   *
   * Output:
   * * The return status 1 | 0
   *
   * Authors:
   * * Sébastien HERT
   */
  private evaluable_finProg(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_finProg.name, 0);
      return 1;
    }
    this.output.appendLine("Fin de Programme");
    this.end = true;
    this.currentLineCpt = 0;
    return 0;
  }

  /**
   * Description : reserves n slots in the pile
   *
   * Input:
   * * n : the number of slots
   * * (The parameter error checks if no argument has been given)
   *
   * Output:
   * * The return status 1 | 0
   *
   * Authors:
   * * Sébastien HERT
   */
  private evaluable_reserver(n: number, error = undefined) {
    if (!(error === undefined) || n === undefined) {
      this.paramsError(this.evaluable_reserver.name, 1);
      return 1;
    }
    for (let i = 0; i < n; i++) {
      this.pile.push(0);
    }
    this.cptPile += n;
    this.currentLineCpt++;
    return 0;
  }

  /**
   * Description : stacks the value n at the top of the pile
   *
   * Input:
   * * n : the value to stack
   * * (The parameter error checks if only one argument has been given)
   *
   * Output:
   * * The return status 1 | 0
   *
   * Authors:
   * * Sébastien HERT
   */
  private evaluable_empiler(n: number, error = undefined) {
    if (!(error === undefined) || n === undefined) {
      this.paramsError(this.evaluable_empiler.name, 1);
      return 1;
    }

    if (!Number.isInteger(n)) {
      this.notValidNumberError(n);
      return 1;
    }

    this.pile.push(n);
    this.cptPile++;
    this.currentLineCpt++;
    return 0;
  }

  /**
   * Description :
   *
   * Input: None
   *
   * Output: None
   *
   * Authors:
   * * Sébastien HERT
   * * Adam RIVIERE
   */
  private evaluable_affectation(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_affectation.name, 0);
      return 1;
    }

    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");

      return 1;
    }

    const value = this.pile.pop();
    const address = this.pile.pop();

    if (
      address === undefined ||
      address < 0 ||
      address > this.pile.length ||
      this.pile.length ||
      value === undefined
    ) {
      this.pileError("Address isn't is the pile");
      return 1;
    }

    try {
      this.pile[address] = value;
    } catch (error) {
      console.log(error);
      this.stop();
      return 1;
    }
    this.cptPile -= 2;
    this.currentLineCpt++;
    return 0;
  }

  /**
   * Description :
   *
   * Input: None
   *
   * Output: None
   *
   * Authors:
   * * Sébastien HERT
   * * Adam RIVIERE
   */
  private evaluable_valeurPile(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_valeurPile.name, 0);
      return 1;
    }

    const address = this.pile.pop();
    this.cptPile--;

    if (address === undefined || address < 0 || address > this.pile.length) {
      this.pileError("Address isn't is the pile");
      return 1;
    }

    const value = this.pile[address];
    return this.evaluable_empiler(value);
  }

  /**
   * Description :
   *
   * Input: None
   *
   * Output: None
   *
   * Authors:
   * * Sébastien HERT
   * * Adam RIVIERE
   */

  private async evaluable_get(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_get.name, 0);
      return 1;
    }

    if (this.pile.length < 1) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    async function getInputValue() {
      var res = await vscode.window.showInputBox({
        placeHolder: "",
        prompt: "Please enter an integer.",
      });
      if (res === undefined) {
        return "";
      } else {
        return res;
      }
    }

    var inputString = await getInputValue();

    if (inputString === undefined) {
      console.log("inputBox is undefined");
      this.currentLineCpt++;
      return 0;
    }

    var inputNumber: number = parseInt(inputString);

    if (isNaN(inputNumber)) {
      this.notNumberError(inputString);
      return 1;
    }

    const address = this.pile.pop();
    this.cptPile--;

    if (address === undefined || address < 0 || address > this.pile.length) {
      this.pileError("Address isn't is the pile");
      return 1;
    }

    this.pile[address] = inputNumber;
    this.currentLineCpt++;

    return 0;
  }

  /**
   * Description :
   *
   * Input: None
   *
   * Output: None
   *
   * Authors:
   * * Sébastien HERT
   * * Adam RIVIERE
   */
  private evaluable_put(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_put.name, 0);
      return 1;
    }
    const value = this.pile.pop();

    if (value === undefined) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    this.cptPile--;
    this.currentLineCpt++;
    this.output.appendLine(value.toString());

    return 0;
  }

  /**
   * Description :
   *
   * Input: None
   *
   * Output: None
   *
   * Authors:
   * * Sébastien HERT
   * * adam
   */
  private evaluable_moins(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_moins.name, 0);
      return 1;
    }
    if (this.pile.length < 1) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var value = this.pile.pop();
    this.cptPile--;
    if (value === undefined) {
      return 1;
    }

    return this.evaluable_empiler(-value);
  }

  private evaluable_sous(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_sous.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    return this.evaluable_empiler(b - a);
  }

  private evaluable_add(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_add.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    return this.evaluable_empiler(b + a);
  }

  private evaluable_mult(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_mult.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    return this.evaluable_empiler(b * a);
  }

  private evaluable_div(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_div.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    if (a == 0) {
      this.zeroDivisionError();
      return 1;
    }

    return this.evaluable_empiler(Math.floor(b / a));
  }

  private evaluable_egal(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_egal.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    return this.evaluable_empiler(Number(a == b));
  }
  private evaluable_diff(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_diff.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    return this.evaluable_empiler(Number(!(a == b)));
  }

  private evaluable_inf(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_inf.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    return this.evaluable_empiler(Number(b > a));
  }

  private evaluable_infeg(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_infeg.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    return this.evaluable_empiler(Number(b >= a));
  }

  private evaluable_sup(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_sup.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    return this.evaluable_empiler(Number(b > a));
  }

  private evaluable_supeg(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_supeg.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }

    return this.evaluable_empiler(Number(b >= a));
  }

  private evaluable_et(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_et.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }
    if (a != 0 && a != 1) {
      this.notBooleanError(a);
      return 1;
    }
    if (b != 0 && b != 1) {
      this.notBooleanError(b);
      return 1;
    }

    return this.evaluable_empiler(Number(b && a));
  }

  private evaluable_ou(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_ou.name, 0);
      return 1;
    }
    if (this.pile.length < 2) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();
    var b = this.pile.pop();

    this.cptPile -= 2;

    if (a === undefined || b === undefined) {
      return 1;
    }
    if (a != 0 && a != 1) {
      this.notBooleanError(a);
      return 1;
    }
    if (b != 0 && b != 1) {
      this.notBooleanError(b);
      return 1;
    }

    return this.evaluable_empiler(Number(b || a));
  }

  private evaluable_non(error = undefined) {
    if (!(error === undefined)) {
      this.paramsError(this.evaluable_non.name, 0);
      return 1;
    }
    if (this.pile.length < 1) {
      this.pileError("Pile doesn't have enough elements.");
      return 1;
    }

    var a = this.pile.pop();

    this.cptPile--;

    if (a === undefined) {
      return 1;
    }
    if (a != 0 && a != 1) {
      this.notBooleanError(a);
      return 1;
    }
    return this.evaluable_empiler(Number(!a));
  }

  private evaluable_tra(n: number) {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_tze(n: number) {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_erreur(exp: string) {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
    return 0;
  }
  private evaluable_empilerAd(n: number) {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_empilerParam(n: number) {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_retourProc() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_retourFonct() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_reserverBloc() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_traStat(n: number, t: number) {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  //--------------------------------------------------------------------------------//
}
//================================================================================//
