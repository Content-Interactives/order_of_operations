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

		return { isValid: true };
	};

	const formatExpression = (expr) => {
		// First replace * and / with × and ÷
		let formatted = expr.replace(/\*/g, '×').replace(/\//g, '÷');
		
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
		
		// Count each set of parentheses as a separate step
		const parenthesesMatches = expr.match(/\([^()]+\)/g) || [];
		steps += parenthesesMatches.length;
		
		// Create a copy of the expression with parentheses content removed
		// But preserve operators between parentheses by replacing with a placeholder
		let exprWithoutParentheses = expr;
		parenthesesMatches.forEach(match => {
			exprWithoutParentheses = exprWithoutParentheses.replace(match, 'P');
		});
		
		// Then check for exponents outside parentheses
		const exponentMatches = [...exprWithoutParentheses.matchAll(/\^/g)] || [];
		steps += exponentMatches.length;
		
		// Then check for multiplication or division outside parentheses
		const multDivMatches = [...exprWithoutParentheses.matchAll(/[\*\/]/g)] || [];
		steps += multDivMatches.length;
		
		// Finally check for addition or subtraction outside parentheses
		const addSubMatches = [...exprWithoutParentheses.matchAll(/[\+\-]/g)] || [];
		steps += addSubMatches.length;
		
		return steps;
	};

	// Helper: Determine the next correct operation in PEMDAS order for the current expression
	function getNextOperation(expr) {
		const formatted = formatExpression(expr);
		
		// Check for parentheses first
		if (/\(/.test(formatted)) return 'parentheses';
		
		// Check for exponents
		if (/([\d\)]+)[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.test(formatted)) return 'exponents';
		
		// Check for multiplication or division
		const multDivMatch = formatted.match(/\d+(?:\.\d+)?\s*[×÷]\s*\d+(?:\.\d+)?/);
		if (multDivMatch) return 'multiplication or division';
		
		// Only check for addition or subtraction if there are no multiplication/division operations
		const addSubMatch = formatted.match(/\d+(?:\.\d+)?\s*[+\-−]\s*\d+(?:\.\d+)?/);
		if (addSubMatch) return 'addition or subtraction';
		
		return null;
	}

	// Helper: Get the leftmost operation in the expression
	function getLeftmostOperation(expr, operation) {
		const formatted = formatExpression(expr);
		
		if (operation === 'parentheses') {
			// First check for parentheses containing exponents
			const exponentInParensMatch = formatted.match(/\(([^()]*[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ][^()]*|[^()]*[+\-×÷][^()]*)\)/);
			if (exponentInParensMatch) {
				return exponentInParensMatch[0];
			}
			// Then check for regular parentheses
			const regularParensMatch = formatted.match(/\(([^()]+)\)/);
			if (regularParensMatch) {
				return regularParensMatch[0];
			}
		} else if (operation === 'exponents') {
			// Match exponents, including those on parenthesized expressions, with decimal points
			const match = formatted.match(/(\([^)]+\)|\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/);
			if (match) return match[0];
		} else if (operation === 'multiplication or division') {
			// Match numbers with optional decimals
			const match = formatted.match(/\d+(?:\.\d+)?\s*[×÷]\s*\d+(?:\.\d+)?/);
			if (match) return match[0];
		} else if (operation === 'addition or subtraction') {
			// Match numbers with optional decimals
			const matches = [...formatted.matchAll(/\d+(?:\.\d+)?\s*[+\-−]\s*\d+(?:\.\d+)?/g)];
			if (matches.length > 0) {
				return matches[0][0];
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
			
			// Instead of using regex replacement, find the exact position of the operation
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
							setHighlightedOperation(getLeftmostOperation(expression, nextOp));
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
						setHighlightedOperation(getLeftmostOperation(expression, nextOp));
						// Show continue button after operation highlight
						setTimeout(() => {
							setShowContinueButton(true);
						}, 500);
					}, 1000);
				}, 500);
			}, 500);
		}, 400); // Wait for removal animations to complete
	};

	// Add useEffect to track animation states
	useEffect(() => {
		// Animation states tracking removed
	}, [isHighlightedOperationShrinking, isHighlightedOperationGrowing]);

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
				0% { transform: scale(0.8); opacity: 0; }
				100% { transform: scale(1); opacity: 1; }
			}
			.simplified-grow-in {
				animation: simplified-grow-in 0.2s cubic-bezier(0.4,0,0.2,1) forwards;
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
				100% { color: #52c41a; }
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
			.highlighted-operation {
				display: inline-block;
				transform-origin: center;
				transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s cubic-bezier(0.4,0,0.2,1);
			}
			.highlighted-operation.shrinking {
				transform: scale(0.7);
				opacity: 0;
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
												? <>According to PEMDAS, the first operation to do here would be the leftmost <span className="font-bold">{getNextOperation(displayedExpression)}</span>.</>
												: <>The next step according to PEMDAS would be the leftmost <span className="font-bold">{getNextOperation(displayedExpression)}</span>.</>
										}
									</p>
								</div>
							)}
							{!showPlaceholder && (
								<div className="w-full flex flex-col gap-2 items-center justify-end absolute left-0 bottom-0 pb-4">
									{/* Progress Bar */}
									{totalSteps > 0 && (
										<div className="flex gap-2">
											{[...Array(totalSteps)].map((_, index) => (
												<div
													key={`${bigAnimKey}-${index}`}
													className={`progress-circle ${index + 1 <= currentStep ? 'active' : ''} ${isProgressShrinking ? 'shrink-out' : isProgressGrowing ? 'grow-in' : ''}`}
												/>
											))}
										</div>
									)}
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
										className={`text-3xl font-bold text-black select-none ${isBigShrinking ? 'simplified-shrink-out' : !isSimplifying ? 'simplified-grow-in' : ''} ${getNextOperation(displayedExpression) === null && !isBigShrinking ? 'final-answer' : ''}`}
									>
										<span className="expression-wrapper">
											<span className={`expression-content ${isSimplifying ? 'fading' : ''}`}>
												{formatExpression(displayedExpression).split(highlightedOperation || '').map((part, index, array) => (
													<React.Fragment key={index}>
														{part}
														{index < array.length - 1 && highlightedOperation && (
															<span 
																key={`highlight-${bigAnimKey}-${index}`}
																className={`highlighted-operation ${showOperationHighlight ? 'highlight' : ''} ${
																	isHighlightedOperationShrinking ? 'shrinking' : 
																	isHighlightedOperationGrowing ? 'growing' : ''
																}`}
															>
																{highlightedOperation}
															</span>
														)}
													</React.Fragment>
												))}
											</span>
											{isSimplifying && !isHighlightedOperationShrinking && (
												<span className="simplified-portion-grow-in">
													{getSimplifiedExpression(displayedExpression, highlightedOperation)}
												</span>
											)}
										</span>
									</p>
									{showContinueButton && (
										<div className="absolute bottom-4 right-4">
											<Button 
												onClick={() => {
													// Start the animation sequence
													setIsContinueButtonShrinking(true);
													setIsSimplifying(true);
													setIsInstructionFadingOut(true);
													setIsHighlightedOperationShrinking(true);
													setIsHighlightedOperationGrowing(false);
													
													// Store the current operation before we start changing states
													const currentOperation = highlightedOperation;
													
													// Wait for shrink animation to complete before proceeding
													setTimeout(() => {
														// Calculate and set the simplified expression
														const simplifiedExpr = getSimplifiedExpression(displayedExpression, currentOperation);
														
														// Update all states at once to prevent stalling
														setDisplayedExpression(simplifiedExpr);
														setIsSimplifying(false);
														setIsHighlightedOperationShrinking(false);
														setShowOperationHighlight(false);
														setShowContinueButton(false);
														setIsContinueButtonShrinking(false);
														setShowInstruction(false);
														setIsInstructionFadingOut(false);
														setHighlightedOperation(null);
														setCurrentStep(prev => prev + 1);
														setBigAnimKey(prev => prev + 1); // Force re-render for grow-in animation
														
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
																	setHighlightedOperation(nextOperation);
																	setIsHighlightedOperationGrowing(true);
																	
																	// Show continue button after operation highlight
																	setTimeout(() => {
																		setShowContinueButton(true);
																		setIsHighlightedOperationGrowing(false);
																	}, 500);
																}, 1000);
															}
														}, 500);
													}, 400);
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