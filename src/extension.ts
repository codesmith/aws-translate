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

function prepareTextForTranslation(text: string): string {
	// ハイフンとスペース、バッククォートで囲われたテキスト、Markdownリンクを変換
	return text.replace(/^- /gm, '<hyphen-space>').replace(/`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g, '<p translate=no>$&</p>');
  }
  
  function restoreTextAfterTranslation(text: string): string {
	// 変換したテキストを元に戻す
	return text.replace(/<hyphen-space>/g, '- ').replace(/<p translate=no>(.*?)<\/p>/g, '$1');
  }
  
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.translate', async () => {
	  const editor = vscode.window.activeTextEditor;
	  if (!editor) {
		return; // エディタがアクティブでない場合は何もしない
	  }
  
	  const selection = editor.selection;
	  const originalText = editor.document.getText(selection);
	  if (originalText) {
		try {
		  const preparedText = prepareTextForTranslation(originalText);
		  const translatedText = await translateText(preparedText);
		  const restoredText = restoreTextAfterTranslation(translatedText);
		  
		  editor.edit(editBuilder => {
			editBuilder.replace(selection, restoredText);
		  });
		} catch (error) {
		  vscode.window.showErrorMessage('翻訳に失敗しました: ' + error);
		}
	  }
	});
  
	context.subscriptions.push(disposable);
  }

export function deactivate() {}