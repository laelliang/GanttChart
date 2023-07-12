import ts from 'typescript';
import type * as tst from 'typescript';
import type { TransformerExtras, PluginConfig } from 'ts-patch';

import path from 'path';

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
          
          const relativePath = path.relative(node.getSourceFile().fileName, program.getCurrentDirectory()).replace(/\\/g, '\/')

          console.warn('========================================')
          console.warn(node.getSourceFile().fileName)
          console.warn(relativePath + '/gantt/utils')

          const pathStr = node.moduleSpecifier.text
          .replace(/^@gantt/, relativePath + '/gantt')
          .replace(/^@utils/, relativePath + '/gantt/utils')
          const newNode = factory.updateImportDeclaration(
            node,
            node.modifiers,
            node.importClause,
            factory.createStringLiteral(pathStr + ".js"),
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
