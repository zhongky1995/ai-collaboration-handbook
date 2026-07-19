(function () {
  "use strict";

  const KEY = "ai-intro-kb-v3-state";
  const LEGACY_KEY = "ai-intro-kb-completed";
  let memoryState = null;
  let failWrites = false;
  let lastError = null;

  function now() { return new Date().toISOString(); }

  function baseState() {
    return {
      schemaVersion: 1,
      currentStage: "prompt",
      currentUnitId: "learn.prompt.first-task",
      nextRecommended: "learn.prompt.first-task",
      artifacts: {},
      drafts: {},
      reflections: {},
      milestones: {
        prompt: { status: "not_started", artifactId: "artifact-task-card-v1", passedCriteria: 0, requiredCriteria: 6 },
        context: { status: "not_started", artifactId: "artifact-context-template-v1", passedCriteria: 0, requiredCriteria: 5 },
        workflow: { status: "not_started", artifactId: "artifact-workflow-v1", passedCriteria: 0, requiredCriteria: 4 },
        agent: { status: "not_started", artifactId: "artifact-agent-loop-v1", passedCriteria: 0, requiredCriteria: 4 },
        harness: { status: "not_started", artifactId: "artifact-minimum-harness-v1", passedCriteria: 0, requiredCriteria: 6 },
        asset: { status: "not_started", artifactId: "artifact-capability-package-v1", passedCriteria: 0, requiredCriteria: 5 }
      },
      readingHistory: [],
      legacyReadingHistory: { sourceKey: LEGACY_KEY, completedPaths: [], importStatus: "not_checked", rawOnFailure: null },
      saveMeta: { mode: "persistent", lastSavedAt: null, error: null },
      lastValidSnapshot: null
    };
  }

  function safeLegacyImport(state) {
    if (state.legacyReadingHistory && state.legacyReadingHistory.importStatus !== "not_checked") return state;
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (raw === null) {
        state.legacyReadingHistory.importStatus = "empty";
      } else {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("旧记录不是路径数组");
        state.legacyReadingHistory.completedPaths = parsed.filter((item) => typeof item === "string");
        state.legacyReadingHistory.importStatus = "imported";
      }
    } catch (error) {
      state.legacyReadingHistory.importStatus = "failed";
      state.legacyReadingHistory.rawOnFailure = String(error && error.message || error);
    }
    return state;
  }

  function normalize(candidate) {
    const base = baseState();
    const state = candidate && candidate.schemaVersion === 1 ? candidate : base;
    state.artifacts = state.artifacts || {};
    state.drafts = state.drafts || {};
    state.reflections = state.reflections || {};
    state.milestones = { ...base.milestones, ...(state.milestones || {}) };
    state.readingHistory = Array.isArray(state.readingHistory) ? state.readingHistory : [];
    state.legacyReadingHistory = state.legacyReadingHistory || base.legacyReadingHistory;
    state.saveMeta = state.saveMeta || base.saveMeta;
    return safeLegacyImport(state);
  }

  function load() {
    if (memoryState) return memoryState;
    try {
      const raw = localStorage.getItem(KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      memoryState = normalize(parsed);
      if (!raw) save(memoryState);
    } catch (error) {
      lastError = error;
      memoryState = normalize(baseState());
      memoryState.saveMeta = { mode: "session", lastSavedAt: null, error: String(error && error.message || error) };
    }
    return memoryState;
  }

  function save(nextState) {
    const state = normalize(nextState || memoryState || baseState());
    const snapshot = memoryState ? JSON.parse(JSON.stringify({ ...memoryState, lastValidSnapshot: null })) : null;
    state.lastValidSnapshot = snapshot;
    state.saveMeta = { mode: "persistent", lastSavedAt: now(), error: null };
    memoryState = state;
    try {
      if (failWrites) throw new Error("浏览器拒绝本地存储");
      localStorage.setItem(KEY, JSON.stringify(state));
      lastError = null;
      return { ok: true, state };
    } catch (error) {
      lastError = error;
      state.saveMeta = { mode: "session", lastSavedAt: state.saveMeta.lastSavedAt, error: String(error && error.message || error) };
      memoryState = state;
      return { ok: false, state, error };
    }
  }

  function update(mutator) {
    const state = load();
    mutator(state);
    return save(state);
  }

  function resetV3() {
    memoryState = null;
    try { localStorage.removeItem(KEY); } catch (_) { /* session fallback */ }
    return load();
  }

  function retry() {
    failWrites = false;
    return save(memoryState || load());
  }

  window.CourseStorage = {
    KEY,
    LEGACY_KEY,
    load,
    save,
    update,
    resetV3,
    retry,
    getLastError() { return lastError; },
    __setFailWrites(value) { failWrites = Boolean(value); },
    __dropMemory() { memoryState = null; }
  };
})();
