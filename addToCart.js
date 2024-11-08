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
    default: 'E;057;O3;R',
    description: 'Tag ID (default: "E;057;O3;R")'
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
        //var count = 0;

        do {
            try {
                // Click the checkout button
                await page.locator('#submit.btn-primary.action-default.btn.btn-default.first-underline[accesskey="C"]').click();
                await new Promise(resolve => setTimeout(resolve, 187)); // Wait for 187 milliseconds

                /*console.log("Count: " + count);
                count += 1;

                // After 1000 attempts, fill in additional fields if the button isn't visible yet
                if (count === 1000 && !isAddToCartBtnVisible) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    await page.locator('[aria-label="Row #1 - hunt location code"]').fill("012");
                    await page.locator('[aria-label="Row #1 - date period code"]').fill("O4");
                }*/

                console.log("Checking if the Add to Cart button is visible...");

                // Check if the Add to Cart button is visible
                isAddToCartBtnVisible = await page.evaluate(() => {
                    const button = document.querySelector('div[data-auto-id="action-bar-right"] a.btn-primary.action-default[accesskey="A"]');
                    return button != null;
                });

                if (isAddToCartBtnVisible) {
                    console.log("Add to Cart button is now visible. Exiting loop...");
                    break; // Exit the loop immediately
                } else {
                    console.log("Add to Cart button is still not visible.");
                }
            } catch (err) {
                console.error("An error occurred in the loop:", err);
                // Decide whether to continue or break based on the error
                break; // Optionally break out of the loop on error
            }
        } while (!isAddToCartBtnVisible);

        // Code after the loop
        if (isAddToCartBtnVisible) {
            console.log("About to click on the Add to Cart button...");
            await page.locator('div[data-auto-id="action-bar-right"] a.btn-primary.action-default[accesskey="A"]').click();
            console.log("The Add to Cart button has been clicked. End of the script.");
        } else {
            console.log("Failed to find the Add to Cart button. Ending script.");
        }

    }
    catch (error) {
        console.log(error);
    }
}


main(argv.port, argv.tag_id);