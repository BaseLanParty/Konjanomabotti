
var Logger = require("./include/logger.js").Logger;

var cmdLastExecutedTime = {};
var yllapitaja_idt = require("./conf/config.json").yllapitaja_idt;
var peli_nimet = require("./conf/peli_nimet.json");
var KomentoEtuliite = "!";

var komennot = {
  "peli": {
    name: "peli",
    description: "Pingaa kaikkia kanavalla ja pyytää pelaajia.",
    extendedhelp: "Tätä spämmätään, KJEH KJEH",
    usage: "<pelin nimi>",
    process: function(client, msg, suffix) {
      var peli = peli_nimet[suffix];
      if (!peli) {
        peli = suffix;
      }
      client.sendMessage(msg.channel, "@everyone, " + msg.sender + " tulukee pellaamaan " + peli);
      Logger.log("debug", "Kutsuttiin @everyone pelaamaan " + peli);
    }
  }
};

var Discord = require("discord.js");
var client = new Discord.Client();

client.on("ready", function() {
  Logger.log("info", "Lipas! Sain " + client.channels.length + " kanavaa");
});

client.on("message", msg => {
  if (msg.author.id != client.user.id && (msg.content[0] === KomentoEtuliite)) {
    if (msg.author.equals(client.user)) {
      return;
    }

    Logger.log("info", msg.author.username + " ajoi komennon <" + msg.content + ">");
    var cmdTxt = msg.content.split(" ")[0].substring(1).toLowerCase();
    var suffix = msg.content.substring(cmdTxt.length + 2);


    var cmd = komennot[cmdTxt];
    if (cmdTxt === "apua") {
      var msgArray = [];
      var commandnames = [];
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
        client.reply(msg.author, msgArray);
        if (msg.channel.server) {
          client.msg.reply(msg.channel.sendMessage, "Juuh, elikkäs " + msg.sender + ", urgaypwned.");
        }
      }
      if (suffix) {
        if (komennot[suffix]) {
          var commando = komennot[suffix];
          msgArray = [];
          msgArray.push("**Komento:** `" + commando.name + "`");
          msgArray.push("");
          if (commando.hasOwnProperty("usage")) {
            msgArray.push("**Käyttö:** `" + KomentoEtuliite + commando.name + " " + commando.usage + "`");
          } else {
            msgArray.push("**Käyttö:** `" + KomentoEtuliite + commando.name + "`");
          }
          msgArray.push("**Selitys:** " + commando.extendedhelp);
          if (commando.hasOwnProperty("adminOnly")) {
            msgArray.push("**Vain ylläpidolle.**");
          }
          if (commando.hasOwnProperty("timeout")) {
            msgArray.push("**Tätä komentoa voi ajaa " + commando.timeout + " sekunnin välein.**");
          }
          client.sendMessage(msg.author, msgArray);
        } else {
          client.sendMessage(msg.channel, "Ei ole olemassa **" + suffix + "** komentoa!");
        }
      }
    } else if (cmd) {
      var cmdCheckSpec = canProcessCmd(cmd, cmdTxt, msg.author.id, msg);
      if (cmdCheckSpec.isAllow) {
        cmd.process(client, msg, suffix);
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
        isAllowResult = false;
        //var diff = (lastExecutedTime-currentDateTime)/1000;
        //errorMessage = diff + " secs remaining";
        client.sendMessage(msg.channel, "Hei " + msg.sender + ", tässä komennossa on aika rajoitus!");
      } else {
        cmdLastExecutedTime[cmdText] = new Date();
      }
    } else {
      cmdLastExecutedTime[cmdText] = new Date();
    }
  }

  if (cmd.hasOwnProperty("adminOnly") && cmd.adminOnly && !isAdmin(userId)) {
    isAllowResult = false;
    client.sendMessage(msg.channel, "Hei! " + msg.sender + ", sinulla ei ole oikeuksia!");
  }

  return {
    isAllow: isAllowResult,
    errMsg: errorMessage
  };
}

function isAdmin(id) {
  return (yllapitaja_idt.indexOf(id) > -1);
}


client.login(require("./conf/config.json").client_id);
