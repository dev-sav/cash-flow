const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const pdfParse = require("pdf-parse");
const fileupload = require("express-fileupload");

const app = express();
app.use(cors());

app.get("/", (res) => {
  return res.json("from backend bitch");
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
/*
[
    "Partner",
    "Merchant",
    "Cash",
    "In",
    "0060",
    "TO:",
    "SHOPEEPAY",
    "PHILI.....XXXXX43486"
    ]
    */
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

/* 
    [
        [
        "Oct",
        "14",
        "Partner",
        "Merchant",
        "Cash",
        "In",
        "0060",
        "TO:",
        "SHOPEEPAY",
        "PHILI.....XXXXX43486",
        "108.00",
        "15,402.51"
        ],
        ....,
        ....,
     ] 
*/

const categorizeData = (arr) => {
  const result = [];

  arr.forEach((item) => {
    let current = {};
    console.log(item[0]);
    current.date = `${item[0]}  ${item[1]}`;
    current.balance = `${item[item.length - 1]}`;
    current.amount = `${item[item.length - 2]}`;
    const newObj = groupData(current, item.slice(2, item.length - 2));
    result.push(newObj);
  });

  /*
    [
        "Oct",
        "14",
        "Partner",
        "Merchant",
        "Cash",
        "In",
        "0060",
        "TO:",
        "SHOPEEPAY",
        "PHILI.....XXXXX43486",
        "108.00",
        "15,402.51"
        ],
    */

  return result;
};

const cleanPages = (text) => {
  // remove invalid pages
  const lines = text.split("\n");
  const sliced = lines.slice(6, lines.length - 2);
  const filtered = sliced.filter((_, index) => index % 2 === 0);

  let cleanedData = [];

  for (let value of filtered) {
    const words = getWords(value);
    const trimmed = trimFluffs(words);
    const chopped = chopItems(trimmed);
    /* 
    [
        [
        "Oct",
        "14",
        "Partner",
        "Merchant",
        "Cash",
        "In",
        "0060",
        "TO:",
        "SHOPEEPAY",
        "PHILI.....XXXXX43486",
        "108.00",
        "15,402.51"
        ],
        ....,
        ....,
     ] 
    */
    cleanedData = [...cleanedData, ...chopped];
  }

  const categorizedData = categorizeData(cleanedData);

  return categorizedData;
};

const processPdfText = (text) => {
  const cleanedPages = cleanPages(text);

  return cleanedPages;

  /*  // Find the index of the line containing the searchString
    const startIndex = lines.findIndex((line) => line.includes("Page3of4"));
    const endIndex = lines.findIndex((line) => line.includes("Page4of4"));
  
    // If the searchString is not found or there aren't enough lines after it, return an empty array
    if (startIndex === -1 || startIndex + 3 >= lines.length) {
      return [];
    }
  
    // Extract the specified number of lines after the found line
    return lines.slice(startIndex + 4, endIndex - 2); */
};

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
      res.send(processPdfText(result.text));
    });
  }
});

app.listen(8081, () => {
  console.log("listening... bitch!");
});
