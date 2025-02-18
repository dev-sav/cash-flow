"use client";
import { useEffect } from "react";
import styles from "./page.module.css";
import Table from "../components/Table/table";
import Upload from "../components/upload";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../store";
import { getTransactions } from "../../store/transactionsSlice";

export default function Home() {
  const titles = [
    "Date",
    "Transaction",
    "Credit/Debit",
    "Balance",
    "Remarks",
    "Checker",
    "Inspection",
  ];

  const { data, loading, error } = useSelector((state) => state.transaction);
  const dispatch = useDispatch<typeof store.dispatch>();

  useEffect(() => {
    dispatch(getTransactions());
  }, []);

  return (
    <div className={styles.page}>
      <h1>Cash Flow</h1>
      <Table titles={titles} data={data} loading={loading} error={error} />
      <Upload />
    </div>
  );
}
