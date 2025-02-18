function trimFluffs(arr) {
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
}

function getWords(text) {
  const words = text.split(" ");
  const trimEnd = words.slice(0, words.length - 1);
  return trimEnd;
}

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

function isRef(str) {
  const refRegex = /^\d{3,4}$/;
  return refRegex.test(str);
}

function buildString(obj, arr, startDesc, endDesc, stardDeets, endDeets) {
  const strDesc = arr.slice(startDesc, endDesc).join(" ");
  const strDeets = arr.slice(stardDeets, endDeets).join(" ");
  obj.description = strDesc;
  obj.details = strDeets;

  return obj;
}

function groupData(obj, arr) {
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
}

function categorizeData(arr) {
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

  return result;
}

function cleanPages(text) {
  // remove invalid pages
  const lines = text.split("\n");
  const sliced = lines.slice(6, lines.length - 2);
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
}

function processPdfText(text) {
  const cleanedPages = cleanPages(text);

  return cleanedPages;
}

export default processPdfText;
