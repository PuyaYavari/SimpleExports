const fs = require('fs');

var path = require('path');
var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
            let fileContent = fs.readFileSync(`${dir}/${path.basename(file)}`, (err) => {}).toString('utf-8');
            if (fileContent.includes('import Public')) {
                fileContent = fileContent.substring(fileContent.indexOf('class') + 6);
                let className = fileContent.substring(0, fileContent.indexOf('{'));
                results.push(`import ${className} from '${dir}\\${path.basename(file).substring(0,path.basename(file).length-3)}'`);
            }
            if (!--pending) done(null, results);
        }
      });
    });
  });
};

console.log(__dirname)
walk(__dirname, function(err, results) {
    if (err) throw err;
    fs.writeFile("./index.ts", results.join('\n'), (err) => {}); 
});
