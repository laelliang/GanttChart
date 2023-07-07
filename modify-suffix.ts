import ts from 'typescript';
import type * as tst from 'typescript';
import type { TransformerExtras, PluginConfig } from 'ts-patch';

export default function(program: tst.Program, pluginConfig: PluginConfig, { ts: tsInstance }: TransformerExtras) {
  return (ctx: tst.TransformationContext) => {
    const { factory } = ctx;
    return (sourceFile: tst.SourceFile) => {
      function visit(node: tst.Node): tst.Node {
        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {

          // 排除带有 'type' 关键字的导入语句
          if (node.importClause && node.importClause.isTypeOnly) {
            return node; // 返回原始节点，不进行修改
          }

          const newNode = factory.updateImportDeclaration(
            node,
            node.modifiers,
            node.importClause,
            factory.createStringLiteral(node.moduleSpecifier.text + ".js"),
            node.assertClause
          );
          return newNode;
        }
        return tsInstance.visitEachChild(node, visit, ctx);
      }
      return tsInstance.visitNode(sourceFile, visit);
    };
  };
}
