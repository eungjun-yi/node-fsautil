var fs = require('fs');
var pth = require('path');
var async = require('async');
var _ = require('underscore');
var util = require('util');

pth.sep = pth.sep || (process.platform == 'win32' ? '\\' : '/');

var rm_rf = function(path, callback) {
    fs.lstat(path, function(err, stat) {
        if (err) {
            if (err.code == 'ENOENT') {
                callback(null);
            } else {
                callback(err);
            }
        } else {
            if (stat.isDirectory()) {
                async.series([
                    function remove_entries(cb) {
                        fs.readdir(path, function(err, files) {
                            files = _.map(files, function(file) { return pth.join(path, file); });
                            async.forEach(files, rm_rf, cb);
                        });
                    },
                    function remove_container(cb) {
                        fs.rmdir(path, cb);
                    },
                ], callback);
            } else {
                fs.unlink(path, callback);
            }
        }
    });
}

var _mkdir_p = function(path_segments, callback) {
    var base = '';
    async.forEachSeries(path_segments, function(segment, cb) {
        base = pth.join(base, segment);
        pth.exists(base, function(exists) {
            if (exists) {
                cb();
            } else {
                fs.mkdir(base, cb);
            }
        });
    }, callback);
}

var mkdir_p = function(path, callback) {
    _mkdir_p(pth.normalize(path).split(pth.sep), callback);
}

var fwrite_p = function(path, data, callback) {
    var path_segments = pth.normalize(path).split(pth.sep);
    _mkdir_p(path_segments.slice(0, path_segments.length - 1), function() {
        fs.writeFile(path, data, callback);
    });
}

var cp = function(src, dst, callback) {
    var is = fs.createReadStream(src);
    var os = fs.createWriteStream(dst);
    util.pump(is, os, callback);
}

var cp_r = function(src, dst, callback) {
    var self = this;
    fs.stat(src, function(err, stat) {
        if (stat.isDirectory()) {
            fs.mkdir(dst, function(err) {
                fs.readdir(src, function(err, files) {
                    async.forEach(files, function(file, cb) {
                        self.cp_r(pth.join(src, file), pth.join(dst, file), cb);
                    }, callback);
                });
            });
        } else {
            cp(src, dst, callback);
        }
    });
}

var ln_sf = function(src, path, callback) {
    pth.exists(path, function(exists) {
        if (exists) {
            fs.stat(path, function(err, stat) {
                if (stat.isDirectory()) {
                    var segments = src.split(pth.sep);
                    filename = segments.split(pth.sep)[segments.length - 1]
                    fs.symlink(src, pth.join(path, filename), null, callback);
                } else {
                    fs.unlink(path, function(err) {
                        fs.symlink(src, path, null, callback);
                    });
                }
            });
        } else {
            fs.symlink(src, path, null, callback);
        }
    });
}

var chown_R = function(uid, gid, path, callback) {
    var self = this;

    fs.stat(path, function(err, stat) {
        if (stat.isDirectory()) {
            fs.readdir(path, function(err, files) {
                async.forEach(files, function (filename, cb) {
                    self.chown_R(uid, gid, pth.join(path, filename), cb);
                }, function(err) {
                    fs.chown(path, uid, gid, callback);
                });
            });
        } else {
            fs.chown(path, uid, gid, callback);
        }
    });
}

exports.rm_rf = rm_rf;
exports.mkdir_p = mkdir_p;
exports.fwrite_p = fwrite_p;
exports.cp = cp;
exports.cp_r = cp_r;
exports.ln_s = fs.symlink;
exports.ln_sf = ln_sf;
exports.cd = process.chdir;
exports.pwd = process.cwd;
exports.mv = fs.rename;
exports.rm = fs.unlink;
exports.chmod = function(mode, path, callback) { return fs.chmod(path, mode, callback); };
exports.chown = function(uid, gid, path, callback) { return fs.chown(path, uid, gid, callback); };
exports.chown_R = chown_R;
