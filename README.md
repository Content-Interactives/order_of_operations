Link to Github interactive: https://content-interactives.github.io/order_of_operations/

# order_of_operations

## Overview
Visual walkthrough: https://docs.google.com/presentation/d/1RhN9Hvt5cVr7xThh8x7v88HXWdILRRdaf1P8BoPbRic/edit?usp=sharing

This interactive will function as an animated simplifier for math expressions. Students can input an expression containing only integers and the following operations:

- Parentheses `()`, `[]`, and `{}`
- Exponents `^`
- Multiplication `*` or `x`
- Division `/` or `÷`
- Addition `+`
- Subtraction `-`

**No variables are allowed in the expression.**

--- 
## How It Works

Once an expression is submitted:

- The interactive will animate the order of operations (PEMDAS) step by step.
- Each operation step will then be represented by an icon in a row underneath the input: **()**, **^**, **×/÷**, **+/-**. (four icons total)
- These icons can be hovered over with the mouse to see what they represent in text.
- The active step’s icon will be highlighted **light blue `#CDCAF7`** during its operation. The rest will be greyed out.
  - All operation icons should be visible at all times, even if the input expression doesn’t use every operation.
  - During parentheses steps, both the **parentheses icon** and the **relevant operation icon** (e.g. multiplication inside parentheses) should be highlighted.
  - Once an operation step is completed, the icon will be crossed out.
- The final simplified answer will be shown in **green `#008545`**. 

---

## Animation Details

After the student first submits the expression:

- The name of the first operation will appear in text.
- Then, the text will animate to become the icon. 
- Repeat for each operation icon until all the icons appear in the row.
  
As each operation is performed:

- The relevant numbers will highlight to **blue `#5750E3`**.
- Then they will animate to merge into a simplified result.
- If there are multiple steps in the same operation, show the animations separately, from left to right.
- For operations with parentheses:
  - Breifly highlight the parentheses on their own.
  - Then continue the animations of the operations inside.
- If possible, add a bit of **squash and stretch** to the animation to make it feel dynamic and engaging.
- After each operation, the expression will get smaller, so allow the expression to condense before moving on to the next step.

---


## Navigation Features

- At the bottom of the screen there will be left and right buttons (perhaps "Back" and "Next"?) so students can click through "pages" (represented by small dots).
- When the "Next" button is clicked:
  - The animation will play until the end of that operation and then pause.
- When the "Back" button is clicked:
  - The expression will reset itself back to the beginning of the last step.
  - The animation should not resume until the student presses "Next" again.
- If a student has already seen the current step's animation, they should be able to quickly skip the animations by using these buttons.
- Consider each dot as one **whole operation step**.

  Example:
  
  - The operations for `3 - 5 + 2` will be represented as **one dot**, and two animations will play back to back: subtraction then addition.

- **Parentheses won't count as a separate dot**, and multiple operations inside them will still be separate dots.

  Example:

  - The operations for `6 + (5 - 2 x 3)` will be represented by **three dots**:
    - multiplication
    - then subtraction
    - then addition

- The **final result should be represented as its own dot** (no animation needed).