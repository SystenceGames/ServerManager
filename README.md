Instructions

1. npm install --msvs_version=2013
2. node app

If you get some node-gyp error related to compiling C or something, you should recompile compress-buffer in node_module winston-graylog2 with node-gyp with node-gyp pointing to Visual Studio 2013 (npm install node-gyp --msvs_version=2013)
I didn't add the node_modules because compress-buffer filepath is too long.
