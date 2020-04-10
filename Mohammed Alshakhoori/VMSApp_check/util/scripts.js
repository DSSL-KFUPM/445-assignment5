const fse = require('fs-extra');
const students = require('./students.json');

// This reformats "dictionary.json" into a JSON file that can be loaded into
// MongoDB via the `mongoimport` command, formatted in the way the dictionary
// examples expect.
(async function() {
  let formatted = '';
  for (const stu in students) {
    const entry = {
      id: students[stu].id,
      name: students[stu].name,
      major: students[stu].major
    }
    console.log(entry)
    formatted += JSON.stringify(entry);
  }
  await fse.writeFile('./formatted-students.json', formatted);
})();
