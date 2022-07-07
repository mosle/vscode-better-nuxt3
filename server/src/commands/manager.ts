import { Command, TextDocumentEdit, TextDocuments } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

// export type CommandGenerator<T> = <S extends string, U extends string>(
//   title: S,
//   key: U
// ) => {
//   title: S;
//   key: U;
//   createCommand: (params: T) => Command;
//   createEditSet: (workspaceRootPath: string, document: TextDocument, params: T) => Promise<TextDocumentEdit | undefined>;
// };

export const defineCommand = <P>(args: { createEditSet: (workspaceRootPath: string, documents: TextDocuments<TextDocument>, params: P) => Promise<TextDocumentEdit | undefined> }) => {
  return <S extends string, U extends string>(title: S, key: U) => ({
    title: title,
    key: key,
    createCommand: (params: P) => Command.create(title, key, params),
    createEditSet: args.createEditSet,
  });
};
// const defineCommand = <P>() => {
//     return <S extends string, U extends string>(args: { title: S; key: U; createEditSet: (workspaceRootPath: string, document: TextDocument, params: P) => Promise<TextDocumentEdit | undefined> }) => ({
//       title: args.title,
//       key: args.key,
//       createCommand: (params: P) => Command.create(args.title, args.key, params),
//       createEditSet: args.createEditSet,
//     });
//   };

//   const a = defineCommand<{ aaa: string }>()({ title: "aaa", key: "bbbb", createEditSet: async (workspacerootPath, document, params) => undefined });
