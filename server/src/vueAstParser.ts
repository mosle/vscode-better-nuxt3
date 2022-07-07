import { parse } from "@vue/compiler-sfc";
import { NodeTypes, TemplateChildNode, DirectiveNode, SimpleExpressionNode } from "@vue/compiler-core";

export function createParser(text: string) {
  const parsed = parse(text);

  const collectElementInTemplateChildNodes = (targetNodes: TemplateChildNode[], collected: TemplateChildNode[], predicate: (node: TemplateChildNode) => boolean) => {
    targetNodes.forEach((node) => {
      if (predicate(node)) {
        collected.push(node);
      }
      if (node.type === NodeTypes.ELEMENT && node.children?.length > 0) {
        collectElementInTemplateChildNodes(node.children, collected, predicate);
      }
    });
  };

  function findElementInTemplate(predicate: (node: TemplateChildNode) => boolean): TemplateChildNode[] {
    if (!parsed.descriptor?.template?.ast) {
      return [];
    }
    const nodes: TemplateChildNode[] = [];
    collectElementInTemplateChildNodes(parsed.descriptor.template.ast.children, nodes, predicate);
    return nodes;
  }
  function findImgElementInTemplate() {
    return findElementInTemplate((node) => {
      if (node.type === NodeTypes.ELEMENT && node.tag === "img") {
        const propNames = [
          ...node.props.map((prop) => prop.name),
          ...node.props.filter((prop) => prop.type === NodeTypes.DIRECTIVE && prop.arg?.type === NodeTypes.SIMPLE_EXPRESSION).map((prop) => ((prop as DirectiveNode).arg as SimpleExpressionNode).content),
        ];
        return !["width", "height"].every((wh) => propNames.includes(wh));
      }
      return false;
    });
  }

  return { findElementInTemplate, findImgElementInTemplate };
}
