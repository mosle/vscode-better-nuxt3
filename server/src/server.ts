import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  //  ProposedFeatures,
  InitializeParams,
  // DidChangeConfigurationNotification,
  // CompletionItem,
  // CompletionItemKind,
  // TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  CodeActionKind,
  CodeAction,
  // Command,
  // TextDocumentEdit,
  // TextEdit,
} from "vscode-languageserver/node";
import { fileURLToPath } from "url";

import { TextDocument } from "vscode-languageserver-textdocument";
import { createParser } from "./vueAstParser";
import { createFillWidthAndHeightForImgTag } from "./commands/replacer";

const connection = createConnection(/*ProposedFeatures.all*/);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// type CommandDef = {[key:string]:{title:string,func:Function}};

// const commandDefs:CommandDef[] = [
//   {"better-nuxt3.fillWidthAndHeight":{title:"Insert width and height",func:createFillWidthAndHeightForImgTag}}
// ] as const;

const commands = { ...createFillWidthAndHeightForImgTag("Insert width and height", "better-nuxt3.fillWidthAndHeight") };

connection.onInitialize((_: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      codeActionProvider: {
        codeActionKinds: [CodeActionKind.QuickFix],
      },
      executeCommandProvider: {
        commands: Object.keys(commands),
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
    const command = commands[diag.source]; //Object.values(commands).find((command) => command.title === diag.source);
    if (command) {
      return [CodeAction.create(command.title, command.create(textDocument.uri, diag.range), CodeActionKind.QuickFix)];
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
      source: "better-nuxt3.fillWidthAndHeight",
    };
    return diagnostic;
  });

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((_change) => {
  //  connection.console.log("We received an file change event");
});

connection.onExecuteCommand(async (params) => {
  const command = commands[params.command];
  if (!command) {
    return;
  }
  const documentUri = command.documentUri(params);
  if (!documentUri) {
    return;
  }
  const textDocument = documents.get(documentUri);
  if (!textDocument) {
    return;
  }

  const folders = await connection.workspace.getWorkspaceFolders();
  if (folders?.[0]) {
    const rootPath = fileURLToPath(folders[0].uri);
    const editSet = await command.createEditSet(rootPath, textDocument, params);
    if (editSet) {
      connection.workspace.applyEdit({ documentChanges: [editSet] });
    }
  }
});

documents.listen(connection);
connection.listen();
