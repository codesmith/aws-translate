// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as AWS from 'aws-sdk';

const translate = new AWS.Translate({ region: 'ap-northeast-1' }); // 適切なリージョン名に置き換えてください

function translateText(text: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const params = {
      Text: text,
      SourceLanguageCode: 'en', // 英語から日本語への翻訳
      TargetLanguageCode: 'ja',
	  TerminologyNames: ['ReactNativeWebSite'] // ここにカスタム用語集の名前を指定
    };
  
    translate.translateText(params, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data.TranslatedText);
    }
    });
  });
}
  
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.translate', async () => {
	  const editor = vscode.window.activeTextEditor;
	  if (!editor) {
		return; // エディタがアクティブでない場合は何もしない
	  }
  
	  const selection = editor.selection;
	  const text = editor.document.getText(selection);
	  if (text) {
		try {
		  const translatedText = await translateText(text);
		  editor.edit(editBuilder => {
			editBuilder.replace(selection, translatedText);
		  });
		} catch (error) {
		  vscode.window.showErrorMessage('翻訳に失敗しました: ' + error);
		}
	  }
	});
  
	context.subscriptions.push(disposable);
  }

export function deactivate() {}