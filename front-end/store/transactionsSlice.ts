import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { json } from "stream/consumers";

///

// Define the API URL (replace with your actual API endpoint)
const API_URL = "http://localhost:8080";

// Define the request payload type
interface TransactionData {}

// Define the state structure
interface TransactionState {
  data: any | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TransactionState = {
  data: [],
  loading: false,
  error: null,
};

// Async thunk for making the POST request
export const createTransaction = createAsyncThunk(
  "extract-text",
  async (transactionData: TransactionData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/extract-text`, {
        method: "POST",
        body: transactionData,
      });

      // Log the raw response as text
      const text = await response.text();

      if (!response.ok) {
        throw new Error(text);
      }

      return text; // Return response data
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for making the GET request
export const getTransactions = createAsyncThunk(
  "getTransactions",
  async (params, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Status code ${response.status}: ${response.body}`);
      }

      return response.json(); // Return the parsed data
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the slice
export const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    clearTransaction: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
    reset() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createTransaction.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(
        createTransaction.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      )
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getTransactions.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(
        getTransactions.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearTransaction, reset } = transactionSlice.actions;
export default transactionSlice.reducer;
