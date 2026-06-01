// ─── AST Node Types ───────────────────────────────────────────────────────────

export type ASTNode =
  | ProgramNode
  | KernelDefinitionNode
  | ParamNode
  | BlockNode
  | VariableAssignmentNode
  | ExpressionStatementNode
  | BinaryExpressionNode
  | FunctionCallNode
  | KeywordArgNode
  | IdentifierNode
  | NumberLiteralNode
  | StringLiteralNode
  | MemberExpressionNode;

export interface ProgramNode {
  type: "Program";
  body: ASTNode[];
}

export interface KernelDefinitionNode {
  type: "KernelDefinition";
  decorator: string;
  name: string;
  params: ParamNode[];
  body: BlockNode;
}

export interface ParamNode {
  type: "Param";
  name: string;
  constexpr: boolean;
}

export interface BlockNode {
  type: "Block";
  statements: ASTNode[];
}

export interface VariableAssignmentNode {
  type: "VariableAssignment";
  operator: string;
  left: IdentifierNode;
  right: ASTNode;
}

export interface ExpressionStatementNode {
  type: "ExpressionStatement";
  expression: ASTNode;
}

export interface BinaryExpressionNode {
  type: "BinaryExpression";
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface FunctionCallNode {
  type: "FunctionCall";
  callee: ASTNode;
  args: ASTNode[];
}

export interface KeywordArgNode {
  type: "KeywordArg";
  key: string;
  value: ASTNode;
}

export interface MemberExpressionNode {
  type: "MemberExpression";
  object: string;
  property: string;
}

export interface IdentifierNode {
  type: "Identifier";
  name: string;
}

export interface NumberLiteralNode {
  type: "NumberLiteral";
  value: number;
}

export interface StringLiteralNode {
  type: "StringLiteral";
  value: string;
}