const axios = require("axios");
const crypto = require("node:crypto");
const stdout = require("process").stdout;

const BASE_URL = `https://recruitment-test.investcloud.com`;

async function initDataSets(size = 1000) {
  return axios.get(`${BASE_URL}/api/numbers/init/${size}`);
}

async function getDataSet(label, type, index) {
  return axios.get(`${BASE_URL}/api/numbers/${label}/${type}/${index}`);
}

async function validate(stringToValidate) {
  return axios.post(`${BASE_URL}/api/numbers/validate`, stringToValidate);
}

function encode(stringToEncode) {
  return crypto.createHash("md5").update(stringToEncode).digest("hex");
}

async function buildMatrix(dataLabel, size) {
  const matrix = new Array(size);

  for (let i = 0; i < size; i++) {
    let row = (await getDataSet(dataLabel, "row", i)).data.Value;
    matrix[i] = [...row];
  }

  return matrix;
}

async function main(size = 1000) {
  try {
    await initDataSets(size);

    return Promise.allSettled([
      buildMatrix("A", size),
      buildMatrix("B", size),
    ]).then(async (result) => {
      // we got both of em
      if (result.every((r) => r.status === "fulfilled")) {
        const matrixA = result[0].value,
          matrixB = result[1].value;
        const resultMatrix = new Array(size)
          .fill(0)
          .map(() => new Array(size).fill(0));

        // working algorithm
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            for (let k = 0; k < size; k++) {
              resultMatrix[i][j] += matrixA[i][k] * matrixB[k][j];
            }
          }
        }

        console.log();
        console.log("Matrix A");
        // matrixA.forEach((row) => console.log(...row));
        console.log();
        console.log("Matrix B");
        // matrixB.forEach((row) => console.log(...row));
        console.log();
        console.log("Result Matrix");
        // resultMatrix.forEach((row) => console.log(...row));

        // const preEncode = resultMatrix.map((row) => row.join("")).join("");
        const encoded = encode(
          resultMatrix.map((row) => row.join("")).join("")
        );

        // console.log();
        // console.log("hash pre encode");
        // console.log(preEncode);
        console.log();
        console.log("hash encoded");
        console.log(encoded);

        const valid = await validate(encoded);
        console.log(valid.data);
        return Promise.resolve();
      } else {
        throw new Error("not loaded");
      }
    });
  } catch (e) {
    throw new Error(e);
  }
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return seconds == 60
    ? `${minutes + 1} minutes"`
    : `${minutes} minutes and ${seconds} seconds`;
}

// found a neat lil spinner so I included it to make it look nicer while loading
function startSpinner() {
  const characters = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const cursorEsc = {
    hide: "\u001B[?25l",
    show: "\u001B[?25h",
  };
  stdout.write(cursorEsc.hide);

  let i = 0;
  const timer = setInterval(function () {
    stdout.write("\r" + characters[i++]);
    i = i >= characters.length ? 0 : i;
  }, 150);

  return () => {
    clearInterval(timer);
    stdout.write("\r");
    stdout.write(cursorEsc.show);
  };
}

console.log("starting now...");
const start = performance.now();
const stopSpinner = startSpinner();

main().then(() => {
  const end = performance.now();
  stopSpinner();
  console.log("this took ", millisToMinutesAndSeconds(end - start));
});
