const yargs = require('yargs');

const puppeteer = require('puppeteer')
require('dotenv').config();

const argv = yargs
  .option('port', {
    alias: 'p',
    type: 'number',
    default: 9222,
    description: 'Port number (default: 9222)'
  })
  .option('tag_id', {
    alias: 't',
    type: 'string',
    default: 'M;020;01;R',
    description: 'Tag ID (default: "M;020;O1;R")'
  })
  .help()
  .argv;

const WEBSITE_URL = "https://www.cpwshop.com/licensing.page"

async function main(port, tagId) {
    console.log("hi");

    try {
        const browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:' + port.toString(),
            defaultViewport: false,
        });
        const page = await browser.newPage();
        await page.goto(WEBSITE_URL);
        let split = tagId.split(';');

        // the bot starts taking action when Leftover Limited Purchase page is rendered
        await page.waitForSelector('[aria-label="Row #1 - hunt location code"]', { timeout: 0 });
        await page.locator('[aria-label="Row #1 - sub species code"]').fill(split[0])
        await page.locator('[aria-label="Row #1 - hunt location code"]').fill(split[1])
        await page.locator('[aria-label="Row #1 - date period code"]').fill(split[2])
        await page.locator('[aria-label="Row #1 - weapon code"]').fill(split[3])
        
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
        var count = 0;
        do {
            console.log("Count: " + count);
            await page.locator('#submit.btn-primary.action-default.btn.btn-default.first-underline[accesskey="C"]').click({ timeout: 0 })
            .then(async () => {
               await new Promise(resolve => setTimeout(resolve, 100));
               count += 1;
                if (count === 1000 && !isAddToCartBtnVisible) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await page.locator('[aria-label="Row #1 - hunt location code"]').fill("012")
                    await page.locator('[aria-label="Row #1 - date period code"]').fill("O4")
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
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
            });
        } while (!isAddToCartBtnVisible);

        // after the Confirm Choices page is rendered, the bot immediately clicks on the Add to Cart button
        console.log("About to click on the Add to Cart button...");
        await page.waitForSelector('div[data-auto-id="action-bar-right"] a.btn-primary.action-default[accesskey="A"]', { timeout: 0 });
        await page.locator('div[data-auto-id="action-bar-right"] a.btn-primary.action-default[accesskey="A"]').click();
        console.log("The Add to Cart button has successfully been clicked. End of the script."); 
    }
    catch (error) {
        console.log(error);
    }
}


main(argv.port, argv.tag_id);