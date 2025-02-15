const process = require('node:process');
const express = require('express');
const { chromium } = require("playwright-chromium");

const PORT = process.env.PORT || 8000;

const app = express();

app.get('/error', (req, res) => {
  let msg = atob(req.query.msg);
  res.send(`<pre>${msg}</pre>`);
});

app.get('/render', async (req, res) => {
  let redirectDisabled = req.query.redirect === 'false';
  let url = req.query.url;
  if (!url) {
    url = `http://localhost:${PORT}/error?msg=${btoa('Missing url query param')}`;
  } else {
    try {
      url = atob(url);
    } catch (err) {
      url = `http://localhost:${PORT}/error?msg=${btoa(err.message)}`;
    }
  }

  let buffer;
  try {
    const browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({
      width: 800,
      height: 480,
    });
    await page.goto(url);
    buffer = await page.screenshot();
    await browser.close();
  } catch (err) {
    console.log(err);
    const errURL = `http://localhost:${PORT}/error?msg=${btoa(err.message)}`;
    if (!redirectDisabled) {
      res.redirect(`/render?url=${btoa(errURL)}&redirect=false`);
    } else {
      res.status(500).send(err.message);
    }
    return;
  }

  res.set('Content-Disposition', 'inline');
  res.set('Content-Type', 'image/png');
  res.send(buffer);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
