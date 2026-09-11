export type LogosRuntimeEnvironment = {
  DB?: D1Database;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  YOUVERSION_APP_KEY?: string;
};

let currentEnvironment: LogosRuntimeEnvironment = {};

export function setRuntimeEnvironment(environment: LogosRuntimeEnvironment) {
  currentEnvironment = environment;
}

export function getRuntimeEnvironment() {
  return currentEnvironment;
}
