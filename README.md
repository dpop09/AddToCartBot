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
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

then,

```
.\runner.ps1 -TagId "M;051;O4;R" -Instances 2
```

- This command opens two Chrome pages in a special mode that allows the bot to control it.
- Make sure the CAPTCHA solver extension is enabled on boths Chrome windows, as the bots will connect to each Chrome page respectively.
