import styles from "./table.module.css";

type Arg = {
  row: number;
  column: number;
  text?: string;
};

const Cell = ({ row, column, text }: Arg) => {
  console.log(text);
  return (
    <div className={styles.cell}>
      <p>{text}</p>
    </div>
  );
};

export default Cell;
