export const SHOW_SIDEBAR = 'SHOW_SIDEBAR'
export const HIDE_SIDEBAR = 'HIDE_SIDEBAR'
export const CHANGE_TAB = 'CHANGE_TAB'

export function showSidebar() {
  return { type: SHOW_SIDEBAR }
}

export function hideSidebar() {
  return { type: HIDE_SIDEBAR }
}

export function changeTab(tabIndex) {
  return { type: CHANGE_TAB, tabIndex }
}
