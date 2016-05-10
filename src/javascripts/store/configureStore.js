import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
// import createLogger from 'redux-logger'
import { routerReducer } from 'react-router-redux'
import sidebar from '../reducers/sidebar'

const rootReducer = combineReducers({
  sidebar,
  routing: routerReducer
})
const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware  // lets us dispatvch() functions
  // createLogger()    // neat middleware logs actions
)(createStore)

export default function configureStore() {
  return createStoreWithMiddleware(rootReducer)
}
