Filesystem Utilities
====================

*Asynchronous* Filesystem utilities for Node.js.

Requirements
------------

* [mocha](http://visionmedia.github.com/mocha/) (if you want to run tests)

API
---

#### rm_rf(path, [callback])

Remove the directory on `path` recursively.

#### mkdir_p(path, [callback])

Create a directory and all its parent directories.

#### cp(src, dest, [callback])

Copy a file content `src` to `dest`.

#### cp_r(src, dest, [callback])

Copy file contents `src` to `dest` recursively.

#### ln_s(src, path, [callback])

Creates a symbolic link `path` which points to `src`.

#### ln_sf(src, path, [callback])

Creates a symbolic link `path` which points to `src`. If `path` already exists, overwrite it.

### cd(path)

Change the current working directory.

### pwd()

Get the current working directory.

#### chmod(mode, path, [callback])

Change permission bits on `path`.

#### chown(uid, gid, path, [callback])

Change the owner of the file or directory on `path`

#### chown_R(uid, gid, path, [callback])

Change the owner of the file or directory on `path` recursively.

#### fwrite_p(path, data, [callback])

Write a file on `path` after create all its parent directories if necessary.
