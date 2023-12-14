require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const schedule = require("node-schedule");
const mongoose = require("mongoose");
const app = express();
const bot = new TelegramBot(process.env.botTOKEN, {
  polling: true,
});
const botModel = require("./models/bot");
const userModel = require("./models/user");
const delay = require("delay");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);
const docxTables = require("./docx-tables.js");

const timeList = ["05:00", "06:00", "18:00", "19:00", "20:00"];
const classList = (() => {
  let c = [];
  for (let i = 0; i <= 2; i++) {
    for (let j = 1; j <= 8; j++) {
      c.push(`1${i}A${j}`);
    }
  }
  return c;
})();

/** Database */
mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

/** Server */
app.use(express.json());
app.get("/", function (req, res) {
  res.send("Hello World");
});

app.listen(process.env.PORT, function listen() {
  console.log(`Server is listening at http://localhost:${process.env.PORT}`);
  loadSchedule();
});

/** Telegram Bot */
let answerCallbacks = {};
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let userData = await userModel.findOne({
    chatId: chatId,
  });
  if (userData) {
    return bot.sendMessage(
      chatId,
      `Tớ sẽ gửi thời khóa biểu của lớp <b>${userData.className}</b> cho bạn vào lúc <b>${userData.time}</b>`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: userData.enable ? "Tắt thông báo" : "Bật thông báo",
                callback_data: userData.enable ? "disable" : "enable",
              },
            ],
          ],
        },
      }
    );
  }
  bot.sendMessage(chatId, "Hãy ấn nút <b>Đăng ký</b> để bắt đầu sử dụng!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Đăng ký",
            callback_data: "register",
          },
        ],
      ],
    },
    parse_mode: "HTML",
  });
});

bot.onText(/\/tkb (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  let className = match[1].split(" ")[0].toUpperCase();
  let day = match[1].split(" ")[1] || "none";
  if (day != "none" && !/[2-7]/g.test(day)) {
    return bot.sendMessage(
      chatId,
      "Hmm, có vẻ thứ mà bạn nhập không hợp lệ, hãy thử nhập đúng cú pháp /tkb (tên lớp) (thứ 2-7)\n<b>Ví dụ</b>: /tkb 10A5 2",
      {
        parse_mode: "HTML",
      }
    );
  }
  let content = "";
  let botData = await botModel.findOne({
    botId: "remaibot",
  });
  if (!botData) {
    botData = await generateBotData();
  }
  if (!classList.includes(className)) {
    return bot.sendMessage(
      chatId,
      "Hmm, có vẻ tên lớp mà bạn nhập không hợp lệ, hãy thử nhập đúng cú pháp \n/tkb (tên lớp) (thứ 2-7)\n<b>Ví dụ</b>: /tkb 10A5 2",
      {
        parse_mode: "HTML",
      }
    );
  }
  let datas = botData.datas;
  if (/(10|11|12)A[1-8]/g.test(className)) {
    className = className.match(/(10|11|12)A[1-8]/g)[0];
    content += `<b>Thời khóa biểu lớp ${className}</b>\n\n`;
    switch (className[1]) {
      case "0":
        data = datas[0];
        if (/[2-7]/g.test(day)) {
          day = day.match(/[2-7]/g)[0];
          content += `———— <b>Thứ ${day}</b> ————\n`;
          content += data[className][day]
            .map((e, i) => `Tiết ${i + 1} - ${e}`)
            .join("\n");
          bot.sendMessage(chatId, content, {
            parse_mode: "HTML",
          });
        } else {
          Object.keys(data[className]).forEach((day) => {
            content +=
              `———— <b>Thứ ${day}</b> ————` +
              "\n" +
              data[className][day]
                .map((e, i) => `Tiết ${i + 1} - ${e}`)
                .join("\n") +
              "\n\n";
          });
          bot.sendMessage(chatId, content, {
            parse_mode: "HTML",
          });
        }
        break;
      case "1":
        data = datas[1];
        if (/[2-7]/g.test(day)) {
          day = day.match(/[2-7]/g)[0];
          content += `———— <b>Thứ ${day}</b> ————\n`;
          content += data[className][day]
            .map((e, i) => `Tiết ${i + 1} - ${e}`)
            .join("\n");
          bot.sendMessage(chatId, content, {
            parse_mode: "HTML",
          });
        } else {
          Object.keys(data[className]).forEach((day) => {
            content +=
              `———— <b>Thứ ${day}</b> ————` +
              "\n" +
              data[className][day]
                .map((e, i) => `Tiết ${i + 1} - ${e}`)
                .join("\n") +
              "\n\n";
          });
          bot.sendMessage(chatId, content, {
            parse_mode: "HTML",
          });
        }
        break;
      case "2":
        data = datas[2];
        if (/[2-7]/g.test(day)) {
          day = day.match(/[2-7]/g)[0];
          content += `———— <b>Thứ ${day}</b> ————\n`;
          content += data[className][day]
            .map((e, i) => `Tiết ${i + 1} - ${e}`)
            .join("\n");
          bot.sendMessage(chatId, content, {
            parse_mode: "HTML",
          });
        } else {
          Object.keys(data[className]).forEach((day) => {
            content +=
              `———— <b>Thứ ${day}</b> ———— ` +
              "\n" +
              data[className][day]
                .map((e, i) => `Tiết ${i + 1} - ${e}`)
                .join("\n") +
              "\n\n";
          });
          bot.sendMessage(chatId, content, {
            parse_mode: "HTML",
          });
        }
        break;
      default:
        bot.sendMessage(
          chatId,
          "Hmm, có vẻ tên lớp mà bạn nhập không hợp lệ, hãy thử nhập đúng cú pháp /tkb (tên lớp) (thứ 2-7)\n<b>Ví dụ</b>: /tkb 10A5 2",
          {
            parse_mode: "HTML",
          }
        );
        break;
    }
  } else {
    return bot.sendMessage(
      chatId,
      "Hmm, có vẻ tên lớp mà bạn nhập không hợp lệ, hãy thử nhập đúng cú pháp /tkb (tên lớp) (thứ 2-7)\n<b>Ví dụ</b>: /tkb 10A5 2",
      {
        parse_mode: "HTML",
      }
    );
  }
});

bot.on("document", async (msg) => {
  const chatId = msg.chat.id;
  if (chatId != process.env.OWNER_ID) {
    return;
  }
  const fileId = msg.document.file_id;
  const file = await bot.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${process.env.botTOKEN}/${file.file_path}`;
  docxTables({
    file: fileUrl,
  })
    .then(async (data) => {
      let botData = await botModel.findOne({
        botId: "remaibot",
      });
      if (!botData) {
        botData = await generateBotData();
      }
      botData.datas = [
        formatData(data[0]),
        formatData(data[1]),
        formatData(data[2]),
      ];
      await botData.save();
      bot.sendMessage(chatId, "Đã lưu dữ liệu mới!");
    })
    .catch((error) => {
      console.error(error);
      bot.sendMessage(chatId, "Có lỗi xảy ra vui lòng thử lại!");
    });
});

bot.onText(/\/changetime/, async (msg) => {
  let userData = await userModel.findOne({
    chatId: msg.chat.id,
  });
  if (!userData) {
    return bot.sendMessage(
      msg.chat.id,
      "Bạn chưa đăng ký sử dụng, hãy nhập lệnh /start để đăng ký",
      {
        reply_markup: {
          keyboard: [["/start"]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  }
  if (!userData.enable) {
    return bot.sendMessage(
      msg.chat.id,
      "Bạn không thể sử dụng lệnh này vì bạn đã tắt thông báo, hãy sử dụng lệnh /start để bật lại",
      {
        reply_markup: {
          keyboard: [["/start"]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  }
  bot
    .sendMessage(msg.chat.id, "Hãy chọn thời gian mà bạn muốn tớ gửi thông báo cho bạn~", {
      reply_markup: {
        keyboard: [timeList],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
    .then(() => {
      answerCallbacks[msg.chat.id] = async (answer) => {
        let time = answer.text;
        if (!timeList.includes(time))
          return bot.sendMessage(
            msg.chat.id,
            `Bạn hay thử lại với danh sách thời gian hợp lệ sau ${timeList
              .map((e) => `<b>${e}</b>`)
              .join(", ")}`,
            {
              parse_mode: "HTML",
            }
          );
        userData.time = time;
        await userData.save();
        return bot.sendMessage(
          msg.chat.id,
          `Bạn đã thay đổi thành công, tớ sẽ gửi thời khoá biểu cho bạn vào lúc <b>${time}</b>`,
          {
            parse_mode: "HTML",
          }
        );
      };
    });
});

bot.onText(/\/changeclass/, async (msg) => {
  let userData = await userModel.findOne({
    chatId: msg.chat.id,
  });
  if (!userData) {
    return bot.sendMessage(
      msg.chat.id,
      "Bạn chưa đăng ký sử dụng, hãy nhập lệnh /start để đăng ký",
      {
        reply_markup: {
          keyboard: [["/start"]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  }
  if (!userData.enable) {
    return bot.sendMessage(
      msg.chat.id,
      "Bạn không thể sử dụng lệnh này vì bạn đã tắt thông báo, hãy sử dụng lệnh /start để bật lại",
      {
        reply_markup: {
          keyboard: [["/start"]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  }
  bot
    .sendMessage(msg.chat.id, "Hãy chọn tên lớp của bạn~", {
      reply_markup: {
        keyboard: [classList],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    })
    .then(() => {
      answerCallbacks[msg.chat.id] = async (answer) => {
        let className = answer.text.toUpperCase();
        if (!classList.includes(className))
          return bot.sendMessage(
            msg.chat.id,
            `Tên hợp của bạn không hợp lệ, hãy thử lại với các tên lớp như sau\nVd: 10A5, 11A1, 12A1,...`,
            {
              parse_mode: "HTML",
            }
          );
        userData.className = className;
        await userData.save();
        return bot.sendMessage(
          msg.chat.id,
          `Bạn đã thay đổi thành công, tớ sẽ gửi thông báo thời khoá biểu của lớp <b>${className}</b>`,
          {
            parse_mode: "HTML",
          }
        );
      };
    });
});

bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  if (data === "register") {
    await delay(200);
    bot.deleteMessage(chatId, callbackQuery.message.message_id);
    bot
      .sendMessage(chatId, "Hãy chọn thời gian mà bạn muốn tớ gửi thông báo cho bạn~", {
        reply_markup: {
          keyboard: [timeList],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      })
      .then(() => {
        answerCallbacks[callbackQuery.message.chat.id] = async (answer) => {
          let time = answer.text;
          if (!timeList.includes(time))
            return bot.sendMessage(chatId, `Bạn hay thử lại với danh sách thời gian hợp lệ sau ${timeList
              .map((e) => `<b>${e}</b>`)
              .join(", ")}`);
          bot
            .sendMessage(
              callbackQuery.message.chat.id,
              "Hãy chọn tên lớp của bạn~",
              {
                reply_markup: {
                  keyboard: [classList],
                  resize_keyboard: true,
                  one_time_keyboard: true,
                },
              }
            )
            .then(() => {
              answerCallbacks[callbackQuery.message.chat.id] = async (
                answer
              ) => {
                let className = answer.text.toUpperCase();
                if (!classList.includes(className))
                  return bot.sendMessage(
                    chatId,
                    "Tên hợp của bạn không hợp lệ, hãy thử lại với các tên lớp như sau\nVd: 10A5, 11A1, 12A1,..."
                  );
                let userData = new userModel({
                  chatId: callbackQuery.message.chat.id,
                  className: className,
                  time: time,
                  enable: true,
                });
                await userData.save();
                return bot.sendMessage(
                  chatId,
                  `Đăng ký thành công!, tớ sẽ gửi thời khóa biểu của lớp <b>${className}</b> vào lúc <b>${time}</b> cho bạn 🥰`,
                  {
                    parse_mode: "HTML",
                  }
                );
              };
            });
        };
      });
  } else if (data == "enable") {
    bot.deleteMessage(chatId, callbackQuery.message.message_id);
    let userData = await userModel.findOne({
      chatId: chatId,
    });
    userData.enable = true;
    await userData.save();
    bot.sendMessage(chatId, "Đã bật thông báo thời khoá biểu!");
  } else if (data == "disable") {
    bot.deleteMessage(chatId, callbackQuery.message.message_id);
    let userData = await userModel.findOne({
      chatId: chatId,
    });
    userData.enable = false;
    await userData.save();
    bot.sendMessage(chatId, "Đã tắt thông báo thời khoá biểu!");
  }
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  let content = [
    "<b>Danh sách các lệnh của Remai~</b>\n",
    "<b>/start</b> - Đăng ký thông báo",
    "<b>/changeclass</b> - Thay đổi lớp",
    "<b>/changetime</b> - Thay đổi thời gian",
    "<b>/help</b> - Danh sách lệnh",
    "<b>/tkb</b> (tên lớp) (thứ) - Đăng ký",
  ];

  bot.sendMessage(chatId, content.join("\n"), {
    parse_mode: "HTML",
  });
});

bot.on("message", function (message) {
  var callback = answerCallbacks[message.chat.id];
  if (callback) {
    delete answerCallbacks[message.chat.id];
    return callback(message);
  }
});

function formatData(table) {
  let datas = {};
  // get class name
  for (let i = 2; i < table["0"].length; i++) {
    datas[table["0"][i].data.replace(/\n/g, "")] = {};
  }
  for (let i of Object.keys(datas)) {
    for (let j = 2; j <= 7; j++) {
      datas[i][j] = [];
    }
  }
  // get data
  let thu = "";
  let lop = "";
  for (let i = 1; i < Object.keys(table).length; i++) {
    for (let j = 0; j < table[`${i}`].length; j++) {
      if (j == 0 && table[`${i}`][j].data != "") {
        thu = table[`${i}`][j].data.replace(/\n/g, "");
      } else if (j != 1) {
        lop = table[`0`][j].data.replace(/\n/g, "");
        if (lop != "") {
          datas[lop][thu].push(table[`${i}`][j].data.replace(/\n/g, ""));
        }
      }
    }
  }
  return datas;
}

async function generateBotData() {
  let botData = await botModel.findOne({
    botId: "remaibot",
  });
  if (!botData) {
    botData = new botModel({
      botId: "remaibot",
      chatsId: [],
      datas: [],
    });
    await botData.save();
  }
  return botData;
}

async function loadSchedule() {
  console.log("Load schedule...");
  const datas = (
    await botModel.findOne({
      botId: "remaibot",
    })
  ).datas;
  const rule = new schedule.RecurrenceRule();
  rule.second = 0;
  rule.tz = "Asia/Ho_Chi_Minh";
  schedule.scheduleJob(rule, async () => {
    const currentTime = dayjs().format("HH:mm");
    console.log(`Schedule: ${currentTime}`);
    const usersToNotify = await userModel.find({ time: `${currentTime}` });
    usersToNotify.forEach((user) => {
      if (!user.enable) return;
      const today = dayjs().tz("Asia/Ho_Chi_Minh").day()+1;
      if (today == 7) return;
      const content = [
        `<b>Thông báo thời khóa biểu ngày mai của lớp ${user.className}</b>\n`,
        `———— <b>Thứ ${today + 1}</b> ————`,
      ];
      content.push(
        ...datas[user.className[1]][user.className][today + 1].map(
          (e, i) => `Tiết ${i + 1} - ${e}`
        )
      );
      bot.sendMessage(user.chatId, content.join("\n"), {
        parse_mode: "HTML",
      });
    });
  });
}
