import http from "k6/http";

const baseUrl = "http://localhost:3000";

const urlIds = [
  "meragpt",
  "beastCo",
  "1LRVQOo",
  "xjurYdK",
  "ouGjLSk",
];

export const options = {
  scenarios: {
    redirect: {
      executor: "constant-vus",
      vus: 10,
      duration: "20s",
      exec: __ENV.SCENARIO || "multipleLinks",
    },
  },
};

function request(urlId) {
  const res = http.get(`${baseUrl}/${urlId}`, {
    redirects: 0,
  });

  if (res.status !== 302) {
    console.log(`Unexpected status: ${res.status}`);
  }
}

export function hotLink() {
  request(urlIds[0]);
}

export function multipleLinks() {
  const urlId = urlIds[Math.floor(Math.random() * urlIds.length)];
  request(urlId);
}