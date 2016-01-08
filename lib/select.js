function Select() {
    this.database;
    this.table;
    this.field;
    this.alias;
}

Select.prototype.column = function(field) {
    this.field = field;
    
    if (!this.alias) {
        this.alias = field;
    }
    
    return this;
}

Select.prototype.from = function(table, database) {
    this.table = table;
    this.database = database;
    return this;
}

Select.prototype.as = function(alias) {
    this.alias = alias;
    return this;
}

Select.equals = function(left, right) {
    return (left.database == right.database && left.table == right.table && left.field == right.field);
}

Select.prototype.equals = function(right) {
    /*console.log(this.database, right.database);
    console.log(this.table, right.table);
    console.log(this.field, right.field);
    console.log("==================");*/
    return Select.equals(this, right);
}

exports = module.exports = Select;