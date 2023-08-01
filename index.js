const axios = require("axios");

async function init(size = 1000) {
  await axios
    .get(`https://recruitment-test.investcloud.com/api/numbers/init/1000`)
    .then(({ data }) => {
      console.log(data);
    });
}

init();
