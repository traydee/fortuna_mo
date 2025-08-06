// fetch("https://script.google.com/macros/s/AKfycbxplvQPVt_IIyJXPEoPNlS1SXBNuHmQOvr5xwUqy9zJEX0xtyF2RvsZxRjCK94evoAlvw/exec", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded"
//   },
//   body: new URLSearchParams({
//     action: "addFriends",
//     user_id: 5744864118,
//     value: 1
//   })
// })
// .then(response => response.text())
// .then(text => {
//   console.log("Ответ:", text);
// })
// .catch(error => {
//   console.error("Ошибка:", error);
// });

// fetch("https://script.google.com/macros/s/AKfycbxplvQPVt_IIyJXPEoPNlS1SXBNuHmQOvr5xwUqy9zJEX0xtyF2RvsZxRjCK94evoAlvw/exec", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded"
//   },
//   body: new URLSearchParams({
//     action: "minusValue",
//     user_id: 5744864118
//   })
// })
// .then(response => response.text())
// .then(result => {
//   console.log("Значение из таблицы:", result);
// })
// .catch(error => {
//   console.error("Ошибка:", error);
// });

// const payload = new URLSearchParams({
//   action: "savePrize",
//   username: "notcoin_bank_official",
//   user_id: 5744864118,
//   prize: "check",
// });

// fetch("https://script.google.com/macros/s/AKfycbxplvQPVt_IIyJXPEoPNlS1SXBNuHmQOvr5xwUqy9zJEX0xtyF2RvsZxRjCK94evoAlvw/exec", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded"
//   },
//   body: payload.toString()
// })
// .then(response => {
//   if (!response.ok) {
//     throw new Error(`HTTP error! Status: ${response.status}`);
//   }
//   return response.text(); // <-- заменили json() на text()
// })
// .then(data => {
//   console.log("Успех:", data);
// })
// .catch(error => {
//   console.error("Ошибка запроса:", error);
// });