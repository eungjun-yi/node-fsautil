var assert = require('assert');
var fsautil = require('../fsautil');
var fs = require('fs');
var path = require('path');

suite('fsautil.rm_rf', function() {
    var cleanup = function() {
        if (fs.existsSync('a')) {
            fs.rmdirSync('a');
        }
        if (fs.existsSync('a/b')) {
            fs.unlinkSync('a/b');
        }
        if (fs.existsSync('b')) {
            fs.rmdirSync('b');
        }
        if (fs.existsSync('c')) {
            fs.unlinkSync('c');
        }
        if (fs.existsSync('d')) {
            fs.unlinkSync('d');
        }
    }

    setup(function(done) {
        cleanup();
        done();
    });

    test('Remove given directory recursively.', function(done) {
        fs.mkdirSync('a');
        fs.writeFileSync('a/b', 'hello');
        fsautil.rm_rf('a', function(err) {
            if (err) throw err;
            assert.ok(!fs.existsSync('a'));
            assert.ok(!fs.existsSync('a/b'));
            done();
        });
    });

    test('Remove a dead symbolic link.', function() {
        fs.writeFileSync('c', 'hello');
        fs.symlinkSync('c', 'd');
        fs.unlinkSync('c');
        fsautil.rm_rf('d', function(err) {
            assert.throws(function() {fs.lstatSync('d');});
        });
    });

    teardown(function(done) {
        cleanup();
        done();
    });

});

suite('fsautil.mkdir_p', function() {
    setup(function(done) {
        if (fs.existsSync('a/b')) {
            fs.rmdirSync('a/b');
            fs.rmdirSync('a');
        }
        done();
    });

    test('Create a directory and all its parent directories.', function(done) {
        fsautil.mkdir_p('a/b', function(err) {
            if (err) throw err;
            assert.ok(fs.existsSync('a'));
            assert.ok(fs.existsSync('a/b'));
            done();
        });
    });

    teardown(function(done) {
        if (fs.existsSync('a/b')) {
            fs.rmdirSync('a/b');
            fs.rmdirSync('a');
        }
        done();
    });
});

suite('fsautil.fwrite_p', function() {
    setup(function(done) {
        if (fs.existsSync('a/b')) {
            fs.unlinkSync('a/b');
            fs.rmdirSync('a');
        }
        done();
    });

    test('Write a file after create all its parent directories.', function(done) {
        fsautil.fwrite_p('a/b', 'hello', function(err) {
            if (err) throw err;
            assert.equal(fs.readFileSync('a/b'), 'hello');
            done();
        });
    });

    teardown(function(done) {
        if (fs.existsSync('a/b')) {
            fs.unlinkSync('a/b');
            fs.rmdirSync('a');
        }
        done();
    });
});

suite('fsautil.cp', function() {
    setup(function(done) {
        fsautil.rm_rf('a', function() {
            fsautil.rm_rf('b', done);
        });
    });

    test('Copy a file content src to dest.', function(done) {
        fs.writeFileSync('a', 'hello');
        fsautil.cp('a', 'b', function() {
            assert.equal(fs.readFileSync('b'), 'hello');
            done();
        });
    });

    teardown(function(done) {
        fsautil.rm_rf('a', function() {
            fsautil.rm_rf('b', done);
        });
    });
});

suite('fsautil.cp_r', function() {
    setup(function(done) {
        fsautil.rm_rf('a', function() {
            fsautil.rm_rf('b', done);
        });
    });

    test('Copy src to dest recursively.', function(done) {
        fs.mkdirSync('a');
        fs.mkdirSync('a/b');
        fs.mkdirSync('a/c');
        fs.writeFileSync('a/d', 'hello');

        fsautil.cp_r('a', 'b', function() {
            assert.equal(fs.readFileSync('b/d'), 'hello');
            done();
        });
    });

    teardown(function(done) {
        fsautil.rm_rf('a', function() {
            fsautil.rm_rf('b', done);
        });
    });
});

suite('fsautil.ln_sf', function() {
    setup(function(done) {
        fsautil.rm_rf('a', function(err) {
            fsautil.rm_rf('b', done);
        });
    });

    test('Creates a symbolic link on the given path even if a file exists on the path.', function(done) {
        fs.writeFileSync('a', 'hello');
        fs.writeFileSync('b', 'bye');
        fsautil.ln_sf('a', 'b', function(err) {
            if (err) throw err;
            assert.ok(fs.lstatSync('b').isSymbolicLink());
            assert.equal(fs.readFileSync('b'), 'hello');
            done();
        });
    });

    teardown(function(done) {
        fsautil.rm_rf('a', function(err) {
            fsautil.rm_rf('b', done);
        });
    });
});

suite('fsautil.cd', function() {
    var origin;

    setup(function(done) {
        fsautil.rm_rf('a', function(err) {
            origin = process.cwd();
            done();
        });
    });

    test('Change the current working directory.', function(done) {
        fs.mkdirSync('a');
        var last_path = process.cwd();
        fsautil.cd('a');
        assert.equal(process.cwd(), path.join(last_path, 'a'));
        done();
    });

    teardown(function(done) {
        process.chdir(origin);
        fsautil.rm_rf('a', done);
    });
});

suite('fsautil.pwd', function() {
    test('Get the current working directory.', function() {
        assert.equal(process.cwd(), fsautil.pwd());
    });
});

// this test must be ran as root.
suite('fsautil.chown_R', function() {
    setup(function(done) {
        fsautil.rm_rf('a', done);
    });

    test('Change the owner of given path recursively.', function(done) {
        fs.mkdirSync('a');
        fs.writeFileSync('a/b', 'hello');
        fsautil.chown_R(1000, 1000, 'a', function(err) {
            var stat = fs.statSync('a');
            assert.equal(fs.statSync('a').uid, 1000);
            assert.equal(fs.statSync('a').gid, 1000);
            assert.equal(fs.statSync('a/b').uid, 1000);
            assert.equal(fs.statSync('a/b').gid, 1000);
            done();
        });
    });

    teardown(function(done) {
        fsautil.rm_rf('a', done);
    });
});
