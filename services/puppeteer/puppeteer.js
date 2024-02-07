const puppeteer = require("puppeteer");

const startUrl = process.env.APP_URL;
console.log("starting...");

if (!startUrl) {
  console.log("No start URL provided");
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    slowMo: 250,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
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
      await targetPage.waitForTimeout(1000);
    }
  }
  // find post in list and click on it
  {
    const targetPage = page;
    const post = await targetPage.$("li:nth-of-type(13) a");
    if (post) {
      await post.click();
      console.log("clicked post");
      await targetPage.waitForNavigation();
    }
  }
  // navigate back home via back button
  {
    const targetPage = page;
    const backBtn = await targetPage.$("a.post-back-btn");
    if (backBtn) {
      await backBtn.click();
      console.log("clicked back button");
      await targetPage.waitForNavigation();
    }
  }
  // go to another post
  {
    const targetPage = page;
    // get all posts and pick random one
    const posts = await targetPage.$$(".postitem");
    console.log("posts", posts);
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    // get link of random post
    const post = await randomPost.$("a");
    if (post) {
      await post.click();
      console.log("clicked post");
      await targetPage.waitForNavigation();
    }
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
  // go home via logo
  {
    const targetPage = page;
    const logo = await targetPage.$(".logo");
    if (logo) {
      await logo.click();
      console.log("clicked logo");
      await targetPage.waitForNavigation();
    }
  }
  // sign in
  {
    const targetPage = page;
    const signInBtn = await targetPage.$("auth-btn");
    if (signInBtn) {
      await signInBtn.click();
      console.log("clicked sign in");
      await targetPage.waitforNavigation();

      // fill in form
      const emailInput = await targetPage.$("input[name=email]");
      const passwordInput = await targetPage.$("input[name=password]");

      if (emailInput && passwordInput) {
        await emailInput.type("alice.smith@example.com");
        await passwordInput.type("password");
        await targetPage.waitForTimeout(1000);
        await targetPage.keyboard.press("Enter");
        await targetPage.waitForTimeout(2500);
      }
    }
  }

  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
