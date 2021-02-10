export function getRandomNumberArray(min, max, times, isDuplicationAllowed) {
  return isDuplicationAllowed
    ? getRandomNumberArrayWithDuplication(min, max, times)
    : getRandomNumberArrayWithoutDuplication(min, max, times);
}

function getRandomInt1(min, max) {
  const range = Math.floor(max) - Math.floor(min);
  return getRandomInt2(range) + Math.floor(min)
}

function getRandomInt2(max) {
  return Math.floor(Math.random() * (Math.floor(max) + 1));
}

function getRandomNumberArrayWithDuplication(min, max, times) {
  const hitItems = [];

  for (let i = 0; i < times; i++) {
    const random = getRandomInt1(min, max);
    hitItems.push(random);
  }

  return hitItems;
}

function getRandomNumberArrayWithoutDuplication(min, max, times) {
  const hitItems = [];
  const range = Math.floor(max) - Math.floor(min) + 1;
  const restItems = [...Array(range).keys()].map(i => i + Math.floor(min));

  for (let i = 0; i < times; i++) {
    const random = getRandomInt2(restItems.length - 1);
    hitItems.push(restItems[random]);
    restItems.splice(random, 1);
  }

  return hitItems;
}
