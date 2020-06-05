let puppeteer = require("puppeteer");
//let merge = require("easy-pdf-merge");
let nodemailer = require("nodemailer");
let fs = require("fs");

let credentialsFile = process.argv[2];
var currentPath = process.cwd();

(async function () {
  //credentials
  let data = await fs.promises.readFile(credentialsFile, "utf-8");
  let credentials = JSON.parse(data);
  let myEmail = credentials.from;
  let pwd = credentials.pwd;
  let enroll = credentials.enroll;
  let course = credentials.course;
  let to = credentials.to;

  //browser activity
  let browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ["--start-maximized", "--disable-notifications"],
  });
  let numberofpages = await browser.pages();
  let tab = numberofpages[0];
  await tab.goto("https://ipuresults.co.in/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  //course and branch
  console.log("page open");
  await tab.waitForSelector("#enrolment");
  console.log("Enrollment number inserted");
  await tab.type("#enrolment", enroll, { delay: 100 });
  await tab.click(".input-control select");
  await tab.keyboard.type(course);
  await tab.keyboard.press("Enter");
  console.log("Course chosen");

  //getting result
  await Promise.all([
    tab.click("input[value='GET RESULT']"),
    tab.waitForNavigation({
      waitUntil: "networkidle2",
      delay: 400,
      timeout: 60000,
    }),
  ]);
  await tab.waitForSelector("#wrapper", {
    visible: true,
    timeout: 160000,
  });
  //let pdfFiles=[];
  let final = "";

  //first overall result page
  await tab.waitForSelector(".flex-grid.block-shadow-danger", {
    timeout: 160000,
  });
  let overall = await tab.$(".flex-grid.block-shadow-danger");
  let text = await tab.evaluate((overall) => overall.innerHTML, overall);
  final += `<hr><div>${text}</div><hr>`;
  //console.log(final);

  //first pdf (but no need)
  /*
     let newTab = await browser.newPage();
     await newTab.setContent(text);
     await newTab.pdf({ path: `./overall.pdf` });
     pdfFiles.push(`${currentPath}\\overall.pdf`)
     */

  //expending all semesters
  await tab.evaluate(() => {
    let semesters = document.querySelectorAll(".panel.collapsible");
    semesters.forEach((sem) => {
      sem.querySelector("div.content").style.display = "block";
    });
  });

  //pdf of every semester
  await tab.waitForSelector(".panel.collapsible", { timeout: 160000 });
  let report = await tab.$$(".panel.collapsible");

  for (let i = 0; i < report.length; i++) {
    const element = report[i];
    await tab.waitForSelector(".panel.collapsible");
    let text = await tab.evaluate((element) => element.innerHTML, element);
    final += `<hr><div>${text}</div><hr>`;

    //next results pdf but no need
    /*
        let newTab = await browser.newPage();
        await newTab.setContent(text);
        await newTab.pdf({ path: `./page${report.length-i}.pdf` });
        */
    console.log(`Semester ${report.length - i} added`);
    // pdfFiles.push(`${currentPath}\\page${report.length-i}.pdf`)
    console.log("***************************");
  }
  await tab.setContent(final);
  await tab.pdf({ path: "./result.pdf" });
  fs.writeFileSync("./result.html", final);
  //console.log(final);
  browser.close();
  console.log("closed");

  //browser closed and merging pdf start

  //await mergeMultiplePDF(pdfFiles);

  //mailing result to client

  let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // use SSL
    service: "gmail",
    auth: {
      user: myEmail,
      pass: pwd,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  let message = {
    from: myEmail,
    to: to,
    subject: "Your Result",
    text: "Here is your result!",
    attachments: [
      {
        filename: "result.pdf",
        path: `${currentPath}\\result.pdf`,
      },
    ],
  };
  transport.sendMail(message, function (err) {
    if (err) {
      console.log("Failed to send email.\n" + err.message);
      return;
    }
    console.log("Email sent\n check your email.");
  });
})();

/*const mergeMultiplePDF = (pdfFiles) => {
    return new Promise((resolve, reject) => {
        merge(pdfFiles,`${currentPath}\\finalresult.pdf`,function(err){

            if(err){
                console.log(err);
                reject(err)
            }

            console.log('Success');
            resolve()
        });
    });
};*/
