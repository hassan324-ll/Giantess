# TODO - Cart sidebar

## Step 1 (done)
Implement shared cart open/close state via `CartService`.

## Step 2 (done)
Wire header cart icon click to open the cart sidebar (use `CartService`).


## Step 3
Replace `src/app/components/cart/cart.html` with the designed off-canvas sidebar UI (overlay + aside + responsive layout).

## Step 4
Implement cart open/close logic in `src/app/components/cart/cart.ts` subscribing to `CartService`.

## Step 5
Add/upgrade styling in `src/app/components/cart/cart.css` to match the theme used by header sidebar (gradients, borders, shadows), including responsive behavior.

## Step 6
Run build/tests (if available) and manually verify: open/close and responsive.

## Step 7
Fix any additional compile/runtime issues discovered during testing.


