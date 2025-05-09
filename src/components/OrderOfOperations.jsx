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
	const [hoveredOp, setHoveredOp] = useState(null);
	const [redGlowOp, setRedGlowOp] = useState(null); // 'paren', 'exp', 'muldiv', 'addsub' or null
	const [redGlowText, setRedGlowText] = useState(false);
	const [greenGlowOp, setGreenGlowOp] = useState(null); // 'paren', 'exp', 'muldiv', 'addsub' or null
	const [greenGlowText, setGreenGlowText] = useState(false);

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
	};

	const handleExpressionChange = (e) => {
		const value = e.target.value;
		// Replace multiplication symbols with * and preserve spaces
		const normalizedValue = value
			.replace(/[×x]/g, '*')
			.replace(/[^0-9+\-*/()^ ]/g, ''); // Allow numbers, operators, parentheses, and spaces
		setExpression(normalizedValue);
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
		formatted = formatted.replace(/(\([^)]+\)|\d+)\^(\d+)/g, (match, base, exponent) => {
			// Convert each digit of the exponent to superscript
			const superscriptExponent = exponent.split('').map(digit => {
				const superscriptMap = {
					'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
					'5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
				};
				return superscriptMap[digit] || digit;
			}).join('');
			return `${base}${superscriptExponent}`;
		});
		
		// Add spaces around operators, but not around parentheses or superscripts
		formatted = formatted
			.replace(/(\d+)([+\-×÷])/g, '$1 $2') // Space after number before operator
			.replace(/([+\-×÷])(\d+)/g, '$1 $2') // Space after operator before number
			.replace(/\s*\(\s*/g, '(') // Remove spaces around opening parenthesis
			.replace(/\s*\)\s*/g, ')') // Remove spaces around closing parenthesis
			.replace(/\s+/g, ' ') // Replace multiple spaces with single space
			.trim(); // Remove leading/trailing spaces
		
		return formatted;
	};

	const calculateTotalSteps = (expr) => {
		if (!expr) return 0;
		
		let steps = 0;
		// Count parentheses pairs
		const parenthesesPairs = (expr.match(/\(/g) || []).length;
		steps += parenthesesPairs;
		
		// Count exponents
		const exponents = (expr.match(/\^/g) || []).length;
		steps += exponents;
		
		// Count multiplication and division
		const multDiv = (expr.match(/[\*\/]/g) || []).length;
		steps += multDiv;
		
		// Count addition and subtraction
		const addSub = (expr.match(/[\+\-]/g) || []).length;
		steps += addSub;
		
		return steps;
	};

	const handleSimplify = () => {
		const validation = validateExpression(expression);
		if (!validation.isValid) {
			if (!showPlaceholder) {
				setIsBigShrinking(true);
				setIsProgressShrinking(true);
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
		setIsProgressShrinking(true);
		setTimeout(() => {
			// After shrinking, update the steps
			setTotalSteps(calculateTotalSteps(expression));
			setCurrentStep(1);
			setIsProgressShrinking(false);
			setIsProgressGrowing(true);
			
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
			}, 400);
			return;
		}

		setIsShrinking(true);
		setTimeout(() => {
			setShowPlaceholder(false);
			setIsShrinking(false);
			setDisplayedExpression(expression);
			setBigAnimKey(prev => prev + 1);
		}, 500);
	};

	// Helper: Determine the next correct operation in PEMDAS order for the current expression
	function getNextOperation(expr) {
		if (/\(/.test(expr)) return 'paren';
		if (/([\d\)]+)[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.test(formatExpression(expr))) return 'exp';
		if (/[×÷]/.test(formatExpression(expr))) return 'muldiv';
		if (/[+−]/.test(formatExpression(expr))) return 'addsub';
		return null;
	}

	// Helper to highlight leftmost parenthesis contents
	function highlightLeftmostParenthesis(expr, colorClass, redGlow, greenGlow) {
		let start = expr.indexOf('(');
		if (start === -1) return expr;
		let depth = 0;
		for (let i = start; i < expr.length; i++) {
			if (expr[i] === '(') depth++;
			if (expr[i] === ')') depth--;
			if (depth === 0) {
				const before = expr.slice(0, start);
				const openParen = expr[start];
				const inside = expr.slice(start + 1, i);
				const closeParen = expr[i];
				const after = expr.slice(i + 1);
				return <>{before}<span className={colorClass + (redGlow ? ' text-red-glow' : greenGlow ? ' text-green-glow' : '')}>{openParen}{inside}{closeParen}</span>{after}</>;
			}
		}
		return expr;
	}

	// Helper to highlight leftmost exponent (base and exponent)
	function highlightLeftmostExponent(expr, colorClass, redGlow, greenGlow) {
		// Match (base)^{exponent} or base^{exponent} (with superscript)
		// The formatted expression uses unicode superscripts, so match those
		const superscriptPattern = /([\d\)]+)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/;
		const match = expr.match(superscriptPattern);
		if (!match) return expr;
		let before = expr.slice(0, match.index);
		let base = match[1];
		const exp = match[2];
		let highlightStart = match.index;
		let highlightEnd = match.index + match[0].length;

		// If base ends with ')', find matching '(' and highlight from there
		if (base.endsWith(')')) {
			let depth = 1;
			let i = match.index + base.length - 2;
			while (i >= 0 && depth > 0) {
				if (expr[i] === ')') depth++;
				if (expr[i] === '(') depth--;
				i--;
			}
			highlightStart = i + 1; // index of matching '('
			before = expr.slice(0, highlightStart);
		}
		const highlight = expr.slice(highlightStart, highlightEnd);
		const after = expr.slice(highlightEnd);
		return <>{before}<span className={colorClass + (redGlow ? ' text-red-glow' : greenGlow ? ' text-green-glow' : '')}>{highlight}</span>{after}</>;
	}

	// Helper to highlight leftmost multiplication/division and its operands
	function highlightLeftmostMulDiv(expr, colorClass, redGlow, greenGlow) {
		// Find the leftmost × or ÷
		const opMatch = expr.match(/[×÷]/);
		if (!opMatch) return expr;
		const opIdx = opMatch.index;
		// Find left operand
		let leftStart = opIdx - 1;
		// If it's a parenthesis group
		if (expr[leftStart] === ')') {
			let depth = 1;
			leftStart--;
			while (leftStart >= 0 && depth > 0) {
				if (expr[leftStart] === ')') depth++;
				if (expr[leftStart] === '(') depth--;
				leftStart--;
			}
			leftStart++;
		} else {
			// Otherwise, scan left for digits/decimals, but always include at least one digit
			while (leftStart - 1 >= 0 && /[\d.]/.test(expr[leftStart - 1])) leftStart--;
		}
		// Find right operand
		let rightStart = opIdx + 1;
		// Skip spaces after operator
		while (rightStart < expr.length && expr[rightStart] === ' ') rightStart++;
		let rightEnd = rightStart;
		if (expr[rightStart] === '(') {
			// Parenthesis group
			let depth = 1;
			rightEnd++;
			while (rightEnd < expr.length && depth > 0) {
				if (expr[rightEnd] === '(') depth++;
				if (expr[rightEnd] === ')') depth--;
				rightEnd++;
			}
		} else {
			// Number (single or multi-digit)
			while (rightEnd < expr.length && /[\d.]/.test(expr[rightEnd])) rightEnd++;
		}
		const before = expr.slice(0, leftStart);
		const highlight = expr.slice(leftStart, rightEnd);
		const after = expr.slice(rightEnd);
		return <>{before}<span className={colorClass + (redGlow ? ' text-red-glow' : greenGlow ? ' text-green-glow' : '')}>{highlight}</span>{after}</>;
	}

	// Helper to highlight leftmost addition/subtraction and its operands
	function highlightLeftmostAddSub(expr, colorClass, redGlow, greenGlow) {
		const opMatch = expr.match(/[+−]/);
		if (!opMatch) return expr;
		const opIdx = opMatch.index;
		let leftStart = opIdx - 1;
		if (expr[leftStart] === ')') {
			let depth = 1;
			leftStart--;
			while (leftStart >= 0 && depth > 0) {
				if (expr[leftStart] === ')') depth++;
				if (expr[leftStart] === '(') depth--;
				leftStart--;
			}
			leftStart++;
		} else {
			// Scan left for digits/decimals and superscripts
			while (leftStart - 1 >= 0 && /[\d.⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(expr[leftStart - 1])) leftStart--;
		}
		let rightStart = opIdx + 1;
		while (rightStart < expr.length && expr[rightStart] === ' ') rightStart++;
		let rightEnd = rightStart;
		if (expr[rightStart] === '(') {
			let depth = 1;
			rightEnd++;
			while (rightEnd < expr.length && depth > 0) {
				if (expr[rightEnd] === '(') depth++;
				if (expr[rightEnd] === ')') depth--;
				rightEnd++;
			}
		} else {
			while (rightEnd < expr.length && /[\d.⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(expr[rightEnd])) rightEnd++;
		}
		const before = expr.slice(0, leftStart);
		const highlight = expr.slice(leftStart, rightEnd);
		const after = expr.slice(rightEnd);
		return <>{before}<span className={colorClass + (redGlow ? ' text-red-glow' : greenGlow ? ' text-green-glow' : '')}>{highlight}</span>{after}</>;
	}

	// Button click handler
	function handleOperationClick(op) {
		const correctOp = getNextOperation(displayedExpression);
		if (op !== correctOp) {
			setRedGlowOp(op);
			setRedGlowText(true);
			setTimeout(() => {
				setRedGlowOp(null);
				setRedGlowText(false);
			}, 600);
			return;
		}
		setGreenGlowOp(op);
		setGreenGlowText(true);
		setTimeout(() => {
			setGreenGlowOp(null);
			setGreenGlowText(false);
		}, 600);
		// TODO: Implement correct operation logic here
	}

	return (
		<>
			<style>{`
			@keyframes grow-in {
				0% { transform: scale(0.7); opacity: 0; }
				100% { transform: scale(1); opacity: 1; }
			}
			.grow-in {
				animation: grow-in 0.4s cubic-bezier(0.4,0,0.2,1) both;
			}
			@keyframes shrink-out {
				0% { transform: scale(1); opacity: 1; }
				100% { transform: scale(0.7); opacity: 0; }
			}
			.shrink-out {
				animation: shrink-out 0.4s cubic-bezier(0.4,0,0.2,1) both;
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
						<div className={`w-full min-h-[200px] p-2 bg-white border border-[#5750E3]/30 rounded-md flex justify-center ${showPlaceholder ? 'items-center' : 'items-start'} relative`}> 
							{/* Order of Operations Steps Row */}
							{!showPlaceholder && (
								<div className="w-full flex flex-col gap-2 items-center justify-end absolute left-0 bottom-0 pb-4">
									{/* Instructional Text */}
									<div className="mb-1 w-full">
										{(() => {
											switch (hoveredOp) {
												case 'paren':
													return <p className="text-center text-sm text-gray-600 font-medium">Simplify inside the <span className="text-[#5750E3] font-bold">parenthesis</span> from left to right</p>;
												case 'exp':
													return <p className="text-center text-sm text-gray-600 font-medium">Simplify the <span className="text-[#5750E3] font-bold">exponents</span> from left to right</p>;
												case 'muldiv':
													return <p className="text-center text-sm text-gray-600 font-medium"><span className="text-[#5750E3] font-bold">Multiply</span> or <span className="text-[#5750E3] font-bold">divide</span> from left to right</p>;
												case 'addsub':
													return <p className="text-center text-sm text-gray-600 font-medium"><span className="text-[#5750E3] font-bold">Add</span> or <span className="text-[#5750E3] font-bold">subtract</span> from left to right</p>;
												default:
													return <p className="text-center text-sm text-gray-600 font-medium">Select the first operation to simplify the expression</p>;
											}
										})()}
									</div>
									{/* Order of Operations Steps Row */}
									<div className="flex gap-2 mb-2">
										{/* Parentheses */}
										<div
											className={`operation-btn w-12 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-2xl text-gray-700 select-none ${isProgressShrinking ? 'shrink-out' : isProgressGrowing ? 'grow-in' : ''}${redGlowOp === 'paren' ? ' red-glow' : greenGlowOp === 'paren' ? ' green-glow' : ''}`}
											onMouseEnter={() => setHoveredOp('paren')}
											onMouseLeave={() => setHoveredOp(null)}
											onClick={() => handleOperationClick('paren')}
										>
											<span className="-mt-[5px]">( )</span>
										</div>
										{/* Exponent */}
										<div
											className={`operation-btn w-12 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-2xl text-gray-700 select-none ${isProgressShrinking ? 'shrink-out' : isProgressGrowing ? 'grow-in' : ''}${redGlowOp === 'exp' ? ' red-glow' : greenGlowOp === 'exp' ? ' green-glow' : ''}`}
											onMouseEnter={() => setHoveredOp('exp')}
											onMouseLeave={() => setHoveredOp(null)}
											onClick={() => handleOperationClick('exp')}
										>
											<span className="flex items-center -mt-[5px]"><span className="font-normal">e</span><sup className="text-xs ml-0.5 align-super">x</sup></span>
										</div>
										{/* Multiplication/Division */}
										<div
											className={`operation-btn w-12 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-2xl text-gray-700 select-none ${isProgressShrinking ? 'shrink-out' : isProgressGrowing ? 'grow-in' : ''}${redGlowOp === 'muldiv' ? ' red-glow' : greenGlowOp === 'muldiv' ? ' green-glow' : ''}`}
											onMouseEnter={() => setHoveredOp('muldiv')}
											onMouseLeave={() => setHoveredOp(null)}
											onClick={() => handleOperationClick('muldiv')}
										>
											<span className="-mt-[5px]"><span className="mr-1">×</span><span>÷</span></span>
										</div>
										{/* Addition/Subtraction */}
										<div
											className={`operation-btn w-12 h-10 flex items-center justify-center rounded-md border border-gray-300 bg-white text-2xl text-gray-700 select-none ${isProgressShrinking ? 'shrink-out' : isProgressGrowing ? 'grow-in' : ''}${redGlowOp === 'addsub' ? ' red-glow' : greenGlowOp === 'addsub' ? ' green-glow' : ''}`}
											onMouseEnter={() => setHoveredOp('addsub')}
											onMouseLeave={() => setHoveredOp(null)}
											onClick={() => handleOperationClick('addsub')}
										>
											<span className="-mt-[5px]"><span className="mr-1">+</span><span>−</span></span>
										</div>
									</div>
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
									Enter a <span className={`transition-all duration-300 ${isError ? 'font-bold text-yellow-500' : ''}`}>valid expression</span> to simplify it using the order of operations!
								</p>
							) : (
								<p
									key={bigAnimKey}
									className={`text-3xl font-bold text-black select-none mt-2 ${isBigShrinking ? 'shrink-out' : 'grow-in'}`}
								>
									{hoveredOp === 'paren'
										? highlightLeftmostParenthesis(formatExpression(displayedExpression), 'text-[#5750E3]', redGlowText, greenGlowText)
										: hoveredOp === 'exp'
										? highlightLeftmostExponent(formatExpression(displayedExpression), 'text-[#5750E3]', redGlowText, greenGlowText)
										: hoveredOp === 'muldiv'
										? highlightLeftmostMulDiv(formatExpression(displayedExpression), 'text-[#5750E3]', redGlowText, greenGlowText)
										: hoveredOp === 'addsub'
										? highlightLeftmostAddSub(formatExpression(displayedExpression), 'text-[#5750E3]', redGlowText, greenGlowText)
										: formatExpression(displayedExpression)}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default OrderOfOperations;