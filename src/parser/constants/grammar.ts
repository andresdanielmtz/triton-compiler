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
Block -> "{" Statement* "}"
Statement -> VariableAssignment | ExpressionStatement
VariableAssignment -> ID AssignmentOperator Expression ";"
AssignmentOperator -> "=" | "+=" | "-=" | "*=" | "/="
ExpressionStatement -> Expression ";")
Expression -> Term (ArithmeticOperatorLevelOne Term)*
ArithmeticOperatorLevelOne -> "+"|"-"
Term -> Factor (ArithmeticOperatorLevelTwo Factor)*
ArithmeticOperatorLevelTwo -> "*"/"/"
FunctionCall -> (ID "." )? ID "(" (Expression ("," Expression)*)? ")"
`;

export default GRAMMAR;