import * as THREE from "three";
import ThreeMeshUI from "three-mesh-ui";
import { Text as TroikaText } from "troika-three-text";

// CONSTANTS & HELPERS //
// pixels to metres
const PX_TO_M = 0.001;
const px = (v) => v * PX_TO_M;

// hex to three.js color
const C = (hex) => new THREE.Color(hex);

// font
const FONT_URL = "assets/fonts/Inter/Inter-Regular.ttf";

// grow progress bar from left
const leftAnchorX = (trackW, w) => (-trackW / 2) + (w / 2);

// 7-box likert
export const LIKERT_7 = [
    { value: 1, label: "Strongly\nDisagree" },
    { value: 2, label: "Disagree" },
    { value: 3, label: "Somewhat\nDisagree" },
    { value: 4, label: "Neutral" },
    { value: 5, label: "Somewhat\nAgree" },
    { value: 6, label: "Agree" },
    { value: 7, label: "Strongly\nAgree" },
];

// styles
const TILE_STYLES = {
    default: { bg: 0xffffff, border: 0xffffff, text: 0x004142, bgOpacity: 0.4 },
    hover: { bg: 0xffffff, border: 0x02c6c9, text: 0x004142, bgOpacity: 0.4 },
    selected: { bg: 0xffffff, border: 0x135de5, text: 0x135de5, bgOpacity: 1.0 },
};

const UI_COLORS = {
    // panel
    panelBg: 0xffffff,
    panelOpacity: 0.95,

    // progress bar
    progressTrack: 0xe8ebf1,
    progressFill: 0x02c6c9,

    // next / done button
    nextDisabledBg: 0xffffff,
    nextDisabledBorder: 0xc6cdcc,
    nextDisabledText: 0xc6cdcc,
    nextDisabledOpacity: 0.4,

    nextEnabledBg: 0xffffff,
    nextEnabledBorder: 0x02c6c9,
    nextEnabledText: 0x02c6c9,
    nextEnabledOpacity: 0.4,
};

// layout spec
const SPEC = {
    // panel padding
    padding: { left: 24, top: 16, right: 24, bottom: 32 },

    // height of progress bar
    progressH: 8,

    // gap between prog bar + button and questions
    gapAfterTopRow: 72,

    // question block (question text + row of tiles)
    questionGroupH: 127,
    gapBetweenQuestions: 24,
    qGapToTiles: 8,

    // button
    nextFixedW: 96,
    nextH: 32,
    nextFontPx: 12,

    // question text row height
    qRowH: 28,

    // likert boxes
    tile: {
        count: 7,
        size: 100,
        gap: 8,
        borderW: 2,
        radius: 16,
        numberFontPx: 32,
        labelFontPx: 12,
    },
};

// tile
const TILE = SPEC.tile;
const TILE_SIZE = px(TILE.size);
const TILE_GAP  = px(TILE.gap);
const TILE_ROW_W_PX = TILE.count * TILE.size + (TILE.count - 1) * TILE.gap;
const TILE_ROW_W = px(TILE_ROW_W_PX);

// offsets (z)
const Z_PANEL_CONTENT = 0.002;
const Z_HITPLANE = 0.01;
const Z_UI = 0.001;

// bring forward UI to avoid clipping with panel
function disableDepth(obj) {
    obj.traverse((o) => {
        if (!o.material) return;
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of mats) {
            m.transparent = true;
            m.depthTest = false;
            m.depthWrite = false;
        }
    });
    obj.renderOrder = 999;
}

// block builder
function makeBlock({
                       w,
                       h,
                       bg = 0xffffff,
                       bgOpacity = 1.0,
                       borderColor = 0xffffff,
                       borderW = px(0),
                       radius = px(0),
                   } = {}) {
    const b = new ThreeMeshUI.Block({
        width: w,
        height: h,
        padding: 0,
        margin: 0,
        justifyContent: "center",
        alignContent: "center",
        // visual styling
        backgroundColor: C(bg),
        backgroundOpacity: bgOpacity,
        borderColor: C(borderColor),
        borderWidth: borderW,
        borderRadius: radius,
    });
    disableDepth(b);
    return b;
}

// update styling safely
function blockSet(block, props) {
    block.set(props); // update block properties (no recreation)
    disableDepth(block);
    block.traverse((o) => {
        if (o.isMesh) o.renderOrder = 9999;
    });
}

// layout-only blocks (invisible containers)
function uiLayoutBlock(props) {
    const b = new ThreeMeshUI.Block({
        padding: 0,
        margin: 0,
        backgroundOpacity: 0,
        ...props,
    });
    disableDepth(b);
    return b;
}


// text object
function makeTroikaText({ content, fontSize, color, maxWidth, anchorX = "center", anchorY = "middle", textAlign = "center", lineHeight = 1.0, } = {}) {
    const t = new TroikaText();
    t.text = content; t.font = FONT_URL; t.fontSize = fontSize; t.color = color; t.maxWidth = maxWidth; t.anchorX = anchorX; t.anchorY = anchorY; t.textAlign = textAlign; t.lineHeight = lineHeight; t.fillOpacity = 1.0;
    t.renderOrder = 10000;
    t.raycast = () => null;
    t.sync();
    return t;
}

// MAIN FUNCTIONS
// make survey ui panel
// all survey pages and survey finish behaviour
export function createSurveyPanelUI(pages, onComplete = () => {}) {
    const root = new THREE.Group();
    const tileRefByNode = new Map(); // handling hover / select
    const tilesByQuestion = new Map(); // to reset other tiles when one is selected

    function findTileRef(node) {
        return tileRefByNode.get(node) ?? null;
    }

    let pageIndex = 0;

    // answer storage
    // answers = {
    //  "page_0": { 0: 6, 1; 4, 2: 7 },
    //  "page_1": { 0: 3, 1: 5, 2: 4, 3: 7 }
    // }

    // pageID comes from getPageId(): page.id or `page_${pageIndex}` as fallback
    // qIndex is the question index within that page
    // likertValue is opt.value (1 -> 7)

    // answers object only emitted via onComplete(answers) on the final page
    const answers = Object.create(null); // keep user's selection

    let pageGroup = null; // current page's contents

    // progress bar state
    let progressFillBlock = null; // moving bar
    let progressTrackW = 0; // track width

    let nextBtn = null;
    let lastHovered = null;

    // questions across all pages
    // panel height is shorter for 3 questions vs 4 questions
    const TOTAL_Q = pages.reduce((sum, p) => sum + (p.questions?.length ?? 0), 0);

    function getPage() {
        return pages[pageIndex];
    }

    function getPageId() {
        return getPage().id ?? `page_${pageIndex}`; // fallback id based on current pageIndex
    }

    // returns answer bucket for CURRENT page
    // ensures answers[pageId] exists, then returns it.
    // bucket shape: bucket[qIndex = likertValue
    function ensureBucket() {
        const id = getPageId(); // top level key =
        if (!answers[id]) answers[id] = Object.create(null);
        return answers[id];
    }

    // check if every q is answered on page
    // page is 'complete' when every qIndex has a non-null answer
    // enables/disables the next button
    function isPageComplete() {
        const page = getPage();
        const bucket = ensureBucket();
        return page.questions.every((_, i) => bucket[i] != null);
    }

    // total questions answered
    function answeredCountAll() {
        let n = 0;
        for (const pageKey of Object.keys(answers)) {
            const bucket = answers[pageKey];
            for (const k of Object.keys(bucket)) {
                if (bucket[k] != null) n++;
            }
        }
        return n;
    }

    function clearPage() {
        if (pageGroup) root.remove(pageGroup);
        pageGroup = null;

        progressFillBlock = null;
        progressTrackW = 0;

        nextBtn = null;
        lastHovered = null;

        tileRefByNode.clear();
        tilesByQuestion.clear();
    }

    // reset button state
    function setNextEnabled(enabled) {
        if (!nextBtn) return;

        nextBtn.userData.disabled = !enabled;

        const bg = enabled ? UI_COLORS.nextEnabledBg : UI_COLORS.nextDisabledBg;
        const border = enabled ? UI_COLORS.nextEnabledBorder : UI_COLORS.nextDisabledBorder;
        const txt = enabled ? UI_COLORS.nextEnabledText : UI_COLORS.nextDisabledText;
        const op = enabled ? UI_COLORS.nextEnabledOpacity : UI_COLORS.nextDisabledOpacity;

        // update button rect
        blockSet(nextBtn.userData.block, {
            backgroundColor: C(bg),
            backgroundOpacity: op,
            borderColor: C(border),
            borderWidth: px(2),
            borderRadius: px(8),
        });

        nextBtn.userData.text.color = txt;
        nextBtn.userData.text.sync();
    }

    function createProgressBar({ trackW, h, trackColor, fillColor, radius = px(4) }) {
        const bar = new THREE.Group();

        const track = makeBlock({ w: trackW, h, bg: trackColor, bgOpacity: 1, borderW: 0, radius });

        const minFillW = Math.max(px(1), h);
        const fill = makeBlock({ w: minFillW, h, bg: fillColor, bgOpacity: 1, borderW: 0, radius: 0 });

        fill.position.set(leftAnchorX(trackW, minFillW), 0, 0.0012);

        bar.add(track, fill);
        bar.userData = { trackW, fill, minFillW, h };

        return bar;
    }

    // update progress bar & whether button is enabled
    function updateProgress() {
        if (!progressFillBlock || !TOTAL_Q) return;

        const bar = progressFillBlock.parent;
        const { trackW, minFillW } = bar?.userData ?? {};
        if (!trackW || !minFillW) return;

        const answered = answeredCountAll();
        const fillW = Math.min(trackW, Math.max(minFillW, (trackW / TOTAL_Q) * answered));

        progressFillBlock.set({ width: fillW });
        progressFillBlock.position.x = leftAnchorX(trackW, fillW);

        setNextEnabled(isPageComplete());
    }

    // top row: progress bar & next / done button
    function buildTopRow(innerW) {
        const row = new THREE.Group();

        // conv spec sizes to m
        const gapW = px(SPEC.gapAfterTopRow);
        const nextW = px(SPEC.nextFixedW);
        const btnH  = px(SPEC.nextH);
        const progressH = px(SPEC.progressH);

        const rowH = Math.max(btnH, progressH);
        row.userData.height = rowH;

        const trackW = Math.max(px(1), innerW - gapW - nextW);
        progressTrackW = trackW;

        const barGroup = new THREE.Group();
        barGroup.position.x = (-innerW / 2) + trackW / 2;

        const progressBar = createProgressBar({
            trackW,
            h: progressH,
            trackColor: UI_COLORS.progressTrack,
            fillColor: UI_COLORS.progressFill,
            radius: px(4),
        });

        progressBar.position.z = Z_UI;

        progressFillBlock = progressBar.userData.fill;
        barGroup.add(progressBar);

        // button
        const btnGroup = new THREE.Group();
        const btnBlock = makeBlock({
            w: nextW,
            h: btnH,
            bg: UI_COLORS.nextDisabledBg,
            bgOpacity: UI_COLORS.nextDisabledOpacity,
            borderColor: UI_COLORS.nextDisabledBorder,
            borderW: px(2),
            radius: px(8),
        });
        const label = makeTroikaText({
            content: "Next",
            fontSize: px(SPEC.nextFontPx),
            color: UI_COLORS.nextDisabledText,
            maxWidth: nextW * 0.9,
            lineHeight: 1.0,
        });
        label.position.z = Z_UI;
        btnBlock.add(label);
        btnGroup.add(btnBlock);
        btnGroup.position.x = (innerW / 2) - nextW / 2;

        // store button refs and click behaviour
        nextBtn = btnGroup;
        nextBtn.userData.block = btnBlock;
        nextBtn.userData.text = label;
        nextBtn.userData.disabled = true;
        nextBtn.userData.onSelect = () => {
            if (nextBtn.userData.disabled) return;
            if (pageIndex < pages.length - 1) {
                pageIndex++;
                renderPage();
            } else {
                onComplete(answers); // emit full answers object to the caller
            }
        };

        row.add(barGroup);
        row.add(btnGroup);
        setNextEnabled(false);
        return row;
    }

    // build interactable tile
    function createLikertTile({ size, radius, borderW, value, label, styles, onSelect, }) {
        const root = new THREE.Group();

        // invisible hitbox for tiles (raycast reliability)
        const hitPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(size, size),
          new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
        );

        hitPlane.position.z = Z_HITPLANE;
        hitPlane.userData.owner = root;
        root.add(hitPlane);

        // tile square bg
        const block = makeBlock({ w: size, h: size, bg: styles.default.bg, bgOpacity: styles.default.bgOpacity, borderColor: styles.default.border, borderW, radius, });
        block.userData.owner = root;

        // text (number & label)
        const num = makeTroikaText({ content: String(value), fontSize: px(SPEC.tile.numberFontPx), color: styles.default.text, maxWidth: size * 0.9, lineHeight: 1.0, });
        num.position.set(0, px(18), Z_UI);
        const lbl = makeTroikaText({ content: label, fontSize: px(SPEC.tile.labelFontPx), color: styles.default.text, maxWidth: size * 0.9, lineHeight: 1.0, });
        lbl.position.set(0, px(-16), Z_UI);

        // raycaster won't hit text
        const contentGroup = new THREE.Group();
        contentGroup.raycast = () => null;
        contentGroup.add(num);
        contentGroup.add(lbl);

        root.add(block);
        root.add(contentGroup);

        root.userData.block = block;
        root.userData.num = num;
        root.userData.label = lbl;
        root.userData.value = value;
        root.userData.onSelect = onSelect;

        // styling state switching
        function setState(state) {
            const s = styles[state];
            blockSet(block, {
                backgroundColor: C(s.bg),
                backgroundOpacity: s.bgOpacity,
                borderColor: C(s.border),
                borderWidth: borderW,
                borderRadius: radius,
            });
            num.color = s.text;
            lbl.color = s.text;
            num.sync();
            lbl.sync();
        }
        setState("default");
        return { root, setState };
    }

    // question section (question text, gap, row of 7 tiles)
    function buildQuestionBlock(innerW, qText, qIndex) {
        const group = new THREE.Group();

        const tileSize = TILE_SIZE;
        const gapX = TILE_GAP;
        const gapY = px(SPEC.qGapToTiles);
        const totalTilesW = TILE_ROW_W;
        const leftX = -totalTilesW / 2 + tileSize / 2;

        const col = uiLayoutBlock({
            width: innerW,
            height: px(SPEC.questionGroupH),
            contentDirection: "column",
            justifyContent: "start",
            alignContent: "center",
        });

        const qRow = uiLayoutBlock({ width: innerW, height: px(SPEC.qRowH), justifyContent: "center", alignContent: "center" });
        const q = makeTroikaText({
            content: qText,
            fontSize: px(18),
            color: 0x111318,
            maxWidth: innerW * 0.95,
            textAlign: "center",
            lineHeight: 1.15,
        });
        q.position.z = Z_UI;
        qRow.add(q);

        // gap
        const spacer = uiLayoutBlock({ width: innerW, height: gapY });

        // row container for tiles
        const tilesRow = uiLayoutBlock({ width: innerW, height: tileSize, justifyContent: "center", alignContent: "center" });
        const rowGroup = new THREE.Group();
        const tiles = [];

        // tile objects
        LIKERT_7.forEach((opt, i) => {
            const { root: tileNode, setState } = createLikertTile({
                size: tileSize,
                radius: px(TILE.radius),
                borderW: px(TILE.borderW),
                value: opt.value,
                label: opt.label,
                styles: TILE_STYLES,

                // save answer for this q index to update visuals, progress, and button
                onSelect: () => {
                    const bucket = ensureBucket(); // selects a tile, store chosen likert value into current page's bucket at this qIndex
                    bucket[qIndex] = opt.value; // answers[pageId][qIndex] = selected likert value

                    (tilesByQuestion.get(qIndex) ?? []).forEach((t) =>
                      t.setState(t.value === opt.value ? "selected" : "default")
                    );

                    updateProgress();
                }
            });

            tileNode.userData.qIndex = qIndex;
            tileNode.userData.value = opt.value;

            tileRefByNode.set(tileNode, { qIndex, value: opt.value, setState });

            tileNode.position.set(leftX + i * (tileSize + gapX), 0, 0);

            tiles.push({ node: tileNode, setState, value: opt.value, qIndex });
            rowGroup.add(tileNode);
        });

        tilesByQuestion.set(qIndex, tiles);
        tilesRow.add(rowGroup);

        // assemble
        col.add(qRow);
        col.add(spacer);
        col.add(tilesRow);
        group.add(col);
        group.userData.col = col;
        return group;
    }

    // page builder
    function renderPage() {
        clearPage();

        const page = getPage();
        const qCount = page.questions.length;

        // inner width: 7*100 + 6*8 = 748
        const innerWpx = TILE_ROW_W_PX;
        const panelWpx = innerWpx + SPEC.padding.left + SPEC.padding.right;
        const innerW = TILE_ROW_W;
        const panelW = px(panelWpx);

        const topRowApproxH = 44;

        // total height for all question blocks & spacing
        const questionsH =
          qCount * SPEC.questionGroupH + Math.max(0, qCount - 1) * SPEC.gapBetweenQuestions;

        // full panel height
        const panelHpx =
          SPEC.padding.top +
          topRowApproxH +
          SPEC.gapAfterTopRow +
          questionsH +
          SPEC.padding.bottom;
        const panelH = px(panelHpx); // convert to world units

        pageGroup = new THREE.Group();
        // panel background
        const panel = makeBlock({
            w: panelW,
            h: panelH,
            bg: UI_COLORS.panelBg,
            bgOpacity: UI_COLORS.panelOpacity,
            borderColor: 0xffffff,
            borderW: px(0),
            radius: px(12),
        });

        pageGroup.add(panel);

        // content slightly in front of panel (no z-fights!)
        const content = new THREE.Group();
        content.position.z = Z_PANEL_CONTENT;
        pageGroup.add(content);

        // top row (progress + button)
        const topRow = buildTopRow(innerW);
        const topRowH = topRow.userData.height ?? px(44);
        topRow.position.y = (panelH / 2) - px(SPEC.padding.top) - (topRowH / 2);
        topRow.position.z = Z_UI;   // extra pop just for bar + button
        content.add(topRow);

        // questions
        const bucket = ensureBucket();
        let y = topRow.position.y - px(SPEC.gapAfterTopRow) - px(20);

        const qBlockH =
          px(SPEC.qRowH) +
          px(SPEC.qGapToTiles) +
          TILE_SIZE;

        // build each question
        page.questions.forEach((qText, qIndex) => {
            const qBlock = buildQuestionBlock(innerW, qText, qIndex);
            qBlock.position.y = y;
            content.add(qBlock);

            const saved = bucket[qIndex]; // restore saved selection
            if (saved != null) {
                const tiles = tilesByQuestion.get(qIndex) ?? [];
                tiles.forEach((t) => t.setState(t.value === saved ? "selected" : "default"));
            }
            y -= (qBlockH + px(SPEC.gapBetweenQuestions));
        });

        root.add(pageGroup);
        updateProgress();
    }

    // call frames from render loop
    function update() {
        ThreeMeshUI.update();
    }

    // reset prev. hovered element back to default
    function resetHover() {
        if (!lastHovered) return;

        const tileRef = findTileRef(lastHovered); // hovered = tile?
        if (tileRef) {
            const saved = ensureBucket()[tileRef.qIndex];
            tileRef.setState(saved != null && saved === tileRef.value ? "selected" : "default");
        } else if (lastHovered === nextBtn) { // hovered = button?
            setNextEnabled(!nextBtn.userData.disabled);
        }
        lastHovered = null;
    }

    // raycasting for hover & click
    function handlePointer({ raycaster, isHover = false, isSelect = false }) {
        const hits = raycaster.intersectObject(root, true); // cast ray against entire survey ui
        if (!hits.length) { // if nothing hit, reset hover if needed
            if (isHover) resetHover();
            return;
        }

        let target = hits[0].object; // start w/ closest object (hitbox) to resolve to tile owner
        if (target.userData?.owner) target = target.userData.owner;

        while (target && !target.userData?.onSelect && target.parent) { // get to clickable element
            target = target.parent;
        }

        if (!target?.userData?.onSelect) { // reset hover if nothing clickable
            if (isHover) resetHover();
            return;
        }

        if (isHover && target !== lastHovered) {
            resetHover();

            const tileRef = findTileRef(target); // set tile style upon hover
            if (tileRef) {
                const saved = ensureBucket()[tileRef.qIndex];
                const isSelected = saved != null && saved === tileRef.value;
                tileRef.setState(isSelected ? "selected" : "hover");
            } else if (target === nextBtn && !target.userData.disabled) { // set button style upon hover
                blockSet(nextBtn.userData.block, { borderColor: C(0x135de5) });
            }
            lastHovered = target;
        }

        if (isSelect) { // select interaction
            if (target === nextBtn && target.userData.disabled) return; // can't click button if disabled
            target.userData.onSelect();
        }
    }

    // build first page
    renderPage();

    return {
        root,
        update,
        handlePointer,
    };
}

export async function loadInterFont() {
    return Promise.resolve();
}