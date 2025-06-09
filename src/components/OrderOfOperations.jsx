import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../components/ui/button";

const OrderOfOperations = () => {
	const [currentStep, setCurrentStep] = useState(1);
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
	const [isPemdasAnimationComplete, setIsPemdasAnimationComplete] = useState(false);
	const [showOperationButtons, setShowOperationButtons] = useState(true);
	const [isPemdasAnimating, setIsPemdasAnimating] = useState(false);
	const [isPemdasButtonsShrinking, setIsPemdasButtonsShrinking] = useState(false);
	const [isPemdasButtonsGrowing, setIsPemdasButtonsGrowing] = useState(false);
	const [isFirstValidSimplify, setIsFirstValidSimplify] = useState(true);
	const [needsDelay, setNeedsDelay] = useState(true);
	const [expressionHistory, setExpressionHistory] = useState([]);
	const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
	const [isSolved, setIsSolved] = useState(false);
	const [isOpWidthTransitioning, setIsOpWidthTransitioning] = useState(false);
	const opWidthRef = useRef(null);
	const [showGrowIn, setShowGrowIn] = useState(false);
	const [showNavigationButtons, setShowNavigationButtons] = useState(false);
	const [navigationDirection, setNavigationDirection] = useState(null);
	const [leftButtonVisible, setLeftButtonVisible] = useState(false);
	const [isGlowActive, setIsGlowActive] = useState(true);
	const [isContinueGlowActive, setIsContinueGlowActive] = useState(true);

	// Add handleContinue function definition
	const handleContinue = () => {
		
		// Start animations
		setIsContinueButtonShrinking(true);
		setIsHighlightedOperationShrinking(true);
		setIsHighlightedOperationGrowing(false);
		setNavigationDirection('forward');
		setIsGlowActive(false);
		// Remove this line to keep the orbit animation active
		// setIsContinueGlowActive(false);

		// Store the current operation before we start changing states
		const currentOperation = highlightedOperation;
		
		// Calculate the simplified expression and result while we still have the operation
		const simplifiedExpr = getSimplifiedExpression(displayedExpression, currentOperation);
		
		const operationResult = calculateOperationResult(currentOperation);
		
		// Store the operation result in state
		setCurrentOperationResult(operationResult);

		// Calculate initial position before any transitions
		const opElement = opWidthRef.current;
		if (opElement) {
			const rect = opElement.getBoundingClientRect();
			const wrapper = opElement.closest('.expression-wrapper');
			const wrapperRect = wrapper.getBoundingClientRect();
			
			// Calculate the center position relative to the wrapper
			const centerPos = rect.left - wrapperRect.left + (rect.width / 2);
			const centerTop = rect.top - wrapperRect.top + (rect.height / 2);
			
			setHighlightedOperationPosition({
				left: centerPos,
				top: centerTop
			});
		}

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
					// Update expression and states
					setDisplayedExpression(simplifiedExpr);
					setIsSimplifying(false);
					setCurrentOperationResult(null);
					setShowContinueButton(false);
					setIsContinueButtonShrinking(false);
					setCurrentStep(prev => prev + 1);
					setBigAnimKey(prev => prev + 1);

					// Add the simplified expression to history
					setExpressionHistory(prev => [...prev, simplifiedExpr]);
					setCurrentHistoryIndex(prev => prev + 1);

					// Check if expression is fully solved
					const nextOp = getNextOperation(simplifiedExpr);
					const isSingleNumber = /^-?\d+(\.\d+)?$/.test(simplifiedExpr.replace(/\s+/g, ''));
					
					if (nextOp === null && isSingleNumber) {
						setShowOperationHighlight(false);
						setHighlightedOperation(null);
						setIsSolved(true);
					} else {
						// Set up next operation but don't show highlight yet
						const nextOperation = getLeftmostOperation(simplifiedExpr, nextOp);
						
						if (nextOperation) {
							// Wait for expression to appear before showing highlight
							setTimeout(() => {
								// First set the operation without showing highlight
								setHighlightedOperation(nextOperation.operation);
								setIsLastInParentheses(nextOperation.isLastInParentheses);
								
								// Small delay to ensure operation is set
								requestAnimationFrame(() => {
									// Then show the highlight
									setIsHighlightedOperationVisible(true);
									setShowOperationHighlight(true);
									setIsHighlightedOperationGrowing(true);
									
									// Show continue button after highlight is fully visible
									setTimeout(() => {
										setShowContinueButton(true);
										setIsHighlightedOperationGrowing(false);
									}, 500);
								});
							}, 800);
						} else {
							// If no next operation is found, mark as solved
							setShowOperationHighlight(false);
							setHighlightedOperation(null);
							setIsSolved(true);
						}
					}
				}, 1000);
			});
		}, 600);
	};

	const generateRandomNumber = (min, max) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	const generateRandomExpression = () => {
		const expressions = [
			// Simple expressions
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				return `${num1} + ${num2} * ${num3}`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, num1); // Ensure num3 is smaller than num1
				return `${num1} * ${num2} - ${num3}`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				return `${num1} / ${num2} + ${num3}`;
			},
			
			// Expressions with parentheses
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				return `(${num1} + ${num2}) * ${num3}`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, num1); // Ensure num3 is smaller than num1
				return `${num1} * (${num2} - ${num3})`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				return `(${num1} + ${num2}) / ${num3}`;
			},
			
			// Expressions with exponents
			() => {
				const num1 = generateRandomNumber(1, 5);
				const num2 = generateRandomNumber(1, 9);
				return `${num1}^2 + ${num2}`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 5);
				return `${num1} * ${num2}^2`;
			},
			() => {
				const num1 = generateRandomNumber(1, 5);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				return `(${num1}^2 + ${num2}) * ${num3}`;
			},
			
			// Complex expressions
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				const num4 = generateRandomNumber(1, num3); // Ensure num4 is smaller than num3
				return `(${num1} + ${num2}) * (${num3} - ${num4})`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 5);
				const num3 = generateRandomNumber(1, 9);
				return `${num1} * ${num2}^2 + ${num3}`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				const num4 = generateRandomNumber(1, 9);
				return `(${num1} + ${num2}) / ${num3} * ${num4}`;
			},
			() => {
				const num1 = generateRandomNumber(1, 5);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				return `${num1}^2 * ${num2} - ${num3}`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				const num4 = generateRandomNumber(1, 9);
				return `(${num1} * ${num2}) + (${num3} / ${num4})`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				return `${num1} * (${num2} + ${num3})^2`;
			},
			
			// New expressions with exponents on parentheses
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				return `(${num1} + ${num2})^2`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, 9);
				return `(${num1} * ${num2})^2 + ${num3}`;
			},
			() => {
				const num1 = generateRandomNumber(1, 9);
				const num2 = generateRandomNumber(1, 9);
				const num3 = generateRandomNumber(1, num2); // Ensure num3 is smaller than num2
				return `${num1} + (${num2} - ${num3})^2`;
			}
		];

		// Randomly select one of the expression generators
		const randomIndex = Math.floor(Math.random() * expressions.length);
		return expressions[randomIndex]();
	};

	const handleRandomExpression = () => {
		setExpression(generateRandomExpression());
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

		// Check if the expression is just a single number (including negative)
		if (/^-?\d+(?:\.\d+)?$/.test(expr.trim())) {
			return { isValid: false, error: "Expression must contain at least one operation" };
		}

		// Check for operators at start or end, but allow negative sign at start
		if (/^[+*/^]|[+\-*/^]$/.test(expr)) {
			return { isValid: false, error: "Expression cannot start with an operator (except -) or end with an operator" };
		}

		// Check for consecutive operators, but allow negative sign after operators
		// This allows patterns like: 2*-1, 2/-1, 2^-1, but not 2++1, 2**1, etc.
		if (/[+\-*/^][+*/^]|[+\-*/^][+\-*/^][+\-*/^]/.test(expr)) {
			return { isValid: false, error: "Cannot have consecutive operators (except for a single negative sign after an operator)" };
		}

		// Check for invalid operator combinations
		// This allows patterns like: 2*-1, 2/-1, 2^-1, but not 2++1, 2**1, etc.
		if (/[+\-*/^][+*/^]/.test(expr)) {
			return { isValid: false, error: "Invalid operator combination" };
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
		
		// Recursively remove unnecessary parentheses until no more can be removed
		let previousFormatted;
		do {
			previousFormatted = formatted;
			formatted = formatted
				// Remove parentheses around single numbers
				.replace(/\(\s*(\d+(?:\.\d+)?)\s*\)/g, '$1')  // Remove (2) -> 2
				.replace(/\(\s*-\s*(\d+(?:\.\d+)?)\s*\)/g, '-$1')  // Remove (-2) -> -2
				// Remove parentheses around expressions that don't need them
				.replace(/\(\s*([^()]+?)\s*\)\s*([×÷+\-])/g, '$1 $2')  // Remove (2+3) + 4 -> 2+3 + 4
				.replace(/([×÷+\-])\s*\(\s*([^()]+?)\s*\)/g, '$1 $2')  // Remove 2 + (3+4) -> 2 + 3+4
				// Remove nested parentheses around the same expression
				.replace(/\(\s*\(\s*([^()]+?)\s*\)\s*\)/g, '($1)');  // Remove ((2+3)) -> (2+3)
		} while (formatted !== previousFormatted);
		
		// Then replace * and / with × and ÷
		formatted = formatted.replace(/\*/g, '×').replace(/\//g, '÷');
		
		// Convert exponents to superscript, including those on parenthesized expressions
		// First pass: handle nested exponents
		while (formatted.includes('^')) {
			formatted = formatted.replace(/(\([^)]+\)|-?\d+(?:\.\d+)?)\^(\d+(?:\.\d+)?)/g, (match, base, exponent) => {
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
		
		// Handle spacing around operators with more space
		formatted = formatted
			.replace(/(-?\d+(?:\.\d+)?)([×÷])/g, '$1 $2 ') // Space after number before operator
			.replace(/([×÷])(-?\d+(?:\.\d+)?)/g, '$1 $2') // Space after operator before number
			.replace(/(-?\d+(?:\.\d+)?)([+\-])/g, '$1 $2 ') // Space after number before operator
			.replace(/([+\-])(-?\d+(?:\.\d+)?)/g, '$1$2'); // No space after operator before number
		
		// Handle parentheses with consistent spacing
		formatted = formatted
			.replace(/\(/g, '(')  // Add space after opening parenthesis
			.replace(/\)/g, ')')  // Add space before closing parenthesis
			.replace(/([+\-×÷])\s*\(/g, '$1 (') // Space before opening parenthesis
			.replace(/\)\s*([+\-×÷])/g, ') $1') // Space after closing parenthesis
			.replace(/(-?\d+)\s*\(/g, '$1 (') // Space before opening parenthesis after number
			.replace(/\)\s*(-?\d+)/g, ') $1'); // Space after closing parenthesis before number
		
		// Clean up any multiple spaces
		formatted = formatted
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
			// Count addition/subtraction, but not negative signs
			// Look for + or - that follows a number or closing parenthesis
			count += (expression.match(/(?<=[\d\)])\s*[+\-]/g) || []).length;
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
			if (/(-?\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/.test(innerExpr)) {
				return { type: 'exponents', inParentheses: true, expression: match };
			}
			
			// Check for multiplication or division in the inner expression
			// Modified to better handle negative numbers
			const multDivMatch = innerExpr.match(/(-?\d+(?:\.\d+)?)\s*[×÷]\s*(-?\d+(?:\.\d+)?)/);
			if (multDivMatch) {
				return { type: 'multiplication or division', inParentheses: true, expression: match };
			}
			
			// Check for addition or subtraction in the inner expression
			// Modified to better handle negative numbers and ensure proper spacing
			const addSubMatch = innerExpr.match(/(-?\d+(?:\.\d+)?)\s*[+\-−]\s*(-?\d+(?:\.\d+)?)/);
			if (addSubMatch) {
				return { type: 'addition or subtraction', inParentheses: true, expression: match };
			}
		}
		
		// If no operations in parentheses, check the main expression
		if (/(-?\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/.test(formatted)) {
			return { type: 'exponents', inParentheses: false, expression: formatted };
		}
		
		// Check for multiplication or division in the main expression
		const multDivMatch = formatted.match(/(-?\d+(?:\.\d+)?)\s*[×÷]\s*(-?\d+(?:\.\d+)?)/);
		if (multDivMatch) {
			return { type: 'multiplication or division', inParentheses: false, expression: formatted };
		}
		
		// Check for addition or subtraction in the main expression
		// Modified to better handle negative numbers and ensure proper spacing
		const addSubMatch = formatted.match(/(-?\d+(?:\.\d+)?)\s*[+\-−]\s*([+\-−]?\d+(?:\.\d+)?)/);
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
			
			// Count remaining operations in the inner expression
			const remainingOps = (innerExpr.match(/[×÷+\-]/g) || []).length + 
							   (innerExpr.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/g) || []).length;
			
			if (operation.type === 'exponents') {
				match = innerExpr.match(/(-?\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/);
			} else if (operation.type === 'multiplication or division') {
				match = innerExpr.match(/(-?\d+(?:\.\d+)?)\s*[×÷]\s*(-?\d+(?:\.\d+)?)/);
			} else if (operation.type === 'addition or subtraction') {
				match = innerExpr.match(/(-?\d+(?:\.\d+)?)\s*[+\-−]\s*(-?\d+(?:\.\d+)?)/);
			}
			
			if (match) {
				// If this is the last operation, return the full parenthesized expression
				if (remainingOps === 1) {
					return {
						operation: operation.expression,
						isLastInParentheses: true,
						fullParentheses: operation.expression
					};
				}
				return {
					operation: match[0],
					isLastInParentheses: false,
					fullParentheses: operation.expression
				};
			}
		} else {
			// Original logic for operations outside parentheses
			let match = null;
			if (operation.type === 'exponents') {
				match = formatted.match(/(-?\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/);
			} else if (operation.type === 'multiplication or division') {
				match = formatted.match(/(-?\d+(?:\.\d+)?)\s*[×÷]\s*(-?\d+(?:\.\d+)?)/);
			} else if (operation.type === 'addition or subtraction') {
				match = formatted.match(/(-?\d+(?:\.\d+)?)\s*[+\-−]\s*(-?\d+(?:\.\d+)?)/);
			}
			
			if (match) {
				return {
					operation: match[0],
					isLastInParentheses: false,
					fullParentheses: null
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
			
			try {
				const result = evaluateExpression(formattedInner);
				// Format large numbers using scientific notation
				const formattedResult = formatLargeNumber(result);
				return formattedResult;
			} catch (error) {
				return null;
			}
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
		
		// Use evaluateExpression for all operations
		try {
			const result = evaluateExpression(standardOperation);
			// Format large numbers using scientific notation
			const formattedResult = formatLargeNumber(result);
			return formattedResult;
		} catch (error) {
			return null;
		}
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
		console.log('\n=== Starting Expression Evaluation (Top Level) ===');
		console.log('Input expression:', expr);
		
		// Remove all spaces
		expr = expr.replace(/\s+/g, '');
		console.log('After removing spaces:', expr);
		
		// Handle negative signs before parentheses by converting to multiplication by -1
		expr = expr.replace(/-\s*\(/g, '-1*(');
		console.log('After handling negative signs before parentheses:', expr);
		
		// Helper function to evaluate a single operation
		const evaluateOperation = (num1, op, num2) => {
			console.log('Evaluating operation:', { num1, op, num2 });
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
			
			console.log('Operation result:', result);
			return Number.isInteger(result) ? result : Number(result.toFixed(2));
		};
		
		// Helper function to evaluate an expression without parentheses
		const evaluateWithoutParentheses = (expression) => {
			console.log('\n=== Starting evaluateWithoutParentheses ===');
			console.log('Input expression:', expression);
			
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
			console.log('After superscript conversion:', result);
			
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
				
				console.log('Found exponent operation:', `${base}^${exp}`);
				
				// Calculate the result
				const answer = evaluateOperation(base, '^', exp);
				console.log('Exponent result:', answer);
				
				// Replace the operation with its result
				result = result.slice(0, lastCaretIndex - base.length) + 
						answer + 
						result.slice(lastCaretIndex + 1 + exp.length);
				console.log('Expression after exponent:', result);
			}
			
			// Handle multiplication and division
			while (/[\*\/]/.test(result)) {
				const match = result.match(/(\d+(?:\.\d+)?)([\*\/])(\d+(?:\.\d+)?)/);
				if (!match) break;
				const [fullMatch, num1, op, num2] = match;
				console.log('Found multiplication/division operation:', fullMatch);
				const answer = evaluateOperation(num1, op, num2);
				console.log('Multiplication/division result:', answer);
				result = result.replace(fullMatch, answer);
				console.log('Expression after multiplication/division:', result);
			}
			
			// Handle addition and subtraction
			while (/[+\-]/.test(result)) {
				// First, handle subtraction operations
				const subMatch = result.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
				if (subMatch) {
					const [fullMatch, num1, num2] = subMatch;
					console.log('Found subtraction operation:', fullMatch);
					console.log('Numbers:', { num1, num2 });
					const answer = evaluateOperation(num1, '-', num2);
					console.log('Subtraction result:', answer);
					result = result.replace(fullMatch, answer);
					console.log('Expression after subtraction:', result);
					continue;
				}
				
				// Then handle addition operations
				const addMatch = result.match(/(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)/);
				if (addMatch) {
					const [fullMatch, num1, num2] = addMatch;
					console.log('Found addition operation:', fullMatch);
					console.log('Numbers:', { num1, num2 });
					const answer = evaluateOperation(num1, '+', num2);
					console.log('Addition result:', answer);
					result = result.replace(fullMatch, answer);
					console.log('Expression after addition:', result);
					continue;
				}
				
				// If no more operations can be found, break
				break;
			}
			
			console.log('Final result in evaluateWithoutParentheses:', result);
			console.log('=== End evaluateWithoutParentheses ===\n');
			return result;
		};
		
		// Handle parentheses first
		while (expr.includes('(')) {
			console.log('Found parentheses in expression:', expr);
			expr = expr.replace(/\(([^()]+)\)/g, (match, innerExpr) => {
				console.log('Evaluating inner expression:', innerExpr);
				const result = evaluateWithoutParentheses(innerExpr);
				console.log('Inner expression result:', result);
				return result;
			});
			console.log('Expression after handling parentheses:', expr);
		}
		
		// Evaluate the remaining expression
		console.log('Evaluating final expression:', expr);
		const finalResult = Number(evaluateWithoutParentheses(expr));
		console.log('Final evaluation result:', finalResult);
		console.log('=== End Expression Evaluation (Top Level) ===\n');
		return finalResult;
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
				// For regular parenthesized expressions
				const operationIndex = formattedExpr.indexOf(formattedOperation);
				if (operationIndex !== -1) {
					// Get the character before the operation
					const prevChar = formattedExpr.charAt(operationIndex - 1);
					
					let simplified;
					// If the result is negative and there's a subtraction operator before it
					if (result < 0 && prevChar === '-') {
						// Replace the subtraction and the operation with addition of the positive result
						simplified = formattedExpr.slice(0, operationIndex - 1) + 
									' + ' + 
									Math.abs(result).toString() + 
									formattedExpr.slice(operationIndex + formattedOperation.length);
					} else if (result < 0) {
						// If result is negative but no subtraction before it, keep the negative sign
						simplified = formattedExpr.slice(0, operationIndex) + 
									result.toString() + 
									formattedExpr.slice(operationIndex + formattedOperation.length);
					} else {
						// Normal replacement for positive results
						simplified = formattedExpr.slice(0, operationIndex) + 
									result.toString() + 
									formattedExpr.slice(operationIndex + formattedOperation.length);
					}
					
					// Ensure we don't have any double spaces or spaces around operators
					const finalResult = formatExpression(simplified)
						.replace(/\s+/g, ' ')  // Replace multiple spaces with single space
						.replace(/\s*([+\-×÷])\s*/g, ' $1 ')  // Ensure spaces around operators
						.replace(/\s*-\s*-/g, ' + ')  // Replace double negatives with plus
						.replace(/\s*\+\s*-/g, ' - ')  // Handle plus followed by negative
						.replace(/\s*-\s*\+/g, ' - ')  // Handle negative followed by plus
						.trim();
					
					return finalResult;
				}
			}
		}
		
		// For non-parenthesized operations, use the original replacement logic
		const formattedOperation = formatExpression(operation);
		const simplified = formattedExpr.replace(formattedOperation, ` ${result} `).trim();
		
		// After any simplification, check for and remove unnecessary parentheses
		const finalResult = formatExpression(simplified)
			.replace(/\(\s*(\d+(?:\.\d+)?)\s*\)/g, '$1')  // Remove parentheses around single numbers
			.replace(/\s+/g, ' ')  // Replace multiple spaces with single space
			.replace(/\s*([+\-×÷])\s*/g, ' $1 ')  // Ensure spaces around operators
			.trim();
		
		return finalResult;
	};

	// Add new function to handle navigation
	const handleNavigateHistory = (direction) => {
		setNavigationDirection(direction);
		
		if (direction === 'back' && currentHistoryIndex > 0) {
			const newIndex = currentHistoryIndex - 1;
			setCurrentHistoryIndex(newIndex);
			setDisplayedExpression(expressionHistory[newIndex]);
			setCurrentStep(newIndex + 1);
			
			// Get the operation that was highlighted at this step
			const nextOp = getNextOperation(expressionHistory[newIndex]);
			const leftmostOp = getLeftmostOperation(expressionHistory[newIndex], nextOp);
			
			// Set up highlighting for this step
			setShowOperationHighlight(true);
			setHighlightedOperation(leftmostOp.operation);
			setIsLastInParentheses(leftmostOp.isLastInParentheses);
			setIsHighlightedOperationVisible(true);
			setIsHighlightedOperationGrowing(true);
			
			// Ensure continue button stays hidden during navigation
			setShowContinueButton(false);
			
		} else if (direction === 'forward' && currentHistoryIndex < expressionHistory.length - 1) {
			const newIndex = currentHistoryIndex + 1;
			setCurrentHistoryIndex(newIndex);
			setDisplayedExpression(expressionHistory[newIndex]);
			setCurrentStep(newIndex + 1);
			
			// Get the operation that was highlighted at this step
			const nextOp = getNextOperation(expressionHistory[newIndex]);
			const leftmostOp = getLeftmostOperation(expressionHistory[newIndex], nextOp);
			
			// Set up highlighting for this step
			setShowOperationHighlight(true);
			setHighlightedOperation(leftmostOp.operation);
			setIsLastInParentheses(leftmostOp.isLastInParentheses);
			setIsHighlightedOperationVisible(true);
			setIsHighlightedOperationGrowing(true);
			
			// Ensure continue button stays hidden during navigation
			setShowContinueButton(false);
		}

		// Reset direction after animation
		setTimeout(() => {
			setNavigationDirection(null);
		}, 300);
	};

	// Modify the handleSimplify function to track history
	const handleSimplify = () => {
		// First trigger removal animations
		setIsBigShrinking(true);
		setIsProgressShrinking(true);
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
		setIsPemdasAnimationComplete(false);
		setIsSolved(false);

		// Reset history when starting a new simplification
		setExpressionHistory([]);
		setCurrentHistoryIndex(-1);

		// If it's not the first time, trigger the PEMDAS buttons animation
		if (!isFirstValidSimplify) {
			setIsPemdasButtonsShrinking(true);
		}

		// Wait for animations to complete before resetting
		setTimeout(() => {
			// Reset all state variables
			setCurrentStep(1);
			setIsError(false);
			setIsShrinking(false);
			setDisplayedExpression('');
			setIsBigShrinking(false);
			setBigAnimKey(prev => prev + 1);
			setIsPlaceholderGrowing(false);
			setTotalSteps(0);
			setIsProgressShrinking(false);
			setIsProgressGrowing(false);
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

			const validation = validateExpression(expression);
			if (!validation.isValid) {
				if (!showPlaceholder) {
					setIsBigShrinking(true);
					setIsProgressShrinking(true);
					setShowOperationHighlight(false);
					setShowContinueButton(false);
					setIsContinueButtonShrinking(false);
					setHighlightedOperation(null);
					setTimeout(() => {
						setShowPlaceholder(true);
						setIsBigShrinking(false);
						setIsProgressShrinking(false);
						setIsPlaceholderGrowing(true);
						setIsError(true);
						setNeedsDelay(true);
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

			// Only remove the glow effect if validation passed
			setIsGlowActive(false);

			// Start the animation sequence
			setIsPemdasAnimating(true);
			setIsShrinking(true);
			
			// First hide the placeholder text
			setTimeout(() => {
				setShowPlaceholder(false);
				setIsShrinking(false);

				// Run PEMDAS animation if it's the first time or if there was an error
				if (isFirstValidSimplify || needsDelay) {
					// Reset animation state to ensure it runs
					setIsPemdasAnimating(true);
					setIsPemdasAnimationComplete(false);
					setIsPemdasButtonsShrinking(false);
					setIsPemdasButtonsGrowing(true);

					// After words animation, show symbols
					setTimeout(() => {						
						// After symbols animation, show expression
						setTimeout(() => {
							setIsFirstValidSimplify(false);
							
							// Wait for all button animations to complete before showing expression
							setTimeout(() => {
								// Only set these states if we're not in the delay period
								if (!needsDelay) {
									setIsPemdasAnimating(false);
									setIsPemdasAnimationComplete(true);
								}
								
								// Add conditional delay after PEMDAS animation
								const delay = needsDelay ? 9500 : 0;
								
								setTimeout(() => {
									// Show the expression and interactive elements
									setDisplayedExpression(expression);
									setBigAnimKey(prev => prev + 1);
									setTotalSteps(calculateTotalSteps(expression));
									setCurrentStep(1);
									setIsProgressGrowing(true);
									setShowOperationButtons(true);
									setIsPemdasButtonsGrowing(true);
									
									setTimeout(() => {
										setIsProgressGrowing(false);
										setShowOperationHighlight(true);
										const nextOp = getNextOperation(expression);
										const leftmostOp = getLeftmostOperation(expression, nextOp);
										setHighlightedOperation(leftmostOp.operation);
										setIsLastInParentheses(leftmostOp.isLastInParentheses);
										
										setTimeout(() => {
											setShowContinueButton(true);
											setNeedsDelay(false); // Reset the delay flag
											
											// Only set these states after everything is complete
											setTimeout(() => {
												setIsPemdasAnimating(false);
												setIsPemdasAnimationComplete(true);
												setIsPemdasButtonsGrowing(false);
											}, 500);
										}, 500);
									}, 1000);
								}, delay);
							}, 0);
						}, 1200); // Wait for all symbols to animate
					}, 2400); // Wait for all words to animate
				} else {
					// For subsequent valid simplifications (not after error), show expression immediately
					setIsPemdasAnimating(false);
					setIsPemdasAnimationComplete(true);
					setShowOperationButtons(true);
					
					// Show the expression and interactive elements immediately
					setDisplayedExpression(expression);
					setBigAnimKey(prev => prev + 1);
					setTotalSteps(calculateTotalSteps(expression));
					setCurrentStep(1);
					setIsProgressGrowing(true);
					setIsPemdasButtonsGrowing(true);
					
					// Reset the shrinking state after a short delay
					setTimeout(() => {
						setIsPemdasButtonsShrinking(false);
					}, 400);
					
					setTimeout(() => {
						setIsProgressGrowing(false);
						setShowOperationHighlight(true);
						const nextOp = getNextOperation(expression);
						const leftmostOp = getLeftmostOperation(expression, nextOp);
						setHighlightedOperation(leftmostOp.operation);
						setIsLastInParentheses(leftmostOp.isLastInParentheses);
						
						setTimeout(() => {
							setShowContinueButton(true);
							setIsPemdasButtonsGrowing(false);
						}, 500);
					}, 1000);
				}
			}, 500);

			// After setting the new expression, add it to history
			setExpressionHistory(prev => [...prev, expression]);
			setCurrentHistoryIndex(prev => prev + 1);
		}, 400);
	};

	const getCurrentPemdasStep = (operation, isLastInParentheses) => {
		// If we're simplifying or there's no operation, return no active state
		if (!operation || isSimplifying || !isHighlightedOperationVisible) {
			return { current: null, inParentheses: false };
		}
		
		// If we're in parentheses and it's the last operation, highlight both P and the current operation
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
			const wrapper = highlightedOperationRef.closest('.expression-wrapper');
			if (wrapper) {
				const opRect = highlightedOperationRef.getBoundingClientRect();
				const wrapperRect = wrapper.getBoundingClientRect();
				
				// Calculate position relative to wrapper
				const left = opRect.left - wrapperRect.left + (opRect.width / 2);
				const top = opRect.top - wrapperRect.top;
				
				setHighlightedOperationPosition({
					left,
					top
				});
			}
		}
	}, [highlightedOperationRef, isHighlightedOperationVisible]);

	// Add effect to control grow-in fade-out
	useEffect(() => {
		if (isSimplifying && !isHighlightedOperationShrinking && !isOpWidthTransitioning) {
			setShowGrowIn(true);
		} else if (isSimplifying && !isHighlightedOperationShrinking && isOpWidthTransitioning && showGrowIn) {
			setTimeout(() => {
				setShowGrowIn(false);
			}, 300); // match fade-out duration
		} else if (!isSimplifying || isHighlightedOperationShrinking) {
			setShowGrowIn(false);
		}
	}, [isSimplifying, isHighlightedOperationShrinking, isOpWidthTransitioning]);

	// Add animation cleanup effect
	useEffect(() => {
		return () => {
			// Clean up animation states when component unmounts
			setShowOperationHighlight(false);
			setShowContinueButton(false);
			setIsPemdasAnimating(false);
			setIsPemdasAnimationComplete(false);
			setIsPemdasButtonsShrinking(false);
			setIsPemdasButtonsGrowing(false);
			setIsHighlightedOperationShrinking(false);
			setIsHighlightedOperationGrowing(false);
			setIsHighlightedOperationVisible(false);
			setIsSimplifying(false);
			setIsContinueButtonShrinking(false);
			setIsBigShrinking(false);
			setIsProgressShrinking(false);
			setIsProgressGrowing(false);
		};
	}, []);

	// Add useEffect to handle navigation button visibility
	useEffect(() => {
		if (isSolved) {
			const timer = setTimeout(() => {
				setShowNavigationButtons(true);
				setLeftButtonVisible(true);
			}, 700); // 500ms delay
			return () => clearTimeout(timer);
		} else {
			setShowNavigationButtons(false);
			setLeftButtonVisible(false);
		}
	}, [isSolved]);

	return (
		<>
			<style>{`
			@keyframes grow-in {
				0% { transform: scale(0.7); opacity: 0; }
				100% { transform: scale(1); opacity: 1; }
			}
			.grow-in {
				animation: grow-in 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
				transform-origin: center;
			}
			@keyframes move-up {
				0% { transform: translateY(0); }
				100% { transform: translateY(-38px); }
			}
			.move-up {
				animation: move-up 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-up-higher {
				0% { transform: translateY(0); }
				100% { transform: translateY(-58px); }
			}
			.move-up-higher {
				animation: move-up-higher 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-parenthesis-button {
				0% { transform: translate(0%, 0%); }
				100% { transform: translate(-185%, -50px); }
			}
			.move-parenthesis-button {
				animation: move-parenthesis-button 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-exponent {
				0% { transform: translate(0%, 0%); }
				100% { transform: translate(-10%, -50px); }
			}
			.move-exponent {
				animation: move-exponent 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-multiply-divide-button {
				0% { transform: translate(0%, 0%); }
				100% { transform: translate(50%, -50px); }
			}
			.move-multiply-divide-button {
				animation: move-multiply-divide-button 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-addition {
				0% { transform: translate(0, 0); }
				100% { transform: translate(-80%, -50px); }
			}
			.move-addition {
				animation: move-addition 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-subtraction {
				0% { transform: translate(0, 0); }
				100% { transform: translate(-90%, -30px); }
			}
			.move-subtraction {
				animation: move-subtraction 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-add-subtract-button {
				0% { transform: translate(0%, 0%); }
				100% { transform: translate(147%, -50px); }
			}
			.move-add-subtract-button {
				animation: move-add-subtract-button 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
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
					transform: translate(-50%, -40%) scale(0.8); 
					opacity: 0;
				}
				100% { 
					transform: translate(-50%, -40%) scale(1); 
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
			.expression-content {
				display: inline-block;
				position: relative;
				white-space: nowrap;
				
				// Add this line to ensure the content is centered
				margin-left: auto;
				margin-right: auto;
			}
			@keyframes simplified-shrink-out {
				0% {
					opacity: 1;
					transform: scale(1);
				}
				100% {
					opacity: 0;
					transform: scale(0.5);
				}
			}
			.simplified-shrink-out {
				animation: simplified-shrink-out 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
				position: absolute;
				transform-origin: center;
				z-index: 10;
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
				transform: scale(1);
			}
			.progress-circle.active {
				background-color: #7973E9;
			}
			.progress-circle.active-new {
					animation: progress-circle-active 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
			}
			@keyframes progress-circle-active {
				0% { 
					background-color: #E5E7EB;
					transform: scale(1);
				}
				50% {
					transform: scale(1.3);
				}
				100% { 
					background-color: #7973E9;
					transform: scale(1.2);
				}
			}
			.progress-circle.shrink-back {
				animation: progress-circle-shrink 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
			}
			@keyframes progress-circle-shrink {
				0% { 
					background-color: #7973E9;
					transform: scale(1.2);
				}
				50% {
					transform: scale(1.3);
				}
				100% { 
					background-color: #E5E7EB;
					transform: scale(1);
				}
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
				border-color: #7973E9 !important;
				background: #f0f0ff !important;
				color: #7973E9 !important;
				cursor: default !important;
			}
			.red-glow {
				border-color: #ff4d4f !important;
				background: #fff0f0 !important;
				color: #ff4d4f !important;
				transition: border-color 0.2s, background 0.2s, color 0.2s;
				cursor: default !important;
			}
			.text-red-glow {
				color: #ff4d4f !important;
				transition: color 0.2s;
				cursor: default !important;
			}
			.green-glow {
				border-color: #52c41a !important;
				background: #f6ffed !important;
				color: #52c41a !important;
				transition: border-color 0.2s, background 0.2s, color 0.2s;
				cursor: default !important;
			}
			.text-green-glow {
				color: #52c41a !important;
				transition: color 0.2s;
				cursor: default !important;
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
				100% { color: #7973E9; }
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
			@keyframes move-down {
				0% { transform: translateY(0); }
				100% { transform: translateY(20px); }
			}
			.move-down {
				animation: move-down 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-up-after-down {
				0% { transform: translateY(0); }
				100% { transform: translateY(-50px); }
			}
			.move-up-after-down {
				animation: move-up-after-down 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-exponent-button {
				0% { transform: translate(0%, 0%); }
				100% { transform: translate(-75%, -50px); }
			}
			.move-exponent-button {
				animation: move-exponent-button 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}
			@keyframes move-multiplication {
				0% { transform: translate(0, 0); }
				100% { transform: translate(-35%, -50px); }
			}
			.move-multiplication {
				animation: move-multiplication 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}

			@keyframes move-division {
				0% { transform: translate(0, 0); }
				100% { transform: translate(-55%, -30px); }
			}
			.move-division {
				animation: move-division 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}

			/* Add new styles for operation button highlights */
			.operation-button {
				transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
				cursor: default !important;
				position: relative;
			}
			.operation-button.active {
				background-color: #7973E9 !important;
				border-color: #7973E9 !important;
				color: white !important;
				cursor: default !important;
			}
			.operation-button .tooltip {
				position: absolute;
				bottom: -25px;
				left: 50%;
				transform: translateX(-50%);
				background-color: #7973E9;
				color: white;
				padding: 2px 6px;
				border-radius: 3px;
				font-size: 11px;
				white-space: nowrap;
				opacity: 0;
				visibility: hidden;
				transition: all 0.2s ease;
				pointer-events: none;
				z-index: 50;
			}
			.operation-button:hover .tooltip {
				opacity: 1;
				visibility: visible;
				bottom: -30px;
			}
			.operation-button .tooltip::before {
				content: '';
				position: absolute;
				top: -3px;
				left: 50%;
				transform: translateX(-50%);
				border-width: 0 3px 3px 3px;
				border-style: solid;
				border-color: transparent transparent #7973E9 transparent;
			}
			.nav-button {
				transition: all 0.2s ease;
				opacity: 0.7;
				cursor: default !important;
			}
			.nav-button:hover {
				opacity: 1;
				cursor: default !important;
			}
			.nav-button:disabled {
				opacity: 0.3;
				cursor: not-allowed !important;
			}
			.expression-wrapper {
				position: absolute;
				transform: translateX(-50%);
				white-space: nowrap;
				transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
				display: inline-block;
			}
			.expression-content {
				white-space: nowrap;
				transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
				display: inline-block;
			}
			.simplified-grow-in {
				transition: opacity 0.3s cubic-bezier(0.4,0,0.2,1);
				opacity: 1;
			}
			.simplified-grow-in.fade-out {
				opacity: 0;
			}
			@keyframes bounce-then-shrink {
				0% { transform: scale(1); opacity: 1; }
				50% { transform: scale(1.1); opacity: 1; }
				100% { transform: scale(0.8); opacity: 0; }
			}

			.shrinking {
				animation: bounce-then-shrink 0.4s cubic-bezier(0.4,0,0.2,1) forwards;
			}

			/* Orbit Glow Button Styles */
			.glow-button { 
				min-width: auto; 
				height: auto; 
				position: relative; 
				border-radius: 8px;  /* Changed from 16px to 6px to match button radius */
				cursor: pointer;
				display: flex;
				align-items: center;
				justify-content: center;
				z-index: 1;
				transition: all .3s ease;
				padding: 7px;
			}

			.glow-button::before {
				content: "";
				display: block;
				position: absolute;
				background: #fff;
				inset: 2px;
				border-radius: 4px;  /* Changed from 14px to 4px to match inner radius */
				z-index: -2;
			}

			.glow-button::after {
				display: none;
			}

			@property --r {
				syntax: '<angle>';
				inherits: false;
				initial-value: 0deg;
			}

			.simple-glow {
				background: conic-gradient(
					from var(--r),
					transparent 0%,
					rgb(0, 255, 132) 2%,
					rgb(0, 214, 111) 8%,
					rgb(0, 174, 90) 12%,
					rgb(0, 133, 69) 14%,
					transparent 15%
				);
				animation: rotating 3s linear infinite;
				transition: animation 0.3s ease;
			}

			/* Remove the hover effect that changes animation speed */
			.simple-glow:hover {
				animation: rotating 3s linear infinite;  /* Keep the same speed as non-hover */
			}

			@keyframes rotating {
				0% {
					--r: 0deg;
				}
				100% {
					--r: 360deg;
				}
			}
			`}</style>
			<div className="w-[500px] mx-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] bg-white rounded-lg select-none">
				<div className="p-4">
					<div className="flex justify-between items-center mb-2">
						<h2 className="text-[#4E48CC] text-sm font-medium select-none">Order of Operations Explorer</h2>
						<div className="flex gap-2">
						</div>
					</div>

					<div className="flex items-center gap-2 max-w-[470px] mx-auto">
						<input
							type="text"
							value={expression}
							// onChange={handleExpressionChange}
							placeholder=""
							className="flex-1 h-[35px] px-3 border border-gray-300 rounded-md /* focus:outline-none focus:ring-2 focus:ring-[#008545] */ select-none"
							disabled
						/>
						<div className={`glow-button ${isGlowActive ? 'simple-glow' : ''}`}>
							<div className="flex gap-2">
								<Button 
									onClick={handleSimplify}
									className="h-[35px] bg-[#008545] hover:bg-[#00783E] text-white text-sm px-3 rounded-md select-none touch-manipulation"
								>
									Simplify
								</Button>
								<Button 
									onClick={handleRandomExpression}
									className="h-[35px] bg-[#008545] hover:bg-[#00783E] text-white text-sm px-3 rounded-md select-none touch-manipulation"
								>
									Random
								</Button>
							</div>
						</div>
					</div>

					<div className="mt-2 space-y-4">
						<div className={`w-full min-h-[200px] p-2 bg-white border border-[#7973E9]/30 rounded-md flex justify-center items-center relative`}> 
							{!showPlaceholder && !isPemdasAnimating && isPemdasAnimationComplete && (
								<div className="w-full flex flex-col gap-2 items-center justify-end absolute left-0 bottom-0 pb-3">
									{/* Progress Bar with Navigation */}
									{totalSteps > 0 && (
										<div className={`flex items-center gap-4 relative z-50 ${isBigShrinking ? 'shrink-out' : 'grow-in'}`}>
											<button
												onClick={() => handleNavigateHistory('back')}
												className={`nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#008545]/10 text-[#008545] hover:bg-[#008545]/20 transition-all duration-200 relative z-50 ${!showNavigationButtons || !isSolved || currentHistoryIndex <= 0 ? 'invisible pointer-events-none' : ''} ${leftButtonVisible ? 'grow-in' : ''}`}
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M15 18l-6-6 6-6"/>
												</svg>
											</button>
											<div className="flex gap-2">
												{[...Array(totalSteps + 1)].map((_, index) => {
													const isActive = index + 1 <= currentStep;
													const isCurrentStep = index + 1 === currentStep;
													const isPreviousStep = index + 1 === currentStep + 1;
													
													return (
														<div
															key={`${bigAnimKey}-${index}`}
															className={`progress-circle ${
																isActive ? 'active' : ''
															} ${
																isCurrentStep && navigationDirection === 'forward' && !isContinueButtonShrinking ? 'active-new' : ''
															} ${
																isPreviousStep && navigationDirection === 'back' ? 'shrink-back' : ''
															} ${
																isProgressShrinking || isBigShrinking ? 'shrink-out' : isProgressGrowing ? 'grow-in' : ''
															}`}
														/>
													);
												})}
											</div>
											<button
												onClick={() => handleNavigateHistory('forward')}
												className={`nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#008545]/10 text-[#008545] hover:bg-[#008545]/20 transition-all duration-200 relative z-50 ${!showNavigationButtons || !isSolved || currentHistoryIndex >= expressionHistory.length - 1 ? 'invisible pointer-events-none' : ''}`}
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M9 18l6-6-6-6"/>
												</svg>
											</button>
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
										className={`text-3xl font-bold text-black select-none ${isBigShrinking ? 'simplified-shrink-out' : ''} ${getNextOperation(displayedExpression) === null && !isBigShrinking ? 'final-answer' : ''} ${isProgressGrowing ? 'grow-in' : ''}`}
										style={{ marginTop: '-30px', position: 'relative', width: '100%', textAlign: 'center' }}
									>
										<span className="expression-wrapper">
											<span className="expression-content">
												{(() => {
													const formattedExpr = formatExpression(displayedExpression);
													if (!highlightedOperation) {
														return formattedExpr;
													}

													// Find the index of the leftmost occurrence of the operation
													const operationIndex = formattedExpr.indexOf(highlightedOperation);
													if (operationIndex === -1) {
														return formattedExpr;
													}

													// Split the expression into three parts: before, operation, and after
													const before = formattedExpr.slice(0, operationIndex);
													const after = formattedExpr.slice(operationIndex + highlightedOperation.length);

													return (
														<>
															{before}
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
															{after}
														</>
													);
												})()}
											</span>
											{isSimplifying && !isHighlightedOperationShrinking && (
												<span 
													className="simplified-grow-in"
													style={{
														position: 'absolute',
														left: `${highlightedOperationPosition.left}px`,
														top: `${highlightedOperationPosition.top + 16}px`,
														transform: 'translate(-50%, -50%)',
														zIndex: 10,
														display: 'inline-block',
														whiteSpace: 'nowrap',
														paddingBottom: '4px'
													}}
												>
													{currentOperationResult}
												</span>
											)}
										</span>
									</p>
									{showContinueButton && (
										<div className={`absolute bottom-1.5 right-1.5 z-50 ${isContinueButtonShrinking ? 'shrink-out' : 'grow-in'}`}>
											<div className={`glow-button ${isContinueGlowActive ? 'simple-glow' : ''}`}>
												<Button 
													onClick={handleContinue}
													className="h-[35px] bg-[#008545] hover:bg-[#00783E] text-white text-sm px-3 rounded-md select-none touch-manipulation"
												>
													Continue
												</Button>
											</div>
										</div>
									)}
									{showOperationButtons && (
										<div className={`absolute inset-0 ${isPemdasButtonsShrinking ? 'shrink-out' : isPemdasButtonsGrowing ? 'grow-in' : ''}`}>
											<div className="relative w-full h-full">
												{/* Parentheses */}
												<div className="absolute left-[173px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-up-after-down" style={{ animationDelay: '1.8s' }}>
															<div className="shrink-out" style={{ animationDelay: '3.1s' }}>
																<span className="text-[#7973E9] font-bold text-2xl">P</span>
																<span className="text-[#7973E9] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '2.4s' }}>arentheses</span>
															</div>
															<div className="absolute left-[35%] top-0 opacity-0 grow-in" style={{ animationDelay: '3.5s' }}>
																<button className={`w-10 h-10 flex items-center justify-center bg-[#7973E9]/10 text-[#7973E9] rounded-md border border-[#7973E9]/30 text-lg font-medium move-parenthesis-button operation-button ${getCurrentPemdasStep(highlightedOperation, isLastInParentheses).inParentheses ? 'active' : ''}`} style={{ animationDelay: '3.9s' }}>
																	( )
																	{!isPemdasAnimating && <span className="tooltip absolute left-[35%] -translate-x-1/2 bottom-[-25px] text-xs">Parentheses</span>}
																</button>
															</div>
														</div>
													</div>
												</div>
												{/* Exponent */}
												<div className="absolute left-[194px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.1s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-exponent" style={{ animationDelay: '4.6s' }}>
															<div className="shrink-out" style={{ animationDelay: '6.0s' }}>
																<span className="text-[#7973E9] font-bold text-2xl">E</span>
																<span className="text-[#7973E9] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '5.2s' }}>xponent</span>
															</div>
															<div className="absolute left-[35%] -translate-x-1/2 top-0 opacity-0 grow-in" style={{ animationDelay: '6.4s' }}>
																<button className={`w-10 h-10 flex items-center justify-center bg-[#7973E9]/10 text-[#7973E9] rounded-md border border-[#7973E9]/30 text-sm font-medium move-exponent-button operation-button ${getCurrentPemdasStep(highlightedOperation, isLastInParentheses).current === '^' ? 'active' : ''}`} style={{ animationDelay: '6.8s' }}>
																	x<sup>n</sup>
																	{!isPemdasAnimating && <span className="tooltip absolute left-[35%] -translate-x-1/2 bottom-[-25px] text-xs">Exponent</span>}
																</button>
															</div>
														</div>
													</div>
												</div>
												{/* Multiplication */}
												<div className="absolute left-[214px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.2s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-multiplication" style={{ animationDelay: '7.5s' }}>
															<div className="shrink-out" style={{ animationDelay: '8.8s' }}>
																<span className="text-[#7973E9] font-bold text-2xl">M</span>
																<span className="text-[#7973E9] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '8.0s' }}>ultiplication</span>
															</div>
															<div className="absolute left-[35%] -translate-x-1/2 top-0 opacity-0 grow-in" style={{ animationDelay: '9.2s' }}>
																<button className={`w-10 h-10 flex items-center justify-center bg-[#7973E9]/10 text-[#7973E9] rounded-md border border-[#7973E9]/30 text-lg font-medium move-multiply-divide-button operation-button ${getCurrentPemdasStep(highlightedOperation, isLastInParentheses).current === '×÷' ? 'active' : ''}`} style={{ animationDelay: '9.6s' }}>
																		×÷
																	{!isPemdasAnimating && <span className="tooltip absolute left-[35%] -translate-x-1/2 bottom-[-25px] text-xs">Multiplication / Division</span>}
																</button>
															</div>
														</div>
													</div>
												</div>
												{/* Division */}
												<div className="absolute left-[242px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.3s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-division" style={{ animationDelay: '7.5s' }}>
															<div className="shrink-out" style={{ animationDelay: '8.8s' }}>
																<span className="text-[#7973E9] font-bold text-2xl">D</span>
																<span className="text-[#7973E9] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '8.0s' }}>ivision</span>
															</div>
														</div>
													</div>
												</div>
												{/* Addition */}
												<div className="absolute left-[264px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.4s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-addition" style={{ animationDelay: '10.3s' }}>
															<div className="shrink-out" style={{ animationDelay: '11.6s' }}>
																<span className="text-[#7973E9] font-bold text-2xl">A</span>
																<span className="text-[#7973E9] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '10.8s' }}>ddition</span>
															</div>
															<div className="absolute left-[35%] -translate-x-1/2 top-0 opacity-0 grow-in" style={{ animationDelay: '12.0s' }}>
																<button className={`w-10 h-10 flex items-center justify-center bg-[#7973E9]/10 text-[#7973E9] rounded-md border border-[#7973E9]/30 text-lg font-medium move-add-subtract-button operation-button ${getCurrentPemdasStep(highlightedOperation, isLastInParentheses).current === '+-' ? 'active' : ''}`} style={{ animationDelay: '12.4s' }}>
																	+-
																	{!isPemdasAnimating && <span className="tooltip absolute left-[35%] -translate-x-1/2 bottom-[-25px] text-xs">Addition / Subtraction</span>}
																</button>
															</div>
														</div>
													</div>
												</div>
												{/* Subtraction */}
												<div className="absolute left-[286px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.5s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-subtraction" style={{ animationDelay: '10.3s' }}>
															<div className="shrink-out" style={{ animationDelay: '11.6s' }}>
																<span className="text-[#7973E9] font-bold text-2xl">S</span>
																<span className="text-[#7973E9] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '10.8s' }}>ubtraction</span>
															</div>
														</div>
													</div>
												</div>
											</div>
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