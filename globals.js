// Light color scheme
//const CANVAS_BACKGROUND_COLOR = 200;
//const BLOCK_BACKGROUND_COLOR = 255;
//const COMPONENT_COLOR = 40;
//...

// Dark color scheme
const CANVAS_BACKGROUND_COLOR = "#383838";
const BLOCK_BACKGROUND_COLOR = "#181818";
const BLOCK_OUTLINE_COLOR = "#484848";
const BLOCK_DOT_COLOR = "#00ffff";
const BLOCK_SELECTED_COLOR = "#686868";
const COMPONENT_COLOR = 240;
const TEXT_FORE_COLOR = "#d8d8d8";
const TEXT_ACTIVE_COLOR = "#ffffff";
const MENU_BACKGROUND_COLOR = "#505050f0";
const MENU_OUTLINE_COLOR = "#c8c8c8";
const MENU_HEADING_COLOR = "#00f0f0";
const MENU_SELECTED_COLOR = "#282828";

// keyCode
const HOME = 36;

// Rotations
const ROTATE_90_LEFT = 1;
const ROTATE_180 = 2;
const ROTATE_90_RIGHT = 3;

// Component types
const BUTTON_COMPONENT = 'Button/Switch';
const CAPACITOR_COMPONENT = 'Capacitor';
const DIODE_COMPONENT = 'LED/Diode';
const RESISTOR_COMPONENT = 'Resistor';
const TRANSISTOR_COMPONENT = 'Transistor';
const WIRE_COMPONENT = 'Wire';
const LOGIC_COMPONENT = 'Logic Gate';
const IC_COMPONENT = 'Integrated Circuit';
const MISC_COMPONENT = 'Miscellaneous';
const VOLTAGE_SOURCE_COMPONENT = 'Voltage Source';
const GROUND_COMPONENT = 'Ground';

// Button types
const OPEN_PUSH_BUTTON = 'Momentary, make';
const CLOSED_PUSH_BUTTON = 'Momentary, break';
const SINGLE_THROW_BUTTON = 'Single throw';
const DOUBLE_THROW_BUTTON = 'Double throw';
const BUTTON_TYPES = [OPEN_PUSH_BUTTON, CLOSED_PUSH_BUTTON, SINGLE_THROW_BUTTON, DOUBLE_THROW_BUTTON];

// Capacitor types
const NORMAL_CAPACITOR = 'Non-polarized';
const POLARIZED_CAPACITOR = 'Polarized';
const CAPACITOR_TYPES = [POLARIZED_CAPACITOR, NORMAL_CAPACITOR];

// Diode types
const NORMAL_DIODE = 'Normal';
const LED_DIODE = 'LED';
//const SCHOTTKY_DIODE = 'Schottky';
//const ZENER_DIODE = 'Zener';
//const PHOTO_DIODE = 'Photo';
const DIODE_TYPES = [LED_DIODE, NORMAL_DIODE];

// Resistor types
const NORMAL_RESISTOR = 'Normal';
const VARIABLE_RESISTOR = 'Variable';
const RESISTOR_TYPES = [NORMAL_RESISTOR, VARIABLE_RESISTOR];

// Transistor types
const NPN_TRANSISTOR = 'NPN BJT';
const PNP_TRANSISTOR = 'PNP BJT';
const TRANSISTOR_TYPES = [NPN_TRANSISTOR, PNP_TRANSISTOR];

// Wire types
const STRAIGHT_WIRE = 'Straight';
const CORNER_WIRE = 'Corner';
const ANGLED_CORNER = 'Angled Corner';
const ANGLED_WIRE = 'Angled';
const T_WIRE = 'T-junction';
const CROSS_WIRE = 'X-junction';
const CROSS_OVER_WIRE = 'Cross-over';
const WIRE_TYPES = [STRAIGHT_WIRE, CORNER_WIRE, ANGLED_WIRE, ANGLED_CORNER, T_WIRE, CROSS_WIRE, CROSS_OVER_WIRE];

// Logic gate types
const INVERTER_LOGIC = 'inverter';
const BUFFER_LOGIC = 'Buffer';
const BUFFER_ENABLE_LOGIC = 'Buffer w/ enable';
const COMPARATOR_LOGIC = 'Comparator';
const AND_LOGIC = 'AND';
const NAND_LOGIC = 'NAND';
const OR_LOGIC = 'OR';
const NOR_LOGIC = 'NOR';
const XOR_LOGIC = 'XOR';
const XNOR_LOGIC = 'XNOR';
const LOGIC_TYPES = [AND_LOGIC, NAND_LOGIC, OR_LOGIC, NOR_LOGIC, XOR_LOGIC, XNOR_LOGIC, INVERTER_LOGIC, BUFFER_LOGIC, BUFFER_ENABLE_LOGIC, COMPARATOR_LOGIC];

// IC types
const IC_LM555 = "555 Timer";
const IC_74_00 = "Quad 2-input NAND";
const IC_74_02 = "Quad 2-input NOR";
const IC_74_04 = "Hex inverter";
const IC_74_08 = "Quad 2-input AND";
const IC_74_11 = "Tri 3-input AND";
const IC_74_32 = "Quad 2-input OR";
const IC_74_73 = "Dual JK flip-flop";
const IC_74_74 = "Dual D flip-flop";
const IC_74_86 = "Quad 2-input XOR";
const IC_74_138 = "3->8 decoder";
const IC_74_139 = "Dual 2->4 decoder";
const IC_74_157 = "Quad 2->1 selector";
const IC_74_161 = "4-bit counter";
const IC_74_173 = "4-bit register";
const IC_74_189 = "16x4 RAM, inverted";
const IC_74_219 = "16x4-bit RAM";
const IC_74_242 = "Quad invert bus";
const IC_74_245 = "Oct tri-state bus";
const IC_74_283 = "4-bit adder";
const IC_28C16 = "16K EEPROM";
const IC_TYPES = [IC_LM555, IC_74_08, IC_74_11, IC_74_00, IC_74_32,
                  IC_74_86, IC_74_02, IC_74_04, IC_74_73, IC_74_74, IC_74_139, IC_74_138, IC_74_157,
                  IC_74_283, IC_74_161, IC_74_173, IC_74_189, IC_74_219, IC_74_242, IC_74_245,
                  IC_28C16];

// Miscellaneous types
const SR_LATCH_MISC = 'SR Latch';
const SR_LATCH_ENABLE_MISC = 'SR Latch w/ enable';
const D_LATCH_MISC = 'D Latch';
const D_FLIPFLOP_MISC = 'D Flip-flop';
const SEG_LED_MISC = '7-seg CC LED';
const MISC_TYPES = [SR_LATCH_MISC, SR_LATCH_ENABLE_MISC, D_LATCH_MISC, D_FLIPFLOP_MISC, SEG_LED_MISC];

const COMPONENT_TYPE_SUBTYPES = [
    { type: BUTTON_COMPONENT, subtypes: BUTTON_TYPES },
    { type: CAPACITOR_COMPONENT, subtypes: CAPACITOR_TYPES },
    { type: DIODE_COMPONENT, subtypes: DIODE_TYPES },
    { type: RESISTOR_COMPONENT, subtypes: RESISTOR_TYPES },
    { type: TRANSISTOR_COMPONENT, subtypes: TRANSISTOR_TYPES },
    { type: WIRE_COMPONENT, subtypes: WIRE_TYPES },
    { type: LOGIC_COMPONENT, subtypes: LOGIC_TYPES },
    { type: IC_COMPONENT, subtypes: IC_TYPES },
    { type: MISC_COMPONENT, subtypes: MISC_TYPES },
    { type: VOLTAGE_SOURCE_COMPONENT, subtypes: [] },
    { type: GROUND_COMPONENT, subtypes: [] }
];
const NUM_NORMAL_COMPONENTS = 6;
const NUM_COMPLEX_COMPONENTS = 3;
const NUM_POWER_COMPONENTS = 2;
