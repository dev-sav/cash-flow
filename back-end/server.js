const express = require("express");
const bodyParser = require('body-parser');
const mysql = require("mysql");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const fileupload = require("express-fileupload");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  return res.json("from backend bitch");
});

app.use(fileupload());
app.post("/extract-text", (req, res) => {
  if (!req.files || req.files?.pdfFile?.mimetype != "application/pdf") {
    console.log("??");
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
      res.send(result.text);
    });
  }
});

app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '#Chuckbart05',
  database: "cash_flow"
});
// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as ID ' + db.threadId);
});

// get transactions
app.get('/transactions', (req, res) => {
  db.query('SELECT * FROM transactions', (err, results) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).send('Error fetching users');
      return;
    }
    res.json(results);
  });
});

// Create a new user
app.post('/transactions', (req, res) => {
  const { date, description, amount, balance, details, remarks } = req.body;
  db.query('INSERT INTO transactions (date, description, amount, balance, details, remarks) VALUES (? , ?, ?, ?, ?,?);', [date, description, amount, balance,details, remarks], (err, result) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(400).send('Error creating user');
      return;
    }
    res.status(201).send('User created successfully');
  });
});


// Delete a user
app.delete('/transactions/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM transactions WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(400).send('Error deleting user');
      return;
    }
    res.send('User deleted successfully');
  });
});

app.listen(8080, () => {

  console.log("listening... bitch!");
});
