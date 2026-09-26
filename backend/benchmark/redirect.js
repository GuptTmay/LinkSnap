import http from "k6/http";
import { check } from "k6";

const baseUrl = "http://localhost:3000";

const urlIds = [
  "meragpt",
  "beastCo",
  "1LRVQOo",
  "xjurYdK",
  "ouGjLSk",
  "invalid-url-id",  // To test negative caching
  "invalid-url-id-2",
];

export const options = {
  scenarios: {
    redirect: {
      executor: "constant-vus",
      vus: 30,
      duration: "20s",
      exec: __ENV.SCENARIO || "multipleLinks",
    },
  },
};

function request(urlId) {
  const res = http.get(`${baseUrl}/${urlId}`, {
    redirects: 0,
  });

  const expectedStatus = urlId.startsWith("invalid-") ? 404 : 302;

  check(res, {
    [`${urlId} returned ${expectedStatus}`]: (r) =>
      r.status === expectedStatus,
  });  
}

export function hotLink() {
  request(urlIds[0]);
}

export function multipleLinks() {
  const urlId = urlIds[Math.floor(Math.random() * urlIds.length)];
  request(urlId);
}