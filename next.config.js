/** @type {import('next').NextConfig} */
module.exports = {
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? "/cogs-explore" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/cogs-explore/" : "",
};
