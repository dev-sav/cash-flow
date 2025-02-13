import styles from "./table.module.css";

type Cell = { row?: number; column?: number; text?: string };
type Styles = { container?: string; textStyle? };
type CellProps = { cell?: Cell; style?: Styles };

type Row = {
  id: number;
  date: string;
  transaction: string;
  amount: number;
  balance: number;
  remarks: string;
  checker: number;
  inspection: string;
};
type Arg = {
  titles: string[];
  data: Row[];
};

const Cell = ({ cell = {}, style = {} }: CellProps) => {
  const { text } = cell;
  const { container } = style;
  console.log(text);
  return (
    <div className={`${styles.cell} ${container}`}>
      <p className={`${styles.minWidth0} ${container}`}>{text}</p>
    </div>
  );
};

const Row = ({ row }) => {
  const {
    id,
    date,
    transaction,
    amount,
    balance,
    remarks,
    checker,
    inspection,
  } = row;
  console.log(transaction);
  return (
    <div className={styles.row}>
      <Cell
        cell={{ row: id, column: 1, text: date }}
        style={{ container: styles.width1 }}
      />
      <Cell
        cell={{ row: id, column: 2, text: transaction }}
        style={{ container: styles.width3 }}
      />
      <Cell
        cell={{ row: id, column: 3, text: String(amount) }}
        style={{ container: styles.width2 }}
      />
      <Cell
        cell={{ row: id, column: 4, text: String(balance) }}
        style={{ container: styles.width2 }}
      />
      <Cell
        cell={{ row: id, column: 5, text: remarks }}
        style={{ container: styles.width4 }}
      />
      <Cell
        cell={{ row: id, column: 6, text: String(checker) }}
        style={{ container: styles.width2 }}
      />
      <Cell
        cell={{ row: id, column: 7, text: inspection }}
        style={{ container: styles.width3 }}
      />
    </div>
  );
};

const calculateTitleWidth = (column: number) => {
  if (column == 1) return styles.width1;
  else if (column == 5) return styles.width4;
  else if (column == 2 || column == 7) return styles.width3;
  else return styles.width2;
};

const Table = ({ titles, data }: Arg) => {
  return (
    <div className={styles.table}>
      {/* TITLES */}
      <div className={styles.row}>
        {titles.map((cell, index) => (
          <Cell
            key={cell}
            cell={{ row: 1, column: index + 1, text: cell }}
            style={{ container: calculateTitleWidth(index + 1) }}
          />
        ))}
      </div>
      {/* Data */}
      {data.map((row) => (
        <Row key={row.id} row={row} />
      ))}
    </div>
  );
};

export default Table;
