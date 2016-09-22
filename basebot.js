
var Logger = require("./include/logger.js").Logger;

var cmdLastExecutedTime = {};
var yllapitaja_idt = require("./conf/config.json").yllapitaja_idt;
var peli_nimet = require("./conf/peli_nimet.json");
var KomentoEtuliite = "!";

var komennot = {
  "peli": {
    name: "peli",
    description: "Pingaa kaikkia kanavalla ja pyytää pelaajia.",
    extendedhelp: "Tätä spämmätään KJEH",
    usage: "<pelin nimi>",
    process: function(bot, msg, suffix) {
      var peli = peli_nimet[suffix];
      if (!peli) {
        peli = suffix;
      }
      bot.sendMessage(msg.channel, "@everyone, " + msg.sender + " tulukee pellaamaan " + peli);
      Logger.log("debug", "Kutsuttiin @everyone pelaamaan " + peli);
    }
  }
};

var Discord = require("discord.js");
var bot = new Discord.Client();

bot.on("ready", function() {
  Logger.log("info", "Lipas! Sain " + bot.channels.length + " kanavaa");
});

bot.on("message", msg => {


  if (msg.author.id != bot.user.id && (msg.content[0] === KomentoEtuliite)) {
    if (msg.author.equals(bot.user)) {
      return;
    }

    Logger.log("info", msg.author.username + " executed <" + msg.content + ">");
    var cmdTxt = msg.content.split(" ")[0].substring(1).toLowerCase();
    var suffix = msg.content.substring(cmdTxt.length + 2); //add one for the ! and one for the space


    var cmd = komennot[cmdTxt];
    if (cmdTxt === "help") { // Help is special, as it isn't a real 'command'
      var msgArray = []; // Build a Messsage array, this makes all the messages send as one.
      var commandnames = []; // Build a array of names from komennot.
      for (cmd in komennot) {
        var info = KomentoEtuliite + cmd;
        var usage = komennot[cmd].usage;
        if (usage) {
          info += " " + usage;
        }
        var description = komennot[cmd].description;
        if (description) {
          info += "\n\t" + description;
        }
      }
      if (!suffix) {
        var index=0;
        for (index in komennot) {
          commandnames.push(komennot[index].name);
        }
        msgArray.push("Komentoja käytettävissä, käytä `" + KomentoEtuliite + "apua <komento>` saadaksesi siitä lisää tietoa.");
        msgArray.push("");
        msgArray.push(commandnames.join(", "));
        msgArray.push("");
        msgArray.push("Ainiin, urgaypwned");
        bot.sendMessage(msg.author, msgArray);
        if (msg.channel.server) {
          bot.sendMessage(msg.channel, "Juuh, elikkäs " + msg.sender + ", urgaypwned.");
        }
      }
      if (suffix) {
        if (komennot[suffix]) { // Look if suffix corresponds to a command
          var commando = komennot[suffix]; // Make a varialbe for easier calls
          msgArray = []; // Build another message array
          msgArray.push("**Komento:** `" + commando.name + "`"); // Push the name of the command to the array
          msgArray.push(""); // Leave a whiteline for readability
          if (commando.hasOwnProperty("usage")) { // Push special message if command needs a suffix.
            msgArray.push("**Käyttö:** `" + KomentoEtuliite + commando.name + " " + commando.usage + "`");
          } else {
            msgArray.push("**Käyttö:** `" + KomentoEtuliite + commando.name + "`");
          }
          msgArray.push("**Selitys:** " + commando.extendedhelp); // Push the extendedhelp to the array.
          if (commando.hasOwnProperty("adminOnly")) { // Push special message if command is restricted.
            msgArray.push("**Vain ylläpidolle.**");
          }
          if (commando.hasOwnProperty("timeout")) { // Push special message if command has a cooldown
            msgArray.push("**Tätä komentoa voi ajaa " + commando.timeout + " sekunnin välein.**");
          }
          bot.sendMessage(msg.author, msgArray); // Send the array to the user
        } else {
          bot.sendMessage(msg.channel, "Ei ole olemassa **" + suffix + "** komentoa!");
        }
      }
    } else if (cmd) {
      var cmdCheckSpec = canProcessCmd(cmd, cmdTxt, msg.author.id, msg);
      if (cmdCheckSpec.isAllow) {
        cmd.process(bot, msg, suffix);
      }
    }
  }
});

function canProcessCmd(cmd, cmdText, userId, msg) {
  var isAllowResult = true;
  var errorMessage = "";

  if (cmd.hasOwnProperty("timeout")) {
    // check for timeout
    if (cmdLastExecutedTime.hasOwnProperty(cmdText)) {
      var currentDateTime = new Date();
      var lastExecutedTime = new Date(cmdLastExecutedTime[cmdText]);
      lastExecutedTime.setSeconds(lastExecutedTime.getSeconds() + cmd.timeout);

      if (currentDateTime < lastExecutedTime) {
        // still on cooldown
        isAllowResult = false;
        //var diff = (lastExecutedTime-currentDateTime)/1000;
        //errorMessage = diff + " secs remaining";
        bot.sendMessage(msg.channel, "Hey " + msg.sender + ", this command is on cooldown!");
      } else {
        // update last executed date time
        cmdLastExecutedTime[cmdText] = new Date();
      }
    } else {
      // first time executing, add to last executed time
      cmdLastExecutedTime[cmdText] = new Date();
    }
  }

  if (cmd.hasOwnProperty("adminOnly") && cmd.adminOnly && !isAdmin(userId)) {
    isAllowResult = false;
    bot.sendMessage(msg.channel, "Hey " + msg.sender + ", you are not allowed to do that!");
  }

  return {
    isAllow: isAllowResult,
    errMsg: errorMessage
  };
}

function isAdmin(id) {
  return (yllapitaja_idt.indexOf(id) > -1);
}


bot.login(require("./conf/config.json").bot_id);
