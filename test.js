let data = [];

for (let i = 0; i < 1000000; i++) {
  const bool = Math.random() > 0.75;
  data.push(bool);
}

let dataSize = data.length;

// for (let i = 0; i < data.length; i++) {
//   console.log(`${i}: ${data[i]}`);
// }

let d = 0;
let a = data.length - 1;

console.time("TIME");
let i = 0;
while (true) {
  i++;
  // Move left to right and find a false
  for (; ; d++) {
    if (d > a) {
      console.log("D", d);
      // return d;
    }
    if (data[d] === false) {
      break;
    }
  }

  // Move right to left and find a true
  for (; ; a--) {
    if (data[a] === true) {
      break;
    }

    if (a <= d) {
      console.log("DA", d);
    }
  }

  if (d > a) {
    break;
  }

  // console.log(`Swapping ${d} with ${a}`)

  // [data[a], data[d]] = [data[d], data[a]];

  const dead = data[d];
  data[d] = data[a];
  data[a] = dead;

  d += 1;
  a -= 1;
}
console.timeEnd("TIME");

const size = d;

// for (let j = 0; j < size; j++) {
//   console.log(data[j]);
// }

// console.log(JSON.stringify(data, null, 2));
console.log(a, d, data[a], data[d], i);
// console.log(data.length)
