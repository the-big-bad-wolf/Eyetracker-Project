// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { fetchData } from "./listener";
import * as fs from "fs";
import * as path from "path";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "extension" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "extension.showData",
    async () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      const message = await fetchData();
      if (message) {
        vscode.window.showInformationMessage(message);
      } else {
        vscode.window.showErrorMessage("Failed to fetch data from Server.py.");
      }
      vscode.window.showInformationMessage("Now logging changes in open file");
    }
  );

  //logs the code in open file to csv file every five seconds
  //along with the time
  setInterval(() => {
    const editor = vscode.window.activeTextEditor;
    const highlighted = editor!.document.getText();
    const now = new Date().toLocaleString();

    const data = `${now},\n${highlighted}\n`;

    try {
      fs.appendFileSync(
        path.join(__dirname, "../src/vscodeData.csv"),
        data + "\n\n"
      );
    } catch (err) {
      console.error(err);
    }
  }, 5000);

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
