import { takeLatest, put, call, select } from 'redux-saga/effects';
import { APIError, fetchNominatim, fetchOpenRouteService } from '../../api';
import { directionsActions } from './slice';
import { notification } from 'antd';
import {
  selectDirectionInputEnd,
  selectDirectionInputStart,
  selectDirectionsState
} from './selectors';
import { bboxAsBounds } from '../../utils/geo';
import { mapActions } from '../map/slice';

function* handleSearchChange(action) {
  let value;
  const startVal = yield select(selectDirectionInputStart);
  const endVal = yield select(selectDirectionInputEnd);
  const state = yield select(selectDirectionsState);
  if (action.type === directionsActions.onSearchStart.type) {
    value = startVal;
  } else {
    value = endVal;
  }
  if (value && value.length) {
    const results = yield call(fetchNominatim, value);
    if (results.length === 0) {
      notification.error({ message: 'Non trovato' });
    } else {
      const point = [
        results[0].geometry.coordinates[1],
        results[0].geometry.coordinates[0]
      ];
      const addr = results[0].properties.address;
      const address = [
        addr.tourism,
        addr.amenity,
        [addr.road, addr.house_number].join(' ')
      ]
        .filter(_ => _)
        .join(', ');
      if (action.type === directionsActions.onSearchStart.type) {
        yield put(directionsActions.setStart(point));
        yield put(directionsActions.set({ key: 'startInput', value: address }));
        if (endVal && state.navigation.length > 0) {
          yield put(directionsActions.navigate());
        }
      } else {
        yield put(directionsActions.setEnd(point));
        yield put(directionsActions.set({ key: 'endInput', value: address }));
        if (startVal) {
          yield put(directionsActions.navigate());
        }
      }
    }
  } else {
    const key =
      action.type === directionsActions.onSearchStart.type
        ? 'loadingStart'
        : 'loadingEnd';
    yield put(directionsActions.set({ key, value: false }));
  }
}

export function* handleChangeMean() {
  const state = yield select(selectDirectionsState);
  if (state.start && state.end) {
    yield put(directionsActions.navigate());
  }
}

function setBoundingBox(bbox) {
  window.LEAFLET_MAP.fitBounds(bboxAsBounds(bbox));
}

export function* fetchDirections() {
  const state = yield select(selectDirectionsState);
  console.log(state);
  try {
    const result = yield call(fetchOpenRouteService, state);
    /* TODO: intercept response and change viewport */
    yield put(directionsActions.endNavigation(result));
    yield put(directionsActions.forceUpdateNavigation());
    yield call(setBoundingBox, result.bbox);
  } catch (e) {
    console.log(e);
    if (e instanceof APIError) {
      notification.error({ message: e.payload.error.message });
    } else {
      notification.error({ message: 'Errore' });
    }
  }
}

function* handleMapClick(action) {
  const state = yield select(selectDirectionsState);
  if (state.selectFromMap) {
    yield put(directionsActions.toggleSelectFromMap());
    yield put(
      directionsActions.setStart([action.payload.lat, action.payload.lng])
    );
    yield put(
      directionsActions.set({
        key: 'startInput',
        value: `${action.payload.lat.toFixed(4)},${action.payload.lng.toFixed(
          4
        )}`
      })
    );
  }
}

export function* directionsSaga() {
  yield takeLatest(directionsActions.onSearchStart.type, handleSearchChange);
  yield takeLatest(directionsActions.onSearchEnd.type, handleSearchChange);
  yield takeLatest(directionsActions.navigate.type, fetchDirections);
  yield takeLatest(directionsActions.setTravelMean.type, handleChangeMean);
  yield takeLatest(mapActions.click.type, handleMapClick);
}