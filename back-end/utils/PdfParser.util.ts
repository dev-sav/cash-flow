function trimFront(arr: string[], anchor1: string, anchor2: string) {
  let start;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === anchor1 && arr[i + 1] === anchor2) {
      start = i + 2;
    }
  }
  const cleanedPage = arr.slice(start, arr.length);
  return cleanedPage;
}

function getWords(text: string) {
  const words = text.split(" ");
  return words;
}

function cleanPages(text: string) {
  // remove invalid pages
  const lines = text.split("\n");
  const filtered = lines.filter((element, index) => index % 2 === 0);
  const pages = filtered.slice(3, lines.length - 1);

  return pages;

  let trimmedPages = [];
  pages.forEach((page) => {
    const words = getWords(page);
    const trimmedFront = trimFront(words, "BEGINNING", "BALANCE");
    trimmedPages.push(trimmedFront);
  });

  return pages;
}

function processPdfText(text: string) {
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
}

export default processPdfText;
