let puppeteer=require("puppeteer");
const merge = require('easy-pdf-merge');
let enroll=process.argv[2];

(async function(){
    let browser=await puppeteer.launch({
        headless:true,
        defaultViewport:null,
        args:["--start-maximized","--disable-notifications"],
        slowMo:200
    });
    let numberofpages=await browser.pages();
    let tab=numberofpages[0];
    await tab.goto("https://ipuresults.co.in/",{waitUntil:"networkidle2",timeout:60000});
    console.log("page open");
    await tab.waitForSelector("#enrolment");
    console.log("Enrollment number inserted");
    await tab.type("#enrolment",enroll,{delay:100});
    await tab.click(".input-control select");
    await tab.keyboard.type("bt");
    await tab.keyboard.press("Enter");
    console.log("Branch chosen");
    await Promise.all([tab.click("input[value='GET RESULT']"), tab.waitForNavigation({
        waitUntil: "networkidle2",
        delay:400,
        timeout: 60000
    })])
    await tab.waitForSelector("#wrapper", {
        visible: true,
        timeout:160000
      });
      let pdfFiles=[];
    await tab.waitForNavigation("flex-grid.block-shadow-danger");
    let overall=await tab.$(".flex-grid.block-shadow-danger");
    await tab.evaluate(overall => overall.innerHTML, overall);
    await tab.setContent(overall);
    await tab.pdf({path:'./overall.pdf'});
    pdfFiles.push("./overall.pdf");
    await tab.evaluate(() => {
		let semesters = document.querySelectorAll(".panel.collapsible");
		semesters.forEach((sem) => {
			sem.querySelector("div.content").style.display = "block";
		});
    });
    await tab.waitForSelector(".panel.collapsible");
    let report=await tab.$$(".panel.collapsible");
    for(let i=0;i<report.length;i++){
        const element = report[i];
        await tab.waitForSelector(".panel.collapsible");
        let text = await tab.evaluate(element => element.innerHTML, element);
        //console.log(text+"");
        await tab.setContent(text);
        await tab.pdf({ path: `./page${report.length-i}.pdf` });
        console.log(`Semester ${report.length-i} created`);
        pdfFiles.push(`./${report.length-i}.pdf`);
        //window.open(`${report.length-i}.pdf`);
        console.log("***************************");
    }
     await tab.pdf({path: './result.pdf', format: 'A4', printBackground: true, delay:4000});
     browser.close();
     console.log("closed");
     await mergeMultiplePDF(pdfFiles);
})();

const mergeMultiplePDF = (pdfFiles) => {
    return new Promise((resolve, reject) => {
        merge(pdfFiles,'./samplefinal.pdf',function(err){

            if(err){
                console.log(err);
                reject(err)
            }

            console.log('Success');
            resolve()
        });
    });
};
