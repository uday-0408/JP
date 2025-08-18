import { createSlice } from "@reduxjs/toolkit";


const authSlice = createSlice(
    {
        name:'auth',
        initialState:{
            loading: false,
            user: null,
            isAuthenticated: false
        },
        reducers:{
            // actions
            setLoading:(state,action)=>{
                state.loading = action.payload
            },
            setUser:(state,action)=>{
                state.user = action.payload
                state.isAuthenticated = !!action.payload // Set isAuthenticated based on user presence
            }
        }
    }
)

export const {setLoading,setUser}= authSlice.actions;
export default authSlice.reducer;