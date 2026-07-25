const MODELS = [
  {
    id: "fablechat-1",
    crackName: "페이블챗 1.0",
    provider: "anthropic",
    providerLabel: "Anthropic",
    actualName: "Claude Fable 5",
    apiModel: "claude-fable-5",
    color: "#ff8a42",
    glow: "rgba(255, 138, 66, .24)",
    thinkingLabel: "최저 추론 · 적응형 항상 켜짐 · effort LOW",
    anthropicMode: "always-adaptive",
    supportsEffort: true,
  },
  {
    id: "hyperchat-3",
    crackName: "하이퍼챗 3.0",
    provider: "anthropic",
    providerLabel: "Anthropic",
    actualName: "Claude Opus 5",
    apiModel: "claude-opus-5",
    color: "#32d36b",
    glow: "rgba(50, 211, 107, .22)",
    thinkingLabel: "최저 추론 · adaptive · effort LOW",
    anthropicMode: "adaptive-low",
    supportsEffort: true,
  },
  {
    id: "hyperchat-2",
    crackName: "하이퍼챗 2.0",
    provider: "anthropic",
    providerLabel: "Anthropic",
    actualName: "Claude Opus 4.8",
    apiModel: "claude-opus-4-8",
    color: "#24c9db",
    glow: "rgba(36, 201, 219, .22)",
    thinkingLabel: "최저 추론 · adaptive · effort LOW",
    anthropicMode: "adaptive-low",
    supportsEffort: true,
  },
  {
    id: "hyperchat-1-5",
    crackName: "하이퍼챗 1.5",
    provider: "anthropic",
    providerLabel: "Anthropic",
    actualName: "Claude Opus 4.7",
    apiModel: "claude-opus-4-7",
    color: "#ff665d",
    glow: "rgba(255, 102, 93, .22)",
    thinkingLabel: "최저 추론 · adaptive · effort LOW",
    anthropicMode: "adaptive-low",
    supportsEffort: true,
  },
  {
    id: "hyperchat-1",
    crackName: "하이퍼챗 1.0",
    provider: "anthropic",
    providerLabel: "Anthropic",
    actualName: "Claude Opus 4.6",
    apiModel: "claude-opus-4-6",
    color: "#ff4d56",
    glow: "rgba(255, 77, 86, .22)",
    thinkingLabel: "최저 추론 · adaptive · effort LOW",
    anthropicMode: "adaptive-low",
    supportsEffort: true,
  },
  {
    id: "superchat-3",
    crackName: "슈퍼챗 3.0",
    provider: "anthropic",
    providerLabel: "Anthropic",
    actualName: "Claude Sonnet 5",
    apiModel: "claude-sonnet-5",
    color: "#ff8b32",
    glow: "rgba(255, 139, 50, .22)",
    thinkingLabel: "최저 추론 · adaptive · effort LOW",
    anthropicMode: "adaptive-low",
    supportsEffort: true,
  },
  {
    id: "superchat-2-5",
    crackName: "슈퍼챗 2.5",
    provider: "anthropic",
    providerLabel: "Anthropic",
    actualName: "Claude Sonnet 4.6",
    apiModel: "claude-sonnet-4-6",
    color: "#ff4e8a",
    glow: "rgba(255, 78, 138, .22)",
    thinkingLabel: "최저 추론 · adaptive · effort LOW",
    anthropicMode: "adaptive-low",
    supportsEffort: true,
  },
  {
    id: "superchat-2",
    crackName: "슈퍼챗 2.0",
    provider: "anthropic",
    providerLabel: "Anthropic",
    actualName: "Claude Sonnet 4.5",
    apiModel: "claude-sonnet-4-5-20250929",
    color: "#9e5df6",
    glow: "rgba(158, 93, 246, .22)",
    thinkingLabel: "최저 추론 · budget 1,024",
    anthropicMode: "manual-min",
    supportsEffort: false,
  },
  {
    id: "prochat-2-5",
    crackName: "프로챗 2.5",
    provider: "gemini",
    providerLabel: "Google",
    actualName: "Gemini 3.1 Pro",
    apiModel: "gemini-3.1-pro-preview",
    color: "#f4b619",
    glow: "rgba(244, 182, 25, .22)",
    thinkingLabel: "최저 추론 · thinking LOW",
    geminiThinking: { thinkingLevel: "low" },
  },
  {
    id: "prochat-1",
    crackName: "프로챗 1.0",
    provider: "gemini",
    providerLabel: "Google",
    actualName: "Gemini 2.5 Pro",
    apiModel: "gemini-2.5-pro",
    color: "#ff7a18",
    glow: "rgba(255, 122, 24, .22)",
    thinkingLabel: "최저 추론 · budget 128",
    geminiThinking: { thinkingBudget: 128 },
  },
  {
    id: "powerchat",
    crackName: "파워챗",
    provider: "gemini",
    providerLabel: "Google",
    actualName: "Gemini 2.5 Flash",
    apiModel: "gemini-2.5-flash",
    color: "#18c65b",
    glow: "rgba(24, 198, 91, .22)",
    thinkingLabel: "최저 추론 · budget 128",
    geminiThinking: { thinkingBudget: 128 },
  },
];

const STORAGE = {
  settings: "crack-server-check.settings.v1",
  selection: "crack-server-check.selection.v1",
  results: "crack-server-check.results.v1",
  history: "crack-server-check.history.v1",
};

const DEFAULT_SETTINGS = {
  anthropicKey: "",
  geminiKey: "",
  persistKeys: true,
  outputTokens: 128,
};

const state = {
  settings: loadJson(STORAGE.settings, DEFAULT_SETTINGS),
  selected: new Set(loadJson(STORAGE.selection, MODELS.map((model) => model.id))),
  results: loadJson(STORAGE.results, {}),
  history: loadJson(STORAGE.history, []),
  errors: {},
  running: new Set(),
  progress: {},
  pickerDraft: new Set(),
  toastTimer: null,
};

state.settings = { ...DEFAULT_SETTINGS, ...state.settings };
delete state.settings.repetitions;
if (!Array.isArray(state.history)) state.history = [];

const elements = {
  modelGrid: document.querySelector("#modelGrid"),
  emptyState: document.querySelector("#emptyState"),
  selectedCount: document.querySelector("#selectedCount"),
  historyCount: document.querySelector("#historyCount"),
  keySummary: document.querySelector("#keySummary"),
  runAllButton: document.querySelector("#runAllButton"),
  clearResults: document.querySelector("#clearResults"),
  settingsDialog: document.querySelector("#settingsDialog"),
  modelPickerDialog: document.querySelector("#modelPickerDialog"),
  historyDialog: document.querySelector("#historyDialog"),
  historySummary: document.querySelector("#historySummary"),
  historyList: document.querySelector("#historyList"),
  settingsForm: document.querySelector("#settingsForm"),
  anthropicKey: document.querySelector("#anthropicKey"),
  geminiKey: document.querySelector("#geminiKey"),
  persistKeys: document.querySelector("#persistKeys"),
  outputTokens: document.querySelector("#outputTokens"),
  modelPickerList: document.querySelector("#modelPickerList"),
  toast: document.querySelector("#toast"),
};

initialize();

function initialize() {
  bindEvents();
  populateSettingsForm();
  renderModelPicker();
  render();
}

function bindEvents() {
  document.querySelector("#openSettings").addEventListener("click", openSettings);
  document.querySelector("#openModelPicker").addEventListener("click", openModelPicker);
  document.querySelector("#openHistory").addEventListener("click", openHistory);
  document.querySelectorAll("[data-open-model-picker]").forEach((button) => button.addEventListener("click", openModelPicker));
  document.querySelectorAll(".close-dialog").forEach((button) => {
    button.addEventListener("click", () => button.closest("dialog").close());
  });

  [elements.settingsDialog, elements.modelPickerDialog, elements.historyDialog].forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  document.querySelectorAll(".reveal-key").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.querySelector(`#${button.dataset.target}`);
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  elements.settingsForm.addEventListener("submit", saveSettingsFromForm);
  document.querySelector("#deleteSavedKeys").addEventListener("click", deleteSavedKeys);
  document.querySelector("#deleteHistory").addEventListener("click", deleteHistory);
  document.querySelector("#selectAllModels").addEventListener("click", () => updatePickerDraft(MODELS.map((model) => model.id)));
  document.querySelector("#selectNoModels").addEventListener("click", () => updatePickerDraft([]));
  document.querySelector("#invertModels").addEventListener("click", () => {
    updatePickerDraft(MODELS.filter((model) => !state.pickerDraft.has(model.id)).map((model) => model.id));
  });
  document.querySelector("#applyModelSelection").addEventListener("click", applyModelSelection);
  elements.runAllButton.addEventListener("click", runSelectedModels);
  elements.clearResults.addEventListener("click", clearResults);

  elements.modelGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-measure-model]");
    if (!button) return;
    runModel(button.dataset.measureModel);
  });
}

function populateSettingsForm() {
  elements.anthropicKey.value = state.settings.anthropicKey || "";
  elements.geminiKey.value = state.settings.geminiKey || "";
  elements.persistKeys.checked = Boolean(state.settings.persistKeys);
  elements.outputTokens.value = String(state.settings.outputTokens);
}

function openSettings() {
  populateSettingsForm();
  elements.settingsDialog.showModal();
}

function openModelPicker() {
  state.pickerDraft = new Set(state.selected);
  syncPickerChecks();
  elements.modelPickerDialog.showModal();
}

function saveSettingsFromForm(event) {
  event.preventDefault();
  const next = {
    anthropicKey: elements.anthropicKey.value.trim(),
    geminiKey: elements.geminiKey.value.trim(),
    persistKeys: elements.persistKeys.checked,
    outputTokens: Number(elements.outputTokens.value),
  };

  state.settings = next;
  if (next.persistKeys) {
    localStorage.setItem(STORAGE.settings, JSON.stringify(next));
  } else {
    localStorage.setItem(
      STORAGE.settings,
      JSON.stringify({ ...next, anthropicKey: "", geminiKey: "" }),
    );
  }

  elements.settingsDialog.close();
  render();
  showToast(next.persistKeys ? "설정을 이 브라우저에 저장했습니다." : "키는 현재 탭의 메모리에만 유지됩니다.");
}

function deleteSavedKeys() {
  state.settings.anthropicKey = "";
  state.settings.geminiKey = "";
  elements.anthropicKey.value = "";
  elements.geminiKey.value = "";
  localStorage.setItem(STORAGE.settings, JSON.stringify({ ...state.settings, anthropicKey: "", geminiKey: "" }));
  render();
  showToast("저장된 API 키를 삭제했습니다.");
}

function renderModelPicker() {
  elements.modelPickerList.innerHTML = MODELS.map((model) => `
    <label class="picker-item" style="--item-color:${model.color}">
      <input type="checkbox" value="${model.id}" />
      <span class="picker-check">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4 10-10" /></svg>
      </span>
      <span class="picker-copy">
        <strong>${escapeHtml(model.crackName)}</strong>
        <small>${escapeHtml(model.actualName)} · ${escapeHtml(model.providerLabel)}</small>
      </span>
    </label>
  `).join("");

  elements.modelPickerList.addEventListener("change", (event) => {
    const input = event.target.closest("input[type=checkbox]");
    if (!input) return;
    if (input.checked) state.pickerDraft.add(input.value);
    else state.pickerDraft.delete(input.value);
  });
}

function syncPickerChecks() {
  elements.modelPickerList.querySelectorAll("input[type=checkbox]").forEach((input) => {
    input.checked = state.pickerDraft.has(input.value);
  });
}

function updatePickerDraft(ids) {
  state.pickerDraft = new Set(ids);
  syncPickerChecks();
}

function applyModelSelection() {
  state.selected = new Set(state.pickerDraft);
  localStorage.setItem(STORAGE.selection, JSON.stringify([...state.selected]));
  elements.modelPickerDialog.close();
  render();
}

function render() {
  const visibleModels = MODELS.filter((model) => state.selected.has(model.id));
  elements.selectedCount.textContent = String(visibleModels.length);
  elements.historyCount.textContent = String(state.history.length);
  elements.emptyState.hidden = visibleModels.length > 0;
  elements.modelGrid.hidden = visibleModels.length === 0;
  elements.modelGrid.innerHTML = visibleModels.map(renderModelCard).join("");

  const hasAnthropic = Boolean(state.settings.anthropicKey);
  const hasGemini = Boolean(state.settings.geminiKey);
  elements.keySummary.textContent = hasAnthropic && hasGemini
    ? "Anthropic · Gemini 키 설정됨"
    : hasAnthropic
      ? "Anthropic 키만 설정됨"
      : hasGemini
        ? "Gemini 키만 설정됨"
        : "API 키를 설정해 주세요";

  const anyRunning = state.running.size > 0;
  elements.runAllButton.disabled = anyRunning || visibleModels.length === 0;
  elements.runAllButton.querySelector("span:last-child").textContent = anyRunning ? "측정 진행 중…" : "선택 모델 전체 조회";
}

function renderModelCard(model) {
  const result = state.results[model.id];
  const error = state.errors[model.id];
  const running = state.running.has(model.id);
  const progress = state.progress[model.id];
  const status = running
    ? { key: "measuring", label: progress || "공식 API 응답 대기 중" }
    : error
      ? { key: "error", label: "측정 실패" }
      : result
        ? statusFromScore(result.score)
        : { key: "idle", label: "아직 측정하지 않음" };

  const score = result ? Math.round(result.score) : 0;
  const ringColor = result ? scoreColor(score) : "var(--muted)";
  const updated = result ? formatRelativeTime(result.measuredAt) : "—";

  return `
    <article class="model-card glass-panel ${running ? "running" : ""}" style="--model-color:${model.color};--model-glow:${model.glow}">
      <div class="card-top">
        <div class="model-identity">
          <div class="model-tier">
            <span class="tier-orb" aria-hidden="true"></span>
            <strong>${escapeHtml(model.crackName)}</strong>
            <span class="model-tier-badge">${escapeHtml(model.providerLabel)}</span>
          </div>
          <h3>${escapeHtml(model.actualName)}</h3>
          <p>${escapeHtml(model.apiModel)}</p>
        </div>
        <div class="score-ring" style="--score:${score};--ring-color:${ringColor}" aria-label="IGX 점수 ${score}점">
          <div class="score-ring-inner">
            <strong>${result ? score : "—"}</strong>
            <small>IGX SCORE</small>
          </div>
        </div>
      </div>

      <div class="status-row ${status.key}">
        <span class="status-dot" aria-hidden="true"></span>
        <span>${escapeHtml(status.label)}${result ? ` · ${updated}` : ""}</span>
      </div>

      <div class="metrics">
        ${metric("응답 시작", result ? formatSeconds(result.latencyMs) : "—")}
        ${metric("생성 속도", result ? `${result.tps.toFixed(1)} T/s` : "—")}
        ${metric("전체 시간", result ? formatSeconds(result.totalMs) : "—")}
        ${metric("출력 토큰", result ? formatInteger(result.outputTokens) : "—")}
      </div>

      ${result?.thinkingTokens ? `<div class="status-row"><span>추론 토큰 ${formatInteger(result.thinkingTokens)} · ${result.runs || 1}회 측정</span></div>` : ""}
      ${error ? `<div class="error-message">${escapeHtml(error)}</div>` : ""}

      <div class="card-bottom">
        <span class="thinking-chip">${escapeHtml(model.thinkingLabel)}</span>
        <button class="measure-button" type="button" data-measure-model="${model.id}" ${running ? "disabled" : ""}>
          ${running ? "측정 중" : "지금 조회"}
        </button>
      </div>
    </article>
  `;
}

function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function openHistory() {
  renderHistory();
  elements.historyDialog.showModal();
}

function appendHistory(model, result) {
  state.history.push({
    modelId: model.id,
    crackName: model.crackName,
    actualName: model.actualName,
    providerLabel: model.providerLabel,
    color: model.color,
    measuredAt: result.measuredAt,
    result: { ...result },
  });
  localStorage.setItem(STORAGE.history, JSON.stringify(state.history));
  elements.historyCount.textContent = String(state.history.length);
}

function renderHistory() {
  const entries = [...state.history].reverse();
  elements.historySummary.textContent = `저장된 측정 ${entries.length.toLocaleString("ko-KR")}건`;

  if (!entries.length) {
    elements.historyList.innerHTML = `
      <div class="history-empty">
        <div class="empty-icon">◇</div>
        <strong>아직 저장된 측정이 없습니다</strong>
        <p>모델을 조회하면 이곳에 결과가 계속 쌓입니다.</p>
      </div>
    `;
    return;
  }

  elements.historyList.innerHTML = entries.map((entry) => {
    const result = entry.result || {};
    const score = Number.isFinite(result.score) ? Math.round(result.score) : 0;
    const status = statusFromScore(score);
    const color = entry.color || "var(--primary)";

    return `
      <article class="history-item" style="--history-color:${escapeHtml(color)}">
        <div class="history-item-top">
          <div class="history-model">
            <span class="history-orb" aria-hidden="true"></span>
            <div>
              <strong>${escapeHtml(entry.crackName || entry.modelId || "알 수 없는 모델")}</strong>
              <span>${escapeHtml(entry.actualName || "")} · ${escapeHtml(entry.providerLabel || "")}</span>
            </div>
          </div>
          <div class="history-score" style="--history-score-color:${scoreColor(score)}">
            <strong>${score}</strong>
            <span>점</span>
          </div>
        </div>
        <div class="history-meta">
          <span class="history-status ${status.key}">${escapeHtml(status.label)}</span>
          <time datetime="${escapeHtml(entry.measuredAt || "")}">${formatHistoryTime(entry.measuredAt)}</time>
        </div>
        <div class="history-metrics">
          ${historyMetric("첫 대사", Number.isFinite(result.latencyMs) ? formatSeconds(result.latencyMs) : "—")}
          ${historyMetric("생성 속도", Number.isFinite(result.tps) ? `${result.tps.toFixed(1)} T/s` : "—")}
          ${historyMetric("전체 시간", Number.isFinite(result.totalMs) ? formatSeconds(result.totalMs) : "—")}
          ${historyMetric("출력 토큰", Number.isFinite(result.outputTokens) ? formatInteger(result.outputTokens) : "—")}
        </div>
        ${result.thinkingTokens ? `<p class="history-thinking">추론 토큰 ${formatInteger(result.thinkingTokens)}</p>` : ""}
      </article>
    `;
  }).join("");
}

function historyMetric(label, value) {
  return `<div><span>${label}</span><strong>${value}</strong></div>`;
}

function deleteHistory() {
  if (!state.history.length) return;
  if (!window.confirm("저장된 모든 측정 내역을 삭제할까요? 이 작업은 되돌릴 수 없습니다.")) return;

  state.history = [];
  localStorage.removeItem(STORAGE.history);
  renderHistory();
  render();
  showToast("측정 내역을 모두 삭제했습니다.");
}

async function runSelectedModels() {
  const selectedModels = MODELS.filter((model) => state.selected.has(model.id));
  if (!selectedModels.length) return;

  const missingProviders = new Set(
    selectedModels
      .filter((model) => !getApiKey(model.provider))
      .map((model) => model.providerLabel),
  );

  if (missingProviders.size) {
    showToast(`${[...missingProviders].join(" · ")} API 키가 필요합니다.`, true);
    openSettings();
    return;
  }

  const requests = selectedModels.length;
  const confirmed = window.confirm(
    `${selectedModels.length}개 모델에 총 ${requests}회 API 요청을 순차 실행합니다.\n각 계정에 실제 API 비용이 발생할 수 있습니다. 계속할까요?`,
  );
  if (!confirmed) return;

  for (const model of selectedModels) {
    await runModel(model.id, { quiet: true });
  }
  showToast("선택한 모델 측정을 완료했습니다.");
}

async function runModel(modelId, options = {}) {
  const model = MODELS.find((item) => item.id === modelId);
  if (!model || state.running.has(model.id)) return;

  const apiKey = getApiKey(model.provider);
  if (!apiKey) {
    showToast(`${model.providerLabel} API 키를 먼저 설정해 주세요.`, true);
    openSettings();
    return;
  }

  state.running.add(model.id);
  delete state.errors[model.id];
  state.progress[model.id] = "요청 준비 중";
  render();

  try {
    state.progress[model.id] = "공식 API 응답 대기 중";
    render();

    const result = model.provider === "anthropic"
      ? await measureAnthropic(model, apiKey)
      : await measureGemini(model, apiKey);

    result.measuredAt = new Date().toISOString();
    result.runs = 1;
    state.results[model.id] = result;
    localStorage.setItem(STORAGE.results, JSON.stringify(state.results));
    appendHistory(model, result);
    if (!options.quiet) showToast(`${model.crackName} 측정 완료 · ${Math.round(result.score)}점`);
  } catch (error) {
    console.error(error);
    state.errors[model.id] = normalizeError(error);
    if (!options.quiet) showToast(`${model.crackName} 측정에 실패했습니다.`, true);
  } finally {
    state.running.delete(model.id);
    delete state.progress[model.id];
    render();
  }
}

async function measureAnthropic(model, apiKey) {
  const target = state.settings.outputTokens;
  const manualThinkingBudget = 1024;
  const thinkingReserve = model.anthropicMode === "manual-min" ? manualThinkingBudget : 2048;
  const body = {
    model: model.apiModel,
    max_tokens: target + thinkingReserve,
    stream: true,
    service_tier: "standard_only",
    system: "이 요청은 생성 속도 측정용입니다. 가능한 즉시 답하고, 불필요한 숙고·서문·설명·마크다운을 사용하지 마세요.",
    messages: [
      {
        role: "user",
        content: benchmarkPrompt(target),
      },
    ],
  };

  if (model.supportsEffort) body.output_config = { effort: "low" };
  if (model.anthropicMode === "always-adaptive" || model.anthropicMode === "adaptive-low") {
    body.thinking = { type: "adaptive", display: "omitted" };
  }
  if (model.anthropicMode === "manual-min") {
    body.thinking = { type: "enabled", budget_tokens: manualThinkingBudget, display: "omitted" };
  }

  const startedAt = performance.now();
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw await apiError(response, "Anthropic");

  let firstTextAt = null;
  let outputTokens = 0;
  let thinkingTokens = null;
  let inputTokens = 0;
  let visibleText = "";
  let sawThinkingBlock = false;
  let streamError = null;

  await consumeSSE(response, (payload) => {
    if (payload.type === "message_start") {
      inputTokens = payload.message?.usage?.input_tokens ?? inputTokens;
    }

    if (
      payload.type === "content_block_start"
      && (payload.content_block?.type === "thinking" || payload.content_block?.type === "redacted_thinking")
    ) {
      sawThinkingBlock = true;
    }

    if (payload.type === "content_block_delta" && payload.delta?.type === "text_delta") {
      const text = payload.delta.text || "";
      if (text && firstTextAt === null) firstTextAt = performance.now();
      visibleText += text;
    }

    if (payload.type === "message_delta") {
      outputTokens = payload.usage?.output_tokens ?? outputTokens;
      thinkingTokens = payload.usage?.output_tokens_details?.thinking_tokens ?? thinkingTokens;
    }

    if (payload.type === "error") {
      streamError = payload.error?.message || payload.error?.type || "Anthropic 스트림 오류";
    }
  });

  if (streamError) throw new Error(streamError);
  const endedAt = performance.now();
  if (firstTextAt === null) throw new Error("첫 텍스트 토큰을 받지 못했습니다. 출력 한도를 늘려 다시 시도해 주세요.");
  if (!outputTokens) throw new Error("Anthropic 응답에서 출력 토큰 수를 확인하지 못했습니다.");
  if (sawThinkingBlock && thinkingTokens === null) {
    throw new Error("Anthropic 응답에서 추론 토큰 수를 확인하지 못해 정확한 TPS를 계산할 수 없습니다.");
  }

  const visibleOutputTokens = Math.max(0, outputTokens - (thinkingTokens || 0));
  if (!visibleOutputTokens) throw new Error("Anthropic 응답의 실제 텍스트 출력 토큰이 0개입니다.");

  return finalizeMeasurement({
    startedAt,
    firstTextAt,
    endedAt,
    outputTokens: visibleOutputTokens,
    inputTokens,
    thinkingTokens: thinkingTokens || 0,
    visibleCharacters: visibleText.length,
  });
}

async function measureGemini(model, apiKey) {
  const target = state.settings.outputTokens;
  const thinkingReserve = model.geminiThinking.thinkingBudget ?? 2048;
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: benchmarkPrompt(target) }],
      },
    ],
    generationConfig: {
      maxOutputTokens: target + thinkingReserve,
      thinkingConfig: model.geminiThinking,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.apiModel)}:streamGenerateContent?alt=sse`;
  const startedAt = performance.now();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw await apiError(response, "Gemini");

  let firstTextAt = null;
  let outputTokens = 0;
  let inputTokens = 0;
  let thinkingTokens = 0;
  let visibleText = "";
  let blockedReason = null;

  await consumeSSE(response, (payload) => {
    const parts = payload.candidates?.flatMap((candidate) => candidate.content?.parts || []) || [];
    for (const part of parts) {
      if (part.thought) continue;
      const text = part.text || "";
      if (text && firstTextAt === null) firstTextAt = performance.now();
      visibleText += text;
    }

    const usage = payload.usageMetadata;
    if (usage) {
      inputTokens = usage.promptTokenCount ?? inputTokens;
      outputTokens = usage.candidatesTokenCount ?? outputTokens;
      thinkingTokens = usage.thoughtsTokenCount ?? thinkingTokens;
    }

    blockedReason = payload.promptFeedback?.blockReason || blockedReason;
  });

  const endedAt = performance.now();
  if (blockedReason) throw new Error(`요청이 차단되었습니다: ${blockedReason}`);
  if (firstTextAt === null) throw new Error("첫 텍스트 토큰을 받지 못했습니다. 모델 접근 권한 또는 출력 설정을 확인해 주세요.");
  if (!outputTokens) throw new Error("Gemini 응답에서 출력 토큰 수를 확인하지 못했습니다.");

  return finalizeMeasurement({
    startedAt,
    firstTextAt,
    endedAt,
    outputTokens,
    inputTokens,
    thinkingTokens,
    visibleCharacters: visibleText.length,
  });
}

function benchmarkPrompt(targetTokens) {
  return [
    "한국어로 자연스럽게 이어지는 창작 장면을 작성하세요.",
    "제목, 번호, 목록, 해설, 마크다운 없이 본문 문장만 출력하세요.",
    `최종 답변의 분량은 약 ${targetTokens} 토큰이 되도록 충분히 이어서 작성한 뒤 끝내세요.`,
    "복잡한 추론은 하지 말고 즉시 본문을 생성하세요.",
  ].join(" ");
}

function finalizeMeasurement({ startedAt, firstTextAt, endedAt, outputTokens, inputTokens, thinkingTokens, visibleCharacters }) {
  const latencyMs = firstTextAt - startedAt;
  const generationMs = Math.max(1, endedAt - firstTextAt);
  const totalMs = endedAt - startedAt;
  const tps = outputTokens / (generationMs / 1000);
  const score = igxScore(latencyMs, tps);

  return {
    latencyMs,
    generationMs,
    totalMs,
    outputTokens,
    inputTokens,
    thinkingTokens: thinkingTokens || 0,
    visibleCharacters,
    tps,
    score,
  };
}

async function consumeSSE(response, onPayload) {
  if (!response.body) throw new Error("브라우저가 스트리밍 응답을 제공하지 않았습니다.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    buffer = processSSEBuffer(buffer, onPayload);
  }

  buffer += decoder.decode();
  processSSEBuffer(`${buffer}\n\n`, onPayload);
}

function processSSEBuffer(buffer, onPayload) {
  const blocks = buffer.split(/\r?\n\r?\n/);
  const remainder = blocks.pop() || "";

  for (const block of blocks) {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");

    if (!data || data === "[DONE]") continue;
    try {
      onPayload(JSON.parse(data));
    } catch (error) {
      console.debug("무시한 SSE 데이터", data, error);
    }
  }

  return remainder;
}

async function apiError(response, provider) {
  let message = `${provider} API 오류 (${response.status})`;
  try {
    const data = await response.json();
    message = data.error?.message || data.error?.status || data.message || message;
  } catch {
    const text = await response.text().catch(() => "");
    if (text) message = text.slice(0, 300);
  }
  return new Error(message);
}

function igxScore(latency, tps) {
  const L = { best: 2000, normal: 3500, worst: 7000 };
  const T = { best: 33, normal: 17.5, worst: 10 };

  let latencyScore = 0;
  let tpsScore = 0;

  if (latency <= L.best) latencyScore = 50;
  else if (latency <= L.normal) latencyScore = mapRange(latency, L.best, L.normal, 50, 30);
  else if (latency <= L.worst) latencyScore = mapRange(latency, L.normal, L.worst, 30, 0);

  if (tps >= T.best) tpsScore = 50;
  else if (tps >= T.normal) tpsScore = mapRange(tps, T.normal, T.best, 30, 50);
  else if (tps >= T.worst) tpsScore = mapRange(tps, T.worst, T.normal, 10, 30);
  else tpsScore = mapRange(Math.max(0, tps), 0, T.worst, 0, 10);

  const total = latencyScore + tpsScore;
  if (latency > L.worst || tps < T.worst) return Math.min(40, total);
  return clamp(total, 0, 100);
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function statusFromScore(score) {
  if (score >= 70) return { key: "active", label: "Fully Active" };
  if (score >= 40) return { key: "degraded", label: "Degraded" };
  return { key: "impacted", label: "Impacted" };
}

function scoreColor(score) {
  if (score >= 70) return "var(--green)";
  if (score >= 40) return "var(--yellow)";
  return "var(--red)";
}

function getApiKey(provider) {
  return provider === "anthropic" ? state.settings.anthropicKey : state.settings.geminiKey;
}

function clearResults() {
  if (!Object.keys(state.results).length && !Object.keys(state.errors).length) return;
  if (!window.confirm("브라우저에 저장된 모든 측정 결과를 지울까요?")) return;
  state.results = {};
  state.errors = {};
  localStorage.removeItem(STORAGE.results);
  render();
  showToast("측정 결과를 초기화했습니다.");
}

function showToast(message, isError = false) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.toggle("error", isError);
  elements.toast.classList.add("show");
  state.toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 3200);
}

function normalizeError(error) {
  const message = error instanceof Error ? error.message : String(error);
  if (/Failed to fetch/i.test(message)) {
    return "네트워크 또는 브라우저 CORS 요청이 차단되었습니다. HTTPS로 배포했는지, 확장 프로그램이 API 요청을 막지 않는지 확인해 주세요.";
  }
  return message.slice(0, 360);
}

function formatSeconds(milliseconds) {
  return `${(milliseconds / 1000).toFixed(milliseconds >= 10000 ? 1 : 2)}초`;
}

function formatInteger(value) {
  return Math.round(value).toLocaleString("ko-KR");
}

function formatHistoryTime(iso) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return "시간 정보 없음";
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelativeTime(iso) {
  const elapsed = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return "방금 전";
  if (elapsed < 60_000) return "방금 전";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)}분 전`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)}시간 전`;
  return new Date(iso).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
