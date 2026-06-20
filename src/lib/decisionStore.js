const KEY = "decisions";

export function getDecisions() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function saveDecisions(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function addDecision(entry) {
  const data = getDecisions();
  data.push(entry);
  saveDecisions(data);
}

export function deleteDecision(id) {
  const data = getDecisions().filter(d => d.id !== id);
  saveDecisions(data);
}

export function clearDecisions() {
  localStorage.removeItem(KEY);
}

export function updateDecision(id, updater) {
  const data = getDecisions().map(d =>
    d.id === id ? updater(d) : d
  );
  saveDecisions(data);
}