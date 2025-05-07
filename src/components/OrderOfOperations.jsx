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
			() => `${generateRandomNumber(1, 9)} * (${generateRandomNumber(1, 9)} + ${generateRandomNumber(1, 9)})^2`
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
		// Replace multiplication symbols with *
		const normalizedValue = value
			.replace(/[×x]/g, '*')
			.replace(/[^0-9+\-*/()^]/g, ''); // Only allow numbers and specified operators
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
		
		// Convert exponents to superscript
		formatted = formatted.replace(/(\d+)\^(\d+)/g, (match, base, exponent) => {
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

	const handleSimplify = () => {
		const validation = validateExpression(expression);
		if (!validation.isValid) {
			if (!showPlaceholder) {
				// If showing an expression, animate it out first
				setIsBigShrinking(true);
				setTimeout(() => {
					setShowPlaceholder(true);
					setIsBigShrinking(false);
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

		if (!showPlaceholder) {
			// If already showing a big expression, animate it out first
			setIsBigShrinking(true);
			setTimeout(() => {
				setDisplayedExpression(expression);
				setIsBigShrinking(false);
				setBigAnimKey(prev => prev + 1); // Force re-mount for grow-in
			}, 400); // Match shrink-out duration
			return;
		}

		setIsShrinking(true);
		setTimeout(() => {
			setShowPlaceholder(false);
			setIsShrinking(false);
			setDisplayedExpression(expression);
			setBigAnimKey(prev => prev + 1);
		}, 500); // Match this with the animation duration
		// TODO: Process the valid expression
		console.log("Expression is valid:", expression);
	};

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
						<div className={`w-full min-h-[200px] p-2 bg-white border border-[#5750E3]/30 rounded-md flex justify-center ${showPlaceholder ? 'items-center' : 'items-start'}`}> 
							{showPlaceholder ? (
								<p className={`text-gray-500 text-center select-none max-w-[280px] transition-all duration-500 ${isShrinking ? 'scale-0 opacity-0' : isPlaceholderGrowing ? 'grow-in' : 'scale-100 opacity-100'}`}>
									Enter a <span className={`transition-all duration-300 ${isError ? 'font-bold text-yellow-500' : ''}`}>valid expression</span> to simplify it using the order of operations!
								</p>
							) : (
								<p
									key={bigAnimKey}
									className={`text-2xl font-bold text-[#5750E3] select-none mt-2 ${isBigShrinking ? 'shrink-out' : 'grow-in'}`}
								>
									{formatExpression(displayedExpression)}
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