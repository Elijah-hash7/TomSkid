export function isDemoModeEnabled(): boolean {
  return process.env.ADMIN_DEMO_MODE === "true"
}
