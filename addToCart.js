const puppeteer = require('puppeteer')
const axios = require('axios')
require('dotenv').config();

const API_KEY = process.env.API_KEY
const WEBSITE_KEY = process.env.WEBSITE_KEY
const WEBSITE_URL = process.env.WEBSITE_URL

async function capSolver() {
    const payload = {
        clientKey: API_KEY,
        task: {
            type: 'ReCaptchaV2TaskProxyLess',
            websiteKey: WEBSITE_KEY,
            websiteURL: WEBSITE_URL,
        }
    };

    try {
        const res = await axios.post("https://api.capsolver.com/createTask", payload);
        const task_id = res.data.taskId;
        if (!task_id) {
            console.log("Failed to create task:", res.data);
            return null;
        }
        console.log("Got taskID:", task_id);

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second

            const getResultPayload = { clientKey: API_KEY, taskId: task_id };
            const resp = await axios.post("https://api.capsolver.com/getTaskResult", getResultPayload);
            const status = resp.data.status;

            if (status === "ready") {
                return resp.data.solution.gRecaptchaResponse;
            }
            if (status === "failed" || resp.data.errorId) {
                console.log("Solve failed! response:", resp.data);
                return null;
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

async function main() {
    try {
        const browser = await puppeteer.launch({
            headless: false,                    // allows user to see puppeteer working in browser
            defaultViewport: false,             // adjusts browser window size
            args: ['--start-maximized'],        // opens browser in full screen
            executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',   // specify the path to the Chrome executable
        });
        const page = await browser.newPage();
        await page.goto(WEBSITE_URL);

        // the bot starts taking action when Leftover Limited Purchase page is rendered
        await page.waitForSelector('[aria-label="Row #1 - hunt location code"]', { timeout: 0 });
        await page.locator('[aria-label="Row #1 - sub species code"]').fill("M")
        await page.locator('[aria-label="Row #1 - hunt location code"]').fill("020")
        await page.locator('[aria-label="Row #1 - date period code"]').fill("O1")
        await page.locator('[aria-label="Row #1 - weapon code"]').fill("R")

        /*capSolver().then(token => {
            console.log(token);
        })*/
        
        // throw the bot in a loop until the checkout button is enabled
        var isCheckoutBtnDisabled = true;
        while (isCheckoutBtnDisabled) {
            console.log("Waiting for the checkout button to be disabled...");
            await page.waitForSelector('#submit.btn-primary.action-default.btn.btn-default.first-underline[accesskey="C"]', { timeout: 0 });
            console.log("I see the checkout button is disabled."); 
            isCheckoutBtnDisabled = await page.evaluate(async () => {
                const button = document.querySelector('#submit.btn-primary.action-default.btn.btn-default.first-underline.disabled[accesskey="C"]');
                if (button != null) { // if the button still exists, that means the checkout button is still disabled
                    console.log("The checkout button is still disabled.")
                    return true
                } else { // if the button no longer exists, that means the checkout button is no longer disabled
                    console.log("The checkout button is now enabled. Proceeding...")
                    return false
                }
            });
        }

        // after the checkout button is enabled, throw the bot into another loop clicking on the checkout button until a tag is "dropped in"
        var isAddToCartBtnVisible = false;
        var count = 0; //remove
        do {
            console.log("About to click on the enabled checkout button...");
            await page.click('#submit.btn-primary.action-default.btn.btn-default.first-underline[accesskey="C"]'); // click the enabled checkout button
            await new Promise(resolve => setTimeout(resolve, 100));
            // simulation of a tag being "dropped in"
            count += 1;//remove
            if (count === 200 && !isAddToCartBtnVisible) {//remove
                await new Promise(resolve => setTimeout(resolve, 1000));//remove
                await page.locator('[aria-label="Row #1 - hunt location code"]').fill("012")//remove
                await page.locator('[aria-label="Row #1 - date period code"]').fill("O4")//remove
            }//remove
            console.log("Clicking on the enabled checkout button...");
            isAddToCartBtnVisible = await page.evaluate(() => {
                const button = document.querySelector('div[data-auto-id="action-bar-right"] a.btn-primary.action-default[accesskey="A"]');
                if (button != null) { // if the button exists, that means the Add to Cart button is visible
                    console.log("Add to Cart button is now visible. Proceeding...");
                    return true;
                } else { // if the button does not exist, that means the Add to Cart button is not visible
                    console.log("Add to Cart button is still not visible.");
                    return false;
                }
            })
        } while (!isAddToCartBtnVisible);

        // after the Confirm Choices page is rendered, the bot immediately clicks on the Add to Cart button
        console.log("About to click on the Add to Cart button...");
        await page.waitForSelector('div[data-auto-id="action-bar-right"] a.btn-primary.action-default[accesskey="A"]', { timeout: 0 });
        await page.click('div[data-auto-id="action-bar-right"] a.btn-primary.action-default[accesskey="A"]');
        console.log("Add to Cart button clicked successfully.");
    }
    catch (error) {
        console.log(error);
    }
}

main();