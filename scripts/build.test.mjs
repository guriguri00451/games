import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, isValidId, renderPlayPage, renderSitemap, selectLocalGames } from "./build.mjs";

const untido = {
  id: "untido",
  type: "local",
  title: "うんち道",
  description: "円を描いて、一巻き。",
  addedAt: "2026-11-13",
  thumbnail: "games/untido/thumb.jpg",
  instructions: ["一、円を描け。"],
};

test("escapeHtml escapes characters that could break out of attributes", () => {
  assert.equal(escapeHtml(`<a href="x">'&`), "&lt;a href=&quot;x&quot;&gt;&#39;&amp;");
});

test("isValidId rejects path traversal", () => {
  assert.equal(isValidId("../etc"), false);
});

test("isValidId accepts lowercase ids with hyphens", () => {
  assert.equal(isValidId("my-game-2"), true);
});

test("renderPlayPage includes an absolute canonical URL", () => {
  assert.match(renderPlayPage(untido), /<link rel="canonical" href="https:\/\/guriguri00451\.github\.io\/games\/play\/untido\/">/);
});

test("renderPlayPage bakes the title into the static HTML", () => {
  assert.match(renderPlayPage(untido), /<title>うんち道 \| t\.そーまGames<\/title>/);
});

test("renderPlayPage uses an absolute og:image URL", () => {
  assert.match(renderPlayPage(untido), /og:image" content="https:\/\/guriguri00451\.github\.io\/games\/games\/untido\/thumb\.jpg"/);
});

test("renderPlayPage omits og:image when there is no thumbnail", () => {
  assert.doesNotMatch(renderPlayPage({ ...untido, thumbnail: undefined }), /og:image/);
});

test("renderPlayPage escapes HTML in instructions", () => {
  assert.match(renderPlayPage({ ...untido, instructions: ["<b>"] }), /<li>&lt;b&gt;<\/li>/);
});

test("renderSitemap lists the top page and each game page", () => {
  const locs = [...renderSitemap([untido]).matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, ["https://guriguri00451.github.io/games/", "https://guriguri00451.github.io/games/play/untido/"]);
});

test("selectLocalGames excludes external games", () => {
  assert.deepEqual(selectLocalGames([untido, { id: "ext", type: "external" }]), [untido]);
});

test("selectLocalGames throws on an invalid id", () => {
  assert.throws(() => selectLocalGames([{ ...untido, id: "Bad/Id" }]), /不正なid/);
});
