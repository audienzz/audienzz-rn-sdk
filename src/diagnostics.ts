/*
    Copyright 2025 Audienzz AG

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

/**
 * One greppable line per decision the SDK makes about a slot.
 *
 * This exists so a run on a device can be captured, sent to someone who was not holding the phone,
 * and read back as a sequence: which page became current, which slot belongs to it, and — the part
 * that is otherwise invisible — why a slot is sitting there doing nothing.
 *
 * React Native needs its own channel rather than only forwarding the switch to the natives,
 * because the decisions that matter most here are taken in JS: the page wrapper owns focus, and
 * the managed banner owns whether a native view is created at all. A native-only log shows the
 * request and not the reason it was or was not made.
 *
 * Off by default. Turn it on with `Audienzz.setDiagnosticsEnabled(true)`, which also switches on
 * the iOS and Android SDKs, whose lines share this format.
 *
 * Format: `AUDZ <subsystem> <event> key=value key=value`
 * Keys are stable; new keys may be added, so parse by key, not by position.
 */
let enabled = false;

/**
 * Where a line goes. Replaceable so a host can route diagnostics into its own file — `console.log`
 * reaches Metro and the device console, but not something a tester in the field can send back.
 */
let sink: (line: string) => void = (line) => console.log(line);

export function setDiagnosticsSink(next: (line: string) => void): void {
  sink = next;
}

/** @internal — the public switch is `Audienzz.setDiagnosticsEnabled`. */
export function setDiagnosticsEnabledLocally(next: boolean): void {
  enabled = next;
}

export function isDiagnosticsEnabled(): boolean {
  return enabled;
}

/**
 * Log an action the PERSON took, into the same stream as the SDK's own decisions.
 *
 * Exported for example and QA apps. A captured log then reads back as a sequence — "navigated to
 * settings", then what the SDK did about it — instead of needing someone to remember what they
 * tapped and in what order. It is a no-op unless diagnostics are on, like everything else here.
 */
export function logAppAction(
  action: string,
  fields: Record<string, unknown> = {}
): void {
  logDiagnostic('app', action, fields);
}

export function logDiagnostic(
  subsystem: string,
  event: string,
  fields: Record<string, unknown> = {}
): void {
  if (!enabled) {
    return;
  }
  let line = `AUDZ ${subsystem} ${event}`;
  for (const [key, value] of Object.entries(fields)) {
    if (value == null) {
      continue;
    }
    const text = String(value);
    // Bare unless it contains a space, which would break key=value parsing.
    line += text.includes(' ') ? ` ${key}="${text}"` : ` ${key}=${text}`;
  }
  sink(line);
}
