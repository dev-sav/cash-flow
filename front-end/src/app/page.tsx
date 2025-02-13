"use client";
import styles from "./page.module.css";
import Table from "../components/Table/table";
import Upload from "../components/upload";

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
  const data = [
    {
      id: 1,
      date: "Jan 2",
      transaction: "PartnerMerchantCashIn",
      amount: -1000,
      balance: 10000,
      remarks: "TTO:BPIMOBILEBANK,A/C#302141155dd7",
      checker: 400,
      inspection: "no energy today",
    },
    {
      id: 2,
      date: "Jan 3",
      transaction: "Purchase Spotify",
      amount: -1000,
      balance: 10000,
      remarks: "kfc",
      checker: 400,
      inspection: "no energy today",
    },
    {
      id: 3,
      date: "Jan 4",
      transaction: "Purchase BDO",
      amount: -1000,
      balance: 10000,
      remarks: "kfc",
      checker: 400,
      inspection: "no energy today",
    },
    {
      id: 4,
      date: "Jan 5",
      transaction: "Purchase Dildo",
      amount: -1000,
      balance: 10000,
      remarks: "kfc",
      checker: 400,
      inspection: "no energy today",
    },
  ];

  console.log(JSON.stringify(data));
  return (
    <div className={styles.page}>
      <h1>Cash Flow</h1>
      <Table titles={titles} data={data} />
      <Upload />
    </div>
  );
}
