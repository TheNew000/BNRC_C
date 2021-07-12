const process = require('process');
const https = require('https');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const jquery = require('jquery');

// here is the basic logic that collects the arguments passed into the CLI.  
// The "childCounter" is to keep track of how many child operations are being passed with the "-n" flag
let childCounter = 0;
process.argv.forEach((val, index) => {
    // not the best way to accomplish this as it doesn't account for errors in the syntax or different command ordering.
    //would've used yargs to improve this logic but was worried about too many 3rd party reqs.
    if (index === 3) {
        childCounter = val;
    }
    if (index === 4) {
        collectPageData(val, childCounter);  
    }
});

process.on('exit', (code) => {
    console.log('Exit Code: ', code);
});

function collectPageData(url, num) {
    let content;
    let counter = num;
    https.get(url, function(res) {
        if(res.statusCode === 200) {
            res.setEncoding("utf8");
            res.on("data", function (chunk) {
                content += chunk;
            }).on("end", function () {
                crawlAndLogLinks(url, content, counter);  
            });   
        }
    }).on('error', function(e) {
        console.log("Error: " + e.message);
    });
};

function crawlAndLogLinks(url, content, num) {
    let counter = num;
    let dom = new JSDOM(content);
    const $ = jquery(dom.window);    
    for(var x of dom.window.document.querySelectorAll("a")) {
        if (x.href.includes(url.toLowerCase())){
            console.log(x.href);
            if (counter > 0) {
                collectPageData(x.href, 0);
                counter--;
            }
        }
    }    
};
