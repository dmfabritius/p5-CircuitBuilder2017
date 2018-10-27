const DEFAULT_CIRCUIT_SIZE = 9;
const BLOCK_SIZE = 30; // all the component rendering details are extremely dependent on this, so it cannot change
const HALF_BLOCK = 15;

class Circuit {
    constructor(x, y, width, height, rotation, zoom, showBlockOutline, showBlockDot, showJunctionDot) {
        this.x = (x) ? x : 0; // the circuit's position on the canvas
        this.y = (y) ? y : 0;
        this.width = (width) ? width : DEFAULT_CIRCUIT_SIZE; // width & height in blocks
        this.height = (height) ? height : DEFAULT_CIRCUIT_SIZE;
        this.rotation = (rotation) ? rotation : 0; // amount to rotate the entire circuit drawing
        this.zoom = (zoom) ? zoom : 1; // by default, draw at 100% size
        this.showBlockOutline = (showBlockOutline !== undefined) ? showBlockOutline : true; // show an outline around each block
        this.showBlockDot = (showBlockDot !== undefined) ? showBlockDot : true; // show a center dot for each block
        this.showJunctionDot = (showJunctionDot !== undefined) ? showJunctionDot : true; // show a dot at the junctions where wires connect
        this.components; // each block in the circuit may point to a Component object
        this.componentsCopy; // a copy of the components array used for copy, cut & paste
        this.copyLocation; // upper-left x,y location of selection that was cut/copied
        this.history = []; // an array of previous versions of the components array
        this.isSelected; // each block in the circuit may be marked as selected so that they can be acted on together
        this.selectedBlocks = []; // no blocks are selected by default
        this.hoveredBlock = -1; // points to the block under the mouse pointer, -1 means pointing off the circuit
        this.modified = true; // flag to indicate whether or not the circuit needs to be redrawn
        this.importMerge = 0; // flag to control whether an import file replaces or merges with existing circuit
        this.importing = 0; // flag to indicate if a circuit is in the process of being imported

        this.erase(); // initialize the circuit
    }

    erase(prompt, width, height) {
        if (prompt === "confirm") {
            if (!confirm("Are you sure you want to clear the entire circuit?")) return;
        }
        if (this.components) this.processHistory("push"); // save the state of the circuit in the history buffer

        // create arrays to hold state information for each block of the circuit
        if (width) this.width = width;
        if (height) this.height = height;
        this.components = new Array(this.width * this.height); // establish the size of the circuit for the show() function
        this.isSelected = [];
        this.selectedBlocks = [];
        this.modified = true;
    }

    resize(width, height) {
        let size = width * height;
        let newCircuit = new Array(size);
        for (let i = 0; i < this.components.length; i++) {
            let oldX = i % this.width; // determine the index's x,y position in the current grid
            let oldY = floor(i / this.width);
            let j = oldX + oldY * width; // determine the corresponding index in the new grid
            if (j < size) newCircuit[j] = this.components[i];
        }
        this.width = width;
        this.height = height;
        this.components = newCircuit; // replace the circuit
        this.modified = true;
    }

    show() {
        push();
        translate(this.x, this.y); // position the entire circuit
        scale(this.zoom);
        rotate(this.rotation); // rotate the entire circuit

        // draw the circuit as a grid of blocks, highlighting blocks based on how they are being used
        for (let i = 0; i < this.components.length; i++) {
            push();
            let x = (i % this.width);
            let y = floor(i / this.width);
            translate(x * BLOCK_SIZE, y * BLOCK_SIZE); // set the origin to the top-left corner of the block
            fill(BLOCK_BACKGROUND_COLOR);
            if (this.isSelected[i]) {
                fill(BLOCK_SELECTED_COLOR); // highlight background if the block is selected
            } /* else
                // **
                // ** no longer updating display when hover changes, so this does nothing ** //
                // **
                if (!mouseIsPressed && // if the mouse is pressed, the menu is active so don't add hover color
                (i === this.hoveredBlock)) { // otherwise, if this block is the hovered block, highlight it
                if (this.components[i]) {
                    fill(BLOCK_HOVER_COMPONENT_COLOR);
                } else {
                    fill(BLOCK_HOVER_EMPTY_COLOR);
                }
            } */
            if (this.showBlockOutline) {
                strokeWeight(1/this.zoom);
                stroke(BLOCK_OUTLINE_COLOR);
            } else {
                noStroke();
            }
            rect(0, 0, BLOCK_SIZE, BLOCK_SIZE);
            pop();
        }

        // loop thru again, drawing the components on top of any highlights or outlines
        //let componentCount = 0;
        for (let i = 0; i < this.components.length; i++) {
            push();
            translate((i % this.width) * BLOCK_SIZE, floor(i / this.width) * BLOCK_SIZE);
            let c = this.components[i];
            if (c) { // if there is a component in this position, show it
                showComponent(c, this.showJunctionDot);
                //componentCount++;
            }
            if (this.showBlockDot) {
                stroke(BLOCK_DOT_COLOR);
                point(HALF_BLOCK, HALF_BLOCK);
            }
            pop();
            //debugDiv0.html("[0]Circuit.show() comp count: " + componentCount);
        }
        pop();
    }

    addComponent(x, y, type, subType, rotation, flip, color) {
        this.processHistory("push"); // save the state of the circuit in the history buffer
        let i = x + y * this.width;
        this.components[i] = createComponent(x, y, type, subType, rotation, flip, color);
    }

    setHovered() { // determine which (if any) block the mouse is pointing to
        let x = floor((mouseX - this.x) / (BLOCK_SIZE * this.zoom));
        let y = floor((mouseY - this.y) / (BLOCK_SIZE * this.zoom));
        if ((x >= 0 && x < this.width) && (y >= 0 && y < this.height)) {
            this.hoveredBlock = x + y * this.width;
        } else {
            this.hoveredBlock = -1;
        }
    }

    setSelection(block) {
        if (this.selectedBlocks.length === 0 || (keyIsPressed && keyCode === CONTROL)) {
            if (this.selectedBlocks.indexOf(block) === -1) {
                this.selectedBlocks.push(block); // add selected block's index # to the array of selectedBlocks
                this.isSelected[block] = true; // mark that block as selected so it's highlighted during show()
            }
        } else {
            // find the row & col of the first corner of the selection
            let x1 = this.selectedBlocks[0] % this.width;
            let y1 = floor(this.selectedBlocks[0] / this.width);

            // find the row & col of the second corner of the selection
            let x2 = block % this.width;
            let y2 = floor(block / this.width);

            // we always want to store the selection from the top-left corner down to the bottom-right
            let startX = (x1 < x2) ? x1 : x2;
            let startY = (y1 < y2) ? y1 : y2;
            let endX = (x1 < x2) ? x2 : x1;
            let endY = (y1 < y2) ? y2 : y1;

            this.clearSelection();
            for (let x = startX; x <= endX; x++) {
                for (let y = startY; y <= endY; y++) {
                    let i = x + y * this.width;
                    this.selectedBlocks.push(i); // add to list of selected blocks
                    this.isSelected[i] = true; // mark block as selected for highlighting during show()
                }
            }
        }
        this.modified = true;
    }

    clearSelection() {
        this.selectedBlocks = [];
        this.isSelected = [];
        this.modified = true;
    }

    moveSelected(block) {
        let moveX = 0, moveY = 0;
        switch (keyCode) {
            case LEFT_ARROW:  moveX = -1; break;
            case RIGHT_ARROW: moveX =  1; break;
            case UP_ARROW:    moveY = -1; break;
            case DOWN_ARROW:  moveY =  1; break;
        }
        if (this.selectedBlocks.length === 0) {
            this.selectedBlocks.push(this.hoveredBlock); // if nothing is selected, use the hovered block
        }
        let start = this.selectedBlocks[0];
        let end = this.selectedBlocks[this.selectedBlocks.length - 1];
        if (this.components[start] && 
            (this.components[start].x + moveX < 0 ||
             this.components[start].y + moveY < 0)) return;
        if (this.components[end] &&
            (this.components[end].x + moveX > this.width - 1 ||
             this.components[end].y + moveY > this.height - 1)) return;
        this.processHistory("push"); // save the state of the circuit in the history buffer
        for (let i = 0; i < this.selectedBlocks.length; i++) {
            // when moving left or up, go thru the array forward; otherwise go backwards
            let j = ((moveX < 0 || moveY < 0)) ? i : this.selectedBlocks.length - 1 - i;
            let oldPos = this.selectedBlocks[j];
            if (this.components[oldPos]) {
                this.components[oldPos].x += moveX; // update the component's position info
                this.components[oldPos].y += moveY;
            }
            let newPos = oldPos + moveX + (moveY * this.width); // shift the block position up, down, left, or right
            this.components[newPos] = this.components[oldPos]; // move the component to the new position
            this.components[oldPos] = null; // erase the component from the old position
            this.isSelected[newPos] = true; // move the selection over so the highlighting follows along
            this.isSelected[oldPos] = 0; // clear the old selection highlight
            this.selectedBlocks[j] = newPos; // update the list of which blocks are selected
        }
    }

    processSelected(action, arg, arg2) {
        this.processHistory("push"); // save the state of the circuit in the history buffer
        if (this.selectedBlocks.length === 0) this.selectedBlocks.push(this.hoveredBlock); // if nothing is selected, use hovered block
        if (action === "cut" || action === "copy") {
            let x = this.selectedBlocks[0] % this.width; // determine upper-left corner of the selection
            let y = floor(this.selectedBlocks[0] / this.width);
            this.copyLocation = { x: x, y: y };
            this.componentsCopy = [];
        }
        for (let i = 0; i < this.selectedBlocks.length; i++) { // for each selected block, perform the desired action
            let c = this.components[this.selectedBlocks[i]];
            switch (action) {
                case "add":
                    let x = this.selectedBlocks[i] % this.width;
                    let y = floor(this.selectedBlocks[i] / this.width);
                    this.components[this.selectedBlocks[i]] = createComponent(x, y, arg, arg2);
                    break;
                case "cut":
                case "copy":
                    let copy = (c) ? Object.assign({}, this.components[this.selectedBlocks[i]]) : null;
                    if (copy) this.componentsCopy.push(copy);
                    if (action === "copy") break;
                    // falls through for cut to erase the blocks after they've been copied
                case "erase": this.components[this.selectedBlocks[i]] = null; break;
                case "change": if (c) c.subType = arg; break;
                case "spin": if (c) c.rotation = (c.rotation += 4 + arg) % 4; break;
                case "flip": if (c) c.flip = (c.flip === 1) ? 0 : 1; break;
                case "color": if (c) c.rgba = arg; break;
            }
        }
    }

    paste() {
        this.processHistory("push"); // save the state of the circuit in the history buffer
        if (this.selectedBlocks.length === 0) {
            if (this.hoveredBlock === -1) return; // don't paste if no block is selected and the mouse is off the circuit
            this.selectedBlocks.push(this.hoveredBlock); // if nothing is selected, use hovered block
        }
        let xOffset = (this.selectedBlocks[0] % this.width) - this.copyLocation.x;
        let yOffset = floor(this.selectedBlocks[0] / this.width) - this.copyLocation.y;
        for (let i = 0; i < this.componentsCopy.length; i++) {
            copy = this.componentsCopy[i];
            let x = copy.x + xOffset;
            let y = copy.y + yOffset;
            if (x < this.width && y < this.height) {
                let j = x + y * this.width; // determine new location of pasted component
                this.components[j] = Object.assign({}, copy); // create a new component from the copy buffer
                this.components[j].x = x;
                this.components[j].y = y;
            }
        }
    }

    processHistory(action) {
        this.modified = true;
        if (action === "push") {
            let c = JSON.parse(JSON.stringify(this.components)); // make a deep copy of the components array
            this.history.push(c); // add  to the history buffer
            if (this.history.length > 100) this.history.shift();
        } else if (action === "pop") {
            let h = this.history.pop();
            if (h) this.components = h;
        }
    }
}
