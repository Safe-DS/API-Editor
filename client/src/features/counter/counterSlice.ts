import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CounterState {
    value: number
}

const initialState: CounterState = {
    value: 0,
}

const CounterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        incremented(state) {
            state.value++
        },
        amountAdded(state, action: PayloadAction<number>) {
            state.value += action.payload
        },
    },
})

export const { incremented, amountAdded } = CounterSlice.actions
export default CounterSlice.reducer
