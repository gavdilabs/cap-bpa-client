import { expect } from "chai";
import { constructQuery } from "../src/utils";
import { QueryBuilder } from "../src/query-builder";

describe("Utils Tests", () => {
  describe("constructQuery Tests", () => {
    it("Should return an empty string if input is undefined", () => {
      const input = undefined;
      const expected = "";
      const result = constructQuery(input);

      expect(result).to.not.be.undefined;
      expect(result).to.equal(expected);
    });

    it("Should return an empty string if input is null", () => {
      const input = null;
      const expected = "";
      const result = constructQuery(input);

      expect(result).to.not.be.undefined;
      expect(result).to.equal(expected);
    });

    it("Should return the input string if the input is of type string", () => {
      const input = "randomParameter=true";
      const expected = input;
      const result = constructQuery(input);

      expect(result).to.not.be.undefined;
      expect(result).to.equal(expected);
    });

    it("Should return the output of the QueryBuilder if the input is a QueryBuilder object", () => {
      const input = new QueryBuilder().addArgument({ skip: 10 }).build();
      const expected = "?$skip=10";
      const result = constructQuery(input);

      expect(result).to.not.be.undefined;
      expect(result).to.equal(expected);
    });
  });
});
