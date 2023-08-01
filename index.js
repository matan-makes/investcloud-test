const axios = require("axios");
const crypto = require("node:crypto");

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
    matrix[i] = [...row]; //
  }

  return matrix;
}

async function main(size = 1000) {
  await initDataSets(size);
  const matrixA = await buildMatrix("A", size);
  const matrixB = await buildMatrix("B", size);
  // const multiMatrix = multiplyMatrix(matrixA, matrixB);
  const resultMatrix = new Array(size)
    .fill(0)
    .map(() => new Array(size).fill(0));
  let hash = "";

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      for (let k = 0; k < size; k++) {
        resultMatrix[i][j] += matrixA[i][k] * matrixB[k][j];
      }
    }
  }

  console.log("Matrix A");
  matrixA.forEach((row) => console.log(...row));
  console.log();
  console.log("Matrix B");
  matrixB.forEach((row) => console.log(...row));
  console.log();
  console.log("Result Matrix");
  resultMatrix.forEach((row) => console.log(...row));

  const preEncode = resultMatrix.map((row) => row.join("")).join("");
  const encoded = encode(resultMatrix.map((row) => row.join("")).join(""));

  console.log();
  console.log("hash pre encode");
  console.log(preEncode);
  console.log();
  console.log("hash encoded");
  console.log(encoded);

  const valid = await validate(encoded);
  console.log(valid.data);
}

main(3);
