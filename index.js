var MySQL = require('mysql');
var Promise = require('promise');

var Compiler = require('./lib/compiler.js');

function SQuery() {
    // The MySQL connection
    this.conn;
    
    // The data from the database
    this.data;
    
    // The sql statement that is executed
    this.sql;
    
    // The table that is being queried
    this.table;
    
    // The database that is being queried
    this.database;
    
    // The compiler to construct the MySQL query
    this.compiler = new Compiler(this);
    
    // Flags, used to check if certain values have been set before reaching
    // a specific function
    this.flags = {
        isConnected: false,
        hasTable: false,
    }
    
    // The settings for the LIMIT parameter
    this.limit = {
        enabled: false,
        limit: 10,
        offset: 0
    }
    
    // The settings for the COUNT parameter
    this.count = {
        enabled: false
    }
}

/**
 * @description Connects to the mysql database
 */
SQuery.prototype.connect = function(conn) {
    this.database = conn.database;
    this.conn = MySQL.createConnection(conn);
    this.flags.isConnected = true;
    return this;
}

/**
 * @description Compiles and executes the query
 */
SQuery.prototype.resolve = function(accept, reject) {
    var that = this;
    reject = reject || function(err) {console.log(`SQuery.resolve() called without reject function, also: ${err}`)};
    
    if (!this.flags.isConnected) {
        throw Error('No mysql connection established! Please set one using SQuery.connect(options)'); 
    }
    
    if (!this.flags.hasTable) {
        throw Error('No table specified! Please set one using SQuery.from(table)');
    }
    
    // Compile the SQL statement
    this.compiler.compile().then(function(query) {
        that.sql = query;
        that.conn.query(query, function(err, rows, fields) {
            if (err) {
                reject(`${err} from query:\n${query}`);
            }
            console.log(that.sql);
            accept(rows);  
        })
    }, function(err) {
        reject(err);
    });
    
    //this.data = this.conn.query(this.sql);
    
    return this.data;
}

/**
 * @description Sets the table to select FROM
 */
SQuery.prototype.from = function(table) {
    this.table = table;
    this.flags.hasTable = true;
    return this;
}

/**
 * @description Adds a LIMIT to the query
 */
SQuery.prototype.withLimit = function(limit, offset) {
    this.limit.enabled = true;
    this.limit.limit = limit;
    this.limit.offset = offset || this.limit.offset;
    return this; 
}

/**
 * @description Adds a COUNT to the query
 */
SQuery.prototype.withCount = function() {
    this.count.enabled = true;
    return this;
}

exports = module.exports = new SQuery();