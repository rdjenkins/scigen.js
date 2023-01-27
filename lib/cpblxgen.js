/* disposable code to convert JSON to PERL 
const dialectData = require("/home/dean/Downloads/autotweet/daily-cpblx/src/dialect/dialects.json");
console.log(`${Object.keys(dialectData).length} dialect objects loaded`);

Object.entries(dialectData).forEach(([key, values]) => {
  Object.entries(values).forEach(([i, value]) => {
    console.log(`${key.toUpperCase()} ${value}`)
  });
});

return;
*/


var rules = _interopRequireDefault(require("../rules/rules-compiled/cpblxrules.json"))["default"];
var dupes = []; // an array to identify duplicated expansions
var counter = 0; // a counter to stop the anti-duplicate function trying to work forever
var process_count = 0;
var rx = new RegExp("^(" + Object.keys(rules).sort(function (a, b) {
  return b.length - a.length;
}).join("|") + ")");

var debug=false;
function debuglog(text) {
        if (debug===true) {
                console.log(process_count + ') ' + text);
        }
}

// function taken from scigen.js
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// heroic and exhaustive check duplications method
var checkDupe = function checkDupe(picked, key) {
        if (dupes[key]) {
                if (dupes[key].indexOf(picked)>-1) {
                        debuglog('duplicate ' + picked + ' in ' + key + ' [' + dupes[key] + ']');
                        debuglog('... number chosen for ' + key + ' = ' + dupes[key].length);
                        debuglog('... number available for ' + key + ' = ' + rules[key].length);
                        if (dupes[key].length < rules[key].length) {
                                debuglog('... will choose again for ' + key);
                        } else {
                                debuglog('... all choices taken for ' + key);
                                debuglog('... emptying dupe tracker for ' + key);
                                dupes[key] = [];
                        }
                        return true; // another pick is needed
                } else {
                        dupes[key].push(picked);
                        debuglog("new " + picked + ' for ' + key + ' [' + dupes[key] + ']');
                }
        } else {
                dupes[key] = [picked];
                debuglog("new dupe tracker for " + key);
                debuglog("new " + picked + ' for ' + key + ' [' + dupes[key] + ']');
        }
        return false; // no need for another pick

}

// function taken from scigen.js and separated out
  var pick = function pick(key) {
    var array = rules[key];
    var picked = array[Math.floor(Math.random() * array.length)];
    debuglog('picked = ' + picked + ' from ' + key);
    if (checkDupe(picked,key) && counter<50) {
        counter++; // just a precaution to prevent stack overflow
        return pick(key);
    }
    if (counter>=50) {
        debuglog('counter reset at ' + picked + ' from ' + key);
        counter = 0;
    }
    return picked;
  };

// function taken from scigen.js and separated out
  var expand = function expand(key) {

    var plusRule = key.match(/(.*)[+]$/);
    var sharpRule = key.match(/(.*)[#]$/);

    if (plusRule) {
      if (plusRule[1] in rules) {
        rules[plusRule[1]] += 1;
      } else {
        rules[plusRule[1]] = 1;
      }

      return rules[plusRule[1]]; // removed the -1
      
    } else if (sharpRule) {
      if (sharpRule[1] in rules) {
        return Math.floor(Math.random() * (rules[sharpRule[1]]) + 1);
      } else {
        return 0;
      }
      
    } else {
    debuglog("process ... " + key);
      return process(pick(key));
    }
  };

// function taken from scigen.js and separated out
      var process = function process(rule) {
        debuglog('processing ' + rule);
        var text = "";
        var atom = ""; // the text of an expanded rule that contains no other rules within

        for (var i in rule) { // go along the rule (text) to see if there's another inside
          var match = rule.substring(i).match(rx); // is there one at this point?
          process_count++;
//          debuglog(process_count);
          if (match) {
            return text + expand(match[0]) + process(rule.slice(text.length + match[0].length));            
          } else {
//            debuglog('.. ' + rule.substring(i));
            text += rule[i];
          }
        }
            debuglog('final text = ' + text);
        return text;
      };
      

// function taken from scigen.js
var prettyPrint = function prettyPrint(text) {
  text = text.split("\n").map(function (line) {
    line = line.trim();
    line = line.replace(/ +/g, " ");
    line = line.replace(/\s+([.,?;:])/g, "$1");
    line = line.replace(/\ba\s+([\"']*[aeiou])/gi, "an $1"); // modified for cpblx
    line = line.replace(/\bthe\s+(["'])*((the)|(a)|(an))\s+/gi, "$1the "); // sometimes 'the the' or 'the a' appears in cpblx 
    line = line.replace(/^\s*\'*[a-z]/, function (l) { // modified for cpblx
      return l.toUpperCase();
    });
    line = line.replace(/((([.:?!]\s+)|(=\s*\{\s*)|((br)|(div))(>\s+))[a-z])/g, function (l) { // modified for cpblx
      return l.toUpperCase();
    });
    line = line.replace(/\W((jan)|(feb)|(mar)|(apr)|(jun)|(jul)|(aug)|(sep)|(oct)|(nov)|(dec))\s/gi, function (l) {
      return l[0].toUpperCase() + l.substring(1, l.length) + ". ";
    });
    line = line.replace(/\\Em /g, "\\em");
    var titleMatch = line.match(/(\\(((sub)?section)|(slideheading)|(title))\*?)\{(.*)\}/);

    if (titleMatch) {
      line = titleMatch[1] + "{" + titleMatch[7][0].toUpperCase() + (0, _titleCase.titleCase)(titleMatch[7]).slice(1) + "}";
    }

    var cpblxTitleMatch = line.match(/<title>([^<]+)<\/title>(.*)/);

    if (cpblxTitleMatch) {
      if (Math.random() > 0.3) {
        // capitalise first letters of title (including the first word within quotes)
        // https://regex101.com/r/2qv4Vy/1
        var thistitle = cpblxTitleMatch[1].replace(/(^['"]{0,1}\w{1})|(\s+['"]{0,1}\w{1})/g, letter => letter.toUpperCase());
      } else {
        // capitalise all the title
        var thistitle = cpblxTitleMatch[1].toUpperCase();
      }
      line = "<strong>" + thistitle + "</strong>" + cpblxTitleMatch[2];
    }

    line = line.replace(/{{{([^}]+)}}}/g, function(d) {
        if (d === "{{{today}}}") {
                var thedate = new Date();
                var theday = thedate.getDay();
                d = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][theday];
        }
        if (d === "{{{thismonth}}}") {
                var thedate = new Date();
                var themonth = thedate.getMonth();
                d = ['January','February','March','April','May','June','July','August','September','October','November','December'][themonth];
        }
        return d;
    });


    if (line.match(/\n$/)) {
      line += "\n";
    }

    return line;
  }).join("\n");
  return text;
};

// modified function taken from scigen.js and separated out
var generate = function generate(start) {
  return {
    text: prettyPrint(expand(start)),
  };
};


function testoutput(WHAT) {
  console.log(WHAT);
  console.log(generate(WHAT).text);
}

//testoutput('BREXIT_FIVE_THINGS_LIST');
//testoutput('BREXIT_DOING');
testoutput('NHS_RCT_ABSTRACT');
//testoutput('GENERIC_NASTY');
//testoutput('GENERIC_TWEET');
//testoutput('BREXIT_WHY_HOW_WHAT_FOLLOW');
//testoutput('BREXIT_DOING_SENTENCE');
