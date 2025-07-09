import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  errorMessage: null,
  tracker: {
    activities: [],
  },
  totalItems: 0,
};

export type AdministrationState = Readonly<typeof initialState>;

// Actions

export const AdministrationSlice = createSlice({
  name: 'administration',
  initialState: initialState as AdministrationState,
  reducers: {
    websocketActivityMessage(state, action) {
      // filter out activities from the same session
      const uniqueActivities = state.tracker.activities.filter(activity => activity.sessionId !== action.payload.sessionId);
      // remove any activities with the page of logout
      const activities = [...uniqueActivities, action.payload].filter(activity => activity.page !== 'logout');
      state.tracker = { activities };
    },
  },
  extraReducers(builder) {},
});

export const { websocketActivityMessage } = AdministrationSlice.actions;

// Reducer
export default AdministrationSlice.reducer;
