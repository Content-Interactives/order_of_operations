import React, { useState, useEffect } from 'react';
import { Button } from '../../../annuity/src/components/ui/button';

const OrderOfOperations = () => {
	const [currentStep, setCurrentStep] = useState(1);
	const [completedSteps, setCompletedSteps] = useState({
		step1: false,
		step2: false,
		step3: false,
		step4: false,
		step5: false
	});
	const [expression, setExpression] = useState('');
	const [isError, setIsError] = useState(false);
	const [showPlaceholder, setShowPlaceholder] = useState(true);
	const [isShrinking, setIsShrinking] = useState(false);
	const [displayedExpression, setDisplayedExpression] = useState('');
	const [isBigShrinking, setIsBigShrinking] = useState(false);
	const [bigAnimKey, setBigAnimKey] = useState(0); // To force re-mount for grow-in
	const [isPlaceholderGrowing, setIsPlaceholderGrowing] = useState(false);
	const [totalSteps, setTotalSteps] = useState(0);
	const [isProgressShrinking, setIsProgressShrinking] = useState(false);
	const [isProgressGrowing, setIsProgressGrowing] = useState(false);
	const [showProgress, setShowProgress] = useState(false);
	const [showInstruction, setShowInstruction] = useState(false);
	const [isInstructionFadingOut, setIsInstructionFadingOut] = useState(false);
	const [showOperationHighlight, setShowOperationHighlight] = useState(false);
	const [showContinueButton, setShowContinueButton] = useState(false);
	const [highlightedOperation, setHighlightedOperation] = useState(null);
	const [isSimplifying, setIsSimplifying] = useState(false);
	const [isContinueButtonShrinking, setIsContinueButtonShrinking] = useState(false);
	const [isHighlightedOperationShrinking, setIsHighlightedOperationShrinking] = useState(false);
	const [isHighlightedOperationGrowing, setIsHighlightedOperationGrowing] = useState(false);
	const [currentOperationResult, setCurrentOperationResult] = useState(null);
	const [isHighlightedOperationVisible, setIsHighlightedOperationVisible] = useState(true);
	const [highlightedOperationPosition, setHighlightedOperationPosition] = useState({ left: 0, top: 0 });
	const [highlightedOperationRef, setHighlightedOperationRef] = useState(null);
	const [isLastInParentheses, setIsLastInParentheses] = useState(false);
	const [fullParentheses, setFullParentheses] = useState(null);

	const generateRandomNumber = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	const generateRandomExpression = () => {
		const operations = ['+', '-', '*', '/'];
		const expressions = [
			// Simple expressions
			() => `${generateRandomNumber(1, 9)} + ${generateRandomNumber(1, 9)} * ${generateRandomNumber(1, 9)}`,
			() => `${generateRandomNumber(1, 9)} * ${generateRandomNumber(1, 9)} - ${generateRandomNumber(1, 9)}`,
			() => `${generateRandomNumber(1, 9)} / ${generateRandomNumber(1, 9)} + ${generateRandomNumber(1, 9)}`,
			
			// Expressions with parentheses
			() => `(${generateRandomNumber(1, 9)} + ${generateRandomNumber(1, 9)}) * ${generateRandomNumber(1, 9)}`,
			() => `${generateRandomNumber(1, 9)} * (${generateRandomNumber(1, 9)} - ${generateRandomNumber(1, 9)})`,
			() => `(${generateRandomNumber(1, 9)} + ${generateRandomNumber(1, 9)}) / ${generateRandomNumber(1, 9)}`,
			
			// Expressions with exponents
			() => `${generateRandomNumber(1, 5)}^2 + ${generateRandomNumber(1, 9)}`,
			() => `${generateRandomNumber(1, 9)} * ${generateRandomNumber(1, 5)}^2`,
			() => `(${generateRandomNumber(1, 5)}^2 + ${generateRandomNumber(1, 9)}) * ${generateRandomNumber(1, 9)}`,
			
			// Complex expressions
			() => `(${generateRandomNumber(1, 9)} + ${generateRandomNumber(1, 9)}) * (${generateRandomNumber(1, 9)} - ${generateRandomNumber(1, 9)})`,
			() => `${generateRandomNumber(1, 9)} * ${generateRandomNumber(1, 5)}^2 + ${generateRandomNumber(1, 9)}`,
			() => `(${generateRandomNumber(1, 9)} + ${generateRandomNumber(1, 9)}) / ${generateRandomNumber(1, 9)} * ${generateRandomNumber(1, 9)}`,
			() => `${generateRandomNumber(1, 5)}^2 * ${generateRandomNumber(1, 9)} - ${generateRandomNumber(1, 9)}`,
			() => `(${generateRandomNumber(1, 9)} * ${generateRandomNumber(1, 9)}) + (${generateRandomNumber(1, 9)} / ${generateRandomNumber(1, 9)})`,
			() => `${generateRandomNumber(1, 9)} * (${generateRandomNumber(1, 9)} + ${generateRandomNumber(1, 9)})^2`,
			
			// New expressions with exponents on parentheses
			() => `(${generateRandomNumber(1, 9)} + ${generateRandomNumber(1, 9)})^2`,
			() => `(${generateRandomNumber(1, 9)} * ${generateRandomNumber(1, 9)})^2 + ${generateRandomNumber(1, 9)}`,
			() => `${generateRandomNumber(1, 9)} + (${generateRandomNumber(1, 9)} - ${generateRandomNumber(1, 9)})^2`
		];

		// Randomly select one of the expression generators
		const randomIndex = Math.floor(Math.random() * expressions.length);
		return expressions[randomIndex]();
	};

	const handleRandomExpression = () => {
		setExpression(generateRandomExpression());
		// Reset continue button state
		setShowContinueButton(false);
		setIsContinueButtonShrinking(false);
	};

	const handleExpressionChange = (e) => {
		const value = e.target.value;
		// Replace multiplication symbols with * and preserve spaces
		const normalizedValue = value
			.replace(/[×x]/g, '*')
			.replace(/[^0-9+\-*/()^ .]/g, ''); // Allow numbers, operators, parentheses, spaces, and decimal points
		
		// Format any large numbers in the input
		const formattedValue = normalizedValue.replace(/\d+(?:\.\d+)?/g, (match) => {
			const num = Number(match);
			return formatLargeNumber(num).toString();
		});
		
		setExpression(formattedValue);
	};

	const validateExpression = (expr) => {
		// Check for empty expression
		if (!expr.trim()) {
			return { isValid: false, error: "Expression cannot be empty" };
		}

		// Check for operators at start or end
		if (/^[+\-*/^]|[+\-*/^]$/.test(expr)) {
			return { isValid: false, error: "Expression cannot start or end with an operator" };
		}

		// Check for consecutive operators
		if (/[+\-*/^]{2,}/.test(expr)) {
			return { isValid: false, error: "Cannot have consecutive operators" };
		}

		// Check for nested exponents (e.g., 2^2^2)
		if (/\d+\^\d+\^/.test(expr)) {
			return { isValid: false, error: "Nested exponents are not allowed. Use parentheses to clarify the order of operations." };
		}

		// Check for invalid decimal point usage
		// First, split the expression into tokens (numbers, operators, parentheses)
		const tokens = expr.match(/\d+\.?\d*|\.\d+|[+\-*/^()]/g) || [];
		
		// Check each token that contains a decimal point
		for (const token of tokens) {
			if (token.includes('.')) {
				// Count decimal points in the token
				const decimalCount = (token.match(/\./g) || []).length;
				if (decimalCount > 1) {
					return { isValid: false, error: "Invalid decimal point usage. Each number can only have one decimal point." };
				}
				
				// Check if decimal point is at start or end of number
				if (token.startsWith('.') || token.endsWith('.')) {
					// These are valid cases (.2 or 2.)
					continue;
				}
				
				// Check if decimal point is between digits
				if (!/^\d+\.\d+$/.test(token)) {
					return { isValid: false, error: "Invalid decimal point usage. Decimal points must be between digits." };
				}
			}
		}

		// Check for unmatched parentheses
		let parenthesesCount = 0;
		for (let char of expr) {
			if (char === '(') parenthesesCount++;
			if (char === ')') parenthesesCount--;
			if (parenthesesCount < 0) {
				return { isValid: false, error: "Unmatched closing parenthesis" };
			}
		}
		if (parenthesesCount !== 0) {
			return { isValid: false, error: "Unmatched opening parenthesis" };
		}

		// Check for invalid operator combinations
		if (/[+\-*/^][+\-*/^]/.test(expr)) {
			return { isValid: false, error: "Invalid operator combination" };
		}

		// Check for empty parentheses
		if (/\(\s*\)/.test(expr)) {
			return { isValid: false, error: "Empty parentheses are not allowed" };
		}

		// Check for implicit multiplication/distribution
		// This checks for patterns like 5(2-1) or (2-1)5, but allows exponents on parentheses
		const hasImplicitMult = /\d+\s*\(|\)\s*\d+/.test(expr);
		if (hasImplicitMult) {
			// Check if the expression is a valid parenthesized expression with optional exponent
			const isValidParenthesizedExpr = /^\([^()]+\)(?:\^[0-9]+)?$/.test(expr.trim());
			if (!isValidParenthesizedExpr) {
				return { isValid: false, error: "Implicit multiplication is not allowed. Please use the * operator (e.g., 5 * (2-1) or (2-1) * 5)." };
			}
		}

		return { isValid: true };
	};

	const formatExpression = (expr) => {
		// First normalize decimal numbers (e.g., .2 -> 0.2, 2. -> 2)
		let formatted = expr.replace(/(?<!\d)\.(\d+)/g, '0.$1')  // .2 -> 0.2
			.replace(/(\d+)\.(?!\d)/g, '$1');  // 2. -> 2
		
		// Then replace * and / with × and ÷
		formatted = formatted.replace(/\*/g, '×').replace(/\//g, '÷');
		
		// Convert exponents to superscript, including those on parenthesized expressions
		// First pass: handle nested exponents
		while (formatted.includes('^')) {
			formatted = formatted.replace(/(\([^)]+\)|\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g, (match, base, exponent) => {
				// Convert each digit of the exponent to superscript, including the decimal point
				const superscriptExponent = exponent.split('').map(digit => {
					const superscriptMap = {
						'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
						'5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
						'.': 'ᐧ'  // Using a raised dot as superscript decimal point
					};
					return superscriptMap[digit] || digit;
				}).join('');
				
				// If the base already contains superscripts, wrap it in parentheses
				if (/[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]/.test(base)) {
					return `(${base})${superscriptExponent}`;
				}
				return `${base}${superscriptExponent}`;
			});
		}
		
		// Add spaces around operators, but not around parentheses, superscripts, or decimal points
		formatted = formatted
			.replace(/(\d+(?:\.\d+)?)([+\-×÷])/g, '$1 $2') // Space after number before operator
			.replace(/([+\-×÷])(\d+(?:\.\d+)?)/g, '$1 $2') // Space after operator before number
			.replace(/\s*\(\s*/g, '(') // Remove spaces around opening parenthesis
			.replace(/\s*\)\s*/g, ')') // Remove spaces around closing parenthesis
			.replace(/\s+/g, ' ') // Replace multiple spaces with single space
			.trim(); // Remove leading/trailing spaces
		
		return formatted;
	};

	const calculateTotalSteps = (expr) => {
		if (!expr) return 0;
		
		let steps = 0;
		
		// Helper function to count operations in an expression
		const countOperations = (expression) => {
			let count = 0;
			// Count exponents
			count += (expression.match(/\^/g) || []).length;
			// Count multiplication/division
			count += (expression.match(/[\*\/]/g) || []).length;
			// Count addition/subtraction
			count += (expression.match(/[\+\-]/g) || []).length;
			return count;
		};

		// First, find all parenthesized expressions
		const parenthesesMatches = expr.match(/\([^()]+\)/g) || [];
		
		// For each parenthesized expression, count its internal operations
		parenthesesMatches.forEach(match => {
			const innerExpr = match.slice(1, -1); // Remove the parentheses
			steps += countOperations(innerExpr);
		});

		// Create a copy of the expression with parentheses content removed
		let exprWithoutParentheses = expr;
		parenthesesMatches.forEach(match => {
			exprWithoutParentheses = exprWithoutParentheses.replace(match, 'P');
		});

		// Count operations outside parentheses
		steps += countOperations(exprWithoutParentheses);
		
		return steps;
	};

	// Helper: Determine the next correct operation in PEMDAS order for the current expression
	function getNextOperation(expr) {
		const formatted = formatExpression(expr);
		
		// First check for operations within parentheses
		const parenthesesMatches = formatted.match(/\([^()]+\)/g) || [];
		for (const match of parenthesesMatches) {
			const innerExpr = match.slice(1, -1);
			
			// Check for exponents in the inner expression
			if (/([\d\)]+)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/.test(innerExpr)) {
				return { type: 'exponents', inParentheses: true, expression: match };
			}
			
			// Check for multiplication or division in the inner expression
			const multDivMatch = innerExpr.match(/\d+(?:\.\d+)?\s*[×÷]\s*\d+(?:\.\d+)?/);
			if (multDivMatch) {
				return { type: 'multiplication or division', inParentheses: true, expression: match };
			}
			
			// Check for addition or subtraction in the inner expression
			const addSubMatch = innerExpr.match(/\d+(?:\.\d+)?\s*[+\-−]\s*\d+(?:\.\d+)?/);
			if (addSubMatch) {
				return { type: 'addition or subtraction', inParentheses: true, expression: match };
			}
		}
		
		// If no operations in parentheses, check the main expression
		if (/([\d\)]+)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/.test(formatted)) {
			return { type: 'exponents', inParentheses: false, expression: formatted };
		}
		
		const multDivMatch = formatted.match(/\d+(?:\.\d+)?\s*[×÷]\s*\d+(?:\.\d+)?/);
		if (multDivMatch) {
			return { type: 'multiplication or division', inParentheses: false, expression: formatted };
		}
		
		const addSubMatch = formatted.match(/\d+(?:\.\d+)?\s*[+\-−]\s*\d+(?:\.\d+)?/);
		if (addSubMatch) {
			return { type: 'addition or subtraction', inParentheses: false, expression: formatted };
		}
		
		return null;
	}

	// Helper: Get the leftmost operation in the expression
	function getLeftmostOperation(expr, operation) {
		if (!operation) return null;
		
		const formatted = formatExpression(expr);
		
		if (operation.inParentheses) {
			const innerExpr = operation.expression.slice(1, -1);
			let match = null;
			
			if (operation.type === 'exponents') {
				match = innerExpr.match(/(\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/);
			} else if (operation.type === 'multiplication or division') {
				match = innerExpr.match(/\d+(?:\.\d+)?\s*[×÷]\s*\d+(?:\.\d+)?/);
			} else if (operation.type === 'addition or subtraction') {
				match = innerExpr.match(/\d+(?:\.\d+)?\s*[+\-−]\s*\d+(?:\.\d+)?/);
			}
			
			if (match) {
				// Check if this is the last operation in the parentheses
				const remainingExpr = innerExpr.replace(match[0], '');
				const hasMoreOperations = /[+\-×÷^]/.test(remainingExpr);
				
				if (!hasMoreOperations) {
					// If it's the last operation, return the full parenthesized expression
					return {
						operation: operation.expression,
						isLastInParentheses: true
					};
				}
				
				return {
					operation: match[0],
					isLastInParentheses: false
				};
			}
		} else {
			// Original logic for operations outside parentheses
			let match = null;
			if (operation.type === 'exponents') {
				match = formatted.match(/(\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/);
			} else if (operation.type === 'multiplication or division') {
				match = formatted.match(/\d+(?:\.\d+)?\s*[×÷]\s*\d+(?:\.\d+)?/);
			} else if (operation.type === 'addition or subtraction') {
				match = formatted.match(/\d+(?:\.\d+)?\s*[+\-−]\s*\d+(?:\.\d+)?/);
			}
			
			if (match) {
				return {
					operation: match[0],
					isLastInParentheses: false
				};
			}
		}
		
		return null;
	}

	// Add new function to calculate the result of an operation
	const calculateOperationResult = (operation) => {
		// If the operation is in parentheses, evaluate all operations inside
		if (operation.startsWith('(') && operation.endsWith(')')) {
			const innerExpr = operation.slice(1, -1);
			const formattedInner = innerExpr
				.replace('×', '*')
				.replace('÷', '/')
				.replace('−', '-')
				.replace(/\s+/g, '');
			const result = evaluateExpression(formattedInner);
			// Format large numbers using scientific notation
			return formatLargeNumber(result);
		}

		// Handle exponents first
		const exponentMatch = operation.match(/([\d\.\)]+)([⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+)/);
		if (exponentMatch) {
			const base = exponentMatch[1];
			let baseValue = base;
			if (base.startsWith('(') && base.endsWith(')')) {
				baseValue = calculateOperationResult(base);
			}
			const exponent = exponentMatch[2].split('').map(digit => {
				const superscriptMap = {
					'⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
					'⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
					'ᐧ': '.'  // Convert superscript decimal point back to regular decimal point
				};
				return superscriptMap[digit] || digit;
			}).join('');
			const result = Math.pow(Number(baseValue), Number(exponent));
			// Format large numbers using scientific notation
			return formatLargeNumber(result);
		}

		// Convert formatted operators back to standard ones for calculation
		const standardOperation = operation
			.replace('×', '*')
			.replace('÷', '/')
			.replace('−', '-')
			.replace(/\s+/g, '');
		
		// Extract numbers and operator, now handling decimals
		const numbers = standardOperation.match(/\d+(?:\.\d+)?/g).map(Number);
		const operator = standardOperation.match(/[\+\-\*\/]/)[0];
		
		let result;
		switch (operator) {
			case '+':
				result = numbers[0] + numbers[1];
				break;
			case '-':
				result = numbers[0] - numbers[1];
				break;
			case '*':
				result = numbers[0] * numbers[1];
				break;
			case '/':
				result = numbers[0] / numbers[1];
				break;
			default:
				return null;
		}
		
		// Format large numbers using scientific notation
		return formatLargeNumber(result);
	};

	// Helper function to format large numbers
	const formatLargeNumber = (num) => {
		// If the number is an integer and less than 1 million, return as is
		if (Number.isInteger(num) && Math.abs(num) < 1000000) {
			return num;
		}
		
		// For numbers with absolute value >= 1 million or < 0.000001, use scientific notation
		if (Math.abs(num) >= 1000000 || (Math.abs(num) < 0.000001 && num !== 0)) {
			return num.toExponential(2);
		}
		
		// For other numbers, round to 2 decimal places
		return Number(num.toFixed(2));
	};

	// Add function to evaluate an expression following PEMDAS
	const evaluateExpression = (expr) => {
		// Remove all spaces
		expr = expr.replace(/\s+/g, '');
		
		// Helper function to evaluate a single operation
		const evaluateOperation = (num1, op, num2) => {
			const n1 = Number(num1);
			const n2 = Number(num2);
			let result;
			
			switch(op) {
				case '^':
					result = Math.pow(n1, n2);
					break;
				case '*':
					result = n1 * n2;
					break;
				case '/':
					result = n1 / n2;
					break;
				case '+':
					result = n1 + n2;
					break;
				case '-':
					result = n1 - n2;
					break;
				default:
					return null;
			}
			
			return Number.isInteger(result) ? result : Number(result.toFixed(2));
		};
		
		// Helper function to evaluate an expression without parentheses
		const evaluateWithoutParentheses = (expression) => {
			let result = expression;
			
			// Convert superscript numbers back to regular numbers with ^
			const superscriptMap = {
				'⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
				'⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9'
			};
			
			// Convert any superscript numbers back to ^ format
			result = result.replace(/(\d+(?:\.\d+)?)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (match, base, exp) => {
				const regularExp = exp.split('').map(digit => superscriptMap[digit]).join('');
				return `${base}^${regularExp}`;
			});
			
			// Handle exponents from right to left (right-associative)
			while (result.includes('^')) {
				// Find the rightmost ^ operator
				const lastCaretIndex = result.lastIndexOf('^');
				if (lastCaretIndex === -1) break;
				
				// Find the base (number before ^)
				const baseMatch = result.slice(0, lastCaretIndex).match(/(\d+(?:\.\d+)?)$/);
				if (!baseMatch) break;
				const base = baseMatch[1];
				
				// Find the exponent (number after ^)
				const expMatch = result.slice(lastCaretIndex + 1).match(/^(\d+(?:\.\d+)?)/);
				if (!expMatch) break;
				const exp = expMatch[1];
				
				// Calculate the result
				const answer = evaluateOperation(base, '^', exp);
				
				// Replace the operation with its result
				result = result.slice(0, lastCaretIndex - base.length) + 
						answer + 
						result.slice(lastCaretIndex + 1 + exp.length);
			}
			
			// Handle multiplication and division
			while (/[\*\/]/.test(result)) {
				result = result.replace(/(\d+(?:\.\d+)?)([\*\/])(\d+(?:\.\d+)?)/, (match, num1, op, num2) => {
					return evaluateOperation(num1, op, num2);
				});
			}
			
			// Handle addition and subtraction
			while (/[\+\-]/.test(result)) {
				result = result.replace(/(\d+(?:\.\d+)?)([\+\-])(\d+(?:\.\d+)?)/, (match, num1, op, num2) => {
					return evaluateOperation(num1, op, num2);
				});
			}
			
			return result;
		};
		
		// Handle parentheses first
		while (expr.includes('(')) {
			expr = expr.replace(/\(([^()]+)\)/g, (match, innerExpr) => {
				return evaluateWithoutParentheses(innerExpr);
			});
		}
		
		// Evaluate the remaining expression
		return Number(evaluateWithoutParentheses(expr));
	};

	// Add function to get the simplified expression
	const getSimplifiedExpression = (expr, operation) => {
		const result = calculateOperationResult(operation);
		
		if (result === null) {
			return expr;
		}
		
		// Get the formatted version of the expression
		const formattedExpr = formatExpression(expr);
		
		// If the operation is in parentheses, we need to handle the replacement carefully
		if (operation.startsWith('(') && operation.endsWith(')')) {
			// Get the formatted version of the operation (this is what's displayed in the UI)
			const formattedOperation = formatExpression(operation);
			
			// Check if the operation has an exponent
			const hasExponent = /\)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/.test(formattedOperation);
			
			if (hasExponent) {
				// For parenthesized expressions with exponents, we need to handle the entire expression
				// including the exponent
				const operationIndex = formattedExpr.indexOf(formattedOperation);
				if (operationIndex !== -1) {
					// Replace the entire operation including the exponent
					const simplified = formattedExpr.slice(0, operationIndex) + 
									result.toString() + 
									formattedExpr.slice(operationIndex + formattedOperation.length);
					
					// Ensure we don't have any double spaces or spaces around operators
					const finalResult = formatExpression(simplified)
						.replace(/\s+/g, ' ')  // Replace multiple spaces with single space
						.replace(/\s*([+\-×÷])\s*/g, ' $1 ')  // Ensure spaces around operators
						.trim();
					
					return finalResult;
				}
			} else {
				// For regular parenthesized expressions without exponents
				const operationIndex = formattedExpr.indexOf(formattedOperation);
				if (operationIndex !== -1) {
					// Replace the operation with the result
					const simplified = formattedExpr.slice(0, operationIndex) + 
									result.toString() + 
									formattedExpr.slice(operationIndex + formattedOperation.length);
					
					// Ensure we don't have any double spaces or spaces around operators
					const finalResult = formatExpression(simplified)
						.replace(/\s+/g, ' ')  // Replace multiple spaces with single space
						.replace(/\s*([+\-×÷])\s*/g, ' $1 ')  // Ensure spaces around operators
						.trim();
					
					return finalResult;
				}
			}
		}
		
		// For non-parenthesized operations, use the original replacement logic
		const formattedOperation = formatExpression(operation);
		const simplified = formattedExpr.replace(formattedOperation, ` ${result} `).trim();
		const finalResult = formatExpression(simplified);
		return finalResult;
	};

	const handleSimplify = () => {
		// First trigger removal animations
		setIsBigShrinking(true);
		setIsProgressShrinking(true);
		setIsInstructionFadingOut(true);
		setShowOperationHighlight(false);
		setShowContinueButton(false);
		setIsContinueButtonShrinking(false);
		setHighlightedOperation(null);
		setIsSimplifying(false);
		setIsHighlightedOperationShrinking(false);
		setIsHighlightedOperationGrowing(false);
		setIsHighlightedOperationVisible(true);
		setCurrentOperationResult(null);
		setHighlightedOperationPosition({ left: 0, top: 0 });
		setHighlightedOperationRef(null);
		setIsLastInParentheses(false);
		setFullParentheses(null);

		// Wait for animations to complete before resetting
		setTimeout(() => {
			// Reset all state variables
			setCurrentStep(1);
			setCompletedSteps({
				step1: false,
				step2: false,
				step3: false,
				step4: false,
				step5: false
			});
			setIsError(false);
			setIsShrinking(false);
			setDisplayedExpression('');
			setIsBigShrinking(false);
			setBigAnimKey(prev => prev + 1);
			setIsPlaceholderGrowing(false);
			setTotalSteps(0);
			setIsProgressShrinking(false);
			setIsProgressGrowing(false);
			setShowProgress(false);
			setShowInstruction(false);
			setIsInstructionFadingOut(false);
			setShowOperationHighlight(false);
			setShowContinueButton(false);
			setHighlightedOperation(null);
			setIsSimplifying(false);
			setIsContinueButtonShrinking(false);
			setIsHighlightedOperationShrinking(false);
			setIsHighlightedOperationGrowing(false);
			setIsHighlightedOperationVisible(true);
			setCurrentOperationResult(null);
			setHighlightedOperationPosition({ left: 0, top: 0 });
			setHighlightedOperationRef(null);
			setIsLastInParentheses(false);
			setFullParentheses(null);

			const validation = validateExpression(expression);
			if (!validation.isValid) {
				if (!showPlaceholder) {
					setIsBigShrinking(true);
					setIsProgressShrinking(true);
					setIsInstructionFadingOut(true);
					setShowOperationHighlight(false);
					setShowContinueButton(false);
					setIsContinueButtonShrinking(false);
					setHighlightedOperation(null);
					setTimeout(() => {
						setShowPlaceholder(true);
						setIsBigShrinking(false);
						setIsProgressShrinking(false);
						setShowProgress(false);
						setIsPlaceholderGrowing(true);
						setIsError(true);
						setShowInstruction(false);
						setIsInstructionFadingOut(false);
						setTimeout(() => {
							setIsError(false);
							setIsPlaceholderGrowing(false);
						}, 1000);
					}, 400);
				} else {
					setIsError(true);
					setTimeout(() => setIsError(false), 1000);
				}
				return;
			}

			// Start the animation sequence
			setIsProgressShrinking(true);
			setIsInstructionFadingOut(true);
			setShowOperationHighlight(false);
			setShowContinueButton(false);
			setIsContinueButtonShrinking(false);
			setHighlightedOperation(null);
			setTimeout(() => {
				// After shrinking, update the steps
				setTotalSteps(calculateTotalSteps(expression));
				setCurrentStep(1);
				setIsProgressShrinking(false);
				setIsProgressGrowing(true);
				setShowInstruction(false);
				setIsInstructionFadingOut(false);
				
				// After a brief delay, start growing
				setTimeout(() => {
					setIsProgressGrowing(false);
				}, 400);
			}, 400);

			if (!showPlaceholder) {
				setIsBigShrinking(true);
				setTimeout(() => {
					setDisplayedExpression(expression);
					setIsBigShrinking(false);
					setBigAnimKey(prev => prev + 1);
					// Show instruction after expression appears
					setTimeout(() => {
						setShowInstruction(true);
						// Show operation highlight after instruction appears
						setTimeout(() => {
							setShowOperationHighlight(true);
							const nextOp = getNextOperation(expression);
							const leftmostOp = getLeftmostOperation(expression, nextOp);
							setHighlightedOperation(leftmostOp.operation);
							setIsLastInParentheses(leftmostOp.isLastInParentheses);
							setFullParentheses(leftmostOp.fullParentheses);
							// Show continue button after operation highlight
							setTimeout(() => {
								setShowContinueButton(true);
							}, 500);
						}, 1000);
					}, 500);
				}, 400);
				return;
			}

			setIsShrinking(true);
			setTimeout(() => {
				setShowPlaceholder(false);
				setIsShrinking(false);
				setDisplayedExpression(expression);
				setBigAnimKey(prev => prev + 1);
				// Show instruction after expression appears
				setTimeout(() => {
					setShowInstruction(true);
					// Show operation highlight after instruction appears
					setTimeout(() => {
						setShowOperationHighlight(true);
						const nextOp = getNextOperation(expression);
						const leftmostOp = getLeftmostOperation(expression, nextOp);
						setHighlightedOperation(leftmostOp.operation);
						setIsLastInParentheses(leftmostOp.isLastInParentheses);
						setFullParentheses(leftmostOp.fullParentheses);
						// Show continue button after operation highlight
						setTimeout(() => {
							setShowContinueButton(true);
						}, 500);
					}, 1000);
				}, 500);
			}, 500);
		}, 400); // Wait for removal animations to complete
	};

	const getCurrentPemdasStep = (operation, isLastInParentheses) => {
		if (!operation) return { current: null, inParentheses: false };
		
		// If we're in parentheses, we need to highlight both P and the current operation
		if (isLastInParentheses) {
			if (operation.includes('^') || operation.includes('²')) {
				return { current: '^', inParentheses: true };
			}
			if (operation.includes('×') || operation.includes('÷')) {
				return { current: '×÷', inParentheses: true };
			}
			if (operation.includes('+') || operation.includes('-')) {
				return { current: '+-', inParentheses: true };
			}
		}
		
		// Regular operation highlighting
		if (operation.includes('^') || operation.includes('²')) {
			return { current: '^', inParentheses: false };
		}
		if (operation.includes('×') || operation.includes('÷')) {
			return { current: '×÷', inParentheses: false };
		}
		if (operation.includes('+') || operation.includes('-')) {
			return { current: '+-', inParentheses: false };
		}
		
		return { current: null, inParentheses: false };
	};

	// Add useEffect to track animation states
	useEffect(() => {
		if (highlightedOperationRef && isHighlightedOperationVisible) {
			const rect = highlightedOperationRef.getBoundingClientRect();
			const parentRect = highlightedOperationRef.parentElement.getBoundingClientRect();
			setHighlightedOperationPosition({
				left: rect.left - parentRect.left + rect.width / 2,
				top: rect.top - parentRect.top + rect.height / 2
			});
		}
	}, [highlightedOperationRef, isHighlightedOperationVisible]);

	return (
		<>
			<style>{`
			@keyframes grow-in {
				0% { transform: scale(0.7); opacity: 0; }
				100% { transform: scale(1); opacity: 1; }
			}
			.grow-in {
				animation: grow-in 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes shrink-out {
				0% { transform: scale(1); opacity: 1; }
				100% { transform: scale(0.7); opacity: 0; }
			}
			.shrink-out {
				animation: shrink-out 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes simplified-grow-in {
				0% { 
					transform: translate(-50%, -50%) scale(0.8); 
					opacity: 0;
				}
				100% { 
					transform: translate(-50%, -50%) scale(1); 
					opacity: 1;
				}
			}
			.simplified-grow-in {
				display: inline-block;
				animation: simplified-grow-in 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
				position: absolute;
				z-index: 10;
				white-space: nowrap;
				padding-bottom: 4px;
			}
			.expression-wrapper {
				position: relative;
				display: inline-block;
				min-height: 50px;
			}
			@keyframes simplified-shrink-out {
				0% { transform: scale(1); opacity: 1; }
				100% { transform: scale(0.8); opacity: 0; }
			}
			.simplified-shrink-out {
				animation: simplified-shrink-out 0.2s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes final-answer-transition {
				0% { color: inherit; }
				100% { color: #008545; }
			}
			.final-answer {
				animation: final-answer-transition 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
				animation-delay: 0.2s; /* Wait for grow animation to complete */
			}
			.simplified-shrink-out.final-answer {
				animation: simplified-shrink-out 0.2s cubic-bezier(0.4,0,0.2,1) forwards;
				animation-delay: 0s;
			}
			@keyframes simplified-portion-grow-in {
				0% { transform: scale(0.9); opacity: 0; }
				100% { transform: scale(1); opacity: 1; }
			}
			.simplified-portion-grow-in {
				animation: simplified-portion-grow-in 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
				display: inline-block;
				transform-origin: center;
			}
			.progress-circle {
				width: 8px;
				height: 8px;
				border-radius: 50%;
				background-color: #E5E7EB;
				transition: background-color 0.3s ease;
			}
			.progress-circle.active {
				background-color: #5750E3;
			}
			.progress-circle.shrink-out {
				animation: shrink-out 0.4s cubic-bezier(0.4,0,0.2,1) both;
			}
			.progress-circle.grow-in {
				animation: grow-in 0.4s cubic-bezier(0.4,0,0.2,1) both;
			}
			.instruction-text {
				animation: grow-in 0.4s cubic-bezier(0.4,0,0.2,1) both;
			}
			.operation-btn:hover:not(.red-glow):not(.green-glow) {
				border-color: #5750E3 !important;
				background: #edeaff !important;
				color: #5750E3 !important;
			}
			.red-glow {
				border-color: #ff4d4f !important;
				background: #fff0f0 !important;
				color: #ff4d4f !important;
				transition: border-color 0.2s, background 0.2s, color 0.2s;
			}
			.text-red-glow {
				color: #ff4d4f !important;
				transition: color 0.2s;
			}
			.green-glow {
				border-color: #52c41a !important;
				background: #f6ffed !important;
				color: #52c41a !important;
				transition: border-color 0.2s, background 0.2s, color 0.2s;
			}
			.text-green-glow {
				color: #52c41a !important;
				transition: color 0.2s;
			}
			@keyframes fade-in {
				0% { transform: translateY(-8px); opacity: 0; }
				100% { transform: translateY(0); opacity: 1; }
			}
			.fade-in {
				animation: fade-in 0.4s cubic-bezier(0.4,0,0.2,1) both;
			}
			@keyframes fade-out {
				0% { transform: translateY(0); opacity: 1; }
				100% { transform: translateY(8px); opacity: 0; }
			}
			.fade-out {
				animation: fade-out 0.4s cubic-bezier(0.4,0,0.2,1) both;
			}
			@keyframes highlight {
				0% { color: inherit; }
				100% { color: #5750E3; }
			}
			.highlight {
				animation: highlight 0.3s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes bounce-then-shrink {
				0% { transform: scale(1); opacity: 1; }
				50% { transform: scale(1.1); opacity: 1; }
				100% { transform: scale(0.8); opacity: 0; }
			}
			.highlighted-operation {
				display: inline-block;
				transform-origin: center;
				transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1);
			}
			.highlighted-operation.shrinking {
				animation: bounce-then-shrink 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			.highlighted-operation.growing {
				transform: scale(1);
				opacity: 1;
			}
			`}</style>
			<div className="w-[500px] mx-auto mt-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] bg-white rounded-lg select-none">
				<div className="p-4">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-[#5750E3] text-sm font-medium select-none">Order of Operations Explorer</h2>
						<div className="flex gap-2">
						</div>
					</div>

					<div className="flex items-center gap-2 mb-4 max-w-[470px] mx-auto">
						<input
							type="text"
							value={expression}
							onChange={handleExpressionChange}
							placeholder="Enter an expression (e.g., 2 + 3 * 4)"
							className="flex-1 h-[35px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5750E3] select-none"
						/>
						<Button 
							onClick={handleSimplify}
							className="h-[35px] bg-[#5750E3] hover:bg-[#4a42c7] text-white text-sm px-3 rounded-md select-none touch-manipulation"
						>
							Simplify
						</Button>
						<Button 
							onClick={handleRandomExpression}
							className="h-[35px] bg-[#5750E3] hover:bg-[#4a42c7] text-white text-sm px-3 rounded-md select-none touch-manipulation"
						>
							Random
						</Button>
					</div>

					<div className="mt-4 space-y-4">
						<div className={`w-full min-h-[200px] p-2 bg-white border border-[#5750E3]/30 rounded-md flex justify-center items-center relative`}> 
							{!showPlaceholder && showInstruction && (
								<div className={`absolute top-4 left-0 right-0 text-center mx-auto ${currentStep === 1 ? 'max-w-[450px]' : 'max-w-[430px]'}`}>
									<p className={`text-sm text-gray-600 ${isInstructionFadingOut ? 'fade-out' : 'fade-in'}`}>
										{getNextOperation(displayedExpression) === null 
											? "We have successfully simplified using the order of operations!"
											: currentStep === 1
												? <>According to PEMDAS, the first operation to do here would be the leftmost <span className="font-bold">{getNextOperation(displayedExpression).type}</span>{getNextOperation(displayedExpression).inParentheses ? " in the leftmost parenthesis" : ""}.</>
												: <>The next step according to PEMDAS would be the leftmost <span className="font-bold">{getNextOperation(displayedExpression).type}</span>{getNextOperation(displayedExpression).inParentheses ? " in the leftmost parenthesis" : ""}.</>
										}
									</p>
								</div>
							)}
							{!showPlaceholder && (
								<div className="w-full flex flex-col gap-2 items-center justify-end absolute left-0 bottom-0 pb-5">
									{/* Progress Bar */}
									{totalSteps > 0 && (
										<div className="flex gap-2 -mt-[5px]">
											{[...Array(totalSteps)].map((_, index) => (
												<div
													key={`${bigAnimKey}-${index}`}
													className={`progress-circle ${index + 1 <= currentStep ? 'active' : ''} ${isProgressShrinking ? 'shrink-out' : isProgressGrowing ? 'grow-in' : ''}`}
												/>
											))}
										</div>
									)}
									{/* PEMDAS Boxes */}
									<div className="absolute left-3 bottom-3">
										<div className={`flex gap-1 ${isProgressShrinking ? 'shrink-out' : isProgressGrowing ? 'grow-in' : ''}`}>
											<div className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded transition-colors duration-300 ${
												getCurrentPemdasStep(highlightedOperation, isLastInParentheses).inParentheses ? 'bg-[#CDCAF7] text-[#5750E3]' : 'bg-[#5750E3]/10 text-[#5750E3]'
											}`}>( )</div>
											<div className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded transition-colors duration-300 ${
												getCurrentPemdasStep(highlightedOperation, isLastInParentheses).current === '^' ? 'bg-[#CDCAF7] text-[#5750E3]' : 'bg-[#5750E3]/10 text-[#5750E3]'
											}`}>^</div>
											<div className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded transition-colors duration-300 ${
												getCurrentPemdasStep(highlightedOperation, isLastInParentheses).current === '×÷' ? 'bg-[#CDCAF7] text-[#5750E3]' : 'bg-[#5750E3]/10 text-[#5750E3]'
											}`}>×÷</div>
											<div className={`w-6 h-6 flex items-center justify-center text-xs font-medium rounded transition-colors duration-300 ${
												getCurrentPemdasStep(highlightedOperation, isLastInParentheses).current === '+-' ? 'bg-[#CDCAF7] text-[#5750E3]' : 'bg-[#5750E3]/10 text-[#5750E3]'
											}`}>+-</div>
										</div>
									</div>
								</div>
							)}
							{showPlaceholder ? (
								<p className={`text-gray-500 text-center select-none max-w-[280px] transition-all duration-500 ${isShrinking ? 'scale-0 opacity-0' : isPlaceholderGrowing ? 'grow-in' : 'scale-100 opacity-100'}`}>
									Enter a <span className={`transition-all duration-300 ${isError ? 'font-bold text-yellow-500' : ''}`}>valid simple expression</span> to simplify it using the order of operations!
								</p>
							) : (
								<>
									<p
										key={bigAnimKey}
										className={`text-3xl font-bold text-black select-none ${isBigShrinking ? 'simplified-shrink-out' : ''} ${getNextOperation(displayedExpression) === null && !isBigShrinking ? 'final-answer' : ''} ${isProgressGrowing ? 'grow-in' : ''}`}
									>
										<span className="expression-wrapper">
											<span className="expression-content">
												{formatExpression(displayedExpression).split(highlightedOperation || '').map((part, index, array) => (
													<React.Fragment key={index}>
														{part}
														{index < array.length - 1 && highlightedOperation && (
															<span 
																className={`highlighted-operation ${showOperationHighlight ? 'highlight' : ''} ${
																	isHighlightedOperationShrinking ? 'shrinking' : 
																	isHighlightedOperationGrowing ? 'growing' : ''
																}`}
																style={{
																	visibility: isHighlightedOperationVisible ? 'visible' : 'hidden',
																	display: 'inline-block'
																}}
																ref={setHighlightedOperationRef}
															>
																{highlightedOperation}
															</span>
														)}
													</React.Fragment>
												))}
											</span>
											{isSimplifying && !isHighlightedOperationShrinking && (
												<span 
													className="simplified-grow-in"
													style={{
														position: 'absolute',
														left: `${highlightedOperationPosition.left}px`,
														top: `${highlightedOperationPosition.top}px`,
														transform: 'translate(-50%, -50%)',
														zIndex: 10,
														display: 'inline-block',
														whiteSpace: 'nowrap'
													}}
												>
													{currentOperationResult}
												</span>
											)}
										</span>
									</p>
									{showContinueButton && (
										<div className="absolute bottom-3 right-3">
											<Button 
												onClick={() => {
													// Start the animation sequence
													setIsContinueButtonShrinking(true);
													setIsInstructionFadingOut(true);
													setIsHighlightedOperationShrinking(true);
													setIsHighlightedOperationGrowing(false);
													
													// Store the current operation before we start changing states
													const currentOperation = highlightedOperation;
													
													// Calculate the simplified expression and result while we still have the operation
													const simplifiedExpr = getSimplifiedExpression(displayedExpression, currentOperation);
													const operationResult = calculateOperationResult(currentOperation);
													
													// Store the operation result in state
													setCurrentOperationResult(operationResult);
													
													// Wait for shrink animation to complete before proceeding
													setTimeout(() => {
														// Reset shrink state but keep the space occupied
														setIsHighlightedOperationShrinking(false);
														setIsHighlightedOperationVisible(false);
														
														// Small delay to ensure shrink state is reset
														requestAnimationFrame(() => {
															setIsSimplifying(true);
															
															// Wait for the simplified portion animation to complete before updating the entire expression
															setTimeout(() => {
																setDisplayedExpression(simplifiedExpr);
																setIsSimplifying(false);
																setCurrentOperationResult(null);
																
																setShowContinueButton(false);
																setIsContinueButtonShrinking(false);
																setShowInstruction(false);
																setIsInstructionFadingOut(false);
																setCurrentStep(prev => prev + 1);
																setBigAnimKey(prev => prev + 1);
																
																// After a brief delay, show the new instruction
																setTimeout(() => {
																	setShowInstruction(true);
																	
																	// Check if there are more operations to perform
																	const nextOp = getNextOperation(simplifiedExpr);
																	if (nextOp === null) {
																		// No more operations - show completion message
																		setShowOperationHighlight(false);
																		setHighlightedOperation(null);
																	} else {
																		// Show operation highlight after instruction appears
																		setTimeout(() => {
																			const nextOperation = getLeftmostOperation(simplifiedExpr, nextOp);
																			setShowOperationHighlight(true);
																			setHighlightedOperation(nextOperation.operation);
																			setIsLastInParentheses(nextOperation.isLastInParentheses);
																			setIsHighlightedOperationVisible(true);
																			setIsHighlightedOperationGrowing(true);
																			
																			// Show continue button after operation highlight
																			setTimeout(() => {
																				setShowContinueButton(true);
																				setIsHighlightedOperationGrowing(false);
																			}, 500);
																		}, 1000);
																	}
																}, 500);
															}, 1000);
														});
													}, 600);
												}}
												className={`h-[35px] bg-[#5750E3] hover:bg-[#4a42c7] text-white text-sm px-3 rounded-md select-none touch-manipulation ${isContinueButtonShrinking ? 'shrink-out' : 'fade-in'}`}
											>
												Continue
											</Button>
										</div>
									)}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default OrderOfOperations;