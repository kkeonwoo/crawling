const express = require("express");
const axios = require("axios");
const cors = require("cors");
const morgan = require("morgan");
const cheerio = require("cheerio");
const app = express();
const puppeteer = require("puppeteer");

app.use(cors());

app.set("port", process.env.PORT || "8099");
const port = app.get("port");

app.get("/", (req, res) => {
  res.render("index");
});

// 동적 로딩 ssr / csr (vue, react) puppeteer (구글, 크롬에서만 동작)
// 동기적 실행 비동기적 실행

// proise 비동기적 실행을 동기적으로 처리할 수 있다.
// function 앞에 async를 붙이면 await을 사용할 수 있고, await은 promise를 리턴한다.
app.get("/gmarket/:item", async (req, res) => {
  const item = req.params.item;
  const searchItem = encodeURIComponent(item);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disalbe-setuid-sandbox", ""],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1620,
    height: 2000,
  });
  await page.goto(`https://browse.gmarket.co.kr/search?keyword=${searchItem}`, { waitUntil: "load" });
  const content = await page.content();
  const $ = cheerio.load(content);
  const items = $(".box__component-itemcard");
  const sendItemsArray = [];
  items.each((idx, item) => {
    const title = $(item).find(".text__item").text();
    const img = $(item).find(".image__item").attr("src");
    const price = $(item).find(".text__value").text();
    const link = $(item).find(".box__image a").attr("href");
    sendItemsArray.push({ title: title, price: price, image: img, link: link });
    // console.log(img);
  });
  res.json(sendItemsArray);
});

// app.get("/daum/news", (req, res) => {
//   axios({
//     url: "http://news.daum.net",
//   }).then((response) => {
//     // console.log(response.data);
//     const $ = cheerio.load(response.data);
//     const newsList = $(".list_newsissue").children("li");
//     const sendNewsList = [];
//     newsList.each((idx, item) => {
//       sendNewsList.push({
//         title: $(item).find(".tit_g").text().replaceAll("\n", "").trim(),
//         img: $(item).find(".wrap_thumb .thumb_g").attr("src"),
//         category: $(item).find(".txt_category").text(),
//         company: $(item).find(".logo_cp .thumb_g").attr("src"),
//         url: $(item).find(".tit_g a").attr("href"),
//       });
//     });
//     res.json(sendNewsList);
//     // res.send(sendNewsList);
//   });
// });

// app.get("/gmarket/tomato", (req, res) => {
//   axios({
//     url: "http://corners.gmarket.co.kr/SuperDeals",
//   })
//     .then((response) => {
//       // console.log(response.data);
//       const $ = cheerio.load(response.data);
//       const shoppingList = $(".item_list").children("li");
//       const sendShopList = [];
//       shoppingList.each((idx, item) => {
//         sendShopList.push({
//           title: $(item).find(".inner a .title").text(),
//           img: $(item).find(".inner a .thumb").attr("src"),
//           sale: $(item).find(".info .sale strong").text(),
//           price: $(item).find(".info .price strong").text(),
//           delPrice: $(item).find(".info .price del").text(),
//           tag: $(item).find(".tag:nth-child(2)").text(),
//           url: $(item).find(".inner a").attr("href"),
//           buy: $(item).find(".option .buy").text(),
//         });
//       });
//       res.json(sendShopList);
//     })
//     .catch((error) => {
//       console.log(error);
//     });
// });

app.listen(port, () => {
  console.log(`${port}번에서 서버 대기중`);
});
