/**
 * This file defines the context-free grammar for the Triton language.
 */
const GRAMMAR = `
Program -> Kernel EOF
Kernel -> Decorator FunctionDefinition
Decorator -> "@" "triton" "." "jit"
FunctionDefinition -> "def" ID "(" ParamList ")" ":" Block
ParamList -> ε | Param ("," Param)*
Param -> ID (":" "tl" "." "constexpr")?
Block -> Statement*
Statement -> VariableAssignment | ExpressionStatement
VariableAssignment -> ID AssignmentOperator Expression
AssignmentOperator -> "=" | "+=" | "-=" | "*=" | "/="
ExpressionStatement -> Expression
Expression -> Comparison
Comparison -> Term (ComparisonOperator Term)*
ComparisonOperator -> "<" | ">" | "<=" | ">=" | "==" | "!="
Term -> Factor (ArithmeticOperatorLevelOne Factor)*
ArithmeticOperatorLevelOne -> "+" | "-"
Factor -> Primary (ArithmeticOperatorLevelTwo Primary)*
ArithmeticOperatorLevelTwo -> "*" | "/" | "%"
Primary -> ID | NUMBER | STRING | FunctionCall | MemberExpression | "(" Expression ")"
MemberExpression -> ID "." ID
FunctionCall -> (MemberExpression | ID) "(" (Arg ("," Arg)*)? ")"
Arg -> (ID "=")? Expression
`;

export default GRAMMAR;