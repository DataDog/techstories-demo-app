const puppeteer = require("puppeteer");

const startUrl = process.env.APP_URL;
console.log("starting...");

if (!startUrl) {
  console.log("No start URL provided");
  process.exit(1);
}

const createBrowser = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      slowMo: 1750,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "'--shm-size=4gb",
      ],
      ignoreHTTPSErrors: true,
    });

    return browser;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// first session (everything works with maybe some quotes api errors)
const firstSession = async () => {
  console.log("starting first session...\n\n");
  try {
    const browser = await createBrowser();

    const page = await browser.newPage();
    const timeout = 30000;
    page.setDefaultTimeout(timeout);

    {
      const targetPage = page;
      await targetPage.setViewport({
        width: 1487,
        height: 1294,
      });
    }
    // go to start url
    {
      const targetPage = page;
      await targetPage.goto(startUrl, { waitUntil: "domcontentloaded" });
      console.log(`on page ${await targetPage.title()}`);
    }
    // click on button to get quote
    {
      const targetPage = page;
      const quoteBtn = await targetPage.$("button.quote-btn");
      if (quoteBtn) {
        await quoteBtn.click();
        console.log("clicked quote button");
        await targetPage.waitForTimeout(2500);
      }
    }
    // find post in list and click on it
    {
      const targetPage = page;
      const post = await targetPage.$("li:nth-of-type(13) a");
      if (post) {
        await Promise.all([targetPage.waitForNavigation(), post.click()]);
        console.log("clicked post");
      }
    }
    // navigate back home via back button
    {
      const targetPage = page;
      const backBtn = await targetPage.$("a.post-back-btn");
      if (backBtn) {
        await Promise.all([targetPage.waitForNavigation(), backBtn.click()]);
        console.log("clicked back button");
      }
    }
    // go to another post
    {
      const targetPage = page;
      const postListLength = await targetPage.$$eval(
        ".postitem",
        (list) => list.length
      );
      const post = await targetPage.$(
        `li:nth-of-type(${Math.floor(Math.random() * postListLength)}) a`
      );
      if (post) {
        await Promise.all([targetPage.waitForNavigation(), post.click()]);
        console.log("clicked post");
        await targetPage.waitForTimeout(2500);
      }
    }
    // click on button to get quote
    {
      const targetPage = page;
      console.log(`on page ${await targetPage.title()}`);
      const quoteBtn = await targetPage.$("button.quote-btn");
      if (quoteBtn) {
        await Promise.all([targetPage.waitForTimeout(2500), quoteBtn.click()]);
        console.log("clicked quote button");
        await targetPage.waitForTimeout(2500);
      }
    }
    // go home via logo
    {
      const targetPage = page;
      await targetPage.waitForSelector(".logo");
      const logo = await targetPage.$(".logo");
      if (logo) {
        await Promise.all([targetPage.waitForNavigation(), logo.click()]);
        console.log("clicked logo");
        await targetPage.waitForTimeout(2500);
      }
    }
    // sign in
    {
      const targetPage = page;
      console.log(`about to click signin on ${await targetPage.title()}`);
      const signInBtn = await targetPage.$(".auth-btn");

      if (signInBtn) {
        await Promise.all([targetPage.waitForNavigation(), signInBtn.click()]);
        console.log("clicked sign in");
        await targetPage.waitForTimeout(2500);

        // fill in form
        const [emailInput, passwordInput] = await Promise.all([
          targetPage.$("input[name=email]"),
          targetPage.$("input[name=password]"),
        ]);

        if (emailInput && passwordInput) {
          await emailInput.type("alice.smith@example.com");
          await passwordInput.type("password");
          await targetPage.waitForTimeout(2000);
          await Promise.all([
            targetPage.waitForNavigation(),
            passwordInput.press("Enter"),
          ]);
          console.log("submitted login form");
          await targetPage.waitForTimeout(2500);
        }
      }
    }
    // vote on a post on the home page
    {
      const targetPage = page;
      const postListLength = await targetPage.$$eval(
        ".postitem",
        (list) => list.length
      );
      const post = await targetPage.$(
        `li:nth-of-type(${Math.floor(
          Math.random() * postListLength
        )}) .vote-btn`
      );
      if (post) {
        await Promise.all([targetPage.waitForTimeout(2500), post.click()]);
        console.log("clicked vote");
        await targetPage.waitForTimeout(2500);
      }
    }
    // go to another post and vote
    {
      const targetPage = page;
      const postListLength = await targetPage.$$eval(
        ".postitem",
        (list) => list.length
      );
      const post = await targetPage.$(
        `li:nth-of-type(${Math.floor(Math.random() * postListLength)}) a`
      );
      if (post) {
        await Promise.all([targetPage.waitForNavigation(), post.click()]);
        console.log("clicked post");
        await targetPage.waitForTimeout(2500);
        await targetPage.waitForSelector(".vote-btn");
        const voteBtn = await targetPage.$(".vote-btn");

        if (voteBtn) {
          await Promise.all([targetPage.waitForTimeout(2500), voteBtn.click()]);
          console.log(
            `clicked vote on single post page ${await targetPage.title()}`
          );
        }
      }
    }
    // go to the user page
    {
      const targetPage = page;
      const userBtn = await targetPage.$(".user-btn");
      if (userBtn) {
        await Promise.all([targetPage.waitForNavigation(), userBtn.click()]);
        console.log("clicked user button");
        await targetPage.waitForTimeout(2500);
      }
    }
    console.log("closing first session\n\n");
    await browser.close();
  } catch (err) {
    console.log("error in first session");
    console.error(err);
    process.exit(1);
  }
};

// second session (some errrors)
const secondSession = async () => {
  console.log("starting second session...\n\n");
  try {
    const browser = await createBrowser();
    const page = await browser.newPage();
    const timeout = 30000;
    page.setDefaultTimeout(timeout);

    {
      const targetPage = page;
      await targetPage.setViewport({
        width: 1487,
        height: 1294,
      });
    }
    // go to start url
    {
      const targetPage = page;
      await targetPage.goto(startUrl, { waitUntil: "domcontentloaded" });
      console.log(`on page ${await targetPage.title()}`);
    }
    // click on button to get quote
    {
      const targetPage = page;
      const quoteBtn = await targetPage.$("button.quote-btn");
      if (quoteBtn) {
        await Promise.all([targetPage.waitForTimeout(2500), quoteBtn.click()]);
        console.log("clicked quote button");
      }
    }
    // find post in list and click on it
    {
      const targetPage = page;
      const post = await targetPage.$("li:nth-of-type(13) a");
      if (post) {
        await Promise.all([targetPage.waitForNavigation({}), post.click()]);
        console.log("clicked post");
        await targetPage.waitForTimeout(2500);
      }
    }
    // sign in
    {
      const targetPage = page;
      console.log(`about to click signin on ${await targetPage.title()}`);
      const signInBtn = await targetPage.$(".auth-btn");

      if (signInBtn) {
        await Promise.all([targetPage.waitForNavigation(), signInBtn.click()]);
        console.log("clicked sign in");

        // fill in form
        const [emailInput, passwordInput] = await Promise.all([
          targetPage.$("input[name=email]"),
          targetPage.$("input[name=password]"),
        ]);

        if (emailInput && passwordInput) {
          await emailInput.type("harper.walker@example.com");
          await passwordInput.type("password");
          await Promise.all([
            targetPage.waitForNavigation(),
            passwordInput.press("Enter"),
          ]);
          console.log("submitted login form");
          await targetPage.waitForTimeout(2500);
          console.log(`on page ${await targetPage.title()}`);
        }
      }
    }

    // go to the user page
    {
      const targetPage = page;
      console.log(
        `about to go to user page on page ${await targetPage.title()}`
      );
      await targetPage.waitForSelector(".user-btn");
      const userBtn = await targetPage.$(".user-btn");
      if (userBtn) {
        await Promise.all([targetPage.waitForNavigation(), userBtn.click()]);
        console.log("clicked user button");
        await targetPage.waitForTimeout(2500);
      }
    }
    console.log("closing second session\n\n");
    await browser.close();
  } catch (err) {
    console.log("error in second session");
    console.error(err);
    process.exit(1);
  }
};

// third session (logged out errrors)
const thirdSession = async () => {
  console.log("starting third session...\n\n");
  try {
    const browser = await createBrowser();
    const page = await browser.newPage();
    const timeout = 30000;
    page.setDefaultTimeout(timeout);

    {
      const targetPage = page;
      await targetPage.setViewport({
        width: 1487,
        height: 1294,
      });
    }
    // go to start url
    {
      const targetPage = page;
      await targetPage.goto(startUrl, { waitUntil: "domcontentloaded" });
      console.log(`on page ${await targetPage.title()}`);
    }
    // click on button to get quote
    {
      const targetPage = page;
      const quoteBtn = await targetPage.$("button.quote-btn");
      if (quoteBtn) {
        await quoteBtn.click();
        console.log("clicked quote button");
        await targetPage.waitForTimeout(2500);
      }
    }
    // find post in list and click on it
    {
      const targetPage = page;
      const post = await targetPage.$("li:nth-of-type(13) a");
      if (post) {
        await Promise.all([targetPage.waitForNavigation(), post.click()]);
        console.log("clicked post");
      }
    }
    // navigate back home via back button
    {
      const targetPage = page;
      const backBtn = await targetPage.$("a.post-back-btn");
      if (backBtn) {
        await Promise.all([targetPage.waitForNavigation(), backBtn.click()]);
        console.log("clicked back button");
      }
    }
    // go to another post
    {
      const targetPage = page;
      const postListLength = await targetPage.$$eval(
        ".postitem",
        (list) => list.length
      );
      const post = await targetPage.$(
        `li:nth-of-type(${Math.floor(Math.random() * postListLength)}) a`
      );
      if (post) {
        await Promise.all([targetPage.waitForNavigation(), post.click()]);
        console.log("clicked post");
        await targetPage.waitForTimeout(2500);
      }
    }
    // click on button to get quote
    {
      const targetPage = page;
      console.log(`on page ${await targetPage.title()}`);
      const quoteBtn = await targetPage.$("button.quote-btn");
      if (quoteBtn) {
        await Promise.all([targetPage.waitForTimeout(2500), quoteBtn.click()]);
        console.log("clicked quote button");
      }
    }
    // go home via logo
    {
      const targetPage = page;
      await targetPage.waitForSelector(".logo");
      await Promise.all([
        targetPage.waitForNavigation(),
        targetPage.click(".logo"),
      ]);
      console.log("clicked logo");
      await targetPage.waitForTimeout(2500);
    }
    // go to the user page
    {
      const targetPage = page;
      await targetPage.waitForSelector(".user-btn");
      await Promise.all([
        targetPage.waitForNavigation(),
        targetPage.click(".user-btn"),
      ]);
      console.log("clicked user button");
      await targetPage.waitForTimeout(2500);
    }
    console.log("closing third session\n\n");
    await browser.close();
  } catch (err) {
    console.log("error in third session");
    console.error(err);
    process.exit(1);
  }
};

// for (let i = 0; i < 2; i++) {
//   setTimeout(() => {
//     // randomly choose which session to run
//     const session = Math.floor(Math.random() * 3);
//     if (session === 0) {
//       (() => firstSession())();
//     } else if (session === 1) {
//       (() => secondSession())();
//     } else {
//       (() => thirdSession())();
//     }
//   }, 500 * i);
// }

(() => firstSession())();
