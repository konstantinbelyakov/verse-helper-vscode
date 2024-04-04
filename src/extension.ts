import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log('Verse Helper sample is activated');
    let timeout: NodeJS.Timer | undefined = undefined;

    const poemLineDecorationType = vscode.window.createTextEditorDecorationType({
        dark: {	before: { color: 'MediumSlateBlue'} },
        light: { before: { color: 'LightBlue' }	},
        before: { width: "1.5em", fontStyle: 'normal' }
    });

    let activeEditor = vscode.window.activeTextEditor;

    function getDecorationText(count: number) {
        if (count > 0 && count <= 20) {
            // ⑴ ⑵ ⑶ ⑷ ⑸ ⑹ ⑺ ⑻ ⑼ ⑽ ⑾ ⑿ ⒀ ⒁ ⒂ ⒃ ⒄ ⒅ ⒆ ⒇
            return String.fromCharCode(9331 + count);
        }
        else {
            return "⍰";
        }
    }

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }
        const poemRegex = /(?<=\r?\n *).+(?= {2}\r?\n *\S)|(?<=\S {2}\r?\n *).+(?=\r?\n\r?\n)/gm;
        const vowelRegex = /а|о|у|ы|э|я|ё|ю|и|е/gi;
        const text = activeEditor.document.getText();
        const poemLines: vscode.DecorationOptions[] = [];
        let match;
        while ((match = poemRegex.exec(text))) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const vowelCount = (match[0].match(vowelRegex)||[]).length;
            const decoration ={
                range: new vscode.Range(startPos, endPos),
                renderOptions: {
                    before: { contentText: getDecorationText(vowelCount) }
                }
            };
            poemLines.push(decoration);
        }
        activeEditor.setDecorations(poemLineDecorationType, poemLines);
    }

    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout as NodeJS.Timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        } else {
            updateDecorations();
        }
    }

    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations(true);
        }
    }, null, context.subscriptions);

}
