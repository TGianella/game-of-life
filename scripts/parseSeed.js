const fs = require('fs');

const seedsPath = './app/seeds';
const imagesPath = `${seedsPath}/images`;
const arraysPath = `${seedsPath}/arrays`;


const [_, __, seedFile] = process.argv;
const seedFiles = fs.readdirSync(imagesPath)

console.log(`Found ${seedFiles.length} seeds in /images`)

for (const fileName of seedFiles) {
  console.log(`Found seed ${fileName}`)
  if (fs.existsSync(arraysPath)) {
    console.log("Seed already parsed !")
    continue
  } else {
    let seed = fs.readFileSync(`${imagesPath}/${seedFile}.txt`).toString();
    seed = seed.replace(/(\r\n|\n|\r)/gm, "");
    const seedArray = seed.split('');
    console.log(`Created array of length ${seedArray.length}, width: ${Math.sqrt(seedArray.length)}`);
    fs.writeFileSync(`${arraysPath}/${seedFile}.js`,
      `export default [${seedArray}]`)
  }
}

