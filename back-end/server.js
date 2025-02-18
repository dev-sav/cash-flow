const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const fileupload = require("express-fileupload");
const { transpileModule } = require("typescript");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  return res.json("from backend bitch");
});

app.use(bodyParser.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "#Chuckbart05",
  database: "cash_flow",
});

const getTransaction = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM transactions");
    return rows; // Return the results
  } catch (err) {
    console.error("Error executing query: " + err.stack);
    throw err; // Propagate the error
  }
};

// get transactions
app.get("/transactions", async (req, res) => {
  try {
    const data = await getTransaction();
    res.status(200).send(data);
  } catch (error) {
    throw error;
  }
});

const formatDate = (input) => {
  // Get the current year
  const currentYear = new Date().getFullYear();

  // Define an array of month abbreviations
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Split the input date into month and day
  const [monthStr, dayStr] = input.split("  ");

  // Find the month index from the months array
  const monthIndex = months.indexOf(monthStr.trim());

  if (monthIndex === -1) {
    throw new Error("Invalid month abbreviation");
  }

  // Get the day number
  const day = parseInt(dayStr.trim(), 10);

  // Construct the MySQL date format
  const formattedDate = new Date(currentYear, monthIndex, day)
    .toISOString()
    .split("T")[0];

  return formattedDate;
};

const removeCommas = (str) => {
  // Remove all commas from the string
  return str.replace(/,/g, "");
};

const batchFormat = (transaction) => {
  let newObj = transaction;
  newObj.date = formatDate(transaction.date);
  newObj.amount = removeCommas(transaction.amount);
  newObj.balance = removeCommas(transaction.balance);
  return newObj;
};

const insertTransaction = async (transaction) => {
  const formattedDate = formatDate(transaction.date);

  try {
    const query = `
      INSERT INTO transactions (date, description, amount, balance ,details, remarks)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      formattedDate,
      transaction.description,
      transaction.amount,
      transaction.balance,
      transaction.details,
      transaction.remarks,
    ];

    // Using promise-based query execution with async/await
    await pool.query(query, values);
  } catch (err) {
    throw new Error(`Error inserting transaction: ${err.message}`);
  }
};

// Delete a user
app.delete("/transactions/:id", (req, res) => {
  const id = req.params.id;
  pool.query("DELETE FROM transactions WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Error executing query: " + err.stack);
      res.status(400).send("Error deleting user");
      return;
    }
    res.send("User deleted successfully");
  });
});

const trimFluffs = (arr) => {
  const anchor = ["BEGINNING", "BALANCE", "AMOUNT", "THIS"];
  let start;
  let end = arr.length; // only applicable on the last page
  for (let i = 0; i < arr.length - 1; i++) {
    if ([anchor[0], anchor[2]].includes(arr[i]) && arr[i + 1] === anchor[1]) {
      if (arr[i] === anchor[0]) start = i + 3;
      else start = i + 2;
    }
    if (arr[i] === anchor[1] && arr[i + 1] === anchor[3]) end = i;
  }
  const cleanedPage = arr.slice(start, end);

  return cleanedPage;
};

const getWords = (text) => {
  const words = text.split(" ");
  const trimEnd = words.slice(0, words.length - 1);
  return trimEnd;
};

function chopItems(data) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const result = [];
  let currentChunk = [];

  data.forEach((item) => {
    if (months.includes(item)) {
      if (currentChunk.length > 0) {
        result.push(currentChunk);
      }
      currentChunk = [item];
    } else {
      currentChunk.push(item);
    }
  });

  if (currentChunk.length > 0) {
    result.push(currentChunk);
  }

  return result;
}

const isRef = (str) => {
  const refRegex = /^\d{3,4}$/;
  return refRegex.test(str);
};

const buildString = (obj, arr, startDesc, endDesc, stardDeets, endDeets) => {
  const strDesc = arr.slice(startDesc, endDesc).join(" ");
  const strDeets = arr.slice(stardDeets, endDeets).join(" ");
  obj.description = strDesc;
  obj.details = strDeets;

  return obj;
};

const groupData = (obj, arr) => {
  let newObj;

  const match = arr.find((word) => isRef(word));
  if (match) {
    const i = arr.indexOf(match);
    if (isRef(arr[i + 1]))
      newObj = buildString(obj, arr, 0, i + 2, i + 3, arr.length);
    else newObj = buildString(obj, arr, 0, i + 1, i + 1, arr.length);
  } else {
    const floor = Math.floor(arr.length / 2);
    const ceil = Math.ceil(arr.length / 2);
    newObj = buildString(obj, arr, 0, floor, ceil, arr.length);
  }

  return newObj;
};

const toNum = (str) => {
  const num = parseFloat(str.replace(/,/g, ""));
  const result = parseFloat(num.toFixed(2));
  return result;
};
const categorizeData = (arr) => {
  const result = [];

  arr.forEach((item) => {
    let current = {};
    current.date = `${item[0]}  ${item[1]}`;
    current.balance = toNum(`${item[item.length - 1]}`);
    current.amount = toNum(`${item[item.length - 2]}`);
    const newObj = groupData(current, item.slice(2, item.length - 2));
    result.push(newObj);
  });

  return result;
};

const cleanPages = (text) => {
  // remove invalid pages
  const lines = text.split("\n");
  const sliced = lines.slice(6, lines.length);
  const filtered = sliced.filter((_, index) => index % 2 === 0);

  let cleanedData = [];

  for (let value of filtered) {
    const words = getWords(value);
    const trimmed = trimFluffs(words);
    const chopped = chopItems(trimmed);

    cleanedData = [...cleanedData, ...chopped];
  }

  const categorizedData = categorizeData(cleanedData);

  return categorizedData;
};

const processPdfText = (text) => {
  const cleanedPages = cleanPages(text);

  return cleanedPages;
};

const isProbable = (balCurrent, amt, balProjected) => {
  const sum = parseFloat((parseFloat(balCurrent) + amt).toFixed(2));
  const diff = parseFloat((parseFloat(balCurrent) - amt).toFixed(2));
  console.log(
    `balCur ${balCurrent} amt ${amt} balProj ${balProjected} minus ${diff} plus ${sum}`
  );
  if (diff == balProjected || sum == balProjected) {
    console.log(`chrue`);
    return true;
  }
  return false;
};

const amountValue = (balCurrent, amt, balProjected) => {
  if (balCurrent - amt == balProjected) return -amt;
  return amt;
};

const insertBatch = async (transactions) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    // INSERT FIRST DATA
    await insertTransaction(transactions[0]);
    // insert the rest
    for (let i = 1; i < transactions.length; i++) {
      if (
        isProbable(
          transactions[i - 1].balance,
          transactions[i].amount,
          transactions[i].balance
        )
      ) {
        transactions[i].amount = amountValue(
          transactions[i - 1].balance,
          transactions[i].amount,
          transactions[i].balance
        );
        await insertTransaction(transactions[i]);
      }
    }
    await connection.commit(); // Commit if all queries succeed }catch (error)
  } catch (error) {
    await connection.rollback(); // Rollback if any query fails
    console.error("Transaction failed. Rolling back...", error);
  } finally {
    connection.release(); // Release connection back to pool
  }
};

const processTransactions = async (transactions) => {
  let result = {};

  const current = await getTransaction();

  // FIRST DATA SO JUST SHOVE IT IN!
  if (current.length == 0) await insertBatch(transactions);
  // THERE ARE EXISTING DATA
  else {
    const lastBal = current[current.length - 1].balance;
    const incomingAmt = transactions[0].amount;
    const projectedBal = transactions[0].balance;

    if (isProbable(lastBal, incomingAmt, projectedBal)) {
      await insertBatch(transactions);
    } else
      console.log(
        `The math is not mathing! Current balance is ${lastBal}, Incoming is ${incomingAmt}, Projected Balance is ${projectedBal}`
      );
  }
};

app.use(fileupload());
app.post("/extract-text", (req, res) => {
  if (!req.files || req.files?.pdfFile?.mimetype != "application/pdf") {
    res.status(400).send("Invalid request. Pleaser submit a valid PDF file");
  } else {
    const options = {
      pagerender: (pageData) => {
        // Options for text content retrieval
        const renderOptions = {
          normalizeWhitespace: false, // Replace all occurrences of whitespace with standard spaces (0x20)
          disableCombineTextItems: true, // Do not attempt to combine same line TextItem's
        };
        return pageData.getTextContent(renderOptions).then((textContent) => {
          let text = "";
          textContent.items.forEach((item, index) => {
            text += item.str + " ";
          });

          return text;
        });
      },
    };
    pdfParse(req.files.pdfFile, options).then((result) => {
      const processedText = processPdfText(result.text);
      processTransactions(processedText)
        .then(() => {
          console.log("All transactions processed!");
          res.status(200).send("Successfully inserted data");
        })
        .catch((error) => {
          console.error("Error processing transactions:", error);
        });
    });
  }
});

app.listen(8080, () => {
  console.log("listening... bitch!");
});
