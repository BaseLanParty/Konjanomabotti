var mysql = require("mysql");
var mysql_settings = require("../conf/mysql_settings.json");
checkConfig();

var mysql_conn = null;

function checkConfig() {
  if (mysql_settings.db_type === null) { Logger.log("warn", "DBType not specified. Defaulting to 'mysql'"); mysql_settings.db_type = "mysql"; }
  if (mysql_settings.db_host === null) { Logger.log("warn", "DBHost not defined. Defaulting to 'localhost'"); mysql_settings.db_host = "localhost"; }
  if (mysql_settings.db_port === null) { Logger.log("warn", "DBPort not defined. Defaulting to '3306'"); mysql_settings.db_port = "3306"; }
  if (mysql_settings.db_username === null) { Logger.log("warn", "DBUsername not defined. Will connect anonymously"); mysql_settings.db_username = ""; }
  if (mysql_settings.db_password === null) { Logger.log("warn", "DBPassword not defined. Will connect anonymously"); mysql_settings.db_password = ""; }
  if (mysql_settings.db_dbname === null) { Logger.log("warn", "Database not defined. Please check your settings"); }
}

function createConnection() {
  mysql_conn = mysql.createConnection({
    host: mysql_settings.db_host,
    port: mysql_settings.db_port,
    user: mysql_settings.db_username,
    password: mysql_settings.db_password,
    database: mysql_settings.db_dbname
  });
}

exports.testDb = function(callback) {
  createConnection();
  //EXECUTE EVERYTHING, THEN CALLBACK THE FUNCTION IF AN ERROR HAPPENS
  mysql_conn.connect(function(err) {
    //IF ERROR
    if (err) {
      Logger.log("error", "DB error connecting: " + err.stack);
      testresult = false;
    }
    //IF NO ERROR
    else
    {
      Logger.log("info", "DB connected as threadid " + mysql_conn.threadId);
      mysql_conn.end(function(err) {
        Logger.log("error", "DB threadid " + mysql_conn.threadId + " exited!");
      });
      testresult = true;
    }
    //FINALLY, CALL THE CALLBACK OF THE TESTDB FUNCTION WITH THE SUCCESS CODE PASSED IN
    callback(testresult);
  });
};

exports.query = function(sqlquery, sqlitems, callback) {
  createConnection();
  var query = mysql_conn.query(sqlquery, sqlitems, function (error, results, fields) {
    callback(error, results, fields);
    Logger.log("error", callback(error, results, fields));
  });
  mysql_conn.end(function(err) {});
  Logger.log("debug","Last SQL: "+query.sql);
};
