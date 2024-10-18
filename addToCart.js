const puppeteer = require('puppeteer')
require('dotenv').config();

const WEBSITE_URL = process.env.WEBSITE_URL

async function main() {
    try {
        const browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: false,
        });
        const page = await browser.newPage();
        await page.goto(WEBSITE_URL);

        // the bot starts taking action when Leftover Limited Purchase page is rendered
        await page.waitForSelector('[aria-label="Row #1 - hunt location code"]', { timeout: 0 });
        await page.locator('[aria-label="Row #1 - sub species code"]').fill("M")
        await page.locator('[aria-label="Row #1 - hunt location code"]').fill("020")
        await page.locator('[aria-label="Row #1 - date period code"]').fill("O1")
        await page.locator('[aria-label="Row #1 - weapon code"]').fill("R")
        
        // throw the bot in a loop until the checkout button is enabled
        var isCheckoutBtnDisabled = true;
        while (isCheckoutBtnDisabled) {
            await page.waitForSelector('#submit.btn-primary.action-default.btn.btn-default.first-underline[accesskey="C"]', { timeout: 0 });
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
            console.log("Count " + count + ": About to click on the enabled checkout button...");
            //await page.waitForSelector('#submit.btn-primary.action-default.btn.btn-default.first-underline[accesskey="C"]', { timeout: 0 });
            await page.locator('#submit.btn-primary.action-default.btn.btn-default.first-underline[accesskey="C"]').click(); // click the enabled checkout button
            await new Promise(resolve => setTimeout(resolve, 100));
            // simulation of a tag being "dropped in"
            count += 1;//remove
            if (count === 1000 && !isAddToCartBtnVisible) {//remove
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
        await new Promise(resolve => setTimeout(resolve, 100)); // need
        console.log("About to click on the Add to Cart button...");
        await page.waitForSelector('div[data-auto-id="action-bar-right"] a.btn-primary.action-default[accesskey="A"]', { timeout: 0 });
        await page.locator('div[data-auto-id="action-bar-right"] a.btn-primary.action-default[accesskey="A"]').click();
        console.log("Add to Cart button clicked successfully.");
    }
    catch (error) {
        console.log(error);
    }
}

main();