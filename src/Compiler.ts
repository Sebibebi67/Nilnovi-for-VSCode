//================================ Class Compiler ================================//

//--------------------------------- Description ----------------------------------//
//
//
//
//--------------------------------------------------------------------------------//

//----------------------------------- Authors ------------------------------------//
//
// Sébastien HERT
//
//--------------------------------------------------------------------------------//

//----------------------------------- Imports ------------------------------------//

import * as vscode from "vscode";
import { EndOfCommentBlockError } from "./errors/EndOfCommentBlockError";
import { EndOfStringError } from "./errors/EndOfStringError";
import * as error from "./errors/errorsDeclaration";
import { SemiColonError } from "./errors/SemiColonError";

//--------------------------------------------------------------------------------//

export class Compiler {
  //------------------------------- Class Variables --------------------------------//

  private dictLines = new Map<number, String>();
  private output: vscode.OutputChannel;
  //--------------------------------------------------------------------------------//

  //--------------------------------- Constructor ----------------------------------//
  //
  constructor(output: vscode.OutputChannel) {
    this.output = output;
  }

  //--------------------------------------------------------------------------------//

  //----------------------------------- Methods ------------------------------------//

  public compile(file: string) {
    // reseting the data
    this.reset();

    // Spliting file string
    var lines = file.split(/\r?\n/);

    // Creating dictionary
    for (let i = 0; i < lines.length; i++) {
      this.dictLines.set(i + 1, lines[i].trim());
    }

    var returnCommentsValue = this.removeComments();

    if (returnCommentsValue != 0) {
      return 1;
    }

    this.removeEmptyLines();

    var returnSemiColonValue = this.checkingSemiColon();
    if (returnSemiColonValue != 0) {
      return 1;
    }

    this.checkingMethodError();

    // this.dictLines.forEach(function (value, key) {
    //   console.log(`${key} : ${value}`);
    // });
  }

  private reset() {
    this.dictLines = new Map<number, String>();
  }

  private removeComments() {
    var isOneLineCommented = false;
    var isMultiLineCommented = false;
    var isQuoted = false;
    var lastOpenBlockLine = 0;

    for (var k = 1; k < this.dictLines.size + 1; k++) {
      isOneLineCommented = false;
      var line = this.dictLines?.get(k);
      if (line == undefined) {
        return 1;
      }
      var i = 0;
      while (i < line.length) {
        var char = line.charAt(i);
        switch (char) {
          case "#":
            if (!isQuoted && !isMultiLineCommented) {
              isOneLineCommented = true;
            }
            break;

          case '"':
            var lastChar = line.charAt(i - 1);
            if (
              lastChar != "\\" &&
              !isMultiLineCommented &&
              !isOneLineCommented
            ) {
              isQuoted = !isQuoted;
            }
            break;

          case "/":
            var nextChar = line.charAt(i + 1);
            if (nextChar == "*" && !isQuoted && !isMultiLineCommented) {
              line =
                line.substring(0, i + 1) + line.substring(i + 2, line.length);
              // i--;
              isMultiLineCommented = true;
              lastOpenBlockLine = k;
            }
            break;

          case "*":
            var nextChar = line.charAt(i + 1);
            if (nextChar == "/" && !isQuoted && isMultiLineCommented) {
              line = line.substring(0, i) + line.substring(i + 2, line.length);
              i--;
              isMultiLineCommented = false;
            }
            break;

          default:
            break;
        }

        if (isOneLineCommented || isMultiLineCommented) {
          line = line.substring(0, i) + line.substring(i + 1, line.length);
        } else {
          i++;
        }
      }
      if (isQuoted) {
        new EndOfStringError(this.output, k);
        return error.ERROR_END_OF_STRING;
      }

      line = line.trim();
      this.dictLines.set(k, line);
    }

    if (isMultiLineCommented) {
      new EndOfCommentBlockError(this.output, lastOpenBlockLine);
      return error.ERROR_END_OF_COMMENTED_BLOCK;
    }

    return 0;
  }

  private removeEmptyLines() {
    var size = this.dictLines.size + 1;
    for (let i = 1; i < size; i++) {
      let line = this.dictLines.get(i);
      if (typeof line === undefined || line?.length == 0) {
        this.dictLines.delete(i);
      }
    }
  }

  private checkingSemiColon() {
    for (let [nb, line] of this.dictLines) {
      if (!line.endsWith(";")) {
        new SemiColonError(this.output, nb);
        return error.ERROR_SEMICOLON_EXPECTED;
      }
    }
    return 0;
  }

  private checkingMethodError() {
    var regex = /^((debutProg|finProg|affectation|valeurPile|get|put|moins|sous|add|mult|div|egal|diff|inf|infeg|sup|supeg|et|ou|non|retourProc|retourFonct|reserverBloc)\(\)|(reserver|empiler|tra|tze|empilerAd|empilerParam)\([0-9]+\)|(trastat\([0-9]+,[0-9]+\))|(erreur\(".*"\)));$/gm;

    for (let [nb, line] of this.dictLines) {
      var copiedLine = line.replace(" ", "");

      if (!copiedLine.match(regex)) {
        // Syntax error
        if (!copiedLine.match(/[a-zA-Z]*\(.*\);/)) {
          console.error("Syntax Error" + nb);
          return 1;
        }
        var method = copiedLine.split("(")[0];

        if (
          method.match(
            /^(debutProg|finProg|affectation|valeurPile|get|put|moins|sous|add|mult|div|egal|diff|inf|infeg|sup|supeg|et|ou|non|retourProc|retourFonct|reserverBloc)$/
          )
        ) {
          if (copiedLine.split(",").length - 1 != 0) {
            console.error("wrong number of parameters");
          } else {
            console.error("wrong Type");
          }
        } else if (
          method.match(/^(reserver|empiler|tra|tze|empilerAd|empilerParam)$/)
        ) {
          if (copiedLine.split(",").length - 1 != 1) {
            console.error("wrong number of parameters");
          } else {
            console.error("wrong Type");
          }
        } else if (method.match(/^trastat$/)) {
          if (copiedLine.split(",").length - 1 != 2) {
            console.error("wrong number of parameters");
          } else {
            console.error("wrong Type");
          }
        } else if (method.match(/^erreur$/)) {
          console.log("TODO");
          console.error(nb + "4");
        } else {
          console.error("Method doesn't match");
        }
        return 1;

        // if (!method.match(/debutProg|finProg|affectation|valeurPile|get|put|moins|sous|add|mult|div|egal|diff|inf|infeg|sup|supeg|et|ou|non|retourProc|retourFonct|reserverBloc|reserver|empiler|tra|tze|empilerAd|empilerParam|trastat|erreur/))
      }
    }
    console.log("isok");
    return 0;

    //   var method =

    // eval("this.test(4, 3)");
  }

  //--------------------------------------------------------------------------------//
}
//================================================================================//
