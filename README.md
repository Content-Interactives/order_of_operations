# order-of-operations

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
- Each operation step is represented by a tab in a row underneath the input: **P**, **E**, **M/D**, **A/S**. (four tabs total)
- The active step’s tab will be highlighted **light blue `#CDCAF7`** during its operation. The rest will be greyed out.
  - All operation tabs should be visible at all times, even if the input expression doesn’t use every operation.
  - During parentheses steps, both the **parentheses tab** and the **relevant operation tab** (e.g. multiplication inside parentheses) should be highlighted.
- The final simplified answer will be shown in **green `#008545`**. 

---

## Animation Details

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

## Help Text

Display help text during each step explaining what's happening.

Example texts:

- `"Perform all the operations inside the parentheses until it is simplified."`
- `"Addition and subtraction are performed from left to right."`


---

## Navigation Features

- On the first run after submission, the animation will play from start to finish automatically.
- At the bottom of the screen there will be **left and right arrows** so students can click through "pages" (represented by small dots).
- At any point, students can interrupt the animation to navigate through the steps using the arrows.
- When an arrow is clicked:
  - The animation will play until the end of that operation and then pause.
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
