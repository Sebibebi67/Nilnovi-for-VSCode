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
  public pile = [];
  public base = -1;
  public output: vscode.OutputChannel;

  private lines: string[] = [];
  private end = false;
  private commentedStates = {
    NOT_COMMENTED: 0,
    COMMENTED_LINE: 1,
    NEXT_LINE_COMMENTED: 2,
  };
  private commentedState = this.commentedStates.NOT_COMMENTED;

  //--------------------------------------------------------------------------------//

  //--------------------------------- Constructor ----------------------------------//

  constructor() {
    this.output = vscode.window.createOutputChannel("Nilnovi Executor Output");
    this.output.show(true);
  }

  //--------------------------------------------------------------------------------//

  //-------------------------------- Public Methods --------------------------------//

  /**
   * Description : loads and converts the file into an array of strings, one string per line. It also removes the block of comments
   *
   * Input:
   * * The file which should be loaded
   *
   * Output: None
   *
   * Authors:
   * * Sébastien HERT
   */
  public loadingFile(file: string) {
    // First, we will remove all the blocks of comments and replace them by empty lines, then filling our array of lines
    const regex = /\/\*(.|[\r\n])*\*\//;
    this.lines = file.replace(regex, "\r\n").split(/\r?\n/);
  }

  /**
   * Description : runs the file previously loaded
   *
   * Input:
   * * (Optional) The delay
   *
   * Output: None
   *
   * Authors:
   * * Sébastien HERT
   */
  public run(delay?: number) {
    // resets the global values
    this.reset();

    // while not "FinProg" or error
    while (!this.end) {
      // Evaluating current line
      const returnValue = this.eval(this.lines[this.currentLineCpt]);

      // An error occurs
      if (returnValue != 0) {
        this.stop();
      }
    }
  }

  //--------------------------------------------------------------------------------//

  //-------------------------------- Private Methods -------------------------------//

  private eval(line: string) {
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

    // console.log(method + "n");

    // console.log(line, method);
    // checks if the line is commented or empty
    if (!(line.length == 0) && !line.startsWith("#")) {
      // console.log(method);

      // If it's not
      if (!(this.commentedState == this.commentedStates.COMMENTED_LINE)) {
        try {
          const returnValue = eval("this.evaluable_" + method);
          if (returnValue != 0) {
            return 1;
          }
        } catch (error) {
          //TODO, need to check type of arguments
          // if 
          // this.functionNotDefinedError(method.split("(")[0]);
          console.log(error);
          console.log(error.name, error.message);
          return 1;
        }

        // else, we should increase the currentLineCpt
      } else {
        this.currentLineCpt++;
      }
    } else {
      // else, we should increase the currentLineCpt
      this.currentLineCpt++;
    }
    return 0;
  }

  private stop() {
    this.end = true;
  }

  private reset() {
    this.end = false;
    this.currentLineCpt = 0;
    this.commentedState = this.commentedStates.NOT_COMMENTED;
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

  //--------------------------------------------------------------------------------//

  //-------------------------------- Nilnovi Methods -------------------------------//

  /**
   * Description : enables the beginning of the program
   *
   * Input : None
   *
   * Output: None
   *
   * Authors:
   * * Sébastien HERT
   */
  private evaluable_debutProg(error = undefined) {
    if (error === undefined) {
      this.output.appendLine("Début de Programme");
      this.currentLineCpt++;
    } else {
      this.paramsError(this.evaluable_debutProg.name, 0);
      return 1;
    }
    return 0;
  }

  /**
   * Description : enables the end of the program
   *
   * Input: None
   *
   * Output: None
   *
   * Authors:
   * * Sébastien HERT
   */
  private evaluable_finProg() {
    this.output.appendLine("Fin de Programme");
    this.end = true;
    this.currentLineCpt = 0;
    return 0;
  }

  private evaluable_reserver(n: number) {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_empiler(n: number) {
    // console.log(n);
    this.output.appendLine("TODO");

    this.currentLineCpt++;
    // return 0;
  }

  private evaluable_affectation() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_valeurPile() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_get() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_put() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_moins() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_sous() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_add() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_mult() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_div() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_egal() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_diff() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_inf() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_infeg() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_sup() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_supeg() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }
  private evaluable_et() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_ou() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
  }

  private evaluable_non() {
    this.output.appendLine("TODO");
    this.currentLineCpt++;
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
