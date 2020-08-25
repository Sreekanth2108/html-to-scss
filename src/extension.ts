// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface IClassMetaData {
	className: string;
	nestingLevel: number;
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
		console.log('Congratulations, your extension "html-to-scss" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.htmltoscss', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World!');
		const activeTextEditor = vscode.window.activeTextEditor;
		let uri = '';
		if(activeTextEditor){
			uri = activeTextEditor.document.uri.fsPath;
		}
		vscode.workspace.openTextDocument(uri).then((document) => {
			const documentLines = document.getText().split('\n');
			let classes: Array<IClassMetaData> = [];
			let scssContent = '';
			let previousTrimLength = 0;
			let previousTrimLengths: Array<number> = [];
			documentLines.forEach((line: string, index: number) => {
				if(line.includes('class="')){
					let trimLength = line.length - line.trimLeft().length;
					const classMetaData = <IClassMetaData>{
						className: line.split('class="')[1].split('"')[0],
						nestingLevel: trimLength
					};
					classes.push(classMetaData);

					if(!scssContent) {
						// previousTrimLengths.push(trimLength);
						scssContent += '.' + classMetaData.className + '{';
					} else {
						if(trimLength > previousTrimLength){
							previousTrimLengths.push(trimLength);
							scssContent += '\n';
							scssContent += getEmptySpace(trimLength) + '.' + classMetaData.className + '{';
						} else if(trimLength === previousTrimLength){
							// trimLength = previousTrimLengths.splice(previousTrimLengths.length-1, 1)[0];
							scssContent += '} \n';
							scssContent += getEmptySpace(trimLength) + '.' + classMetaData.className + '{';
						} else {
							 
							scssContent += '} \n';
							previousTrimLength = previousTrimLengths.splice(previousTrimLengths.length-1, 1)[0];
							if(previousTrimLength > trimLength){
								scssContent += getEmptySpace(trimLength) + '} \n';
							}
							scssContent += getEmptySpace(trimLength) + '.' + classMetaData.className + '{';
							
							// trimLength = previousTrimLengths[previousTrimLengths.length-1];
						}
					}
					
					previousTrimLength = trimLength;

				}
			});
			scssContent += '} \n';
			previousTrimLengths.splice(previousTrimLengths.length-1, 1);
			previousTrimLengths.reverse().forEach((trimLength) => {
				scssContent += getEmptySpace(trimLength) + '} \n';
			});
			
			scssContent += '}';

			const scssFilePath = uri.substring(0, uri.lastIndexOf('.'))+'.scss';
			vscode.workspace.openTextDocument(scssFilePath).then((document) => {
				vscode.window.showTextDocument(document).then(() => {
					const scssEditor = vscode.window.activeTextEditor;
					if (scssEditor) {
						let doc = scssEditor.document;
						let docUri = doc.uri;

			
						let we = new vscode.WorkspaceEdit();
						we.insert(docUri, new vscode.Position(0, 0), scssContent);
						vscode.workspace.applyEdit(we).then(() => {
							vscode.workspace.saveAll();
						});
					}
				});
				
			});

		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function getEmptySpace(spaceCount: number){
	let emptySpaceString = '';
	for(let i =0; i< spaceCount; i++){
		emptySpaceString += '\xa0';
	}
	return emptySpaceString;
}