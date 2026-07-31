const URL = 'https://official-joke-api.appspot.com/jokes/random/';

export async function getJokes (cnt: number) {
  const response = await fetch(URL + cnt);
  const data = await response.json();
  return data;
}
