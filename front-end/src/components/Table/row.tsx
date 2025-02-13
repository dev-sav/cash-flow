import Cell from "./cell";
import styles from "./table.module.css";

type Item = { id?: number; text?: string };
type Items = Item[];
type Arg = {
  items: Items;
};
const Row = ({ items }: Arg) => {
  console.log(JSON.stringify(items));
  return (
    <div className={styles.row}>
      {items.map((item) => (
        <Cell key={item.id} text={item.text} />
      ))}
    </div>
  );
};

export default Row;
