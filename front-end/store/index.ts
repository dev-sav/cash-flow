import { configureStore } from "@reduxjs/toolkit";
import { transactionSlice } from "./transactionsSlice";

export const store = configureStore({
  reducer: {
    transaction: transactionSlice.reducer,
  },
});

// Infer the `RootState` and `AppDispatch` types
export default store;
