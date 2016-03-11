import _ from 'lodash'
import {
  SHOW_SIDEBAR,
  HIDE_SIDEBAR,
  CHANGE_TAB
} from '../actions/sidebar'

const initialState = {
  isActive: true,
  tabIndex: 0
}

export default function sidebar(state = initialState, action) {
  switch (action.type) {
    case SHOW_SIDEBAR:
      return _.assign({}, state, { isActive: true })
    case HIDE_SIDEBAR:
      return _.assign({}, state, { isActive: false })
    case CHANGE_TAB:
      return _.assign({}, state, { tabIndex: action.tabIndex })
    default:
      return state
  }
}
