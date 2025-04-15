// --- Fixed point math configuration
const ANGLES_BITS = 4;
const ANGLES_FIXED_MATH_ONE = Math.pow(2, ANGLES_BITS);
const POS_BITS = 7;
const POS_FIXED_MATH_ONE = Math.pow(2, POS_BITS);
// --- End fixed point configuration

const SCREEN_WIDTH = scene.screenWidth();
const SCREEN_HEIGHT = scene.screenHeight();
const SCREEN_HALF_WIDTH = Math.idiv(SCREEN_WIDTH, 2);
const SCREEN_HALF_HEIGHT = Math.idiv(SCREEN_HEIGHT, 2);

// --- Car configuration
const CAR_VIEWPORT = Math.idiv(scene.screenWidth(), 7);
// end car configuration

const SCREEN_HALF_WIDTH_PLUS_CAR_VIEWPORT = SCREEN_HALF_WIDTH + CAR_VIEWPORT;
const SCREEN_HALF_WIDTH_MINUS_CAR_VIEWPORT = SCREEN_HALF_WIDTH - CAR_VIEWPORT;