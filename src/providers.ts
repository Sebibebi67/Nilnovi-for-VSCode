import * as vscode from "vscode";

export function autoCompletion(){
    return vscode.languages.registerCompletionItemProvider('nilnovi',{
        provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext){
          const completions = [];
          completions.push(new vscode.CompletionItem('debutProg();',1));
          completions.push(new vscode.CompletionItem('finProg();',1));
          completions.push(new vscode.CompletionItem('reserver();',1));
          completions.push(new vscode.CompletionItem('empiler();',1));
          completions.push(new vscode.CompletionItem('affectation();',1));
          completions.push(new vscode.CompletionItem('valeurPile();',1));
          completions.push(new vscode.CompletionItem('get();',1));
          completions.push(new vscode.CompletionItem('put();',1));
          completions.push(new vscode.CompletionItem('moins();',1));
          completions.push(new vscode.CompletionItem('sous();',1));
          completions.push(new vscode.CompletionItem('add();',1));
          completions.push(new vscode.CompletionItem('mult();',1));
          completions.push(new vscode.CompletionItem('div();',1));
          completions.push(new vscode.CompletionItem('egal();',1));
          completions.push(new vscode.CompletionItem('diff();',1));
          completions.push(new vscode.CompletionItem('inf();',1));
          completions.push(new vscode.CompletionItem('infeg();',1));
          completions.push(new vscode.CompletionItem('sup();',1));
          completions.push(new vscode.CompletionItem('supeg();',1));
          completions.push(new vscode.CompletionItem('et();',1));
          completions.push(new vscode.CompletionItem('ou();',1));
          completions.push(new vscode.CompletionItem('non();',1));
          completions.push(new vscode.CompletionItem('tra();',1));
          completions.push(new vscode.CompletionItem('tze();',1));
          completions.push(new vscode.CompletionItem('erreur();',1));
          completions.push(new vscode.CompletionItem('empilerAd();',1));
          completions.push(new vscode.CompletionItem('empilerParam();',1));
          completions.push(new vscode.CompletionItem('retourFonct();',1));
          completions.push(new vscode.CompletionItem('retourProc();',1));
          completions.push(new vscode.CompletionItem('reserverBloc();',1));
          completions.push(new vscode.CompletionItem('traStat();',1));
          return completions;
        }
      });
}

export function hovers(){
    return vscode.languages.registerHoverProvider('nilnovi', {
        provideHover(document, position, token) {
    
            const range = document.getWordRangeAtPosition(position);
            const word = document.getText(range);
    
            if (word == "debutProg") {
    
                return new vscode.Hover({
                    language: "NilNovi",
                    value: "TODO"
                });
            }
        }
      });
}