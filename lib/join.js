function Join() {
    this.left;
    this.leftDb;
    this.leftKey;
    
    this.right;
    this.rightDb;
    this.rightKey;
}

Join.prototype.between = function(left, leftDb, right, rightDb) {
    this.left = left;
    this.leftDb = leftDb;
    this.right = right;
    this.rightDb = rightDb;
    return this;
}

Join.prototype.on = function(left, right) {
    this.leftKey = left;
    this.rightKey = right;
    return this;
}

Join.equals = function(left, right) {
    return (left.leftDb == right.rightDb && left.left == right.left && left.right == right.right);
}

Join.prototype.equals = function(right) {
    return Join.equals(this, right);
}

exports = module.exports = Join;