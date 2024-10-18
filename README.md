# Installation

### Before you can run the bot, follow these steps:

1. Inside the AddToCartBot directory, run the following command in your terminal:

```
npm install puppeteer dotenv
```

2. Create a .env file and fill it with both the web URL and the CAPTCHA solver extension api key

# Running the bot

### Once the installation is complete, follow these steps:

1. Close all open chrome pages. Open a terminal and run the command:

```
\path\to\chrome start chrome --remote-debugging-port=9222
```

- This command opens Chrome in a special mode that allows the bot to control it.
- Make sure the CAPTCHA solver extension is enabled in this Chrome window, as the bot will connect to it.

2. Returning back to the AddToCartBot directory, run the command:

```
node addToCart.js
```

- This command starts the bot, which will connect to the Chrome window you opened and begin interacting with the website.
