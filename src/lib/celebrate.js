// Fires a screen-wide confetti shower (handled by FunEffects).
export function celebrate() {
  window.dispatchEvent(new CustomEvent("kyt:celebrate"));
}
