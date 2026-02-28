const ROW_CARDS = 3;
const COLUMN_CARDS = 2;

const CARD_BACKGROUNDS = {
  red: "var(--card-red)",
  green: "var(--card-green)",
  blue: "var(--card-blue)",
  black: "var(--card-black)",
};

const RARITY_BORDERS = {
  none: { color: "#1f2937", width: 2 },
  bronze: { color: "var(--bronze)", width: 2 },
  silver: { color: "var(--silver)", width: 4 },
  gold: { color: "var(--gold)", width: 6 },
};

const STAR_STYLES = {
  bronze: { color: "#b45309", scale: 0.7, label: "B", labelColor: "#f8fafc", labelScale: 0.28 },
  silver: { color: "#64748b", scale: 1.1, label: "S", labelColor: "#f8fafc", labelScale: 0.34 },
  gold: { color: "#ca8a04", scale: 1.6, label: "G", labelColor: "#111827", labelScale: 0.4 },
};

const COLOR_COSTS = {
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
};

const TOKEN_ACCENTS = {
  red: "#fca5a5",
  green: "#86efac",
  blue: "#93c5fd",
  heart: "#ffe4e6",
  skull: "#4b5563",
  star: "#c4b5fd",
};

const SPECIALS = {
  heart: { fill: "#ffffff", glyph: "♥", glyphColor: "#be123c" },
  skull: { fill: "#111827", glyph: "☠", glyphColor: "#f8fafc" },
  star: { fill: "#7c3aed", glyph: "⛧", glyphColor: "#f8fafc" },
};

const gridElement = document.querySelector("#card-grid");
const statusElement = document.querySelector("#status-text");
const counterElements = {
  gold: document.querySelector("#count-gold"),
  silver: document.querySelector("#count-silver"),
  bronze: document.querySelector("#count-bronze"),
};

let cardLibrary = [];
let tableCards = [];
let cardResizeObserver = null;
let collectedStars = {
  bronze: 0,
  silver: 0,
  gold: 0,
};

bootstrap().catch((error) => {
  console.error(error);
  statusElement.textContent = "Failed to load cards. Serve the docs folder through a web server.";
});

async function bootstrap() {
  cardLibrary = await loadCards();
  resetCollectedStars();
  setupGrid();
  fillTable();
  renderTable();
  statusElement.textContent = "Tap or click any card to replace it.";
}

async function loadCards() {
  const response = await fetch("./cards.jsonl");
  if (!response.ok) {
    throw new Error(`Could not load cards.jsonl (${response.status})`);
  }

  const rawText = await response.text();
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function setupGrid() {
  gridElement.style.gridTemplateColumns = `repeat(${ROW_CARDS}, minmax(0, 1fr))`;
  gridElement.style.gridTemplateRows = `repeat(${COLUMN_CARDS}, minmax(0, 1fr))`;
}

function fillTable() {
  tableCards = Array.from({ length: ROW_CARDS * COLUMN_CARDS }, () => randomCard());
}

function randomCard() {
  return cardLibrary[Math.floor(Math.random() * cardLibrary.length)];
}

function renderTable() {
  ensureResizeObserver();
  cardResizeObserver.disconnect();
  gridElement.replaceChildren();

  tableCards.forEach((card, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card";
    button.setAttribute("aria-label", `Replace ${card.card_name}`);
    applyCardFrame(button, card);
    button.append(createCardTop(card), createName(card), createDescription(card), createCosts(card));
    button.addEventListener("click", () => replaceCard(index));
    gridElement.append(button);
    syncCardLayout(button);
    cardResizeObserver.observe(button);
  });
}

function replaceCard(index) {
  const previous = tableCards[index];
  collectStar(previous.card_star);
  tableCards[index] = randomCard();
  renderTable();
  statusElement.textContent = `Replaced ${previous.card_name} with ${tableCards[index].card_name}.`;
}

function applyCardFrame(element, card) {
  const border = RARITY_BORDERS[card.card_star] ?? RARITY_BORDERS.none;
  element.style.background = CARD_BACKGROUNDS[card.card_color] ?? CARD_BACKGROUNDS.black;
  element.style.border = `${border.width}px solid ${border.color}`;
}

function createName(card) {
  const node = document.createElement("h2");
  node.className = "card__name";
  node.textContent = card.card_name;
  return node;
}

function createCardTop(card) {
  const row = document.createElement("div");
  row.className = "card__top";

  const emoji = document.createElement("div");
  emoji.className = "card__emoji";
  emoji.textContent = card.card_emoji || "";

  const badge = createBadge(card);
  row.append(emoji, badge);
  return row;
}

function createBadge(card) {
  const wrapper = document.createElement("div");
  wrapper.className = "card__badge";

  if (Number(card.card_points) > 0) {
    const points = document.createElement("div");
    points.className = "points-badge";
    points.textContent = String(card.card_points);
    wrapper.append(points);
    return wrapper;
  }

  if (card.card_star && card.card_star !== "none") {
    const starStyle = STAR_STYLES[card.card_star];
    if (starStyle) {
      const star = document.createElement("div");
      star.className = "star-badge";
      star.style.setProperty("--star-scale", String(starStyle.scale));
      star.style.setProperty("--star-label-scale", String(starStyle.labelScale));

      const glyph = document.createElement("span");
      glyph.className = "star-badge__glyph";
      glyph.textContent = "★";
      glyph.style.color = starStyle.color;

      const label = document.createElement("span");
      label.className = "star-badge__label";
      label.textContent = starStyle.label;
      label.style.color = starStyle.labelColor;

      star.append(glyph, label);
      wrapper.append(star);
    }
  }

  return wrapper;
}

function createDescription(card) {
  const node = document.createElement("p");
  node.className = "card__text";
  node.textContent = card.card_text || "";
  if (!card.card_text) {
    node.hidden = true;
  }
  return node;
}

function createCosts(card) {
  const wrapper = document.createElement("div");
  wrapper.className = "card__costs";

  const { upper, lower } = expandCostRows(card.card_costs);
  wrapper.dataset.maxCount = String(Math.max(upper.length, lower.length, 1));

  wrapper.append(createCostRow(upper), createCostRow(lower));

  return wrapper;
}

function expandCostRows(cardCosts) {
  const upper = [];
  const lower = [];

  for (const cost of cardCosts) {
    if (Array.isArray(cost)) {
      const [kind, value, count] = cost;
      for (let i = 0; i < count; i += 1) {
        if (kind === "color") {
          lower.push({ kind: "color", value });
        } else if (kind === "token") {
          upper.push({ kind: "token", value });
        }
      }
      continue;
    }

    upper.push({ kind: "special", value: cost });
  }

  return { upper, lower };
}

function createCostRow(items) {
  const row = document.createElement("div");
  row.className = "cost-row";
  row.style.setProperty("--row-count", String(Math.max(1, Math.min(5, items.length))));

  items.forEach((item) => {
    row.append(createCostIcon(item));
  });

  return row;
}

function createCostIcon(item) {
  if (item.kind === "color") {
    const node = document.createElement("span");
    node.className = "cost-icon cost-icon--circle";
    node.style.background = COLOR_COSTS[item.value];
    return node;
  }

  if (item.kind === "token") {
    if (item.value === "rainbow") {
      const rainbowToken = document.createElement("span");
      rainbowToken.className = "cost-icon cost-icon--rainbow-token";
      return rainbowToken;
    }

    if (item.value in COLOR_COSTS) {
      const token = document.createElement("span");
      token.className = "cost-icon cost-icon--token";
      token.style.background = COLOR_COSTS[item.value];

      const inner = document.createElement("span");
      inner.className = "cost-icon__inner";
      inner.style.background = TOKEN_ACCENTS[item.value];
      token.append(inner);
      return token;
    }

    return createSpecialToken(item.value);
  }

  if (item.value === "rainbow") {
    const rainbow = document.createElement("span");
    rainbow.className = "cost-icon cost-icon--rainbow";
    return rainbow;
  }

  return createSpecialCircle(item.value);
}

function createSpecialCircle(value) {
  const data = SPECIALS[value];
  const node = document.createElement("span");
  node.className = "cost-icon cost-icon--circle";
  node.style.background = data.fill;
  node.style.color = data.glyphColor;
  node.textContent = data.glyph;
  return node;
}

function createSpecialToken(value) {
  const data = SPECIALS[value];
  const token = document.createElement("span");
  token.className = "cost-icon cost-icon--token";
  token.style.background = data.fill;

  const inner = document.createElement("span");
  inner.className = "cost-icon__inner";
  inner.style.background = TOKEN_ACCENTS[value];
  inner.style.color = data.glyphColor;
  inner.textContent = data.glyph;
  token.append(inner);
  return token;
}

function ensureResizeObserver() {
  if (cardResizeObserver) {
    return;
  }

  cardResizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      syncCardLayout(entry.target);
    });
  });
}

function syncCardLayout(cardElement) {
  const cardStyles = window.getComputedStyle(cardElement);
  const horizontalPadding =
    parseFloat(cardStyles.paddingLeft) + parseFloat(cardStyles.paddingRight);
  const verticalPadding =
    parseFloat(cardStyles.paddingTop) + parseFloat(cardStyles.paddingBottom);
  const cardWidth = Math.max(140, cardElement.clientWidth - horizontalPadding);
  const cardHeight = Math.max(180, cardElement.clientHeight - verticalPadding);

  const nameAreaHeight = clampNumber(cardHeight * 0.2, 34, cardHeight * 0.26);
  const cardGap = clampNumber(Math.min(cardWidth, cardHeight) * 0.018, 4, 10);
  const baseTopRowHeight = clampNumber(cardHeight * 0.12, 24, cardHeight * 0.18);

  const costsNode = cardElement.querySelector(".card__costs");
  const maxSymbols = Math.max(
    1,
    Math.min(5, Number(costsNode?.dataset.maxCount ?? "1")),
  );
  const remainingHeight = Math.max(
    56,
    cardHeight - baseTopRowHeight - nameAreaHeight - cardGap * 3,
  );
  let costAreaHeight = clampNumber(remainingHeight * 0.72, 56, cardHeight * 0.52);
  const costGap = clampNumber(cardGap * 0.8, 3, 8);
  let horizontalCostSize =
    (cardWidth - costGap * Math.max(0, maxSymbols - 1)) / maxSymbols;
  let verticalCostSize = (costAreaHeight - costGap) / 2;
  let costSize = clampNumber(
    Math.min(horizontalCostSize, verticalCostSize),
    16,
    Math.min(cardWidth * 0.24, 84),
  );
  const iconBaseSize = clampNumber(costSize * 1.02, 18, cardWidth * 0.22);
  const topRowHeight = clampNumber(
    Math.max(baseTopRowHeight, iconBaseSize * 1.08),
    24,
    cardHeight * 0.2,
  );
  const adjustedRemainingHeight = Math.max(
    56,
    cardHeight - topRowHeight - nameAreaHeight - cardGap * 3,
  );
  costAreaHeight = clampNumber(adjustedRemainingHeight * 0.72, 56, cardHeight * 0.52);
  horizontalCostSize =
    (cardWidth - costGap * Math.max(0, maxSymbols - 1)) / maxSymbols;
  verticalCostSize = (costAreaHeight - costGap) / 2;
  costSize = clampNumber(
    Math.min(horizontalCostSize, verticalCostSize),
    16,
    Math.min(cardWidth * 0.24, 84),
  );
  const syncedIconSize = clampNumber(costSize * 1.02, 18, cardWidth * 0.22);
  const nameNode = cardElement.querySelector(".card__name");
  const nameFontSize = estimateNameFontSize(
    nameNode?.textContent ?? "",
    cardWidth,
    nameAreaHeight,
  );

  cardElement.style.setProperty("--top-row-height", `${topRowHeight}px`);
  cardElement.style.setProperty("--name-area-height", `${nameAreaHeight}px`);
  cardElement.style.setProperty("--name-font-size", `${nameFontSize}px`);
  cardElement.style.setProperty("--badge-size", `${syncedIconSize}px`);
  cardElement.style.setProperty("--emoji-size", `${syncedIconSize}px`);
  cardElement.style.setProperty("--cost-area-height", `${costAreaHeight}px`);
  cardElement.style.setProperty("--cost-size", `${costSize}px`);
  cardElement.style.setProperty("--cost-gap", `${costGap}px`);
  cardElement.style.setProperty("--card-gap", `${cardGap}px`);
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function estimateNameFontSize(cardName, availableWidth, availableHeight) {
  const cleanedName = cardName.trim();
  if (!cleanedName) {
    return 10;
  }

  let fontSize = clampNumber(
    Math.min(availableHeight * 0.6, availableWidth * 0.12),
    11,
    28,
  );

  while (fontSize > 10) {
    const averageCharWidth = fontSize * 0.56;
    const maxCharsPerLine = Math.max(4, Math.floor(availableWidth / averageCharWidth));
    const estimatedLines = estimateWrappedLineCount(cleanedName, maxCharsPerLine);
    const usedHeight = estimatedLines * fontSize * 1.08;

    if (usedHeight <= availableHeight * 0.96) {
      return fontSize;
    }

    fontSize -= 0.5;
  }

  return 10;
}

function estimateWrappedLineCount(text, maxCharsPerLine) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) {
    return 1;
  }

  let lines = 1;
  let lineLength = 0;

  words.forEach((word) => {
    const wordLength = word.length;

    if (lineLength === 0) {
      lineLength = wordLength;
      return;
    }

    if (lineLength + 1 + wordLength <= maxCharsPerLine) {
      lineLength += 1 + wordLength;
      return;
    }

    lines += 1;
    lineLength = wordLength;
  });

  return lines;
}

function resetCollectedStars() {
  collectedStars = {
    bronze: 0,
    silver: 0,
    gold: 0,
  };
  updateCollectedStarUI();
}

function collectStar(rarity) {
  if (!(rarity in collectedStars)) {
    return;
  }

  collectedStars[rarity] += 1;
  updateCollectedStarUI();
}

function updateCollectedStarUI() {
  Object.entries(counterElements).forEach(([rarity, element]) => {
    if (element) {
      element.textContent = String(collectedStars[rarity]);
    }
  });
}
