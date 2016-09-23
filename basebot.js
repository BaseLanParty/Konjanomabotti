//BaseLanParty kehittämä botti
//Konjanomabotti

//Olennaiset libraryt ladataan
const Discord = require("discord.js");
//var request = require("request");
var Logger = require("./include/logger.js").Logger;

//Alustetaan client
const client = new Discord.Client();
var startTime = Date.now();

//Muuttujia yms..
var cmdLastExecutedTime = {};
var yllapitaja_id = require("./conf/config.json").admin_ids;
var pelien_nimet = require("./conf/peli_nimet.json");
var cmdPrefix = "!";
//const IMGUR_CLIENT_ID = require("./conf/config.json").IMGUR_CLIENT_ID;


var komennot = {
  //Käyttäjien komentoja
  "peli": {
    name: "peli",
    description: "Pingaa kaikkia kanavalla ja pyytää pelaajia.",
    extendedhelp: "Tätä spämmätään, KJEH KJEH",
    usage: "<pelin nimi>",
    process: function(client, msg, suffix) {
      var peli = pelien_nimet[suffix];
      if (!peli) {
        peli = suffix;
      }
      msg.channel.sendMessage("@here, " + msg.author + ": tulukee pellaamaan " + peli);
      msg.author.sendMessage("Äläkä spämmi tätä jatkuvaan. Kerta kyllä riittää!");
      Logger.log("info", "Kutsu pelaamaan " + peli + " kanavalla " + msg.channel + " author: "+ msg.author);
    }
  },
  "uptime": {
    usage: "",
    description: "returns the amount of time since the bot started",
    process: function(client, msg) {
      var now = Date.now();
      var msec = now - startTime;
      console.log("Botti ollut päällä " + msec + " millisekunttia, Kappa");
      var days = Math.floor(msec / 1000 / 60 / 60 / 24);
      msec -= days * 1000 * 60 * 60 * 24;
      var hours = Math.floor(msec / 1000 / 60 / 60);
      msec -= hours * 1000 * 60 * 60;
      var mins = Math.floor(msec / 1000 / 60);
      msec -= mins * 1000 * 60;
      var secs = Math.floor(msec / 1000);
      var timestr = "";
      if(days > 0) {
        timestr += days + " päivää ";
      }
      if(hours > 0) {
        timestr += hours + " tuntia ";
      }
      if(mins > 0) {
        timestr += mins + " minuuttia ";
      }
      if(secs > 0) {
        timestr += secs + " sekunttia ";
      }
      msg.channel.sendMessage("**Uptime**: " + timestr);
    }
  },
  //ADMIN KOMENNOT
  "bottipelaa": {
    name: "bottipelaa",
    description: "Asetetaan mitä botti pelaa nimensä alla.",
    extendedhelp: "",
    usage: "<mitä se nyt pelaisi>",
    adminOnly: true,
    process: function(client, msg, suffix) {
      client.user.setStatus("online", suffix);
      msg.channel.sendMessage(msg.author + " tuliko nyt hyvä mieli? ");
      Logger.log("info", "ADMIN: Vaihdoin peliksi: "+ suffix +" käsky tuli kanavalta " + msg.channel + " author: "+ msg.author);
    }
  }

};


//Aloitetaan alustamaan botin toimintoja
client.on("ready", function() {
  client.user.setStatus("online", "muh dikko");
  Logger.log("info", "Lipas! Sain " + client.channels.length + " kanavaa");
});

//Pää "looppi", jossa käsitellään tulevat viestit
client.on("message", msg => {
  //Pitää alkaa komennolla
  if(!msg.content.startsWith(cmdPrefix)) return;
  //Ettei komennon antaja ole botti itse
  if(msg.author.bot) return;

  Logger.log("info", msg.author + " ajoi komennon <" + msg.content + ">");
  var cmdTxt = msg.content.split(" ")[0].substring(1).toLowerCase();
  var suffix = msg.content.substring(cmdTxt.length + 2);

  //Käsitellään normaalit komennot

  var cmd = komennot[cmdTxt];
  if (cmdTxt === "komennot" || cmdTxt === "apua") {
    var msgArray = [];
    var commandnames = [];
    var adm_msgArray = [];
    var adm_commandnames = [];
    for (cmd in komennot) {
      var info = cmdPrefix + cmd;
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
        if (!komennot[index].hasOwnProperty("adminOnly")) {
          commandnames.push(komennot[index].name);
        } else {
          adm_commandnames.push(komennot[index].name);
        }
      }
      //Normaalit komennot tulostetaan kanavalle
      msgArray.push("Komentoja käytettävissä, käytä `" + cmdPrefix + "apua <komento>` saadaksesi tietystä komennosta lisää tietoa.");
      msgArray.push("");
      msgArray.push(commandnames.join(", "));
      msgArray.push("");
      msg.channel.sendMessage(msgArray);
      //Admin oikeuksilla olevalle PM komennoista.
      adm_msgArray.push("Ylläpitäjän komentoja käytettävissä, käytä `" + cmdPrefix + "apua <komento>` saadaksesi tietystä komennosta lisää tietoa.");
      adm_msgArray.push("");
      adm_msgArray.push(adm_commandnames.join(", "));
      adm_msgArray.push("");
      msg.author.sendMessage(adm_msgArray);
    }
    if (suffix) {
      if (komennot[suffix]) {
        var komento = komennot[suffix];
        msgArray = [];
        msgArray.push("");
        if (komento.hasOwnProperty("usage")) {
          msgArray.push("**Käyttö:** `" + cmdPrefix + komento.name + " " + komento.usage + "`");
        } else {
          msgArray.push("**Käyttö:** `" + cmdPrefix + komento.name + "`");
        }
        msgArray.push("**Tehtävä**" + komento.description);
        msgArray.push("**Käytettävyys:** " + komento.extendedhelp);


        if (komento.hasOwnProperty("timeout")) {
          msgArray.push("**Tätä komentoa voi ajaa " + komento.timeout + " sekunnin välein.**");
        }
        if(komento.hasOwnProperty("adminOnly")) {
          msgArray.push("**Ylläpito komento!**");
          msg.author.sendMessage(msgArray);
          msg.channel.sendMessage("Ylläpitäjät saavat vastaukset privaattina :heart: :thinking:");
        } else {
          msg.channel.sendMessage("msgArray");
        }

      } else {
        msg.channel.sendMessage("Komentoa **" + suffix + "** ei ole olemassa!");
      }
    }
  } else if (cmd) {
    var cmdCheckSpec = canProcessCmd(cmd, cmdTxt, msg.author.id, msg);
    if (cmdCheckSpec.isAllow) {
      cmd.process(client, msg, suffix);
    }
  }
});

//Käyttöoikeus tarkastus
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
        msg.channel.sendMessage("Hei " + msg.author + ", tässä komennossa on aika rajoitus!");
      } else {
        cmdLastExecutedTime[cmdText] = new Date();
      }
    } else {
      cmdLastExecutedTime[cmdText] = new Date();
    }
  }

  if (cmd.hasOwnProperty("adminOnly") && cmd.adminOnly && !isAdmin(userId)) {
    isAllowResult = false;
    msg.channel.sendMessage("Hei! " + msg.author + ", sinulla ei ole oikeuksia!");
  }

  return {
    isAllow: isAllowResult,
    errMsg: errorMessage
  };
}

function isAdmin(id) {
  return (yllapitaja_id.indexOf(id) > -1);
}

//Kirjaudu sisään
client.login(require("./conf/config.json").bot_id);
