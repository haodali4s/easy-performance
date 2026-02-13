import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
export default {
  input: ["./src/index.ts"],
  output: [ { file: 'dist/index.esm.js', format: 'es', sourcemap: true },{
    file: "./dist/index.umd.js",
    format: "umd",
    name: "PerformanceSDK",
    sourcemap: true,
    /**  output.file：输出文件的路径（老版本为 dest，已经废弃）
    output.format：输出文件的格式
    output.banner：文件头部添加的内容
    output.footer：文件末尾添加的内容 */
  }],
  plugins: [
    typescript(),
    babel({
      extensions: [".js", ".ts"],
      exclude: "node_modules/**",
    }),
    resolve({
      extensions: [".js", ".ts"],
    }),
    commonjs(),
    json(),
  ],
};
