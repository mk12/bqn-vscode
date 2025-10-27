import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

interface Snippet {
  body: string[];
  prefix: string[];
}

interface GlyphData {
  // The part of the snippet key before the colon, lowercased.
  // Example: "Function: Conjugate, Add" -> "function".
  category: string;
  // The part of the snippet key after the colon.
  // Example: "Function: Conjugate, Add" -> "Conjugate, Add".
  name: string;
  // First element of the snippet's "body" array.
  // Example: "+".
  glyph: string;
  // First element of the snippet's "prefix" array.
  // Example: "+".
  prefix: string;
}

export class GlyphsProvider implements vscode.WebviewViewProvider {
  // This matches the id in package.json.
  public static readonly viewId = "bqn-glyphs";

  constructor(private readonly extensionUri: vscode.Uri) { }

  private loadGlyphData(): GlyphData[] {
    const snippetsPath = path.join(
      this.extensionUri.fsPath,
      "snippets",
      "snippets.code-snippets"
    );

    try {
      const content = fs.readFileSync(snippetsPath, "utf-8");
      const json = JSON.parse(content);
      return Object.entries(json).map(([key, value]) => {
        const [category, name] = key.split(": ");
        const snippet = value as Snippet;
        return {
          category: category.toLowerCase(),
          name,
          glyph: snippet.body[0],
          prefix: snippet.prefix[0],
        };
      });
    } catch (ex) {
      vscode.window.showErrorMessage(`Failed to load BQN snippets: ${ex}`);
      console.error("Failed to load BQN snippets:", ex);
      return [];
    }
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html = this.getHtmlForWebview();
    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command !== "insertGlyph") return;
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage(
          "No active editor to insert glyph into."
        );
        return;
      }
      editor
        .edit((editBuilder) => {
          editor.selections.forEach((selection) => {
            editBuilder.replace(selection, message.glyph);
          });
        })
        .then(() => {
          // Restore focus to the editor.
          vscode.window.showTextDocument(editor.document);
        });
    });
  }

  private getHtmlForWebview() {
    const glyphButtons = this.loadGlyphData()
      .map(
        (item) =>
          `<button class="glyph-button ${item.category}" title="${item.name}\n${item.prefix}">${item.glyph}</button>`
      )
      .join("");

    return `<!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BQN Glyphs</title>
      <style>
        body {
          padding: 5px;
          font-size: 1.5em;
        }
        .glyph-button {
          cursor: pointer;
          border: 1px solid var(--vscode-button-secondaryBackground);
          background-color: var(--vscode-button-secondaryBackground);
          color: var(--vscode-editor-foreground);
          margin: 2px;
          padding: 5px 10px;
          border-radius: 3px;
          min-width: 40px;
          text-align: center;
          font-size: 0.75em;
        }
        .value { color: var(--vscode-terminal-ansiWhite); }
        .function { color: var(--vscode-terminal-ansiBrightGreen); }
        .modifier { color: var(--vscode-terminal-ansiMagenta); }
        .modifier2 { color: var(--vscode-terminal-ansiBrightYellow); }
        .number { color: var(--vscode-terminal-ansiRed); }
        .gets { color: var(--vscode-terminal-ansiWhite); }
        .parens { color: var(--vscode-terminal-ansiWhite); }
        .bracket { color: var(--vscode-terminal-ansiBrightMagenta); }
        .brace { color: var(--vscode-terminal-ansiMagenta); }
        .ligature { color: var(--vscode-terminal-ansiWhite); }
        .nothing { color: var(--vscode-terminal-ansiRed); }
        .separator { color: var(--vscode-terminal-ansiBrightMagenta); }
        .comment { color: var(--vscode-terminal-ansiBlue); }
        .string { color: var(--vscode-terminal-ansiBrightBlue); }
        .other { color: var(--vscode-terminal-ansiWhite); }
        .glyph-button:hover {
          background-color: var(--vscode-button-secondaryHoverBackground);
        }
      </style>
    </head>
    <body>
      ${glyphButtons}
      <script>
        const vscode = acquireVsCodeApi();
        document.body.addEventListener("click", event => {
          if (event.target.className.includes("glyph-button")) {
            vscode.postMessage({
              command: "insertGlyph",
              glyph: event.target.innerText
            });
          }
        });
      </script>
    </body>
    </html>`;
  }
}
