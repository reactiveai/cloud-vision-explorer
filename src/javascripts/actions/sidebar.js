export const SHOW_SIDEBAR = 'SHOW_SIDEBAR'
export const HIDE_SIDEBAR = 'HIDE_SIDEBAR'
export const CHANGE_TAB = 'CHANGE_TAB'
export const SHOW_HIGHLIGHT_FACE_LANDMARKS = 'SHOW_HIGHLIGHT_FACE_LANDMARKS'
export const HIDE_HIGHLIGHT_FACE_LANDMARKS = 'HIDE_HIGHLIGHT_FACE_LANDMARKS'

export function showSidebar() {
  return { type: SHOW_SIDEBAR }
}

export function hideSidebar() {
  return { type: HIDE_SIDEBAR }
}

export function changeTab(tabIndex) {
  return { type: CHANGE_TAB, tabIndex }
}

export function toggleHighlightFaceLandmarks(show) {
  return {
    type: show ? SHOW_HIGHLIGHT_FACE_LANDMARKS : HIDE_HIGHLIGHT_FACE_LANDMARKS
  }
}
