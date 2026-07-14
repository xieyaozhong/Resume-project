"use strict";

const STORAGE_KEY = "universal-resume-builder:v1";
const STATE_VERSION = 1;
const A4_HEIGHT_PX = 1122.52;
const MAX_PHOTO_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_STORED_PHOTO_BYTES = 700 * 1024;
const PHOTO_MAX_DIMENSION = 900;
const MAX_JSON_BYTES = 5 * 1024 * 1024;

const labels = {
  zh: {
    contact: "聯絡方式",
    summary: "專業摘要",
    experience: "工作經歷",
    education: "學歷",
    skills: "專業技能",
    projects: "專案作品",
    certifications: "證照與獎項",
    languages: "語言能力",
    present: "至今",
    website: "網站",
    linkedin: "LinkedIn",
    github: "GitHub",
    emptyTitle: "開始建立你的履歷",
    emptyText: "在左側輸入姓名與經歷，右側會立即產生 A4 履歷預覽。",
  },
  en: {
    contact: "Contact",
    summary: "Profile",
    experience: "Experience",
    education: "Education",
    skills: "Skills",
    projects: "Projects",
    certifications: "Certifications & Awards",
    languages: "Languages",
    present: "Present",
    website: "Website",
    linkedin: "LinkedIn",
    github: "GitHub",
    emptyTitle: "Start building your resume",
    emptyText: "Enter your name and experience to generate a live A4 resume preview.",
  },
};

const defaultState = {
  version: STATE_VERSION,
  settings: {
    template: "modern",
    fontScale: "normal",
    accentColor: "#0f766e",
    language: "zh",
    showPhoto: true,
    showIcons: true,
    visibility: {
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      languages: true,
      custom: true,
    },
  },
  personal: {
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    photo: "",
  },
  summary: "",
  experience: [createEmptyItem("experience")],
  education: [createEmptyItem("education")],
  skills: "",
  projects: [createEmptyItem("projects")],
  certifications: [createEmptyItem("certifications")],
  languages: [createEmptyItem("languages")],
  custom: {
    title: "",
    format: "bullets",
    content: "",
  },
};

const sampleState = {
  version: STATE_VERSION,
  settings: {
    template: "modern",
    fontScale: "normal",
    accentColor: "#0f766e",
    language: "zh",
    showPhoto: false,
    showIcons: true,
    visibility: {
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      languages: true,
      custom: true,
    },
  },
  personal: {
    name: "王小明",
    title: "全端軟體工程師",
    email: "ming.wang@example.com",
    phone: "0912-345-678",
    location: "台中市，台灣",
    website: "mingwang.dev",
    linkedin: "linkedin.com/in/mingwang",
    github: "github.com/mingwang",
    photo: "",
  },
  summary:
    "具備 4 年網站開發經驗，專注於打造高效、穩定且易維護的數位產品。曾主導內部系統重構，使頁面載入速度提升 42%，並透過自動化流程將部署時間由 30 分鐘縮短至 5 分鐘。",
  experience: [
    {
      id: uid(),
      company: "星火科技有限公司",
      role: "資深前端工程師",
      start: "2024/03",
      end: "至今",
      location: "台中市 / Hybrid",
      description:
        "主導 React 管理平台重構，首屏載入速度提升 42%\n建立共用元件庫與文件，跨團隊開發效率提升 30%\n導入前端測試與 CI 檢查，正式環境回歸錯誤降低 55%",
    },
    {
      id: uid(),
      company: "創意數位工作室",
      role: "網站工程師",
      start: "2022/07",
      end: "2024/02",
      location: "台北市 / Remote",
      description:
        "完成 12 個品牌網站與電商專案，準時交付率 100%\n串接金流、物流與會員 API，支援每月超過 8 萬筆交易\n建立自動部署流程，將平均部署時間由 30 分鐘縮短至 5 分鐘",
    },
  ],
  education: [
    {
      id: uid(),
      school: "國立範例大學",
      degree: "資訊工程學系 學士",
      start: "2018/09",
      end: "2022/06",
      description: "畢業專題：以機器學習進行顧客流失預測；專題競賽佳作",
    },
  ],
  skills:
    "前端：JavaScript、TypeScript、React、Vue\n後端：Node.js、Python、Flask、REST API\n資料庫：PostgreSQL、MySQL、SQLite\n工具：Git、Docker、GitHub Actions、Figma",
  projects: [
    {
      id: uid(),
      name: "萬用履歷產生器",
      tech: "JavaScript、HTML、CSS",
      url: "github.com/mingwang/resume-builder",
      description:
        "開發免安裝的履歷編輯器，支援三種 A4 版型與即時預覽\n實作瀏覽器自動儲存、JSON 匯入匯出與 PDF 列印",
    },
    {
      id: uid(),
      name: "營運數據儀表板",
      tech: "React、Node.js、PostgreSQL",
      url: "mingwang.dev/dashboard",
      description:
        "整合銷售、廣告與會員資料，提供 15 項核心營運指標\n將每週人工報表製作時間由 6 小時縮短至 20 分鐘",
    },
  ],
  certifications: [
    { id: uid(), name: "TOEIC 900", detail: "2025・ETS" },
    { id: uid(), name: "AWS Certified Cloud Practitioner", detail: "2024・AWS" },
  ],
  languages: [
    { id: uid(), name: "中文", level: "母語" },
    { id: uid(), name: "英文", level: "專業工作能力" },
  ],
  custom: {
    title: "社群與分享",
    format: "bullets",
    content: "擔任校園程式社群講師，累計舉辦 8 場工作坊\n撰寫前端開發文章，累計超過 5 萬次瀏覽",
  },
};

let state = loadState();
let saveTimer = null;
let renderTimer = null;
let zoom = 0.85;

const refs = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheRefs();
  bindStaticEvents();
  hydrateStaticFields();
  renderDynamicEditors();
  renderPreview();
  setZoom(zoom);
  updatePhotoEditor();
  updateSummaryCount();
}

function cacheRefs() {
  refs.preview = document.getElementById("resumePreview");
  refs.previewStage = document.getElementById("previewStage");
  refs.editorScroll = document.getElementById("editorScroll");
  refs.saveStatus = document.getElementById("saveStatus");
  refs.summaryCount = document.getElementById("summaryCount");
  refs.pageEstimate = document.getElementById("pageEstimate");
  refs.zoomValue = document.getElementById("zoomValue");
  refs.photoPreview = document.getElementById("photoPreview");
  refs.toastRegion = document.getElementById("toastRegion");
  refs.resumeHealth = document.getElementById("resumeHealth");
  refs.completionLabel = document.getElementById("completionLabel");
  refs.completionHint = document.getElementById("completionHint");
  refs.completionBar = document.getElementById("completionBar");
  refs.completionTrack = document.querySelector(".completion-track");
}

function bindStaticEvents() {
  document.addEventListener("input", handleInput);
  document.addEventListener("change", handleChange);
  document.addEventListener("click", handleClick);

  document.getElementById("photoInput").addEventListener("change", handlePhotoUpload);
  document.getElementById("importJsonInput").addEventListener("change", handleJsonImport);
  document.getElementById("printBtn").addEventListener("click", () => window.print());
  document.getElementById("mobilePrintBtn").addEventListener("click", () => window.print());
  document.getElementById("exportJsonBtn").addEventListener("click", exportJson);
  document.getElementById("exportTextBtn").addEventListener("click", exportPlainText);
  document.getElementById("atsModeBtn").addEventListener("click", activateAtsMode);
  document.getElementById("loadSampleBtn").addEventListener("click", loadSample);
  document.getElementById("resetBtn").addEventListener("click", resetAll);
  document.getElementById("removePhotoBtn").addEventListener("click", removePhoto);
  document.getElementById("zoomInBtn").addEventListener("click", () => setZoom(zoom + 0.05));
  document.getElementById("zoomOutBtn").addEventListener("click", () => setZoom(zoom - 0.05));
  document.getElementById("fitBtn").addEventListener("click", fitPreview);

  window.addEventListener("resize", debounce(() => {
    if (window.innerWidth <= 820) fitPreview();
  }, 150));
  window.addEventListener("pagehide", flushPendingSave);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushPendingSave();
  });
  window.addEventListener("beforeprint", () => renderPreview());
}

function handleInput(event) {
  const target = event.target;

  if (target.matches("[data-bind]")) {
    const path = target.dataset.bind;
    setByPath(state, path, getControlValue(target));

    if (path === "settings.accentColor") {
      syncAccentControls(target.value);
    }

    if (path === "summary") updateSummaryCount();
    scheduleStateUpdate();
    return;
  }

  if (target.id === "accentColorText") {
    const value = normalizeHex(target.value);
    if (value) {
      state.settings.accentColor = value;
      syncAccentControls(value);
      scheduleStateUpdate();
    }
    return;
  }

  if (target.matches("[data-item-field]")) {
    updateDynamicItemFromControl(target);
    scheduleStateUpdate();
  }
}

function handleChange(event) {
  const target = event.target;

  if (target.matches("[data-bind]")) {
    const path = target.dataset.bind;
    setByPath(state, path, getControlValue(target));
    if (path === "settings.accentColor") syncAccentControls(target.value);
    scheduleStateUpdate(true);
    return;
  }

  if (target.matches("[data-visibility]")) {
    state.settings.visibility[target.dataset.visibility] = target.checked;
    scheduleStateUpdate(true);
  }
}

function handleClick(event) {
  const addButton = event.target.closest("[data-add-item]");
  if (addButton) {
    addItem(addButton.dataset.addItem);
    return;
  }

  const removeButton = event.target.closest("[data-remove-item]");
  if (removeButton) {
    removeItem(removeButton.closest("[data-item-type]"));
    return;
  }

  const moveButton = event.target.closest("[data-move]");
  if (moveButton) {
    moveItem(moveButton.closest("[data-item-type]"), moveButton.dataset.move);
    return;
  }

  const navButton = event.target.closest("[data-target]");
  if (navButton) {
    const section = document.getElementById(navButton.dataset.target);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      document.querySelectorAll(".section-nav-item").forEach((button) => {
        button.classList.toggle("is-active", button === navButton);
      });
    }
    return;
  }

  const mobileTab = event.target.closest("[data-mobile-view]");
  if (mobileTab) {
    setMobileView(mobileTab.dataset.mobileView);
  }
}

function hydrateStaticFields() {
  document.querySelectorAll("[data-bind]").forEach((control) => {
    const value = getByPath(state, control.dataset.bind);
    setControlValue(control, value);
  });

  document.querySelectorAll("[data-visibility]").forEach((control) => {
    control.checked = Boolean(state.settings.visibility[control.dataset.visibility]);
  });

  syncAccentControls(state.settings.accentColor);
}

function renderDynamicEditors() {
  renderEditorList("experience");
  renderEditorList("education");
  renderEditorList("projects");
  renderEditorList("certifications");
  renderEditorList("languages");
}

function renderEditorList(type) {
  const container = document.getElementById(`${type}List`);
  const template = document.getElementById(`${type}ItemTemplate`);
  if (!container || !template) return;

  container.innerHTML = "";
  state[type].forEach((item, index) => {
    const fragment = template.content.cloneNode(true);
    const root = fragment.querySelector("[data-item-type]");
    root.dataset.itemId = item.id;
    root.querySelector(".dynamic-item-header strong").textContent = getItemEditorTitle(type, index, item);

    root.querySelectorAll("[data-item-field]").forEach((control) => {
      setControlValue(control, item[control.dataset.itemField] ?? "");
    });

    const up = root.querySelector('[data-move="up"]');
    const down = root.querySelector('[data-move="down"]');
    if (up) up.disabled = index === 0;
    if (down) down.disabled = index === state[type].length - 1;

    container.appendChild(fragment);
  });
}

function getItemEditorTitle(type, index, item) {
  const fallback = {
    experience: "工作經歷",
    education: "學歷",
    projects: "專案作品",
    certifications: "證照 / 獎項",
    languages: "語言能力",
  }[type];

  const candidate = item.role || item.company || item.school || item.name;
  return candidate ? `${index + 1}. ${candidate}` : `${fallback} ${index + 1}`;
}

function addItem(type) {
  if (!Array.isArray(state[type])) return;
  state[type].push(createEmptyItem(type));
  renderEditorList(type);
  scheduleStateUpdate(true);

  requestAnimationFrame(() => {
    const container = document.getElementById(`${type}List`);
    const lastItem = container?.lastElementChild;
    lastItem?.scrollIntoView({ behavior: "smooth", block: "center" });
    lastItem?.querySelector("input, textarea")?.focus();
  });
}

function removeItem(element) {
  if (!element) return;
  const type = element.dataset.itemType;
  const itemId = element.dataset.itemId;
  const list = state[type];
  if (!Array.isArray(list)) return;

  const current = list.find((item) => item.id === itemId);
  const hasContent = current && Object.entries(current).some(([key, value]) => key !== "id" && String(value).trim());

  if (hasContent && !window.confirm("確定要刪除這筆資料嗎？")) return;

  state[type] = list.filter((item) => item.id !== itemId);
  if (state[type].length === 0) state[type].push(createEmptyItem(type));
  renderEditorList(type);
  scheduleStateUpdate(true);
}

function moveItem(element, direction) {
  if (!element) return;
  const type = element.dataset.itemType;
  const itemId = element.dataset.itemId;
  const list = state[type];
  if (!Array.isArray(list)) return;

  const index = list.findIndex((item) => item.id === itemId);
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return;

  [list[index], list[nextIndex]] = [list[nextIndex], list[index]];
  renderEditorList(type);
  scheduleStateUpdate(true);
}

function updateDynamicItemFromControl(control) {
  const root = control.closest("[data-item-type]");
  if (!root) return;

  const type = root.dataset.itemType;
  const item = state[type]?.find((entry) => entry.id === root.dataset.itemId);
  if (!item) return;

  item[control.dataset.itemField] = getControlValue(control);
  const index = state[type].findIndex((entry) => entry.id === item.id);
  root.querySelector(".dynamic-item-header strong").textContent = getItemEditorTitle(type, index, item);
}

function scheduleStateUpdate(immediate = false) {
  refs.saveStatus.textContent = "儲存中…";
  refs.saveStatus.classList.add("is-saving");

  window.clearTimeout(renderTimer);
  renderTimer = window.setTimeout(renderPreview, immediate ? 0 : 80);

  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveState, immediate ? 50 : 450);
}

function flushPendingSave() {
  window.clearTimeout(saveTimer);
  window.clearTimeout(renderTimer);
  saveState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    refs.saveStatus.textContent = "已自動儲存";
    refs.saveStatus.classList.remove("is-saving");
  } catch (error) {
    console.error(error);
    refs.saveStatus.textContent = "儲存失敗";
    refs.saveStatus.classList.remove("is-saving");
    showToast("瀏覽器儲存空間不足，請移除照片或先備份 JSON。", "error");
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return clone(defaultState);
    return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.warn("Unable to restore resume state", error);
    return clone(defaultState);
  }
}

function normalizeState(input) {
  const normalized = deepMerge(clone(defaultState), isRecord(input) ? input : {});
  normalized.version = STATE_VERSION;
  if (!isRecord(normalized.settings)) normalized.settings = clone(defaultState.settings);
  if (!isRecord(normalized.settings.visibility)) normalized.settings.visibility = clone(defaultState.settings.visibility);
  if (!isRecord(normalized.personal)) normalized.personal = clone(defaultState.personal);
  if (!isRecord(normalized.custom)) normalized.custom = clone(defaultState.custom);

  Object.keys(defaultState.personal).forEach((key) => {
    normalized.personal[key] = String(normalized.personal[key] || "");
  });
  normalized.summary = String(normalized.summary || "");
  normalized.skills = String(normalized.skills || "");
  normalized.custom.title = String(normalized.custom.title || "");
  normalized.custom.content = String(normalized.custom.content || "");
  normalized.custom.format = normalized.custom.format === "paragraph" ? "paragraph" : "bullets";

  ["experience", "education", "projects", "certifications", "languages"].forEach((type) => {
    if (!Array.isArray(normalized[type])) normalized[type] = [];
    const schema = createEmptyItem(type);
    normalized[type] = normalized[type].slice(0, 50).map((item) => {
      const source = item && typeof item === "object" && !Array.isArray(item) ? item : {};
      const result = { ...schema, ...source, id: String(source.id || uid()) };
      Object.keys(schema).forEach((key) => {
        if (key !== "id") result[key] = String(result[key] || "");
      });
      return result;
    });
    if (normalized[type].length === 0) normalized[type].push(createEmptyItem(type));
  });

  normalized.settings.showPhoto = Boolean(normalized.settings.showPhoto);
  normalized.settings.showIcons = Boolean(normalized.settings.showIcons);
  Object.keys(defaultState.settings.visibility).forEach((key) => {
    normalized.settings.visibility[key] = Boolean(normalized.settings.visibility[key]);
  });
  normalized.settings.accentColor = normalizeHex(normalized.settings.accentColor) || "#0f766e";
  if (!labels[normalized.settings.language]) normalized.settings.language = "zh";
  if (!["modern", "classic", "minimal"].includes(normalized.settings.template)) normalized.settings.template = "modern";
  if (!["compact", "normal", "comfortable"].includes(normalized.settings.fontScale)) normalized.settings.fontScale = "normal";

  return normalized;
}

function renderPreview() {
  const language = labels[state.settings.language] || labels.zh;
  const accent = normalizeHex(state.settings.accentColor) || "#0f766e";
  const hasContent = hasResumeContent();

  refs.preview.className = `resume-paper template-${state.settings.template} scale-${state.settings.fontScale}`;
  document.title = state.personal.name.trim()
    ? `${state.personal.name.trim()}｜萬用履歷產生器`
    : "萬用履歷產生器";
  refs.preview.style.setProperty("--resume-accent", accent);
  document.documentElement.style.setProperty("--accent", accent);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", accent);

  if (!hasContent) {
    refs.preview.innerHTML = `
      <div class="empty-preview">
        <div><strong>${escapeHtml(language.emptyTitle)}</strong>${escapeHtml(language.emptyText)}</div>
      </div>`;
    updatePageEstimate();
    return;
  }

  if (state.settings.template === "modern") {
    refs.preview.innerHTML = renderModernTemplate(language);
  } else if (state.settings.template === "classic") {
    refs.preview.innerHTML = renderClassicTemplate(language);
  } else {
    refs.preview.innerHTML = renderMinimalTemplate(language);
  }

  requestAnimationFrame(updatePageEstimate);
}

function renderModernTemplate(language) {
  const sidebarSections = [
    renderContactSection(language, true),
    renderSkillsSection(language),
    renderLanguagesSection(language, true),
    renderCertificationsSection(language, true),
  ].filter(Boolean).join("");

  const mainSections = [
    renderSummarySection(language),
    renderExperienceSection(language),
    renderEducationSection(language),
    renderProjectsSection(language),
    renderCustomSection(),
  ].filter(Boolean).join("");

  return `
    <div class="resume-root">
      <aside class="resume-sidebar">
        ${renderPhoto()}
        <h1 class="resume-name">${textOrPlaceholder(state.personal.name, state.settings.language === "en" ? "Your Name" : "姓名")}</h1>
        ${state.personal.title ? `<p class="resume-role">${escapeHtml(state.personal.title)}</p>` : ""}
        ${sidebarSections}
      </aside>
      <main class="resume-main">${mainSections}</main>
    </div>`;
}

function renderClassicTemplate(language) {
  const sections = [
    renderSummarySection(language),
    renderExperienceSection(language),
    renderEducationSection(language),
    renderSkillsSection(language),
    renderProjectsSection(language),
    renderCertificationsSection(language),
    renderLanguagesSection(language),
    renderCustomSection(),
  ].filter(Boolean).join("");

  return `
    <div class="resume-root">
      <header class="resume-header">
        ${renderPhoto()}
        <h1 class="resume-name">${textOrPlaceholder(state.personal.name, state.settings.language === "en" ? "Your Name" : "姓名")}</h1>
        ${state.personal.title ? `<p class="resume-role">${escapeHtml(state.personal.title)}</p>` : ""}
        ${renderContactList(language)}
      </header>
      <main class="resume-content">${sections}</main>
    </div>`;
}

function renderMinimalTemplate(language) {
  const sections = [
    renderSummarySection(language),
    renderExperienceSection(language),
    renderProjectsSection(language),
    renderEducationSection(language),
    renderSkillsSection(language),
    renderCertificationsSection(language),
    renderLanguagesSection(language),
    renderCustomSection(),
  ].filter(Boolean).join("");

  return `
    <div class="resume-root">
      <header class="resume-header">
        <div>
          <h1 class="resume-name">${textOrPlaceholder(state.personal.name, state.settings.language === "en" ? "Your Name" : "姓名")}</h1>
          ${state.personal.title ? `<p class="resume-role">${escapeHtml(state.personal.title)}</p>` : ""}
          ${renderContactList(language)}
        </div>
        ${renderPhoto()}
      </header>
      <main class="resume-content">${sections}</main>
    </div>`;
}

function renderPhoto() {
  if (!state.settings.showPhoto || !state.personal.photo) return "";
  return `<img class="resume-photo" src="${escapeAttribute(state.personal.photo)}" alt="${escapeAttribute(state.personal.name || "Profile photo")}" />`;
}

function renderContactSection(language) {
  const list = renderContactList(language);
  if (!list) return "";
  return `<section class="resume-section"><h2 class="resume-section-title">${escapeHtml(language.contact)}</h2>${list}</section>`;
}

function renderContactList(language) {
  const p = state.personal;
  const icon = (value) => state.settings.showIcons ? `<span class="contact-icon" aria-hidden="true">${value}</span>` : "";
  const items = [];

  if (p.email) items.push(`<li>${icon("@")}<a href="mailto:${escapeAttribute(p.email)}">${escapeHtml(p.email)}</a></li>`);
  if (p.phone) items.push(`<li>${icon("T")}<a href="tel:${escapeAttribute(p.phone.replace(/\s/g, ""))}">${escapeHtml(p.phone)}</a></li>`);
  if (p.location) items.push(`<li>${icon("⌖")}<span>${escapeHtml(p.location)}</span></li>`);
  if (p.website) items.push(renderContactLink(icon("W"), p.website, language.website));
  if (p.linkedin) items.push(renderContactLink(icon("in"), p.linkedin, language.linkedin));
  if (p.github) items.push(renderContactLink(icon("GH"), p.github, language.github));

  return items.length ? `<ul class="resume-contact-list">${items.join("")}</ul>` : "";
}

function renderContactLink(iconHtml, value, fallbackLabel) {
  const href = safeUrl(value);
  const label = displayUrl(value) || fallbackLabel;
  if (href === "#") return `<li>${iconHtml}<span>${escapeHtml(label)}</span></li>`;
  return `<li>${iconHtml}<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a></li>`;
}

function renderSummarySection(language) {
  if (!state.settings.visibility.summary || !state.summary.trim()) return "";
  return renderSection(language.summary, `<p class="resume-description">${formatParagraph(state.summary)}</p>`);
}

function renderExperienceSection(language) {
  if (!state.settings.visibility.experience) return "";
  const items = state.experience.filter((item) => hasItemContent(item));
  if (!items.length) return "";

  const html = items.map((item) => `
    <article class="resume-item">
      <div class="resume-item-head">
        <div>
          ${item.role ? `<h3>${escapeHtml(item.role)}</h3>` : ""}
          ${item.company ? `<div class="resume-item-subtitle">${escapeHtml(item.company)}${item.location ? `・${escapeHtml(item.location)}` : ""}</div>` : ""}
        </div>
        ${renderDateRange(item.start, item.end)}
      </div>
      ${renderBulletDescription(item.description)}
    </article>`).join("");

  return renderSection(language.experience, html);
}

function renderEducationSection(language) {
  if (!state.settings.visibility.education) return "";
  const items = state.education.filter((item) => hasItemContent(item));
  if (!items.length) return "";

  const html = items.map((item) => `
    <article class="resume-item">
      <div class="resume-item-head">
        <div>
          ${item.degree ? `<h3>${escapeHtml(item.degree)}</h3>` : ""}
          ${item.school ? `<div class="resume-item-subtitle">${escapeHtml(item.school)}</div>` : ""}
        </div>
        ${renderDateRange(item.start, item.end)}
      </div>
      ${item.description ? `<p class="resume-description">${formatParagraph(item.description)}</p>` : ""}
    </article>`).join("");

  return renderSection(language.education, html);
}

function renderSkillsSection(language) {
  if (!state.settings.visibility.skills || !state.skills.trim()) return "";
  const rows = parseLines(state.skills).map((line) => {
    const separatorIndex = Math.max(line.indexOf("："), line.indexOf(":"));
    let category = "";
    let skillText = line;

    if (separatorIndex > 0) {
      category = line.slice(0, separatorIndex).trim();
      skillText = line.slice(separatorIndex + 1).trim();
    }

    const skills = skillText.split(/[、,，]/).map((item) => item.trim()).filter(Boolean);
    const tags = skills.map((skill) => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join("");
    return `<li>${category ? `<div class="skill-label">${escapeHtml(category)}</div>` : ""}<div class="skill-tags">${tags}</div></li>`;
  }).join("");

  return renderSection(language.skills, `<ul class="resume-skill-list">${rows}</ul>`);
}

function renderProjectsSection(language) {
  if (!state.settings.visibility.projects) return "";
  const items = state.projects.filter((item) => hasItemContent(item));
  if (!items.length) return "";

  const html = items.map((item) => {
    const name = item.url
      ? `<a href="${escapeAttribute(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name || displayUrl(item.url))}</a>`
      : escapeHtml(item.name);

    return `
      <article class="resume-item">
        <div class="resume-item-head">
          <div>
            ${name ? `<h3>${name}</h3>` : ""}
            ${item.tech ? `<div class="resume-item-subtitle">${escapeHtml(item.tech)}</div>` : ""}
          </div>
          ${item.url ? `<div class="resume-meta">${escapeHtml(displayUrl(item.url))}</div>` : ""}
        </div>
        ${renderBulletDescription(item.description)}
      </article>`;
  }).join("");

  return renderSection(language.projects, html);
}

function renderCertificationsSection(language) {
  if (!state.settings.visibility.certifications) return "";
  const items = state.certifications.filter((item) => hasItemContent(item));
  if (!items.length) return "";

  const html = items.map((item) => `
    <article class="resume-item">
      <div class="resume-item-head">
        <div>${item.name ? `<h3>${escapeHtml(item.name)}</h3>` : ""}</div>
        ${item.detail ? `<div class="resume-meta">${escapeHtml(item.detail)}</div>` : ""}
      </div>
    </article>`).join("");

  return renderSection(language.certifications, html);
}

function renderLanguagesSection(language) {
  if (!state.settings.visibility.languages) return "";
  const items = state.languages.filter((item) => hasItemContent(item));
  if (!items.length) return "";

  const html = `<ul class="resume-skill-list">${items.map((item) => `
    <li><span class="skill-label">${escapeHtml(item.name)}</span>${item.level ? ` — ${escapeHtml(item.level)}` : ""}</li>`).join("")}</ul>`;

  return renderSection(language.languages, html);
}

function renderCustomSection() {
  if (!state.settings.visibility.custom || !state.custom.title.trim() || !state.custom.content.trim()) return "";

  const content = state.custom.format === "paragraph"
    ? `<p class="resume-description">${formatParagraph(state.custom.content)}</p>`
    : `<ul>${parseLines(state.custom.content).map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;

  return renderSection(state.custom.title, content);
}

function renderSection(title, content) {
  return `<section class="resume-section"><h2 class="resume-section-title">${escapeHtml(title)}</h2>${content}</section>`;
}

function renderDateRange(start, end) {
  const values = [start, end].map((value) => String(value || "").trim()).filter(Boolean);
  return values.length ? `<div class="resume-meta">${escapeHtml(values.join(" – "))}</div>` : "";
}

function renderBulletDescription(value) {
  const lines = parseLines(value);
  if (!lines.length) return "";
  if (lines.length === 1) return `<p class="resume-description">${escapeHtml(lines[0])}</p>`;
  return `<ul class="resume-description">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
}

function analyzeResume() {
  const experienceOrProject = state.experience.some(hasItemContent) || state.projects.some(hasItemContent);
  const measurableText = [
    state.summary,
    ...state.experience.map((item) => item.description),
    ...state.projects.map((item) => item.description),
  ].join(" ");
  const isEnglish = state.settings.language === "en";
  const checks = [
    { label: isEnglish ? "name" : "姓名", pass: Boolean(state.personal.name.trim()) },
    { label: isEnglish ? "target role" : "目標職位", pass: Boolean(state.personal.title.trim()) },
    { label: isEnglish ? "contact" : "聯絡方式", pass: Boolean(state.personal.email.trim() || state.personal.phone.trim()) },
    { label: isEnglish ? "profile summary" : "專業摘要", pass: state.summary.trim().length >= 30 },
    { label: isEnglish ? "experience or project" : "經歷或專案", pass: experienceOrProject },
    { label: isEnglish ? "measurable result" : "量化成果", pass: /\d|%|％|提升|降低|成長|節省|縮短|增加/.test(measurableText) },
  ];
  const passed = checks.filter((check) => check.pass).length;
  return {
    checks,
    passed,
    total: checks.length,
    score: Math.round((passed / checks.length) * 100),
    missing: checks.filter((check) => !check.pass).map((check) => check.label),
  };
}

function updateResumeHealth(pages = 1) {
  const result = analyzeResume();
  const isEnglish = state.settings.language === "en";
  const pageWarning = pages > 1
    ? (isEnglish ? "Consider shortening to one page." : "建議精簡為一頁。")
    : "";
  const missingText = result.missing.length
    ? `${isEnglish ? "Missing" : "待補"}：${result.missing.join(isEnglish ? ", " : "、")}`
    : (isEnglish ? "Core content is complete." : "核心內容完整。");

  refs.resumeHealth.textContent = `${isEnglish ? "Check" : "健檢"} ${result.passed}/${result.total}`;
  refs.resumeHealth.title = [missingText, pageWarning].filter(Boolean).join(" ");
  refs.resumeHealth.classList.toggle("is-good", result.passed >= 5 && pages <= 1);
  refs.resumeHealth.classList.toggle("is-warning", result.passed < 4 || pages > 1);
  refs.completionLabel.textContent = `${isEnglish ? "Resume completion" : "履歷完成度"} ${result.score}%`;
  refs.completionHint.textContent = result.missing.length
    ? `${isEnglish ? "Next" : "下一步"}：${result.missing[0]}`
    : (isEnglish ? "Ready to export" : "可以匯出了");
  refs.completionBar.style.width = `${result.score}%`;
  refs.completionTrack.setAttribute("aria-valuenow", String(result.score));
}

function updatePageEstimate() {
  const root = refs.preview.querySelector(".resume-root, .empty-preview");
  if (!root) return;
  const pages = Math.max(1, Math.ceil(Math.max(0, root.scrollHeight - 8) / A4_HEIGHT_PX));
  refs.pageEstimate.textContent = state.settings.language === "en"
    ? `Estimated ${pages} page${pages > 1 ? "s" : ""}`
    : `預估 ${pages} 頁`;
  refs.pageEstimate.title = pages > 1 ? "可改用精簡字級、縮短內容或關閉部分區段" : "內容適合單頁履歷";
  refs.pageEstimate.classList.toggle("is-warning", pages > 1);
  updateResumeHealth(pages);
}

function setZoom(value) {
  zoom = Math.min(1.25, Math.max(0.35, Number(value.toFixed(2))));
  document.documentElement.style.setProperty("--resume-zoom", zoom);
  refs.zoomValue.textContent = `${Math.round(zoom * 100)}%`;
}

function fitPreview() {
  const available = Math.max(280, refs.previewStage.clientWidth - 32);
  const resumeWidth = refs.preview.offsetWidth || 794;
  setZoom(Math.min(1, available / resumeWidth));
}

function updatePhotoEditor() {
  if (state.personal.photo) {
    refs.photoPreview.textContent = "";
    refs.photoPreview.style.backgroundImage = `url("${state.personal.photo.replace(/"/g, "%22")}")`;
  } else {
    refs.photoPreview.textContent = "照片";
    refs.photoPreview.style.backgroundImage = "none";
  }
}

async function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showToast("請選擇 JPG、PNG 或 WebP 圖片。", "error");
    return;
  }

  if (file.size > MAX_PHOTO_INPUT_BYTES) {
    showToast("照片超過 8 MB，請先縮小後再上傳。", "error");
    return;
  }

  try {
    showToast("正在最佳化照片…");
    state.personal.photo = await compressPhoto(file);
    state.settings.showPhoto = true;
    hydrateStaticFields();
    updatePhotoEditor();
    scheduleStateUpdate(true);
    showToast("照片已自動縮圖並壓縮。", "success");
  } catch (error) {
    console.error(error);
    showToast("照片處理失敗，請改用 JPG、PNG 或 WebP。", "error");
  }
}

async function compressPhoto(file) {
  const image = await loadImageSource(file);
  const sourceWidth = image.width || image.naturalWidth;
  const sourceHeight = image.height || image.naturalHeight;
  const scale = Math.min(1, PHOTO_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sourceWidth * scale));
  canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("Canvas unavailable");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close?.();

  let quality = 0.88;
  let blob = await canvasToBlob(canvas, "image/webp", quality);
  if (!blob) blob = await canvasToBlob(canvas, "image/jpeg", quality);
  while (blob && blob.size > MAX_STORED_PHOTO_BYTES && quality > 0.5) {
    quality -= 0.08;
    blob = await canvasToBlob(canvas, blob.type || "image/jpeg", quality);
  }
  if (!blob) throw new Error("Photo compression failed");
  return blobToDataUrl(blob);
}

async function loadImageSource(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch (error) {
      console.warn("createImageBitmap failed; falling back to Image", error);
    }
  }
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = objectUrl;
    });
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function removePhoto() {
  if (!state.personal.photo) return;
  state.personal.photo = "";
  updatePhotoEditor();
  scheduleStateUpdate(true);
}

function activateAtsMode() {
  state.settings.template = "classic";
  state.settings.fontScale = "compact";
  state.settings.showPhoto = false;
  state.settings.showIcons = false;
  state.settings.accentColor = "#334155";
  refreshEntireEditor();
  scheduleStateUpdate(true);
  showToast("已套用 ATS 友善設定：單欄、精簡字級、無照片與圖示。", "success");
}

function exportPlainText() {
  const text = buildPlainTextResume();
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const filename = `${slugify(state.personal.name || "resume")}-${new Date().toISOString().slice(0, 10)}.txt`;
  downloadBlob(blob, filename);
  showToast("ATS 純文字履歷已下載。", "success");
}

function buildPlainTextResume() {
  const language = labels[state.settings.language] || labels.zh;
  const lines = [];
  const pushSection = (title, content) => {
    const body = (Array.isArray(content) ? content : [content]).map((value) => String(value || "").trim()).filter(Boolean);
    if (!body.length) return;
    if (lines.length) lines.push("");
    lines.push(title.toUpperCase(), ...body);
  };

  lines.push(state.personal.name.trim() || (state.settings.language === "en" ? "Your Name" : "姓名"));
  if (state.personal.title.trim()) lines.push(state.personal.title.trim());
  const contacts = [
    state.personal.email,
    state.personal.phone,
    state.personal.location,
    state.personal.website,
    state.personal.linkedin,
    state.personal.github,
  ].map((value) => String(value || "").trim()).filter(Boolean);
  if (contacts.length) lines.push(contacts.join(" | "));

  if (state.settings.visibility.summary && state.summary.trim()) pushSection(language.summary, state.summary.trim());
  if (state.settings.visibility.experience) {
    pushSection(language.experience, state.experience.filter(hasItemContent).flatMap((item) => [
      [item.role, item.company].filter(Boolean).join(" — "),
      [item.start, item.end, item.location].filter(Boolean).join(" | "),
      ...parseLines(item.description).map((line) => `• ${line}`),
      "",
    ]));
  }
  if (state.settings.visibility.education) {
    pushSection(language.education, state.education.filter(hasItemContent).flatMap((item) => [
      [item.degree, item.school].filter(Boolean).join(" — "),
      [item.start, item.end].filter(Boolean).join(" | "),
      item.description,
      "",
    ]));
  }
  if (state.settings.visibility.skills && state.skills.trim()) pushSection(language.skills, parseLines(state.skills));
  if (state.settings.visibility.projects) {
    pushSection(language.projects, state.projects.filter(hasItemContent).flatMap((item) => [
      [item.name, item.tech].filter(Boolean).join(" — "),
      item.url,
      ...parseLines(item.description).map((line) => `• ${line}`),
      "",
    ]));
  }
  if (state.settings.visibility.certifications) {
    pushSection(language.certifications, state.certifications.filter(hasItemContent).map((item) => [item.name, item.detail].filter(Boolean).join(" — ")));
  }
  if (state.settings.visibility.languages) {
    pushSection(language.languages, state.languages.filter(hasItemContent).map((item) => [item.name, item.level].filter(Boolean).join(" — ")));
  }
  if (state.settings.visibility.custom && state.custom.title.trim() && state.custom.content.trim()) {
    const content = state.custom.format === "bullets"
      ? parseLines(state.custom.content).map((line) => `• ${line}`)
      : state.custom.content.trim();
    pushSection(state.custom.title.trim(), content);
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const filename = `${slugify(state.personal.name || "resume")}-${new Date().toISOString().slice(0, 10)}.json`;
  downloadBlob(blob, filename);
  showToast("履歷 JSON 備份已下載。", "success");
}

function handleJsonImport(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (file.size > MAX_JSON_BYTES) {
    showToast("JSON 檔案超過 5 MB，無法匯入。", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(String(reader.result || ""));
      if (!imported || typeof imported !== "object" || Array.isArray(imported)) {
        throw new Error("Invalid resume payload");
      }
      state = normalizeState(imported);
      refreshEntireEditor();
      saveState();
      showToast("履歷資料匯入成功。", "success");
    } catch (error) {
      console.error(error);
      showToast("JSON 格式不正確，無法匯入。", "error");
    }
  };
  reader.onerror = () => showToast("檔案讀取失敗，請重試。", "error");
  reader.readAsText(file, "utf-8");
}

function loadSample() {
  if (hasResumeContent() && !window.confirm("載入範例會取代目前內容，是否繼續？")) return;
  state = normalizeState(clone(sampleState));
  refreshEntireEditor();
  saveState();
  showToast("已載入完整履歷範例。", "success");
}

function resetAll() {
  if (!window.confirm("確定要清除全部履歷資料嗎？此操作無法復原。")) return;
  state = clone(defaultState);
  refreshEntireEditor();
  localStorage.removeItem(STORAGE_KEY);
  saveState();
  showToast("履歷已重設。", "success");
}

function refreshEntireEditor() {
  hydrateStaticFields();
  renderDynamicEditors();
  updatePhotoEditor();
  updateSummaryCount();
  renderPreview();
}

function updateSummaryCount() {
  refs.summaryCount.textContent = String(state.summary.length);
}

function setMobileView(view) {
  document.body.classList.toggle("mobile-preview", view === "preview");
  document.querySelectorAll("[data-mobile-view]").forEach((button) => {
    const active = button.dataset.mobileView === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (view === "preview") requestAnimationFrame(fitPreview);
}

function syncAccentControls(value) {
  const normalized = normalizeHex(value);
  if (!normalized) return;
  const colorInput = document.getElementById("accentColorInput");
  const textInput = document.getElementById("accentColorText");
  if (colorInput.value !== normalized) colorInput.value = normalized;
  if (textInput.value !== normalized) textInput.value = normalized;
  document.documentElement.style.setProperty("--accent", normalized);
}

function hasResumeContent() {
  const p = state.personal;
  return Boolean(
    Object.values(p).some((value) => String(value || "").trim()) ||
    state.summary.trim() ||
    state.skills.trim() ||
    state.custom.content.trim() ||
    ["experience", "education", "projects", "certifications", "languages"].some((type) =>
      state[type].some((item) => hasItemContent(item))
    )
  );
}

function hasItemContent(item) {
  return Boolean(item && Object.entries(item).some(([key, value]) => key !== "id" && String(value || "").trim()));
}

function createEmptyItem(type) {
  const base = { id: uid() };
  const schemas = {
    experience: { company: "", role: "", start: "", end: "", location: "", description: "" },
    education: { school: "", degree: "", start: "", end: "", description: "" },
    projects: { name: "", tech: "", url: "", description: "" },
    certifications: { name: "", detail: "" },
    languages: { name: "", level: "" },
  };
  return { ...base, ...(schemas[type] || {}) };
}

function parseLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function formatParagraph(value) {
  return escapeHtml(String(value || "").trim()).replace(/\r?\n/g, "<br>");
}

function textOrPlaceholder(value, placeholder) {
  return escapeHtml(String(value || "").trim() || placeholder);
}

function safeUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "#";
  const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withProtocol);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "#";
  } catch {
    return "#";
  }
}

function displayUrl(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function normalizeHex(value) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw.slice(1).split("").map((char) => char + char).join("")}`.toLowerCase();
  }
  return "";
}

function getControlValue(control) {
  return control.type === "checkbox" ? control.checked : control.value;
}

function setControlValue(control, value) {
  if (control.type === "checkbox") {
    control.checked = Boolean(value);
  } else {
    control.value = value ?? "";
  }
}

function getByPath(object, path) {
  return path.split(".").reduce((current, key) => current?.[key], object);
}

function setByPath(object, path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key] || typeof current[key] !== "object") current[key] = {};
    return current[key];
  }, object);
  target[last] = value;
}

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function deepMerge(target, source) {
  if (!source || typeof source !== "object") return target;
  Object.keys(source).forEach((key) => {
    if (["__proto__", "prototype", "constructor"].includes(key)) return;
    const sourceValue = source[key];
    if (Array.isArray(sourceValue)) {
      target[key] = sourceValue;
    } else if (sourceValue && typeof sourceValue === "object") {
      target[key] = deepMerge(target[key] && typeof target[key] === "object" ? target[key] : {}, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });
  return target;
}

function clone(value) {
  return typeof structuredClone === "function"
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function uid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function slugify(value) {
  const slug = String(value || "resume")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "resume";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type === "error" ? "error" : ""}`;
  toast.textContent = message;
  refs.toastRegion.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3200);
}

function debounce(callback, delay) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => callback(...args), delay);
  };
}
