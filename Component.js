// After starting out with a component base class and extended classes for each component type,
// I refactored to improve the performance when importing large circuits which may have thousands of
// components. Now a component is just a simple object, and there are a few related functions that
// exist outside of that.
function createComponent(x, y, type, subType, rotation, flip, rgba) {
    return {
        x: x, y: y, // the component's position in the circuit
        type: type, // type of component, e.g., wire, resistor, capacitor, transistor
        subType: subType, // e.g., variable resistor, polarized capacitor, etc.
        rotation: rotation ? rotation : 0, // number of 90 degree rotations, 0 thru 3
        flip: (flip !== undefined) ? flip : 0, // flag to render the component reflected along the y-axis
        rgba: rgba ? rgba : COMPONENT_COLOR
    };
    //width: ((width) ? width : 1), // width & height in Blocks, components can be 1x1, 1x3, 3x3, etc.
    //height: ((height) ? height : 1),
    //resistance: 0.000000000001, // 1 nano Ohm, basically none
    //capacitance: 0.000000000001, // 1 nano Farad, basically none
    //inductance: 0.000000000001, // 1 nano Henry, basically none
}
function showComponent(c, showJunctionDot) {
    push();
    translate(HALF_BLOCK, HALF_BLOCK); // set origin to center of the top-left block
    if (c.flip) applyMatrix(-1, 0, 0, 1, 0, 0); // reflect about the y-axis
    rotateComponent(c); // rotate around the origin & apply positioning corrections
    noFill();
    strokeWeight(1);
    stroke(c.rgba);
    switch (c.type) {
        // NORMAL COMPONENT TYPES
        case BUTTON_COMPONENT: renderButton(c); break;
        case CAPACITOR_COMPONENT: renderCapacitor(c); break;
        case DIODE_COMPONENT: renderDiode(c); break;
        case RESISTOR_COMPONENT: renderResistor(c); break;
        case TRANSISTOR_COMPONENT: renderTransistor(c); break;
        case WIRE_COMPONENT: renderWire(c, showJunctionDot); break;
        // COMPLEX_COMPONENT_TYPES
        case LOGIC_COMPONENT: renderLogic(c); break;
        case IC_COMPONENT: renderIntegratedCircuit(c); break;
        case MISC_COMPONENT: renderMisc(c); break;
        // POWER_COMPONENT_TYPES
        case VOLTAGE_SOURCE_COMPONENT: renderVoltageSource(); break;
        case GROUND_COMPONENT: renderGround(); break;
    }
    pop();
}
function rotateComponent(c) {
    // for some reason I can't figure out, rotating moves the center point
    // also, being flipped moves the center point, which needs to be accounted for
    // so I need to write my own rotate function to get it right
    if (c.rotation === 0) {
        //applyMatrix(0, 0, 0, 0, 0, 0);  // no rotation
        if (c.flip) {
            translate(-1, 0);
        } else {
            //translate(0, 0); // no correction needed
        }
    } else if (c.rotation === 1) {
        applyMatrix(0, -1, 1, 0, 0, 0);  // 90 degrees clockwise
        if (c.flip) {
            translate(-1, -1);
        } else {
            translate(-1, 0);
        }
    } else if (c.rotation === 2) {
        applyMatrix(-1, 0, 0, -1, 0, 0); // 180 degrees
        if (c.flip) {
            translate(0, -1);
        } else {
            translate(-1, -1);
        }
    } else if (c.rotation === 3) {
        applyMatrix(0, 1, -1, 0, 0, 0);  // 90 degrees couter-clockwise
        if (c.flip) {
            //translate(0, 0); // no correction needed
        } else {
            translate(0, -1);
        }
    }
}

// NORMAL COMPONENT TYPES
function renderButton(c) {
        // base shape shared by all buttons & switches
        line(-15, 0, -9, 0);
        line(9, 0, 15, 0);
        ellipse(-7, 0.5, 3);
        ellipse(8, 0.5, 3);
        switch (c.subType) {
            case OPEN_PUSH_BUTTON:
                line(-9, -7, 9, -7);
                line(0, -7, 0, -12);
                break;
            case CLOSED_PUSH_BUTTON:
                line(-9, 2, 9, 2);
                line(0, 2, 0, -5);
                break;
            case SINGLE_THROW_BUTTON:
                line(-6, 0, 5, -6);
                break;
            case DOUBLE_THROW_BUTTON:
                line(0, 10, 0, 15);
                ellipse(0.5, 9, 3);
                line(0, 7, 7, -3);
                break;
        }
    }
function renderCapacitor(c) {
    // base shape shared by all capacitors
    line(-15, 0, -3, 0);
    line(3, 0, 15, 0);
    strokeWeight(2);
    line(-3, -11, -3, 11); // left plate
    switch (c.subType) {
        case NORMAL_CAPACITOR:
            line(3, -11, 3, 11); // right plate
            break;
        case POLARIZED_CAPACITOR:
            arc(17.5, 0, 30, 30, 0.75 * PI, 1.25 * PI, OPEN); // right curved plate
            strokeWeight(1);
            line(-11, -6, -7, -6); // polarity indicator
            line(-9, -4, -9, -8);
            break;
    }
}
function renderDiode(c) {
    // diodes fill two blocks -- when not rotated, they are 2 blocks wide and 1 high
    strokeWeight(2);
    line(25, -10, 25, 10); // thick vertical line
    strokeWeight(1);
    line(-15, 0, 45, 0); // horizontal line
    fill(c.rgba);
    triangle(5, -10, 25, 0, 5, 10);
    switch (c.subType) {
        case LED_DIODE:
            // draw LED indicators
            line(44, -13, 38, -3);
            triangle(45, -13, 40, -10, 44, -8);
            line(37, -15, 31, -5);
            triangle(38, -15, 33, -12, 37, -10);
    }
}
function renderResistor(c) {
    // resistors fill two blocks -- when not rotated, they are 2 blocks wide and 1 high
    line(-15, 0, -10, 0);
    beginShape(); // zig-zag
    vertex(-9, 0);
    vertex(-6, -10); vertex(0, 10);
    vertex(6, -10); vertex(12, 10);
    vertex(18, -10); vertex(24, 10);
    vertex(30, -10); vertex(36, 10);
    vertex(40, 1);
    endShape();
    line(40, 0, 45, 0);
    switch (c.subType) {
        case VARIABLE_RESISTOR:
            // draw variable indicator
            line(-9, 6, 39, -8);
            fill(c.rgba);
            triangle(43, -8.5, 36, -11, 38, -3);
    }
}
function renderTransistor(c) {
    // transistors fill six blocks -- when not rotated, they are 2 blocks wide and 3 high
    line(-15, 30, 0, 30); // base
    line(30, 3, 30, -15); // collector
    line(30, 3, 0, 18);
    line(30, 57, 30, 75); // emittor
    line(30, 57, 0, 42);
    fill(c.rgba);
    rect(0, 0, 3, 60); // plate
    switch (c.subType) {
        case NPN_TRANSISTOR:
            triangle(28, 56, 21, 47, 17, 56);
            break;
        case PNP_TRANSISTOR:
            triangle(5, 45, 17, 45, 13, 55);
            break;
    }
}
function renderWire(c, showJunctionDot) {
    switch (c.subType) {
        case STRAIGHT_WIRE:
            line(-HALF_BLOCK, 0, HALF_BLOCK, 0); // horizontal line
            break;
        case ANGLED_CORNER:
            line(0, -HALF_BLOCK, -HALF_BLOCK, 0); // top-middle to left-middle
            fill(c.rgba);
            if (showJunctionDot) ellipse(0.5, HALF_BLOCK-0.5, 3);
            // falls through
        case ANGLED_WIRE:
            line(0, -HALF_BLOCK, HALF_BLOCK, 0); // top-middle to right-middle
            break;
        case CORNER_WIRE:
            line(0, 0, HALF_BLOCK, 0); // half horizontal line
            line(0, 0, 0, HALF_BLOCK); // half vertical line
            break;
        case CROSS_OVER_WIRE:
            line(-HALF_BLOCK, 0, HALF_BLOCK, 0); // horizontal line
            line(0, -HALF_BLOCK, 0, -HALF_BLOCK*0.333); // vertical line half
            arc(0.5, 0.5, BLOCK_SIZE * 0.333, BLOCK_SIZE * 0.333, -HALF_PI, HALF_PI, OPEN);
            line(0, HALF_BLOCK * 0.333, 0, HALF_BLOCK); // vertical line half
            break;
        case CROSS_WIRE:
            line(-HALF_BLOCK, 0, HALF_BLOCK, 0); // horizontal line
            line(0, -HALF_BLOCK, 0, HALF_BLOCK); // vertical line
            fill(c.rgba);
            if (showJunctionDot) ellipse(0.5, 0.5, 3);
            break;
        case T_WIRE:
            line(-HALF_BLOCK, 0, HALF_BLOCK, 0); // horizontal line
            line(0, 0, 0, HALF_BLOCK); // half vertical line
            fill(c.rgba);
            if (showJunctionDot) ellipse(0.5, 0.5, 3);
            break;
    }
}

// COMPLEX_COMPONENT_TYPES
function renderLogic(c) {
    // logic gates fill 12 blocks -- when not rotated, they are 4 blocks wide and 3 high
    line(90, 30, 90 + 15, 30); // output pin
    if (![BUFFER_LOGIC, BUFFER_ENABLE_LOGIC, INVERTER_LOGIC].includes(c.subType)) { // buffers & inverters only have 1 input
        line(-15, 0, 15, 0); // upper input pin
        line(-15, 60, 15, 60); // lower input pin
    }
    switch (c.subType) {
        case BUFFER_ENABLE_LOGIC:
            line(60, -15, 60, 15 - 2); // enable pin
            // falls through
        case BUFFER_LOGIC:
        case INVERTER_LOGIC:
            line(-15, 30, 15, 30); // single input pin
            // falls through
        case COMPARATOR_LOGIC:
            line(15, -10, 15, 60 + 10); // base
            line(15, -10, 90, 30);
            line(15, 60 + 10, 90, 30);
            if (c.subType !== COMPARATOR_LOGIC) break;
            line(25, 10, 31, 10); // plus symbol
            line(28, 7, 28, 13);
            line(25, 50, 31, 50); // minus symbol
            break;
        case AND_LOGIC:
        case NAND_LOGIC:
            line(15, -10, 15, 60 + 10); // base
            line(15, -10, 30 + 15 + 5, -10);
            line(15, 60 + 10, 30 + 15 + 5, 60 + 10);
            arc(30 + 15 + 5, 30 + 0.5, 90 - 10, 90 - 10, -HALF_PI, HALF_PI);
            break;
        case XOR_LOGIC:
        case XNOR_LOGIC:
            arc(-60 - 17, 30 + 0.5, 30 * 6, 30 * 6, -0.4, 0.4);
            // falls through
        case OR_LOGIC:
        case NOR_LOGIC:
            arc(-60 - 9, 30 + 0.5, 30 * 6, 30 * 6, -0.4, 0.4);
            line(14, -5, 30 + 15, -5);
            line(14, 60 + 5, 30 + 15, 60 + 5);
            arc(21, 39, 140, 93, -1.05, -0.12);
            arc(21, 22, 140, 93, 0.12, 1.05);
            break;
    }
    strokeWeight(0);
    fill(c.rgba);
    switch (c.subType) {
        case INVERTER_LOGIC: text("NOT", 30, 35); break;
        case AND_LOGIC: text("AND", 36, 35); break;
        case NAND_LOGIC: text("NAND", 35, 35); break;
        case OR_LOGIC: text("OR", 40, 35); break;
        case NOR_LOGIC: text("NOR", 35, 35); break;
        case XOR_LOGIC: text("XOR", 35, 35); break;
        case XNOR_LOGIC: text("XNOR", 33, 35); break;
    }
    if ([INVERTER_LOGIC, NAND_LOGIC, NOR_LOGIC, XNOR_LOGIC].includes(c.subType)) {
        strokeWeight(1);
        fill(BLOCK_BACKGROUND_COLOR);
        ellipse(90 + 4, 30 + 0.5, 7); // inverter bubble
    }
}
function renderIntegratedCircuit(c) {
    // IC components with N pins fill 3*(N/2) blocks -- when not rotated, they are 3 blocks wide and N/2 high
    let pins;
    strokeWeight(0);
    fill(c.rgba);
    textFont('sans-serif', 9);
    // set the pin count and label the pins for each IC
    switch (c.subType) {
        case IC_LM555: // 555 Timer
            pins = 8;
            text("GND", -5, 5); text("VCC", 45, 5);
            text("TRG", -5, 35); text("DIS", 45, 35);
            text("OUT", -5, 65); text("THR", 45, 65);
            text("RST", -5, 95); text("CTL", 45, 95);
            break;
        case IC_74_00: // Quad 2-input NAND
        case IC_74_08: // Quad 2-input AND
        case IC_74_32: // Quad 2-input OR
        case IC_74_86: // Quad 2-input XOR
            pins = 14;
            text("A1", -5, 5); text("VCC", 47, 5);
            text("B1", -5, 34); text("B4", 54, 34);
            text("Y1", -5, 64); text("A4", 54, 64);
            text("A2", -5, 94); text("Y4", 54, 94);
            text("B2", -5, 124); text("B3", 54, 124);
            text("Y2", -5, 154); text("A3", 54, 154);
            text("GND", -5, 184); text("Y3", 54, 184);
            break;
        case IC_74_02: // Quad 2-input NOR
            pins = 14;
            text("Y1", -5, 5); text("VCC", 47, 5);
            text("A1", -5, 34); text("Y4", 54, 34);
            text("B1", -5, 64); text("B4", 54, 64);
            text("Y2", -5, 94); text("A4", 54, 94);
            text("A2", -5, 124); text("Y3", 54, 124);
            text("B2", -5, 154); text("B3", 54, 154);
            text("GND", -5, 184); text("A3", 54, 184);
            break;
        case IC_74_04: // Hex inverter
            pins = 14;
            text("A1", -5, 5); text("VCC", 47, 5);
            text("Y1", -5, 34); text("A6", 54, 34);
            text("A2", -5, 64); text("Y6", 54, 64);
            text("Y2", -5, 94); text("A5", 54, 94);
            text("A3", -5, 124); text("Y5", 54, 124);
            text("Y3", -5, 154); text("A4", 54, 154);
            text("GND", -5, 184); text("Y4", 54, 184);
            break;
        case IC_74_11: // Tri 3-input AND
            pins = 14;
            text("A1", -5, 5); text("VCC", 47, 5);
            text("B1", -5, 34); text("C1", 54, 34);
            text("A2", -5, 64); text("Y1", 54, 64);
            text("B2", -5, 94); text("C3", 54, 94);
            text("C2", -5, 124); text("B3", 54, 124);
            text("Y2", -5, 154); text("A3", 54, 154);
            text("GND", -5, 184); text("Y3", 54, 184);
            break;
        case IC_74_73: // Dual JK flip-flop
            pins = 14;
            text("CK1", 0, 4); text("J1", 54, 4);
            text("CL1", -5, 34); text("Q1", 54, 34); // -Q1
            text("K1", -5, 64); text("Q1", 54, 64);
            text("VCC", -5, 94); text("GND", 47, 94);
            text("CK2", 0, 124); text("K2", 54, 124);
            text("CL2", -5, 154); text("Q2", 54, 154);
            text("J2", -5, 184); text("Q2", 54, 184); // -Q2
            break;
        case IC_74_74: // Dual D-type flip-flop
            pins = 14;
            text("CR1", -5, 5); text("VCC", 47, 5);
            text("D1", -5, 34); text("CR2", 47, 34);
            text("CK1", 0, 64); text("D2", 54, 64);
            text("PR1", -5, 94); text("CK2", 44, 94);
            text("Q1", -5, 124); text("PR2", 47, 124);
            text("Q1", -5, 154); text("Q2", 54, 154); // -Q1
            text("GND", -5, 184); text("Q2", 54, 184); // -Q2
            break;
        case IC_74_138: // 3-to-8 decoder
            pins = 16;
            text("A", -5, 4); text("VCC", 47, 4);
            text("B", -5, 34); text("Y0", 54, 34);
            text("C", -5, 64); text("Y1", 54, 64);
            text("G2A", -5, 94); text("Y2", 54, 94);
            text("G2B", -5, 124); text("Y3", 49, 124);
            text("G1", -5, 154); text("Y4", 49, 154);
            text("Y7", -5, 184); text("Y5", 49, 184);
            text("GND", -5, 214); text("Y6", 49, 214);
            break;
        case IC_74_139: // Dual 2-to-4 decoder
            pins = 16;
            text("G1", -5, 5); text("VCC", 47, 5);
            text("A1", -5, 34); text("G2", 54, 34);
            text("B1", -5, 64); text("A2", 54, 64);
            text("1Y0", -5, 94); text("B2", 54, 94);
            text("1Y1", -5, 124); text("2Y0", 49, 124);
            text("1Y2", -5, 154); text("2Y1", 49, 154);
            text("1Y3", -5, 184); text("2Y2", 49, 184);
            text("GND", -5, 214); text("2Y3", 49, 214);
            break;
        case IC_74_157: // Quad 2-to-1 selector
            pins = 16;
            text("S", -5, 5); text("VCC", 47, 5);
            text("A1", -5, 34); text("G", 54, 34); // -G
            text("B1", -5, 64); text("A4", 54, 64);
            text("Y1", -5, 94); text("B4", 54, 94);
            text("A2", -5, 124); text("Y4", 54, 124);
            text("B2", -5, 154); text("A3", 54, 154);
            text("Y2", -5, 184); text("B3", 54, 184);
            text("GND", -5, 214); text("Y3", 54, 214);
            break;
        case IC_74_161: // 4-bit binary counter
            pins = 16;
            text("CLR", -5, 4); text("VCC", 47, 4);
            text("CLK", 0, 34); text("RCO", 47, 34);
            text("A1", -5, 64); text("Q1", 54, 64);
            text("A2", -5, 94); text("Q2", 54, 94);
            text("A3", -5, 124); text("Q3", 54, 124);
            text("A4", -5, 154); text("Q4", 54, 154);
            text("EP", -5, 184); text("ET", 54, 184);
            text("GND", -5, 214); text("LD", 54, 214);
            break;
        case IC_74_173: // 4-bit D-type register
            pins = 16;
            text("M", -5, 5); text("VCC", 47, 5);
            text("N", -5, 34); text("CLR", 47, 34);
            text("Q1", -5, 64); text("D1", 54, 64);
            text("Q2", -5, 94); text("D2", 54, 94);
            text("Q3", -5, 124); text("D3", 54, 124);
            text("Q4", -5, 154); text("D4", 54, 154);
            text("CLK", 0, 184); text("G2", 54, 184); // -G2
            text("GND", -5, 214); text("G1", 54, 214); // -G1
            break;
        case IC_74_189: // 16x4-bit RAM, inverted
        case IC_74_219: // 16x4-bit RAM
            pins = 16;
            text("A0", -5, 5); text("VCC", 47, 5);
            text("CS", -5, 34); text("A1", 54, 34); // -CS
            text("WE", -5, 64); text("A2", 54, 64); // -WE
            text("D1", -5, 94); text("A3", 54, 94);
            text("Q1", -5, 124); text("D4", 54, 124);
            text("D2", -5, 154); text("Q4", 54, 154);
            text("Q2", -5, 184); text("D3", 54, 184);
            text("GND", -5, 214); text("Q3", 54, 214);
            break;
        case IC_74_242: // Quad invert bus
            pins = 14;
            text("GAB", -5, 5); text("VCC", 47, 5);
            text("nc", -5, 34); text("GBA", 47, 34);
            text("A1", -5, 64); text("nc", 54, 64);
            text("A2", -5, 94); text("B1", 54, 94);
            text("A3", -5, 124); text("B2", 54, 124);
            text("A4", -5, 154); text("B3", 54, 154);
            text("GND", -5, 184); text("B4", 54, 184);
            break;
        case IC_74_245: // Oct Tri-state bus
            pins = 20;
            text("DIR", -5, 5); text("VCC", 47, 5);
            text("A1", -5, 34); text("G", 54, 34); // -G
            text("A2", -5, 64); text("B1", 54, 64);
            text("A3", -5, 94); text("B2", 54, 94);
            text("A4", -5, 124); text("B3", 54, 124);
            text("A5", -5, 154); text("B4", 54, 154);
            text("A6", -5, 184); text("B5", 54, 184);
            text("A7", -5, 214); text("B6", 54, 214);
            text("A8", -5, 244); text("B7", 54, 244);
            text("GND", -5, 274); text("B8", 54, 274);
            break;
        case IC_74_283: // 4-bit Adder
            pins = 16;
            text("E2", -5, 5); text("VCC", 47, 5);
            text("B2", -5, 34); text("B3", 54, 34); // -G
            text("A2", -5, 64); text("A3", 54, 64);
            text("E1", -5, 94); text("E3", 54, 94);
            text("A1", -5, 124); text("A4", 54, 124);
            text("B1", -5, 154); text("B4", 54, 154);
            text("C0", -5, 184); text("E4", 54, 184);
            text("GND", -5, 214); text("C4", 54, 214);
            break;
        case IC_28C16: // 16K EEPROM
            pins = 24;
            text("A7", -5, 4); text("VCC", 47, 4);
            text("A6", -5, 34); text("A8", 54, 34);
            text("A5", -5, 64); text("A9", 54, 64);
            text("A4", -5, 94); text("WE", 50, 94); // -WE
            text("A3", -5, 124); text("OE", 52, 124); // -OE
            text("A2", -5, 154); text("A10", 49, 154);
            text("A1", -5, 184); text("CE", 52, 184); // -CE
            text("A0", -5, 214); text("IO7", 50, 214);
            text("IO0", -5, 244); text("IO6", 50, 244);
            text("IO1", -5, 274); text("IO5", 50, 274);
            text("IO2", -5, 304); text("IO4", 50, 304);
            text("GND", -5, 334); text("IO3", 50, 334);
            break;
    }
    rotate(HALF_PI);
    textFont('sans-serif', 12);
    // add the description for each IC
    switch (c.subType) {
        case IC_LM555: text("555 TIMER", 15, -26); break;
        case IC_74_00: text("74_00 :: QUAD  2-IN  NAND", 10, -26); break;
        case IC_74_02: text("74_02 :: QUAD  2-IN  NOR", 10, -26); break;
        case IC_74_04: text("74_04 :: HEX  INVERTER", 10, -26); break;
        case IC_74_08: text("74_08 :: QUAD  2-IN  AND", 10, -26); break;
        case IC_74_11: text("74_11 :: TRI  3-IN  AND", 10, -26); break;
        case IC_74_32: text("74_32 :: QUAD  2-IN  OR", 10, -26); break;
        case IC_74_73: text("74_73 :: DUAL  JK  FLIP-FLOP", 10, -26); break;
        case IC_74_74: text("74_74 :: DUAL  D  FLIP-FLOP", 10, -26); break;
        case IC_74_86: text("74_86 :: QUAD  2-IN  XOR", 10, -26); break;
        case IC_74_138: text("74_138 :: 3-to-8  DECODER", 10, -26); break;
        case IC_74_139: text("74_139 :: DUAL  2-to-4  DECODER", 10, -26); break;
        case IC_74_157: text("74_157 :: QUAD  2-to-1  SELECTOR", 10, -26); break;
        case IC_74_161: text("74_161 :: 4-BIT  BINARY  COUNTER", 10, -26); break;
        case IC_74_173: text("74_173 :: 4-BIT  D  REGISTER", 10, -26); break;
        case IC_74_189: text("74_189 :: 16x4-BIT  RAM, INVERTED", 10, -26); break;
        case IC_74_219: text("74_219 :: 16 x 4-BIT  RAM", 10, -26); break;
        case IC_74_242: text("74_242 :: QUAD  INVERT  BUS", 10, -26); break;
        case IC_74_245: text("74_245 :: TRI-STATE  BUS  TRANSCEIVER", 10, -26); break;
        case IC_74_283: text("74_283 :: 4-BIT  ADDER  +  CARRY", 10, -26); break;
        case IC_28C16: text("28C16 :: 16K  (2K  x  8-BIT)  EEPROM", 10, -26); break;
    }
    rotate(-HALF_PI);
    noFill();
    strokeWeight(1);
    rect(-10, -10, 80, 20 + 30 * (pins / 2 - 1));
    arc(30, -9, 15, 15, 0, PI);
    for (let i = 0; i < pins / 2; i++) {
        line(-15, 30 * i, -10, 30 * i); // left input
        line(70, 30 * i, 75, 30 * i); // right output
    }
    // add any required indicators for each IC
    switch (c.subType) {
        case IC_74_73: // Dual JK flip-flop
            line(-3, 0, -10, -4); // clock input indicator, CK1
            line(-3, 0, -10, 4);
            line(-3, 120, -10, 116); // clock input indicator, CK2
            line(-3, 120, -10, 124);
            line(55, 24, 65, 24); // bar over -Q1
            line(55, 174, 65, 174); // bar over -Q2
            fill(BLOCK_BACKGROUND_COLOR);
            ellipse(-12, 0.5, 5); // inverter bubble for CK1
            ellipse(-12, 30.5, 5); // inverter bubble for CL1
            ellipse(-12, 120.5, 5); // inverter bubble for CK2
            ellipse(-12, 150.5, 5); // inverter bubble for CL2
            break;
        case IC_74_74: // Dual D-type flip-flop
            line(-3, 60, -10, 56); // clock input indicator, CLK1
            line(-3, 60, -10, 64);
            line(64, 90, 70, 86); // clock input indicator, CLK2
            line(64, 90, 70, 94);
            line(-5, 144, 5, 144); // bar over -Q1
            line(55, 174, 65, 174); // bar over -Q2
            fill(BLOCK_BACKGROUND_COLOR);
            ellipse(-12, 0.5, 5); // inverter bubble for CLR1
            ellipse(-12, 90.5, 5); // inverter bubble for PR1
            ellipse(73, 30.5, 5); // inverter bubble for CLR2
            ellipse(73, 120.5, 5); // inverter bubble for PR2
            break;
        case IC_74_138: // 3-to-8 decoder
            fill(BLOCK_BACKGROUND_COLOR);
            ellipse(-12, 90.5, 5); // inverter bubble for G2A
            ellipse(-12, 120.5, 5); // inverter bubble for G2B
            ellipse(-12, 180.5, 5); // inverter bubble for Y7
            ellipse(73, 30.5, 5); // inverter bubble for Y0
            ellipse(73, 60.5, 5); // inverter bubble for Y1
            ellipse(73, 90.5, 5); // inverter bubble for Y2
            ellipse(73, 120.5, 5); // inverter bubble for Y3
            ellipse(73, 150.5, 5); // inverter bubble for Y4
            ellipse(73, 180.5, 5); // inverter bubble for Y5
            ellipse(73, 210.5, 5); // inverter bubble for Y6
            break;
        case IC_74_139: // Dual 2-to-4 decoder
            fill(BLOCK_BACKGROUND_COLOR);
            ellipse(-12, 0.5, 5); // inverter bubble for G1
            ellipse(73, 30.5, 5); // inverter bubble for G2
            ellipse(-12, 90.5, 5); // inverter bubble for 1Y0
            ellipse(-12, 120.5, 5); // inverter bubble for 1Y1
            ellipse(-12, 150.5, 5); // inverter bubble for 1Y2
            ellipse(-12, 180.5, 5); // inverter bubble for 1Y3
            ellipse(73, 120.5, 5); // inverter bubble for 2Y0
            ellipse(73, 150.5, 5); // inverter bubble for 2Y1
            ellipse(73, 180.5, 5); // inverter bubble for 2Y2
            ellipse(73, 210.5, 5); // inverter bubble for 2Y3
            break;
        case IC_74_157: // Quad 2-to-1 selector
            line(54, 24, 60, 24); // bar over -G1
            break;
        case IC_74_161: // 4-bit binary counter
            line(-3, 30, -10, 26); // clock input indicator
            line(-3, 30, -10, 34);
            fill(BLOCK_BACKGROUND_COLOR);
            ellipse(-12, 0.5, 5); // inverter bubble for CLR
            ellipse(73, 210.5, 5); // inverter bubble for LD
            break;
        case IC_74_173: // 4-bit D-type register
            line(-3, 180, -10, 176); // clock input indicator
            line(-3, 180, -10, 184);
            line(55, 174, 65, 174); // bar over -G1
            line(55, 204, 65, 204); // bar over -G2
            break;
        case IC_74_189: // 16x4-bit RAM, inverted
            line(-5, 114, 5, 114); // bar over -Q1
            line(-5, 174, 5, 174); // bar over -Q2
            line(55, 204, 65, 204); // bar over -Q3
            line(55, 144, 65, 144); // bar over -Q4
            fill(BLOCK_BACKGROUND_COLOR);
            ellipse(-12, 120.5, 5); // inverter bubble for Q1
            ellipse(-12, 180.5, 5); // inverter bubble for Q2
            ellipse(73, 210.5, 5); // inverter bubble for Q3
            ellipse(73, 150.5, 5); // inverter bubble for Q4
            // falls through
        case IC_74_219: // 16x4-bit RAM
            line(-5, 24, 7, 24); // bar over -CS
            line(-5, 54, 9, 54); // bar over -WE
            break;
        case IC_74_245: // Oct Tri-state bus
            line(54, 24, 60, 24); // bar over -G
            break;
        case IC_28C16: // 16K EEPROM
            line(50, 84, 64, 84); // bar over -WE
            line(53, 114, 64, 114); // bar over -OE
            line(53, 174, 64, 174); // bar over -CE
            break;
    }
}
function renderMisc(c) {
    // misc components fill 12 blocks -- when not rotated, they are 3 blocks wide and 4 high
    rect(-10, -10, 80, 110);
    line(-15, 0, -10, 0); // top-left input
    line(70, 0, 75, 0); // top-right output
    switch (c.subType) {
        case SR_LATCH_ENABLE_MISC:
            line(-15, 60, -10, 60); // 3rd from top-left input (EN)
            // falls through
        case SR_LATCH_MISC:
            line(-15, 90, -10, 90); // bottom-left input (S)
            line(50, 78, 59, 78); // bar over -Q
            ellipse(73, 90.5, 5); // inverter bubble in lower-right (inverted Q)
            noStroke();
            fill(c.rgba);
            text("R", 0, 10); text("S", 0, 90);
            text("Q", 50, 10); text("Q", 50, 90); // -Q
            if (c.subType === SR_LATCH_ENABLE_MISC) text("EN", 0, 65);
            break;
        case D_FLIPFLOP_MISC:
            line(-3, 60, -10, 60 - 4); // clock input indicator
            line(-3, 60, -10, 60 + 4); // clock input indicator
            // falls through
        case D_LATCH_MISC:
            line(-15, 60, -10, 60); // 3rd from top-left input (EN)
            line(50, 78, 59, 78); // bar over -Q
            ellipse(73, 90.5, 5); // inverter bubble in lower-right (inverted Q)
            noStroke();
            fill(c.rgba);
            text("D", 0, 10);
            if (c.subType === D_LATCH_MISC) text("EN", 0, 65);
            if (c.subType === D_FLIPFLOP_MISC) text("CLK", 0, 65);
            text("Q", 50, 10);
            text("Q", 50, 90); // -Q
            break;
        case SEG_LED_MISC:
            line(0, -10, 0, -15);
            line(30, -10, 30, -15);
            line(60, -10, 60, -15);
            line(0, 100, 0, 105);
            line(30, 100, 30, 105);
            line(60, 100, 60, 105);
            line(-15, 90, -10, 90); // bottom-left input
            line(70, 90, 75, 90); // bottom-right output
            noStroke();
            fill(c.rgba);
            textFont('sans-serif', 9);
            text("E", -6, 89); text("G", -6, 10); // 1 & 10
            text("D", 10, 97); text("F", 10, 2); // 2 & 9
            text("-", 29, 97); text("-", 29, 2); // 3 & 8 - GND
            text("C", 44, 97); text("A", 44, 2); // 4 & 7
            text("P", 59, 89); text("B", 59, 10); // 5 & 6
            //fill(red(c.rgba), green(c.rgba), blue(c.rgba), 96);
            fill("#ff000060");
            rect(7, 20, 7, 25); rect(9, 11, 42, 8); rect(47, 20, 7, 25); // top: left(F), middle(A), right(B)
            rect(7, 46, 7, 25); rect(9, 72, 42, 8); rect(47, 46, 7, 25);  // bottom: left(E), middle(D), right(C)
            rect(15, 41, 30, 8); rect(58, 68, 7, 7); // middle & decimal point
            break;
    }
}

// POWER_COMPONENT_TYPES
function renderVoltageSource() {
    line(0, 0, 0, 15);
    line(0, 0, -6, 6);
    line(0, 0, 6, 6);
    line(3, -6, 9, -6);
    line(6, -3, 6, -9);
}
function renderGround() {
    line(0, 0, 0, -15);
    line(-6, 0, 6, 0);
    line(-3, 3, 3, 3);
    line(-1, 6, 1, 6);
}
