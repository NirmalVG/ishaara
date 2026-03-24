export function isMobileDevice() {
  if (typeof window === "undefined") return false
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.innerWidth < 1024
  )
}
