import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
  name: "job",
  initialState: {
    allJobs: [],
    allAdminJobs: [],
    singleJob: null,
    searchJobByText: "",
    allAppliedJobs: [],
    searchedQuery: "",
    djangoJobs: [],
    pagination: {
      currentPage: 1,
      pageSize: 9,
      totalPages: 1,
      totalJobs: 0
    },
  },
  reducers: {
    // actions
    setAllJobs: (state, action) => {
      state.allJobs = action.payload;
    },
    setSingleJob: (state, action) => {
      state.singleJob = action.payload;
    },
    setAllAdminJobs: (state, action) => {
      state.allAdminJobs = action.payload;
    },
    setSearchJobByText: (state, action) => {
      state.searchJobByText = action.payload;
    },
    setAllAppliedJobs: (state, action) => {
      state.allAppliedJobs = action.payload;
    },
    setSearchedQuery: (state, action) => {
      state.searchedQuery = action.payload;
    },
    setDjangoJobs: (state, action) => {
      // Ensure we always have a valid array, even if action.payload is undefined
      state.djangoJobs = Array.isArray(action.payload) ? action.payload : [];
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
  },
});
export const {
  setAllJobs,
  setSingleJob,
  setAllAdminJobs,
  setSearchJobByText,
  setAllAppliedJobs,
  setSearchedQuery,
  setDjangoJobs,
  setPagination,
} = jobSlice.actions;
export default jobSlice.reducer;
