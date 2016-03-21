import _ from 'lodash'
import {
  SHOW_SIDEBAR,
  HIDE_SIDEBAR,
  CHANGE_TAB,
  SHOW_HIGHLIGHT_FACE_LANDMARKS,
  HIDE_HIGHLIGHT_FACE_LANDMARKS
} from '../actions/sidebar'

const initialState = {
  isActive: false,
  tabIndex: 0,
  highlightFaceLandmarks: false
}

export default function sidebar(state = initialState, action) {
  switch (action.type) {
    case SHOW_SIDEBAR:
      return _.assign({}, state, { isActive: true })
    case HIDE_SIDEBAR:
      return _.assign({}, state, { isActive: false })
    case CHANGE_TAB:
      return _.assign({}, state, { tabIndex: action.tabIndex })
    case SHOW_HIGHLIGHT_FACE_LANDMARKS:
      return _.assign({}, state, { highlightFaceLandmarks: true })
    case HIDE_HIGHLIGHT_FACE_LANDMARKS:
      return _.assign({}, state, { highlightFaceLandmarks: false })
    default:
      return state
  }
}
