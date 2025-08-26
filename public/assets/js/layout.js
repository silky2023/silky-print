// Extracted layout & visualization functions from 2014.html
// Responsibilities: grid calculations, best arrangement, visual creation

const GRIPPER_MARGIN = 1; // سم
const layoutSheets = {
    "tegary": { name: "تجاري", width: 30, height: 20, key: "eighth" },
    "a4": { name: "A4", width: 29.7, height: 21, key: "eighth" },
    "tesaat": { name: "تسعات", width: 33.3, height: 23.3, key: "eighth" },
    "thomn": { name: "ثمن", width: 35, height: 25, key: "eighth" },
    "a3": { name: "A3", width: 42, height: 29.7, key: "quarter" },
    "roba": { name: "ربع", width: 50, height: 35, key: "quarter" },
    "noss": { name: "نص", width: 70, height: 50, key: "half" },
    "kamel": { name: "كامل", width: 100, height: 70, key: "full" },
    "gaier_eighth": { name: "جاير ثمن", width: 33, height: 22, key: "eighth", family: "gaier" },
    "gaier_quarter": { name: "جاير ربع", width: 44, height: 33, key: "quarter", family: "gaier" },
    "gaier_half": { name: "جاير نص", width: 66, height: 44, key: "half", family: "gaier" },
    "gaier_full": { name: "جاير كامل", width: 88, height: 66, key: "full", family: "gaier" },
};
const mainSheet = { width: 100, height: 70, area: 100 * 70 };

function getBestGridInArea(areaW, areaH, itemW, itemH) {
    if (areaW <= 0 || areaH <= 0) return { count: 0 };
    const normalCount = (itemW > areaW || itemH > areaH) ? 0 : Math.floor(areaW / itemW) * Math.floor(areaH / itemH);
    const rotatedCount = (itemH > areaW || itemW > areaH) ? 0 : Math.floor(areaW / itemH) * Math.floor(areaH / itemW);
    if (normalCount >= rotatedCount) {
        return { count: normalCount, cols: Math.floor(areaW / itemW), rows: Math.floor(areaH / itemH), itemW: itemW, itemH: itemH, rotated: false };
    } else {
        return { count: rotatedCount, cols: Math.floor(areaW / itemH), rows: Math.floor(areaH / itemW), itemW: itemH, itemH: itemW, rotated: true };
    }
}

function findBestCardArrangement(sheetW, sheetH, cardW, cardH) {
    let best = { count: 0, strategy: null };
    const singleGrid = getBestGridInArea(sheetW, sheetH, cardW, cardH);
    if (singleGrid.count > best.count) {
        best.count = singleGrid.count;
        best.strategy = { type: 'single', layout: singleGrid };
    }
    // try splits (basic heuristic)
    for (let splitX = 1; splitX < sheetW; splitX++) {
        const blockA = getBestGridInArea(splitX, sheetH, cardW, cardH);
        const blockB = getBestGridInArea(sheetW - splitX, sheetH, cardW, cardH);
        if (blockA.count + blockB.count > best.count) {
            best.count = blockA.count + blockB.count;
            best.strategy = { type: 'horizontal-split', splitX, layoutA: blockA, layoutB: blockB };
        }
    }
    for (let splitY = 1; splitY < sheetH; splitY++) {
        const blockA = getBestGridInArea(sheetW, splitY, cardW, cardH);
        const blockB = getBestGridInArea(sheetW, sheetH - splitY, cardW, cardH);
        if (blockA.count + blockB.count > best.count) {
            best.count = blockA.count + blockB.count;
            best.strategy = { type: 'vertical-split', splitY, layoutA: blockA, layoutB: blockB };
        }
    }

    // build positions (simplified)
    const positions = [];
    let usedWidth = 0, usedHeight = 0, itemsOnWidthEdge = 0, itemsOnHeightEdge = 0;
    if (!best.strategy) return { positions, usedWidth, usedHeight, itemsOnWidthEdge, itemsOnHeightEdge };

    const { type } = best.strategy;
    if (type === 'single') {
        const { layout } = best.strategy;
        for (let r = 0; r < layout.rows; r++) {
            for (let c = 0; c < layout.cols; c++) {
                positions.push({ x: c * layout.itemW, y: r * layout.itemH, w: layout.itemW, h: layout.itemH, rotated: layout.rotated });
            }
        }
        if (layout.cols > 0 && layout.rows > 0) {
            usedWidth = layout.cols * layout.itemW;
            usedHeight = layout.rows * layout.itemH;
            itemsOnWidthEdge = layout.cols;
            itemsOnHeightEdge = layout.rows;
        }
    } else if (type === 'horizontal-split') {
        const { splitX, layoutA, layoutB } = best.strategy;
        for (let r = 0; r < layoutA.rows; r++) for (let c = 0; c < layoutA.cols; c++) positions.push({ x: c * layoutA.itemW, y: r * layoutA.itemH, w: layoutA.itemW, h: layoutA.itemH, rotated: layoutA.rotated });
        for (let r = 0; r < layoutB.rows; r++) for (let c = 0; c < layoutB.cols; c++) positions.push({ x: splitX + (c * layoutB.itemW), y: r * layoutB.itemH, w: layoutB.itemW, h: layoutB.itemH, rotated: layoutB.rotated });
    } else if (type === 'vertical-split') {
        const { splitY, layoutA, layoutB } = best.strategy;
        for (let r = 0; r < layoutA.rows; r++) for (let c = 0; c < layoutA.cols; c++) positions.push({ x: c * layoutA.itemW, y: r * layoutA.itemH, w: layoutA.itemW, h: layoutA.itemH, rotated: layoutA.rotated });
        for (let r = 0; r < layoutB.rows; r++) for (let c = 0; c < layoutB.cols; c++) positions.push({ x: c * layoutB.itemW, y: splitY + (r * layoutB.itemH), w: layoutB.itemW, h: layoutB.itemH, rotated: layoutB.rotated });
    }

    if (type !== 'single') {
        usedWidth = positions.reduce((max, p) => Math.max(max, p.x + p.w), 0);
        usedHeight = positions.reduce((max, p) => Math.max(max, p.y + p.h), 0);
        if (cardW > 0) itemsOnWidthEdge = Math.floor(usedWidth / cardW);
        if (cardH > 0) itemsOnHeightEdge = Math.floor(usedHeight / cardH);
    }

    return { positions, usedWidth, usedHeight, itemsOnWidthEdge, itemsOnHeightEdge };
}

function createVisual(layoutData, title, itemType = 'card', customTitleContent = null, isPressSheet = false) {
    const { positions, width, height, gripperOrientation, gripperFits } = layoutData;
    const container = document.createElement('div'); container.className = 'sheet-visual-wrapper';
    const titleElement = document.createElement('div'); titleElement.className = 'visual-title';
    titleElement.innerHTML = title;
    if (customTitleContent) titleElement.innerHTML += ` (${customTitleContent})`;
    const visual = document.createElement('div'); visual.className = 'sheet-visual';
    const scale = Math.min(280 / width, 320 / height);
    visual.style.width = `${width * scale}px`; visual.style.height = `${height * scale}px`;
    const wastedLayer = document.createElement('div'); wastedLayer.className = 'wasted-area';
    wastedLayer.style.width = '100%'; wastedLayer.style.height = '100%';
    visual.appendChild(wastedLayer);

    let noteText = '';
    if (isPressSheet && GRIPPER_MARGIN > 0 && gripperFits) {
        const gripperDiv = document.createElement('div');
        gripperDiv.className = 'gripper-margin';
        const gripperText = document.createElement('span');
        gripperText.className = 'gripper-text';
        gripperText.textContent = `البنسة (${GRIPPER_MARGIN} سم)`;
        if (gripperOrientation === 'vertical') {
            gripperDiv.style.width = `${GRIPPER_MARGIN * scale}px`;
            gripperDiv.style.height = '100%';
            gripperDiv.style.left = '0';
            gripperDiv.style.top = '0';
            gripperText.classList.add('vertical');
            noteText = `ملحوظة: تم ترك هامش بنسة بعرض ${GRIPPER_MARGIN} سم على جانب الشيت.`;
        } else {
            gripperDiv.style.width = '100%';
            gripperDiv.style.height = `${GRIPPER_MARGIN * scale}px`;
            gripperDiv.style.left = '0';
            gripperDiv.style.top = '0';
            noteText = `ملحوظة: تم ترك هامش بنسة بعرض ${GRIPPER_MARGIN} سم أعلى الشيت.`;
        }
        gripperDiv.appendChild(gripperText);
        visual.appendChild(gripperDiv);
    }

    positions.forEach(pos => {
        const itemDiv = document.createElement('div'); itemDiv.className = 'item-on-sheet';
        if (itemType === 'card') itemDiv.classList.add('card', pos.rotated ? 'rotated' : 'normal');
        else itemDiv.classList.add('sheet-on-farkh', pos.rotated ? 'rotated' : 'normal');
        itemDiv.style.width = `${pos.w * scale}px`;
        itemDiv.style.height = `${pos.h * scale}px`;
        let leftOffset = pos.x, topOffset = pos.y;
        if (isPressSheet && gripperFits) {
            if (gripperOrientation === 'vertical') leftOffset += GRIPPER_MARGIN;
            else topOffset += GRIPPER_MARGIN;
        }
        itemDiv.style.left = `${leftOffset * scale}px`;
        itemDiv.style.top = `${topOffset * scale}px`;
        visual.appendChild(itemDiv);
    });

    container.appendChild(visual);
    container.appendChild(titleElement);
    if (noteText) {
        const noteElement = document.createElement('div');
        noteElement.className = 'visual-note';
        noteElement.textContent = noteText;
        container.appendChild(noteElement);
    }
    return container;
}

// Export helpers to global for now (simple approach)
window.layoutHelpers = {
    layoutSheets, mainSheet, getBestGridInArea, findBestCardArrangement, createVisual
};
