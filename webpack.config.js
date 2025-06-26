const path = require('path');
const webpack = require('webpack');

const layerDependencies = [
  '@nestjs/core',
  '@nestjs/common',
  '@nestjs/platform-express',
  'reflect-metadata',
  'rxjs',
  'class-transformer',
  'class-validator',
  'aws-lambda'
];

module.exports = {
  entry: './src/lambda.ts',
  target: 'node',
  mode: 'production',
  externals: [
    ({ request }, callback) => {
      // 🔧 修复：Prisma 相关模块必须外部化（但确保在部署时包含）
      if (request === '@prisma/client' || request === '.prisma/client') {
        console.log(`🔧 Externalizing Prisma: ${request}`);
        return callback(null, `commonjs ${request}`);
      }
      
      // 🔧 Express 和 serverless-express 不再外部化，让它们被打包到函数中
      if (request === 'express' || request === '@vendia/serverless-express') {
        console.log(`🔧 Bundling: ${request}`);
        return callback(); // 不外部化，打包进去
      }
      
      if (layerDependencies.includes(request)) {
        console.log(`🔧 Externalizing: ${request}`);
        return callback(null, `commonjs ${request}`);
      }
      
      // Node.js 内置模块
      if (/^(fs|path|os|crypto|http|https|url|querystring|stream|util|events|buffer|zlib)$/.test(request)) {
        return callback(null, `commonjs ${request}`);
      }
      
      callback();
    },
    'aws-sdk',
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    fallback: {
      'class-transformer/storage': path.resolve(__dirname, 'webpack-fallbacks/empty-module.js'),
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            compilerOptions: {
              target: 'es2020',
              module: 'commonjs',
            }
          },
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lambda.js',
    clean: true,
    libraryTarget: 'commonjs2',
  },
  optimization: {
    minimize: false,
  },
  stats: {
    errorDetails: true,
    warnings: false,
  },
};