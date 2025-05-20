import React, { useState, useEffect, useRef } from 'react';
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
	const [isFirstValidExpression, setIsFirstValidExpression] = useState(true);
	const [showPemdasWords, setShowPemdasWords] = useState(false);
	const [animatingWords, setAnimatingWords] = useState([]);
	const [showPemdasSymbols, setShowPemdasSymbols] = useState(false);
	const [animatingSymbols, setAnimatingSymbols] = useState([]);
	const [isTestContentShrinking, setIsTestContentShrinking] = useState(false);
	const [showTestContent, setShowTestContent] = useState(true);
	const [isPemdasAnimationComplete, setIsPemdasAnimationComplete] = useState(false);
	const [showOperationButtons, setShowOperationButtons] = useState(true);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isPemdasAnimating, setIsPemdasAnimating] = useState(false);
	const [isPemdasButtonsShrinking, setIsPemdasButtonsShrinking] = useState(false);
	const [isPemdasButtonsGrowing, setIsPemdasButtonsGrowing] = useState(false);
	const [isFirstValidSimplify, setIsFirstValidSimplify] = useState(true);
	// Add new state for expression history
	const [expressionHistory, setExpressionHistory] = useState([]);
	const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
	const [isFullySolved, setIsFullySolved] = useState(false);
	const [isSolved, setIsSolved] = useState(false);  // Add new state for tracking if expression is solved
	const [isWidthTransitioning, setIsWidthTransitioning] = useState(false);
	const [targetWidth, setTargetWidth] = useState(null);
	const expressionContentRef = useRef(null);
	const [currentWidth, setCurrentWidth] = useState(null);
	const [isOpWidthTransitioning, setIsOpWidthTransitioning] = useState(false);
	const [opCurrentWidth, setOpCurrentWidth] = useState(null);
	const [opTargetWidth, setOpTargetWidth] = useState(null);
	const opWidthRef = useRef(null);
	const [showGrowIn, setShowGrowIn] = useState(false);
	const [fadeOutGrowIn, setFadeOutGrowIn] = useState(false);

	// Add handleContinue function definition
	const handleContinue = () => {
		// Start animations
		setIsContinueButtonShrinking(true);
		setIsHighlightedOperationShrinking(true);
		setIsHighlightedOperationGrowing(false);

		// Get current operation and calculate results
		const currentOperation = highlightedOperation;
		const simplifiedExpr = getSimplifiedExpression(displayedExpression, currentOperation);
		const operationResult = calculateOperationResult(currentOperation);
		setCurrentOperationResult(operationResult);

		// Calculate initial position before any transitions
		const opElement = opWidthRef.current;
		if (opElement) {
			const rect = opElement.getBoundingClientRect();
			const wrapper = opElement.closest('.expression-wrapper');
			const wrapperRect = wrapper.getBoundingClientRect();
			
			// Calculate the width difference between the operation and its result
			const tempSpan = document.createElement('span');
			tempSpan.style.visibility = 'hidden';
			tempSpan.style.position = 'absolute';
			tempSpan.style.whiteSpace = 'nowrap';
			tempSpan.style.font = window.getComputedStyle(opElement).font;
			tempSpan.style.fontWeight = window.getComputedStyle(opElement).fontWeight;
			tempSpan.style.fontSize = window.getComputedStyle(opElement).fontSize;
			tempSpan.innerText = operationResult;
			document.body.appendChild(tempSpan);
			const resultWidth = tempSpan.offsetWidth;
			document.body.removeChild(tempSpan);
			
			// Calculate the width difference
			const widthDiff = resultWidth - rect.width;
			
			// Calculate the center position of the operation relative to the wrapper
			const centerPos = rect.left - wrapperRect.left + (rect.width / 2);
			
			// Adjust the position based on the width difference
			const adjustedLeft = centerPos + (widthDiff / 2);
			
			setHighlightedOperationPosition({
				left: adjustedLeft,
				top: rect.top + (rect.height / 2)
			});
		}

		// Start the transition sequence
		setTimeout(() => {
			// Hide the highlighted operation
			setIsHighlightedOperationShrinking(false);
			setIsHighlightedOperationVisible(false);

			requestAnimationFrame(() => {
				setIsSimplifying(true);

				setTimeout(() => {
					const opElement = opWidthRef.current;
					if (opElement) {
						// Get current widths
						const opWidth = opElement.offsetWidth;
						const wrapper = opElement.closest('.expression-wrapper');
						const wrapperWidth = wrapper.offsetWidth;

						// Create temp span to measure result width
						const tempSpan = document.createElement('span');
						tempSpan.style.visibility = 'hidden';
							tempSpan.style.position = 'absolute';
							tempSpan.style.whiteSpace = 'nowrap';
							tempSpan.style.font = window.getComputedStyle(opElement).font;
							tempSpan.style.fontWeight = window.getComputedStyle(opElement).fontWeight;
							tempSpan.style.fontSize = window.getComputedStyle(opElement).fontSize;
							tempSpan.innerText = operationResult;
							document.body.appendChild(tempSpan);
							const resultWidth = tempSpan.offsetWidth;
							document.body.removeChild(tempSpan);

							// Set up width transitions
							setOpCurrentWidth(opWidth);
							setOpTargetWidth(resultWidth);
							setCurrentWidth(wrapperWidth);
							
							// Calculate new wrapper width
							const widthDiff = resultWidth - opWidth;
							const newWrapperWidth = wrapperWidth + widthDiff;
							setTargetWidth(newWrapperWidth);

							// Start transitions
							setIsOpWidthTransitioning(true);
							setIsWidthTransitioning(true);

							// After a small delay to ensure transitions start
							setTimeout(() => {
								setOpCurrentWidth(resultWidth);
								setCurrentWidth(newWrapperWidth);

								// After transitions complete
								setTimeout(() => {
									// Reset transition states
									setIsOpWidthTransitioning(false);
									setIsWidthTransitioning(false);
									setOpCurrentWidth(null);
									setOpTargetWidth(null);
									setCurrentWidth(null);
									setTargetWidth(null);

									// Update expression and states
									setDisplayedExpression(simplifiedExpr);
									setExpressionHistory(prev => [...prev, simplifiedExpr]);
									setCurrentHistoryIndex(prev => prev + 1);
									setIsSimplifying(false);
									setCurrentOperationResult(null);
									setShowContinueButton(false);
									setIsContinueButtonShrinking(false);
									setCurrentStep(prev => prev + 1);
									setBigAnimKey(prev => prev + 1);

									// Check if expression is fully solved
									const nextOp = getNextOperation(simplifiedExpr);
									const isSingleNumber = /^-?\d+(\.\d+)?$/.test(simplifiedExpr.replace(/\s+/g, ''));
									
									if (nextOp === null && isSingleNumber) {
										setShowOperationHighlight(false);
										setHighlightedOperation(null);
										setIsFullySolved(true);
										setIsSolved(true);
									} else {
										// Set up next operation
										setTimeout(() => {
											const nextOperation = getLeftmostOperation(simplifiedExpr, nextOp);
											setShowOperationHighlight(true);
											setHighlightedOperation(nextOperation.operation);
											setIsLastInParentheses(nextOperation.isLastInParentheses);
											setIsHighlightedOperationVisible(true);
											setIsHighlightedOperationGrowing(true);
											
											setTimeout(() => {
												setShowContinueButton(true);
												setIsHighlightedOperationGrowing(false);
											}, 500);
										}, 1000);
									}
								}, 500); // Transition duration
							}, 20); // Small delay to start transitions
						} else {
							// Fallback for when element is not found
							setDisplayedExpression(simplifiedExpr);
							setExpressionHistory(prev => [...prev, simplifiedExpr]);
							setCurrentHistoryIndex(prev => prev + 1);
							setIsSimplifying(false);
							setCurrentOperationResult(null);
							setShowContinueButton(false);
							setIsContinueButtonShrinking(false);
							setCurrentStep(prev => prev + 1);
							setBigAnimKey(prev => prev + 1);
						}
					}, 1000);
				});
			}, 600);
		};

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
			if (/(\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/.test(innerExpr)) {
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
		if (/(\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/.test(formatted)) {
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
			
			// Count remaining operations in the inner expression
			const remainingOps = (innerExpr.match(/[×÷+\-]/g) || []).length + 
							   (innerExpr.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/g) || []).length;
			
			if (operation.type === 'exponents') {
				match = innerExpr.match(/(\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/);
			} else if (operation.type === 'multiplication or division') {
				match = innerExpr.match(/\d+(?:\.\d+)?\s*[×÷]\s*\d+(?:\.\d+)?/);
			} else if (operation.type === 'addition or subtraction') {
				match = innerExpr.match(/\d+(?:\.\d+)?\s*[+\-−]\s*\d+(?:\.\d+)?/);
			}
			
			if (match) {
				// If this is the last operation, return the full parenthesized expression
				if (remainingOps === 1) {
					return {
						operation: operation.expression,  // Return the full parenthesized expression
						isLastInParentheses: true,
						fullParentheses: operation.expression
					};
				}
				// Otherwise return just the operation
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
				match = formatted.match(/(\d+(?:\.\d+)?)[⁰¹²³⁴⁵⁶⁷⁸⁹ᐧ]+/);
			} else if (operation.type === 'multiplication or division') {
				match = formatted.match(/\d+(?:\.\d+)?\s*[×÷]\s*\d+(?:\.\d+)?/);
			} else if (operation.type === 'addition or subtraction') {
				match = formatted.match(/\d+(?:\.\d+)?\s*[+\-−]\s*\d+(?:\.\d+)?/);
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
		if (direction === 'back' && currentHistoryIndex > 0) {
			const newIndex = currentHistoryIndex - 1;
			setCurrentHistoryIndex(newIndex);
			setDisplayedExpression(expressionHistory[newIndex]);
			setCurrentStep(newIndex + 1);
			setShowOperationHighlight(false);
			setHighlightedOperation(null);
			setShowContinueButton(false);
			setIsFullySolved(false);
		} else if (direction === 'forward' && currentHistoryIndex < expressionHistory.length - 1) {
			const newIndex = currentHistoryIndex + 1;
			setCurrentHistoryIndex(newIndex);
			setDisplayedExpression(expressionHistory[newIndex]);
			setCurrentStep(newIndex + 1);
			setShowOperationHighlight(false);
			setHighlightedOperation(null);
			setShowContinueButton(false);
			// Only set isFullySolved to true if we're at the last step
			setIsFullySolved(newIndex === expressionHistory.length - 1);
		}
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
		setFullParentheses(null);
		setIsPemdasAnimationComplete(false);
		setIsFullySolved(false);
		setIsSolved(false);  // Reset solved state

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
			setIsAnimating(true);
			setIsPemdasAnimating(true);
			setIsShrinking(true);
			
			// First hide the placeholder text
			setTimeout(() => {
				setShowPlaceholder(false);
				setIsShrinking(false);

				if (isFirstValidSimplify) {
					// Only run PEMDAS animation on first time
					setShowPemdasWords(true);
					const words = ['Parenthesis', 'Exponent', 'Multiplication', 'Division', 'Addition', 'Subtraction'];
					
					words.forEach((word, index) => {
						setTimeout(() => {
							setAnimatingWords(prev => [...prev, word]);
							setTimeout(() => {
								setAnimatingWords(prev => prev.filter(w => w !== word));
								
								// After the last word animation, show symbols
								if (index === words.length - 1) {
									setTimeout(() => {
										setShowPemdasWords(false);
										setShowPemdasSymbols(true);
										
										// Start animating symbols one by one
										const symbols = ['( )', '^', '× ÷', '+ -'];
										symbols.forEach((symbol, symbolIndex) => {
											setTimeout(() => {
												setAnimatingSymbols(prev => [...prev, symbol]);
												setTimeout(() => {
													setAnimatingSymbols(prev => prev.filter(s => s !== symbol));
													
													// After the last symbol animation, show the interactive elements
													if (symbolIndex === symbols.length - 1) {
														setTimeout(() => {
															setShowPemdasSymbols(false);
															setIsFirstValidSimplify(false);
															
															// Wait for all button animations to complete (6500ms)
															setTimeout(() => {
																setIsPemdasAnimating(false);
																setIsPemdasAnimationComplete(true);
																setIsAnimating(false);
																
																// Show the expression and interactive elements
																setDisplayedExpression(expression);
																setBigAnimKey(prev => prev + 1);
																setTotalSteps(calculateTotalSteps(expression));
																setCurrentStep(1);
																setIsProgressGrowing(true);
																// Don't grow in buttons for first simplify
																setShowOperationButtons(true);
																
																setTimeout(() => {
																	setIsProgressGrowing(false);
																	setShowOperationHighlight(true);
																	const nextOp = getNextOperation(expression);
																	const leftmostOp = getLeftmostOperation(expression, nextOp);
																	setHighlightedOperation(leftmostOp.operation);
																	setIsLastInParentheses(leftmostOp.isLastInParentheses);
																	setFullParentheses(leftmostOp.fullParentheses);
																	
																	setTimeout(() => {
																		setShowContinueButton(true);
																		setIsAnimating(false);
																	}, 500);
																}, 1000);
															}, 6500); // Wait for all button animations to complete
														}, 500);
													}
												}, 800);
											}, symbolIndex * 300);
										});
									}, 100);
								}
							}, 800);
						}, index * 300);
					});
				} else {
					// For subsequent simplifications, show the expression immediately
					setIsPemdasAnimating(false);
					setIsPemdasAnimationComplete(true);
					setIsAnimating(false);
					setShowOperationButtons(true); // Make sure buttons are visible
					
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
						setFullParentheses(leftmostOp.fullParentheses);
						
						setTimeout(() => {
							setShowContinueButton(true);
							setIsAnimating(false);
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
		if (!operation) return { current: null, inParentheses: false };
		
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
			setFadeOutGrowIn(false);
		} else if (isSimplifying && !isHighlightedOperationShrinking && isOpWidthTransitioning && showGrowIn) {
			setFadeOutGrowIn(true);
			setTimeout(() => {
				setShowGrowIn(false);
				setFadeOutGrowIn(false);
			}, 300); // match fade-out duration
		} else if (!isSimplifying || isHighlightedOperationShrinking) {
			setShowGrowIn(false);
			setFadeOutGrowIn(false);
		}
	}, [isSimplifying, isHighlightedOperationShrinking, isOpWidthTransitioning]);

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
				100% { transform: translate(-180%, -50px); }
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
					transform: translate(0, 0) scale(0.8); 
					opacity: 0;
				}
				100% { 
					transform: translate(0, 0) scale(1); 
					opacity: 1;
				}
			}
			.simplified-grow-in {
				display: inline-block;
				animation: simplified-grow-in 0.5s cubic-bezier(0.4,0,0.2,1) forwards;
				position: absolute;
				z-index: 10;
				white-space: nowrap;
				transform-origin: center center;
			}
			.expression-wrapper, .expression-content {
				white-space: nowrap;
				transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
				display: inline-block;
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
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				transform: scale(1);
			}
			.progress-circle.active {
				background-color: #5750E3;
				transform: scale(1.2);
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
				background-color: #CDCAF7 !important;
				border-color: #5750E3 !important;
				color: #5750E3 !important;
				cursor: default !important;
			}
			.operation-button .tooltip {
				position: absolute;
				bottom: -25px;
				left: 50%;
				transform: translateX(-50%);
				background-color: #5750E3;
				color: white;
				padding: 4px 8px;
				border-radius: 4px;
				font-size: 12px;
				white-space: nowrap;
				opacity: 0;
				visibility: hidden;
				transition: all 0.2s ease;
				pointer-events: none;
			}
			.operation-button:hover .tooltip {
				opacity: 1;
				visibility: visible;
				bottom: -30px;
			}
			.operation-button .tooltip::before {
				content: '';
				position: absolute;
				top: -4px;
				left: 50%;
				transform: translateX(-50%);
				border-width: 0 4px 4px 4px;
				border-style: solid;
				border-color: transparent transparent #5750E3 transparent;
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
				left: 50%;
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
							{!showPlaceholder && !isPemdasAnimating && isPemdasAnimationComplete && (
								<div className="w-full flex flex-col gap-2 items-center justify-end absolute left-0 bottom-0 pb-5">
									{/* Progress Bar with Navigation */}
									{totalSteps > 0 && (
										<div className="flex items-center gap-4 relative z-50">
											{isSolved && (
												<button
													onClick={() => handleNavigateHistory('back')}
													className="nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#5750E3]/10 text-[#5750E3] hover:bg-[#5750E3]/20 transition-all duration-200 relative z-50"
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<path d="M15 18l-6-6 6-6"/>
													</svg>
												</button>
											)}
											<div className="flex gap-2">
												{[...Array(totalSteps + (isSolved ? 1 : 0))].map((_, index) => (
													<div
														key={`${bigAnimKey}-${index}`}
														className={`progress-circle ${index + 1 <= currentStep ? 'active' : ''} ${isProgressShrinking ? 'shrink-out' : isProgressGrowing ? 'grow-in' : ''}`}
													/>
												))}
											</div>
											{isSolved && (
												<button
													onClick={() => handleNavigateHistory('forward')}
													className="nav-button w-8 h-8 flex items-center justify-center rounded-full bg-[#5750E3]/10 text-[#5750E3] hover:bg-[#5750E3]/20 transition-all duration-200 relative z-50"
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
														<path d="M9 18l6-6-6-6"/>
													</svg>
												</button>
											)}
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
										style={{ position: 'relative', height: '48px', display: 'flex', alignItems: 'center' }}
									>
										<span 
											className="expression-wrapper" 
											style={{
												position: 'absolute',
												left: '50%',
												transform: 'translateX(-50%)',
												whiteSpace: 'nowrap',
												display: 'inline-block',
												transition: isWidthTransitioning ? 'width 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
												width: isWidthTransitioning && currentWidth !== null ? `${currentWidth}px` : 'auto',
												top: '50%',
												transform: 'translate(-50%, -50%)'
											}}
										>
											<span
												className="expression-content"
												ref={expressionContentRef}
												style={{
													whiteSpace: 'nowrap',
													display: 'inline-block',
													transition: isWidthTransitioning ? 'width 0.5s cubic-bezier(0.4,0,0.2,1)' : 'none',
													width: isWidthTransitioning && currentWidth !== null ? `${currentWidth}px` : 'auto',
													verticalAlign: 'middle',
													lineHeight: '1',
													position: 'relative'
												}}
											>
												{(() => {
													const parts = formatExpression(displayedExpression).split(highlightedOperation || '');
													const result = [];
													for (let i = 0; i < parts.length; i++) {
														result.push(
															<span key={`part-${i}`} style={{ display: 'inline-block', verticalAlign: 'middle', lineHeight: '1' }}>
																{parts[i]}
															</span>
														);
														if (i < parts.length - 1 && highlightedOperation) {
															result.push(
																<span
																	key={"highlighted-op"}
																	className={`highlighted-operation ${showOperationHighlight ? 'highlight' : ''} ${
																		isHighlightedOperationShrinking ? 'shrinking' :
																		isHighlightedOperationGrowing ? 'growing' : ''
																	}`}
																	style={{
																		visibility: isHighlightedOperationVisible ? 'visible' : 'hidden',
																		display: isOpWidthTransitioning && opCurrentWidth !== null ? 'inline-block' : 'inline',
																		transition: isOpWidthTransitioning ? 'width 0.5s cubic-bezier(0.4,0,0.2,1)' : undefined,
																		width: isOpWidthTransitioning && opCurrentWidth !== null ? `${opCurrentWidth}px` : undefined,
																		overflow: isOpWidthTransitioning ? 'hidden' : undefined,
																		whiteSpace: 'nowrap',
																		verticalAlign: 'middle',
																		lineHeight: '1'
																	}}
																	ref={el => {
																		opWidthRef.current = el;
																		setHighlightedOperationRef(el);
																	}}
																>
																	{isOpWidthTransitioning && opCurrentWidth !== null && opTargetWidth !== null
																		? (isSimplifying && !isHighlightedOperationShrinking ? currentOperationResult : highlightedOperation)
																		: highlightedOperation}
																</span>
															);
														}
													}
													return result;
												})()}
											</span>
										</span>
										{isSimplifying && !isHighlightedOperationShrinking && (
											<span 
												className="simplified-grow-in"
												style={{
													position: 'absolute',
													left: `${highlightedOperationPosition.left}px`,
													top: '21%',
													transform: 'translate(-50%, -50%)',
													zIndex: 10,
													display: 'inline',
													whiteSpace: 'nowrap',
													pointerEvents: 'none',
												}}
											>
												{currentOperationResult}
											</span>
										)}
									</p>
									{showContinueButton && (
										<div className="absolute bottom-3 right-3 z-50">
											<Button 
												onClick={handleContinue}
												 className={`h-[35px] bg-[#5750E3] hover:bg-[#4a42c7] text-white text-sm px-3 rounded-md select-none touch-manipulation ${isContinueButtonShrinking ? 'shrink-out' : 'fade-in'}`}
											>
												Continue
											</Button>
										</div>
									)}
									{showOperationButtons && (
										<div className={`absolute inset-0 ${isPemdasButtonsShrinking ? 'shrink-out' : isPemdasButtonsGrowing ? 'grow-in' : ''}`}>
											<div className="relative w-full h-full">
												<div className="absolute left-[173px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-up-after-down" style={{ animationDelay: '1.8s' }}>
															<div className="shrink-out" style={{ animationDelay: '3.5s' }}>
																<span className="text-[#5750E3] font-bold text-2xl">P</span>
																<span className="text-[#5750E3] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '2.6s' }}>arenthesis</span>
															</div>
															<div className="absolute left-[35%] top-0 opacity-0 grow-in" style={{ animationDelay: '3.8s' }}>
																<button className={`w-10 h-10 flex items-center justify-center bg-[#5750E3]/10 text-[#5750E3] rounded-md border border-[#5750E3]/30 text-lg font-medium move-parenthesis-button operation-button ${getCurrentPemdasStep(highlightedOperation, isLastInParentheses).inParentheses ? 'active' : ''}`} style={{ animationDelay: '4.2s' }}>
																	( )
																	{!isPemdasAnimating && <span className="tooltip absolute left-[35%] -translate-x-1/2 bottom-[-25px] text-xs">Parentheses</span>}
																</button>
															</div>
														</div>
													</div>
												</div>
												<div className="absolute left-[194px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.1s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-exponent" style={{ animationDelay: '4.6s' }}>
															<div className="shrink-out" style={{ animationDelay: '5.4s' }}>
																<span className="text-[#5750E3] font-bold text-2xl">E</span>
																<span className="text-[#5750E3] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '5.0s' }}>xponent</span>
															</div>
															<div className="absolute left-[35%] -translate-x-1/2 top-0 opacity-0 grow-in" style={{ animationDelay: '5.8s' }}>
																<button className={`w-10 h-10 flex items-center justify-center bg-[#5750E3]/10 text-[#5750E3] rounded-md border border-[#5750E3]/30 text-sm font-medium move-exponent-button operation-button ${getCurrentPemdasStep(highlightedOperation, isLastInParentheses).current === '^' ? 'active' : ''}`} style={{ animationDelay: '6.2s' }}>
																	x<sup>n</sup>
																	{!isPemdasAnimating && <span className="tooltip absolute left-[35%] -translate-x-1/2 bottom-[-25px] text-xs">Exponent</span>}
																</button>
															</div>
														</div>
													</div>
												</div>
												<div className="absolute left-[214px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.2s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-multiplication" style={{ animationDelay: '6.6s' }}>
															<div className="shrink-out" style={{ animationDelay: '7.4s' }}>
																<span className="text-[#5750E3] font-bold text-2xl">M</span>
																<span className="text-[#5750E3] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '7.0s' }}>ultiplication</span>
															</div>
															<div className="absolute left-[35%] -translate-x-1/2 top-0 opacity-0 grow-in" style={{ animationDelay: '7.8s' }}>
																<button className={`w-10 h-10 flex items-center justify-center bg-[#5750E3]/10 text-[#5750E3] rounded-md border border-[#5750E3]/30 text-lg font-medium move-multiply-divide-button operation-button ${getCurrentPemdasStep(highlightedOperation, isLastInParentheses).current === '×÷' ? 'active' : ''}`} style={{ animationDelay: '8.2s' }}>
																		×÷
																	{!isPemdasAnimating && <span className="tooltip absolute left-[35%] -translate-x-1/2 bottom-[-25px] text-xs">Multiplication / Division</span>}
																</button>
															</div>
														</div>
													</div>
												</div>
												<div className="absolute left-[242px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.3s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-division" style={{ animationDelay: '6.6s' }}>
															<div className="shrink-out" style={{ animationDelay: '7.4s' }}>
																<span className="text-[#5750E3] font-bold text-2xl">D</span>
																<span className="text-[#5750E3] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '7.0s' }}>ivision</span>
															</div>
														</div>
													</div>
												</div>
												<div className="absolute left-[264px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.4s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-addition" style={{ animationDelay: '8.6s' }}>
															<div className="shrink-out" style={{ animationDelay: '9.4s' }}>
																<span className="text-[#5750E3] font-bold text-2xl">A</span>
																<span className="text-[#5750E3] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '9.0s' }}>ddition</span>
															</div>
															<div className="absolute left-[35%] -translate-x-1/2 top-0 opacity-0 grow-in" style={{ animationDelay: '9.8s' }}>
																<button className={`w-10 h-10 flex items-center justify-center bg-[#5750E3]/10 text-[#5750E3] rounded-md border border-[#5750E3]/30 text-lg font-medium move-add-subtract-button operation-button ${getCurrentPemdasStep(highlightedOperation, isLastInParentheses).current === '+-' ? 'active' : ''}`} style={{ animationDelay: '10.2s' }}>
																	+-
																	{!isPemdasAnimating && <span className="tooltip absolute left-[35%] -translate-x-1/2 bottom-[-25px] text-xs">Addition / Subtraction</span>}
																</button>
															</div>
														</div>
													</div>
												</div>
												<div className="absolute left-[286px] top-[85px] opacity-0 grow-in" style={{ animationDelay: '0.5s' }}>
													<div className="relative inline-block move-down" style={{ animationDelay: '1.2s' }}>
														<div className="move-subtraction" style={{ animationDelay: '8.6s' }}>
															<div className="shrink-out" style={{ animationDelay: '9.4s' }}>
																<span className="text-[#5750E3] font-bold text-2xl">S</span>
																<span className="text-[#5750E3] font-bold text-2xl opacity-0 fade-in" style={{ animationDelay: '9.0s' }}>ubtraction</span>
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