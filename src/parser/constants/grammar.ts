/**
 * This file defines the context-free grammar for the Triton language.
 */
const GRAMMAR = `
Program -> Kernel EOF
Kernel -> Decorator KernelDefinition
Decorator -> "@" "triton" "." "jit"
KernelDefinition -> "def" ID "(" ParamList ")" ":" Block
ParamList -> ε | Param ("," Param)*
Param -> ID (":" "tl" "." "constexpr")?
Block -> "{" Statement* "}"
Statement -> VariableAssignment | ExpressionStatement
VariableAssignment -> ID "=" Expression ";"
ExpressionStatement -> Expression ";"
Expression -> Term (ArithmeticOperatorLevelOne Term)*
ArithmeticOperatorLevelOne -> "+"|"-"
Term -> Factor (ArithmeticOperatorLevelTwo Factor)*
ArithmeticOperatorLevelTwo -> "*"| "/"
Factor -> NUMBER | "("Expression")" | NameOrCall
NameOrCall -> ID "." ID "(" (Expression ("," Expression)*)? ")" | ID ("(" (Expression ("," Expression)*)? ")")?
`;

export default GRAMMAR;