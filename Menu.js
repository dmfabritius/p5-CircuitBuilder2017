const MENU_WIDTH = 150; // arbitrarily selected default menu width
const MENU_HEADING = true; // indicates that an option represents a heading

class Menu {
    constructor(width) {
        this.width = (width) ? width : MENU_WIDTH; // width in pixels
        this.height; // calculated during show() based on the number of menu options
        this.active; // flag indicating whether or not the menu is in use
        this.x; // upper-left position on the canvas is set when the menu is activated
        this.y;
        this.menuBlock; // the block of the circuit being pointed to when the menu was activated
        this.selectedOption; // keep track of the selected menu option
        this.options = []; // an array of the available options
        this.activeSubmenu; // points to submenu, if one is active
        this.menuDepth; // 1=main menu, 2=first child submenu, 3=second, etc.
        this.saveImage = false; // flag to indicate we want to save an image of the circuit
    }

    activate() {
        if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return; // don't activate if mouse is off the canvas
        this.active = true;
        this.selectedOption = -1;
        this.activeSubmenu = null;
        this.menuDepth = 1;
        this.menuBlock = circuit.hoveredBlock;
        this.x = mouseX; // set the position of the menu to the mouse's position
        this.y = mouseY;
    }

    show() {
        if (this.menuDepth === 1) this.selectMenu(); // select an appropriate set of options for the main menu
        this.height = 10 + (20 * this.options.length);
        // if the menu will be positioned off the canvas, shift it over
        let x = (this.x + this.width + 10 < width) ? this.x : this.x - (this.width - 8) * this.menuDepth;
        let y = (this.y + this.height + 10 < height) ? this.y : max(height - this.height - 10 * this.menuDepth, 10);

        push();
        translate(x, y); // draw everything for the menu relative to its top-left corner
        textFont('sans-serif', 15);
        strokeWeight(1);
        stroke(MENU_OUTLINE_COLOR);
        fill(MENU_BACKGROUND_COLOR);
        rect(0, 0, this.width, this.height);

        if (!this.activeSubmenu) { // if submenu is active, don't change the parent selected option
            this.selectedOption = floor((mouseY - y - 5) / 20); // option pointed to by the mouse
            if (mouseX < x + 5 || mouseX > x + this.width - 5) this.selectedOption = -1; // don't select if mouse off menu
        }

        for (let i = 0; i < this.options.length; i++) {
            if (this.options[i].heading) {
                fill(MENU_HEADING_COLOR); // set text color for option headings
                stroke(MENU_HEADING_COLOR);
                strokeWeight(0.5);
            } else if (this.selectedOption === i) {
                if (this.options[i].action) {
                    stroke(MENU_OUTLINE_COLOR);
                    fill(MENU_SELECTED_COLOR); // highlight the selected option
                    rect(5, 5 + this.selectedOption * 20, this.width - 10, 20);
                    fill(TEXT_ACTIVE_COLOR);
                    stroke(TEXT_ACTIVE_COLOR);
                    strokeWeight(0.5); // add a bold effect to the text
                }
                if (this.options[i].submenu) { // activate selected submenu
                    this.activeSubmenu = this.options[i].submenu;
                    this.options[i].submenu.activate();
                    this.options[i].submenu.menuDepth = this.menuDepth + 1;
                    this.options[i].submenu.menuBlock = this.menuBlock;
                    this.options[i].submenu.x = x + this.width - 10;
                    this.options[i].submenu.y = y + this.selectedOption * 20;
                }
            } else {
                noStroke();
                fill(TEXT_FORE_COLOR); // set text color for unselection options with actions
            }

            if (this.options[i].text === "-") {
                stroke(MENU_OUTLINE_COLOR);
                strokeWeight(1);
                line(0, 15 + (i * 20), this.width, 15 + (i * 20)); // for separators, draw a line
            } else {
                text(this.options[i].text, 10, 20 + (i * 20)); // the text of the option
                if (this.options[i].submenu) text("▸", 125, 20 + (i * 20));
            }
        }
        pop(); // stop positioning things relative to this menu's upper-left corner

        if (this.activeSubmenu) {
            // show any active submenu, and deactivate it if mouse isn't hovering over it
            if (!this.activeSubmenu.show()) this.activeSubmenu = null;
        }
        return (mouseX > x && mouseX < x + this.width && mouseY > y && mouseY < y + this.height);
    }

    selectMenu() {
        this.options = [];
        if (this.menuBlock === -1) { // not pointing to the circuit, use circuit-level menu
            this.circuitMenu();
        }
        else if (circuit.components[this.menuBlock]) { // use the component-specific menu
            this.modifyComponentMenu();
        }
        else { // not pointing to a component, use add menu
            this.addComponentMenu();
        }
    }

    circuitMenu() {
        this.addOption("Circuit", null, MENU_HEADING);
        this.addOption("Toggle block outlines", () => { circuit.showBlockOutline = !circuit.showBlockOutline; circuit.modified = true; });
        this.addOption("Toggle block dots", () => { circuit.showBlockDot = !circuit.showBlockDot; circuit.modified = true; });
        this.addOption("Toggle junction dots", () => { circuit.showJunctionDot = !circuit.showJunctionDot; circuit.modified = true; });
        this.addOption("-", null);
        this.addOption("Open JSON file", () => { $("#importFilename").trigger("click"); }); // choose a file to import, which then fires importCircuit()
        this.addOption("Merge in JSON file", () => { circuit.importMerge = true; $("#importFilename").trigger("click"); }); // choose a file to import, which then fires importCircuit()
        this.addOption("Save to JSON", () => exportCircuit(circuit));
        this.addOption("Save to PNG", () => this.saveImage = true);
        this.addOption("-", null);
        this.addOption("Resize to 10x10", () => circuit.resize(10, 10));
        this.addOption("Resize to 20x20", () => circuit.resize(20, 20));
        this.addOption("Resize to 30x15", () => circuit.resize(30, 15));
        this.addOption("Resize to 30x20", () => circuit.resize(30, 20));
        this.addOption("Resize to 40x25", () => circuit.resize(40, 25));
        this.addOption("Resize to 50x50", () => circuit.resize(50, 50));
        this.addOption("Clear circuit", () => circuit.erase("confirm"));
        this.addOption("-", null);
        this.addOption("Hints", showHelp);
    }

    addComponentMenu() {
        let submenus = [];
        this.addOption("Add component", null, MENU_HEADING);
        for (let i = 0; i < COMPONENT_TYPE_SUBTYPES.length; i++) {
            if (COMPONENT_TYPE_SUBTYPES[i].subtypes.length !== 0) { // most components have subtypes, but some don't
                submenus[i] = new Menu();
                this.addOption(COMPONENT_TYPE_SUBTYPES[i].type,
                    () => circuit.processSelected("add", COMPONENT_TYPE_SUBTYPES[i].type, COMPONENT_TYPE_SUBTYPES[i].subtypes[0]),
                    null, submenus[i]);
                submenus[i].addOption(COMPONENT_TYPE_SUBTYPES[i].type, null, MENU_HEADING);
                for (let j = 0; j < COMPONENT_TYPE_SUBTYPES[i].subtypes.length; j++) {
                    submenus[i].addOption(COMPONENT_TYPE_SUBTYPES[i].subtypes[j],
                        () => circuit.processSelected("add", COMPONENT_TYPE_SUBTYPES[i].type, COMPONENT_TYPE_SUBTYPES[i].subtypes[j]));
                }
            } else { // for components without subtypes, don't create submenu
                this.addOption(COMPONENT_TYPE_SUBTYPES[i].type,
                    () => circuit.processSelected("add", COMPONENT_TYPE_SUBTYPES[i].type, COMPONENT_TYPE_SUBTYPES[i].subtypes[0]));
            }
            if (i === NUM_NORMAL_COMPONENTS - 1 ||
                i === NUM_NORMAL_COMPONENTS + NUM_COMPLEX_COMPONENTS - 1) {
                this.addOption("-", null); // put separator lines between groups of component types
            }
        }
    }

    modifyComponentMenu() {
        let c = circuit.components[this.menuBlock];
        this.addOption(c.type, null, MENU_HEADING);
        for (let i = 0; i < COMPONENT_TYPE_SUBTYPES.length; i++) {
            if (COMPONENT_TYPE_SUBTYPES[i].type === c.type) { // show the sub-types only for the selected component type
                for (let j = 0; j < COMPONENT_TYPE_SUBTYPES[i].subtypes.length; j++) {
                    this.addOption(COMPONENT_TYPE_SUBTYPES[i].subtypes[j],
                        () => circuit.processSelected("change", COMPONENT_TYPE_SUBTYPES[i].subtypes[j]));
                }
            }
        }
        this.addOption("-", null);
        this.addOption("Rotate (Shift+wheel)", () => circuit.processSelected("spin", 1)); // spin clockwise
        this.addOption("Flip", () => circuit.processSelected("flip"));
        this.colorMenu(); // color submenu
        this.addOption("-", null);
        this.addOption("Delete (Del)", () => circuit.processSelected("erase"));
    }

    colorMenu() {
        let colorSubmenu = new Menu();
        this.addOption("Change color", null, null, colorSubmenu);
        colorSubmenu.addOption("Colors", null, MENU_HEADING);
        colorSubmenu.addOption("Brown", () => circuit.processSelected("color", "#b75"));
        colorSubmenu.addOption("Red", () => circuit.processSelected("color", "#f00"));
        colorSubmenu.addOption("Orange", () => circuit.processSelected("color", "#f90"));
        colorSubmenu.addOption("Yellow", () => circuit.processSelected("color", "#ff0"));
        colorSubmenu.addOption("Green", () => circuit.processSelected("color", "#5f5"));
        colorSubmenu.addOption("Blue", () => circuit.processSelected("color", "#69f"));
        colorSubmenu.addOption("Purple", () => circuit.processSelected("color", "#d3f"));
        colorSubmenu.addOption("White", () => circuit.processSelected("color", "#fff"));
        colorSubmenu.addOption("Black", () => circuit.processSelected("color", "#000"));
        colorSubmenu.addOption("Gray", () => circuit.processSelected("color", "#666"));
        colorSubmenu.addOption("Default color", () => circuit.processSelected("color", COMPONENT_COLOR));
    }

    addOption(text, action, heading, submenu) {
        return this.options.push({ text: text, action: action, heading: heading, submenu: submenu });
    }

    process() {
        if (this.activeSubmenu) {
            this.activeSubmenu.process();
        } else if (this.selectedOption &&
                   this.options[this.selectedOption] &&
                   this.options[this.selectedOption].action) {
            this.options[this.selectedOption].action();
        }
        this.active = 0; // stop showing the menu once the choice has been processed
    }
}
