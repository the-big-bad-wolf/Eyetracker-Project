// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { setUp } from "./listener";
import * as fs from "fs";
import * as path from "path";

let statusBarItem: vscode.StatusBarItem;

let timeHelpPropmtWasActivated = new Date().getTime();
let timePausePropmtWasActivated = new Date().getTime();

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  console.log("Congratulations, your extension is now active!");

  const disposable = vscode.commands.registerCommand(
    "extension.showData",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      setUp();

      statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
      );
      statusBarItem.text = `Creating baseline $(loading~spin)`;
      statusBarItem.show();

      vscode.window.showInformationMessage(
        "Will now begin to create a baseline, just relax for a couple of minutes"
      );
    },
    context.subscriptions
  );

  context.subscriptions.push(statusBarItem);

  //create file path to where the data will be logged
  let today = new Date();
  let outputPath = path.join(
    __dirname,
    "../../vsCodeOutput/vscodeData-" +
      today.toISOString().slice(0, 10) +
      today.getHours() +
      today.getMinutes() +
      today.getSeconds() +
      ".csv"
  );

  //logs code every five seconds
  setInterval(() => {
    const editor = vscode.window.activeTextEditor;
    const highlighted = editor!.document.getText();

    const now = new Date().getTime() / 1000;
    const data = `${now},"${highlighted}"\n`;

    //comment this out if you dont want to log everytime you activate the extension
    log(outputPath, data);
  }, 5000);

  context.subscriptions.push(disposable);
}

export function initializeHelpButton() {
  /**
   * Creates a button in the bottom right corner of the screen
   * that will open the copilot chat when clicked
   */
  statusBarItem.text = `Help me!`;

  //command to open copilot chat
  const helpCommand = "extension.help";
  vscode.commands.registerCommand(helpCommand, () => {
    activateCopilotChat();
  });

  //set the command for the button
  statusBarItem.command = helpCommand;
}

function log(outputPath: string, data: string) {
  /**
   * Logs the code of the current open file to a csv file.
   * @param {string} outputPath - where the data should be logged
   * @param {string} data - the data to be logged
   */

  ensureDirectoryExistence(outputPath);

  try {
    fs.appendFileSync(outputPath, data);
  } catch (err) {
    console.error(err);
  }
}

function ensureDirectoryExistence(filePath: string) {
  /**
   * Checks if the filepath exists, if not it creates the necessary folders
   * @param {string} filePath - path to where you want to create a file
   */
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

export async function offerHelpNotification() {
  /**
   * Creates a notification to user offering to turn on copilot
   */
  let now = new Date().getTime();

  //only prompt if it is five minutes since last promt
  if (now - timeHelpPropmtWasActivated > 5 * 60 * 1000) {
    timeHelpPropmtWasActivated = now;

    const selection = await vscode.window.showWarningMessage(
      "Would you like help with your task?",
      "Yes, please",
      "No, thank you"
    );

    if (selection === "Yes, please") {
      activateCopilotChat();
    } else if (selection === "No, thank you") {
      console.log("The user does not need help");
    }
  }
}

export function activateCopilotChat() {
  vscode.commands.executeCommand("github.copilot.interactiveEditor.explain");
}

export function pauseNotification() {
  /**
   * Creates a notification to the user telling them they should take a break
   */
  let now = new Date().getTime();

  //only prompt if two minutes since last prompt
  if (now - timePausePropmtWasActivated > 2 * 60 * 1000) {
    timePausePropmtWasActivated = now;
    vscode.window.showWarningMessage(
      "You are approaching a level of stress that can be detrimental to your task. It might be time to take a break."
    );
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
