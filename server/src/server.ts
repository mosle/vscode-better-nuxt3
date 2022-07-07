import { createConnection, TextDocuments, Diagnostic, DiagnosticSeverity, InitializeParams, TextDocumentSyncKind, InitializeResult, CodeActionKind, CodeAction } from "vscode-languageserver/node";
import { fileURLToPath } from "url";

import { TextDocument } from "vscode-languageserver-textdocument";
import { createParser } from "./vueAstParser";
import { createFillWidthAndHeightForImgTag, createFillWidthAndHeightForImgTagBulk } from "./commands/replacer";

const connection = createConnection(/*ProposedFeatures.all*/);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

const commands = [
  createFillWidthAndHeightForImgTag("Insert width and height", "better-nuxt3.fill-width-and-height"),
  createFillWidthAndHeightForImgTagBulk("Insert width and height to all images", "better-nuxt3.fill-width-and-height-bulk"),
] as const;

type CommandKey = typeof commands[number]["key"];
const findCommand = (key: CommandKey) => {
  return commands.find((c) => c.key === key)!;
};

connection.onInitialize((_: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix],
      },
      executeCommandProvider: {
        commands: commands.map((command) => command.key),
      },
    },
  };
  return result;
});

connection.onInitialized(async () => {});

documents.onDidChangeContent((change) => {
  validate(change.document);
});

connection.onCodeAction((params) => {
  const textDocument = documents.get(params.textDocument.uri);
  if (textDocument === undefined) {
    return undefined;
  }

  const diag = params.context.diagnostics?.[0];
  if (diag && diag.source) {
    const command = findCommand(diag.source as any);
    const actions: CodeAction[] = [];
    if (command) {
      if (command.key === "better-nuxt3.fill-width-and-height") {
        actions.push(CodeAction.create(command.title, command.createCommand({ documentUri: textDocument.uri, range: diag.range }), CodeActionKind.QuickFix));

        const sub = findCommand("better-nuxt3.fill-width-and-height-bulk");
        if (sub.key === "better-nuxt3.fill-width-and-height-bulk") {
          actions.push(CodeAction.create(sub.title, sub.createCommand({ documentUri: textDocument.uri }), CodeActionKind.QuickFix));
        }
      }
    }
    if (actions.length > 0) {
      return actions;
    }
  }
  return;
});

async function validate(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const parser = createParser(text);
  const imgs = parser.findImgElementInTemplate();

  const diagnostics = imgs.map((img) => {
    const diagnostic: Diagnostic = {
      severity: DiagnosticSeverity.Warning,
      range: {
        start: textDocument.positionAt(img.loc.start.offset),
        end: textDocument.positionAt(img.loc.end.offset),
      },
      message: `width and height are missing.`,
      source: findCommand("better-nuxt3.fill-width-and-height").key,
    };
    return diagnostic;
  });

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((_change) => {
  //  connection.console.log("We received an file change event");
});

connection.onExecuteCommand(async (params) => {
  console.log(params.command);
  const command = findCommand(params.command as any);
  if (!command) {
    return;
  }

  const folders = await connection.workspace.getWorkspaceFolders();
  if (folders?.[0]) {
    const rootPath = fileURLToPath(folders[0].uri);
    const editSet = await command.createEditSet(rootPath, documents, params.arguments?.[0]);
    if (editSet) {
      connection.workspace.applyEdit({ documentChanges: [editSet] });
    }
  }
});

documents.listen(connection);
connection.listen();
