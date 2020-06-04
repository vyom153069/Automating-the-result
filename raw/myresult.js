let puppeteer=require("puppeteer");
let merge = require('easy-pdf-merge');
let nodemailer=require('nodemailer');
let fs=require("fs");
let enroll=process.argv[2];
let branch=process.argv[3];
let credentialsFile=process.argv[4];

(async function(){

    //credentials
    let data = await fs.promises.readFile(credentialsFile, "utf-8");
    let credentials = JSON.parse(data);
    let myEmail = credentials.senderEmail;
    let pwd = credentials.pwd;

   //browser activity
    let browser=await puppeteer.launch({
        headless:true,
        defaultViewport:null,
        args:["--start-maximized","--disable-notifications"],
    });
    let numberofpages=await browser.pages();
    let tab=numberofpages[0];
    await tab.goto("https://ipuresults.co.in/",{waitUntil:"networkidle2",timeout:60000});


    //enroll and branch 
    console.log("page open");
    await tab.waitForSelector("#enrolment");
    console.log("Enrollment number inserted");
    await tab.type("#enrolment",enroll,{delay:100});
    await tab.click(".input-control select");
    await tab.keyboard.type(branch);
    await tab.keyboard.press("Enter");
    console.log("Branch chosen");


    //getting result
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

    //first overall result page
     //await tab.waitForNavigation("flex-grid block-shadow-danger",{timeout:160000});
     //let overall=await tab.$(".flex-grid block-shadow-danger");
     //await tab.evaluate(overall => overall.innerHTML, overall);
     //let newTab = await browser.newPage();
     //await newTab.setContent(overall);
    // await tab.pdf({path:'./overall.pdf'});
    // pdfFiles.push("./overall.pdf");

     //expending all semesters
    await tab.evaluate(() => {
		let semesters = document.querySelectorAll(".panel.collapsible");
		semesters.forEach((sem) => {
			sem.querySelector("div.content").style.display = "block";
		});
    });
   
    //pdf of every semester
    await tab.waitForSelector(".panel.collapsible",{timeout:160000});
    let report=await tab.$$(".panel.collapsible");
    let final="";
    for(let i=0;i<report.length;i++){
        const element = report[i];
        await tab.waitForSelector(".panel.collapsible");
        let text = await tab.evaluate(element => element.innerHTML, element);
        let newTab = await browser.newPage();
        await newTab.setContent(text);
        await newTab.pdf({ path: `./page${report.length-i}.pdf` });
        console.log(`Semester ${report.length-i} added`);
        pdfFiles.push(`C:\\Users\\hp\\Downloads\\pep coding\\may_29_2020\\raw\\page${report.length-i}.pdf`)
        //pdfFiles.push(`./${report.length-i}.pdf`);
        console.log("***************************");
    }
    console.log(final);
     browser.close();
     console.log("closed");

     //browser closed and merging pdf start
     await mergeMultiplePDF(pdfFiles);

     //mailing result to client
 /*    let transport=nodemailer.createTransport({
         service:"gmail",
         auth:{
             user:myEmail,
             pass:pwd,
         }
     })
     let message={
         from:myEmail,
         to:'vyomchandra@gmail.com',
        subject:"Your Result",
        text:"Here is your result!",
        attachment:[{
            path:'./samplefinal.pdf',
        }
        ]
     }
     transport.sendMail(message,function(err){
         if(err){
             console.log("Failed to send email.\n");
             return;
         }
         console.log("Email sent\n check your email.")
     })
     */

})();

const mergeMultiplePDF = (pdfFiles) => {
    return new Promise((resolve, reject) => {
        merge(pdfFiles,'C:\\Users\\hp\\Downloads\\pep coding\\may_29_2020\\raw\\finalresult.pdf',function(err){

            if(err){
                console.log(err);
                reject(err)
            }

            console.log('Success');
            resolve()
        });
    });
};
