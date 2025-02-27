module.exports = {
  preset: "ts-jest",
  clearMocks: true,
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  testRegex: "(/test/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  // collectCoverage: true,
  // coverageDirectory: "./coverage",
};
