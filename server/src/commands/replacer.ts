//import resolver from "../ts-paths-resolver";
import { createResolver } from "ts-paths-resolver-esm";
import { Range, TextDocument } from "vscode-languageserver-textdocument";
import { TextDocuments, TextDocumentEdit, TextEdit } from "vscode-languageserver/node";
import { updateImageSizeForImg } from "../process/html";
import { createParser } from "../vueAstParser";
import { defineCommand } from "./manager";

//const { createResolver } = resolver;

export const createFillWidthAndHeightForImgTag = defineCommand<{ documentUri: string; range: Range }>({
  createEditSet: async (workspaceRootPath: string, documents: TextDocuments<TextDocument>, params) => {
    const { documentUri, range } = params;
    const textDocument = documents.get(documentUri);
    if (!textDocument) {
      return;
    }

    const imgTag = textDocument.getText(range);
    const resolver = createResolver("tsconfig.json", workspaceRootPath);
    const replacedImgTag = await updateImageSizeForImg(imgTag, resolver);
    if (replacedImgTag !== imgTag) {
      return TextDocumentEdit.create({ uri: documentUri, version: null }, [TextEdit.replace(range, replacedImgTag)]);
    }
  },
});

export const createFillWidthAndHeightForImgTagBulk = defineCommand<{ documentUri: string }>({
  createEditSet: async (workspaceRootPath: string, documents: TextDocuments<TextDocument>, params) => {
    const { documentUri } = params;
    const textDocument = documents.get(documentUri);
    if (!textDocument) {
      return;
    }
    const text = textDocument.getText();
    const parser = createParser(text);
    const resolver = createResolver("tsconfig.json", workspaceRootPath);
    const imgs = parser.findImgElementInTemplate();
    const replaceSet = [];
    for (const img of imgs) {
      const range = {
        start: textDocument.positionAt(img.loc.start.offset),
        end: textDocument.positionAt(img.loc.end.offset),
      };
      const imgTag = textDocument.getText(range);
      const replacedImgTag = await updateImageSizeForImg(imgTag, resolver);
      if (replacedImgTag !== imgTag) {
        replaceSet.push(TextEdit.replace(range, replacedImgTag));
      }
    }
    if (replaceSet.length > 0) {
      return TextDocumentEdit.create({ uri: documentUri, version: null }, replaceSet);
    }
  },
});
