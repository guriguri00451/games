// 旧URL(play.html?id=xxx)は静的ページ(play/xxx/)へ移したので転送だけ行う。
// idは英小文字・数字・ハイフンに限定し、任意のパスへ飛ばされないようにする
const requestedId = new URLSearchParams(location.search).get("id") || "";
const isValidId = /^[a-z0-9][a-z0-9-]*$/.test(requestedId);
location.replace(isValidId ? `play/${requestedId}/` : "./");
