//import resolver from "../ts-paths-resolver";
import { createResolver } from "ts-paths-resolver-esm";
import { Range, TextDocument } from "vscode-languageserver-textdocument";
import { Command, ExecuteCommandParams, TextDocumentEdit, TextEdit } from "vscode-languageserver/node";
import { updateImageSizeForImg } from "../process/html";

//const { createResolver } = resolver;

export type CommandGeneratorReturnType = ReturnType<typeof createFillWidthAndHeightForImgTag>;

export function createFillWidthAndHeightForImgTag(title: string, key: string) {
  return {
    [key]: {
      create: (documentUri: string, range: Range) => Command.create(title, key, documentUri, range),
      title: title,
      documentUri: (params: ExecuteCommandParams) => params.arguments?.[0],
      createEditSet: async (workspaceRootPath: string, document: TextDocument, params: ExecuteCommandParams) => {
        if (!params.arguments) {
          return;
        }
        const [documentUri, range] = params.arguments;
        const imgTag = document.getText(range);
        const resolver = createResolver("tsconfig.json", workspaceRootPath);
        const replacedImgTag = updateImageSizeForImg(imgTag, resolver);

        return TextDocumentEdit.create({ uri: documentUri, version: null }, [TextEdit.replace(range, replacedImgTag)]);
      },
    },
  };
}
