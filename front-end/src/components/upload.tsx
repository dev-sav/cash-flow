"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { store } from "../../store";
import {
  createTransaction,
  getTransactions,
  reset,
} from "../../store/transactionsSlice";

const Upload = () => {
  const { handleSubmit, register } = useForm();
  const dispatch = useDispatch<typeof store.dispatch>();

  const handleUpload = async (data) => {
    const formData = new FormData();
    formData.append("pdfFile", data.pdfFile[0]);

    dispatch(createTransaction(formData)).then((response) => {
      if (response.meta.requestStatus === "fulfilled") {
        dispatch(getTransactions());
        console.log(`shut`);
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(handleUpload)}>
        <input {...register("pdfFile")} type="file" accept="application/pdf" />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Upload;
