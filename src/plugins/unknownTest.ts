import { CallExpression, File } from "@babel/types";
import traverse, { NodePath } from "@babel/traverse";
import { Smell } from "../smell";
import { isAssertion, isTestCase, isChaiAssert, isJest, isChaiBdd, isChaiHttp } from "../util";
import Rule from "../rule";

export default class UnknownTestRule extends Rule {

  get name(): string {
    return "Unknown Test";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: NodePath<CallExpression>) => {
        const node = path.node;
        if (isTestCase(node)) {
          const assertions: any[] = [];
          path.traverse({
            CallExpression: (path: any) => {
              const innerNode = path.node;
              if (isAssertion(innerNode) || isChaiAssert(innerNode) || isChaiBdd(innerNode) || isChaiHttp(innerNode) || isJest(innerNode)) {
                assertions.push(innerNode);
              }
            }
          });
          if (assertions.length === 0 && node.loc) {
            results.push(new Smell({ column: node.loc.start.column, line: node.loc.start.line }));
          }
        }
      }
    });
    return results;
  }
}
