import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

interface Snippet {
  body: string[];
  prefix: string[];
}

interface SnippetsFile {
  [key: string]: Snippet;
}

interface BqnPrimitive {
  glyph: string;
  name: string;
  category: string;
  prefix: string;
}

export class GlyphsProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "bqn-glyphs"; // This must match the id in package.json
  private _extensionUri: vscode.Uri;

  constructor(
    private readonly _context: vscode.ExtensionContext,
    extensionUri: vscode.Uri
  ) {
    this._extensionUri = extensionUri;
  }

  private _loadGlyphData(): BqnPrimitive[] {
    const extensionPath = this._extensionUri.fsPath;
    const snippetsPath = path.join(
      extensionPath,
      "snippets",
      "snippets.code-snippets"
    );

    try {
      const fileContent = fs.readFileSync(snippetsPath, "utf-8");
      const snippets: SnippetsFile = JSON.parse(fileContent);

      const primitives: BqnPrimitive[] = [];

      const keys = Object.keys(snippets);
      for (const fullKey of keys) {
        const snippet = snippets[fullKey];

        // The first part of the key in lowercase is the Category
        // e.g., "Function: Conjugate, Add" -> "function"
        const categoryMatch = fullKey.match(/^([^:]+):/);
        const category = categoryMatch
          ? categoryMatch[1].trim().toLocaleLowerCase().replace(/\s/g, "")
          : "other";

        // The whole key is the Name (excluding the category and colon)
        // e.g., "Function: Conjugate, Add" -> "Conjugate, Add"
        const name = fullKey.replace(/^[^:]+:\s*/, "").trim();

        // The glyph is the first element of the 'body' array
        const glyph = snippet.body[0];

        // The prefix is the first element of the 'prefix' array
        const prefix = snippet.prefix[0];

        if (glyph) {
          primitives.push({
            glyph: glyph,
            name: name,
            category: category,
            prefix: prefix,
          });
        }
      }
      return primitives;
    } catch (error) {
      // Handle errors (file not found, invalid JSON, etc.)
      vscode.window.showErrorMessage(`Failed to load BQN snippets: ${error}`);
      console.error("Failed to load BQN snippets:", error);
      return []; // Return an empty array on failure
    }
  }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = { enableScripts: true };

    webviewView.webview.html = this._getHtmlForWebview();

    // Add a listener for messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "insertGlyph": {
          const editor = vscode.window.activeTextEditor;
          if (!editor) {
            vscode.window.showInformationMessage(
              "No active editor to insert glyph into."
            );
            return;
          }

          // Insert the glyph at the current cursor position(s)
          editor
            .edit((editBuilder) => {
              editor.selections.forEach((selection) => {
                editBuilder.replace(selection, message.glyph);
              });
            })
            .then(() => {
              // Restore focus to the editor
              vscode.window.showTextDocument(editor.document);
            });
          return;
        }
      }
    });
  }

  private _getHtmlForWebview() {
    const bqnPrimitives = this._loadGlyphData();

    const glyphButtons = bqnPrimitives
      .map(
        (item) =>
          `<button class="glyph-button ${item.category}" title="${item.name}\n${item.prefix}">${item.glyph}</button>`
      )
      .join("");

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
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
        /* Category-specific colors (overrides the default 'color' property) */
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

        document.body.addEventListener('click', event => {
          if (event.target.className.includes('glyph-button')) {
            vscode.postMessage({
              command: 'insertGlyph',
              glyph: event.target.innerText
            });
          }
        });
      </script>
    </body>
    </html>`;
  }
}
