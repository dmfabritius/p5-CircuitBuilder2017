//   p5 Reference, https://p5js.org/reference/
//   p5.js tutorials, https://www.youtube.com/user/shiffman/playlists
//
var menu, circuit = null;

function preload() {
    // this seems like a good place to set up the listener event for the importFilename input element
    document.getElementById('importFilename').addEventListener('change', importCircuit, 0);
}

function setup() {
    createCanvas(windowWidth-20, windowHeight-20);
    //createCanvas(1280, 900); // max with console window
    //createCanvas(1740, 1020); // max without console window
    //createCanvas(2000, 1080); // max size for full-screen browser
    //createCanvas(5000,5000); // for saving large image
    menu = new Menu();
    circuit = new Circuit(25, 25, 10, 10, 0, 2.5, 1, 0);
    let params = getURLParams();
    if (params.circuit) {
        importCircuit(params.circuit);
    } else {
        //circuit.showBlockOutline = 0;
        //circuit.showBlockDot = 0;
        circuit.addComponent(1, 1, TRANSISTOR_COMPONENT, NPN_TRANSISTOR);
        circuit.addComponent(4, 1, TRANSISTOR_COMPONENT, PNP_TRANSISTOR);
        //circuit.addComponent(6, 1, IC_COMPONENT, IC_74_139);
        //importCircuit("8BC-39.1_computer-v5.json");
    }
    // just for displaying debugging output
    //debugDiv0 = createDiv("");
    //debugDiv1 = createDiv("");
    //debugDiv2 = createDiv("");
    //debugDiv3 = createDiv("");
    //debugDiv4 = createDiv("");
}

function draw() {
    background(CANVAS_BACKGROUND_COLOR); // erases the background at the start of each frame of animation
    //if (!circuit) return; // async import
    circuit.setHovered(); // set the block the mouse is hovering over
    if (circuit.modified) {
        circuit.show();
        loadPixels(); // save the image of the circuit to memory (i.e., the pixels[] array)
        circuit.modified = 0;
    } else {
        updatePixels(); // don't re-render everything, just display the circuit from memory
    }
    if (menu.saveImage) {
        saveCanvas();
        menu.saveImage = false;
    }
    if (menu.active) menu.show(); // show the menu if the mouse button is pressed

    if (!circuit || circuit.importing === true) {
        push();
        strokeWeight(2);
        stroke(COMPONENT_COLOR);
        fill('#f00');
        textSize(40);
        text("LOADING, PLEASE WAIT", 150,150);
        pop();
    }

    //let d =
    //    //"[1]sketch.draw() debug info:<br>" +
    //    "zoom: " + circuit.zoom +
    //    //"<br>hovered: " + circuit.hoveredBlock +
    //    "<br>x, y: " + circuit.hoveredBlock % circuit.width + ", " + floor(circuit.hoveredBlock / circuit.width) +
    //    //"<br># selected: " + circuit.selectedBlocks.length +
    //    "";
    //    //if (circuit.components[circuit.hoveredBlock]){
    //    //    d +=
    //    //        "<br>component: " + circuit.components[circuit.hoveredBlock].type +
    //    //        "<br>subtype: " + circuit.components[circuit.hoveredBlock].subType +
    //    //        "<br>rotation: " + circuit.components[circuit.hoveredBlock].rotation +
    //    //        "<br>flip: " + circuit.components[circuit.hoveredBlock].flip +
    //    //        "";
    //    //}
    //debugDiv1.html(d);
    //let s = "[2]selected: ";
    //for (let i = 0; i < circuit.selectedBlocks.length; s += (circuit.selectedBlocks[i++] + ", ")) { }
    //debugDiv2.html(s);
    //if (floor(frameRate()) % 10 === 0) debugDiv3.html("[3]frame rate: " + floor(frameRate())+" fps");
}

function keyPressed() {
    if (keyIsDown(CONTROL)) switch (key) {
        case 'z', 'Z': circuit.processHistory("pop"); break;
        case 'c', 'C': circuit.processSelected("copy"); break;
        case 'x', 'X': circuit.processSelected("cut"); break;
        case 'v', 'V': circuit.paste(); break;
    } else if (keyIsDown(SHIFT)) switch (keyCode) {
        case UP_ARROW: circuit.y -= 150; circuit.modified = true; break;
        case DOWN_ARROW: circuit.y += 150; circuit.modified = true; break;
        case LEFT_ARROW: circuit.x -= 150; circuit.modified = true; break;
        case RIGHT_ARROW: circuit.x += 150; circuit.modified = true; break;
    } else {
        switch (keyCode) {
            case UP_ARROW:
            case DOWN_ARROW:
            case LEFT_ARROW:
            case RIGHT_ARROW:
                circuit.moveSelected();
                break;
            case DELETE:
                circuit.processSelected("erase");
                break;
            case HOME:
                circuit.x = 10;
                circuit.y = 10;
                circuit.modified = true;
                break;
        }
    }
}

function mousePressed() {
    if (!(keyIsPressed && (keyCode === SHIFT || keyCode === CONTROL))) {
        circuit.clearSelection();
    }
    circuit.setSelection(circuit.hoveredBlock);
    menu.activate();
}

function mouseReleased() {
    if (menu.active) menu.process();
}

function mouseWheel(event) {
    if (keyIsDown(SHIFT)) {
        circuit.processSelected("spin", (event.delta > 0) ? -1 : 1); // rotate clockwise or counter-clockwise
        return 0;
    } else {
        circuit.zoom += (event.delta > 0) ? 0.05 : -0.05; // zoom the circuit drawing in & out
        circuit.zoom = floor(min(max(circuit.zoom, 0.1), 5.0) * 100 + 0.5) / 100; // limit scaling and round to 2 places
        circuit.modified = true;
    }
    return false; // attempt to prevent the browser window from scrolling around
}

function importCircuit(arg) {
    filename = arg;                 // the argument will either be a string with the filename
    if (typeof arg === "object") { // or an event object with a FileList object
        filename = arg.target.files[0].name;
    }
    circuit.importing = true;
    loadJSON("data/" + filename, processImport);
}

function processImport(data) {
    if (!circuit || !circuit.importMerge) {
        circuit = new Circuit(
            data.x, data.y, data.width, data.height,
            data.rotation, data.zoom,
            data.showBlockOutline, data.showBlockDot, data.showJunctionDot);
    }

    if (circuit.importMerge) {
        for (let i = 0; i < data.components.length; i++) {
            let c = data.components[i];
            let j = c.x + c.y * circuit.width;
            circuit.components[j] = createComponent(c.x, c.y, c.type, c.subType, c.rotation, c.flip, c.rgba);
        }
    } else {
        circuit.components = data.components;
    }

    circuit.importMerge = 0;
    circuit.importing = 0;
    circuit.modified = true;
}

function exportCircuit(originalCircuit, filename) {
    if (!filename) filename = "circuit.json";

    let exportCircuit = Object.assign({}, originalCircuit); // make a deep copy of the circuit's basic properties
    delete exportCircuit.componentsCopy; // clean up properties unnecessary for the export
    delete exportCircuit.copyLocation;
    delete exportCircuit.history;
    delete exportCircuit.isSelected;
    delete exportCircuit.selectedBlocks;
    delete exportCircuit.hoveredBlock;
    delete exportCircuit.modified;
    delete exportCircuit.importMerge;
    delete exportCircuit.importing;
    exportCircuit.components = []; // create new array for components, otherwise we'd still be pointing to the original
    for (let i = 0; i < originalCircuit.components.length; i++) {
        if (originalCircuit.components[i]) {
            exportCircuit.components.push(originalCircuit.components[i]);
        } else {
            exportCircuit.components.push(0);
        }
    }
    saveJSON(exportCircuit, filename, true);
}

function showHelp() {
    alert(
        "Things to be aware of when attempting to use the circuit sketching tool:\n\n" +
        "* It's not perfect\n" +
        "* The main user interface is the pop-up menu\n" +
        "  - Press and hold the mouse button to interact with the menu\n" +
        "  - The menu is accessed using either the left or right mouse buttons\n" +
        "  - The left button is probably easier because the brower's context menu is not blocked\n" +
        "  - Release when hovering over the desired option to make that happen\n" +
        "  - Release anywhere else to simply close the menu\n" +
        "  - When the mouse is off the canvas, pressing the button does nothing\n" +
        "  - When the mouse is on the canvas but off the circuit, pressing the button shows circuit-level options\n" +
        "  - When the mouse is on the circuit over a blank spot, you can add a component\n" +
        "  - When the mouse is over a component, you can modify it\n" +
        "  - Some components cover more than one spot, but only their top-left spot is interactive\n" +
        "  - Rotating or flipping a component does not change its interactive spot (but does move it)\n" +
        "* Click on a spot in the circuit to select it (be careful not to accidently select a menu option)\n" +
        "* Hold shift and click another spot to select an area\n" +
        "* Hold control and click multiple spots to select them\n" +
        "* Holding shift or control when selecting a menu action will effect all the selected spots/components\n" +
        "* Ctrl-C, X, & V will copy, cut, and paste the selection\n" +
        "* Ctrl-Z will undo up to 100 steps -- there is no re-do, so be careful\n" +
        "* Press the arrow keys to move around all the selected components\n" +
        "* Hold shift and press the arrow keys to move the circuit on the canvas\n" +
        "* Press the home key to reposition the circuit to the top-left corner of the canvas\n" +
        "* Hold the shift key and use the scroll wheel to rotate all selected components individually\n" +
        "* Use the mouse scroll wheel by itself to zoom in and out\n" +
        "* Different browsers may also react to the mouse wheel if the window has scroll bars\n" +
        "* After saving to JSON, you can use a text editor to modify the circuit's width, height, etc.\n" +
        "  - When you open a circuit with a modified size, the component positions will be scambled\n" +
        "  - You can fix it by clearing the circuit (keeping its size) and then merging it back in again\n" +
        "\n");
}
