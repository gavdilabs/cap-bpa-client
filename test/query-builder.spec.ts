import {
  AttributeArg,
  DefaultQueryArgs,
  QueryBuilder,
  TaskQueryArgs,
  WorkflowQueryArgs,
} from "../src/query-builder";
import { expect } from "chai";

describe("Query builder Tests", () => {
  it("Should take in an input of default query args", () => {
    const queryArg: DefaultQueryArgs = {
      skip: 10,
      top: 2,
      inlinecount: "allpages",
      expand: "something",
      orderBy: "id desc",
    };

    const expected = `?$skip=${queryArg.skip}&$top=${queryArg.top}&$inlinecount=${queryArg.inlinecount}&$expand=${queryArg.expand}&$orderBy=${queryArg.orderBy}`;
    const builder = new QueryBuilder();
    const result = builder.addArgument(queryArg).build();

    expect(result).to.not.be.undefined;
    expect(result).to.equal(expected);
  });

  it("Should take in an input of task instance query args", () => {
    const queryArg: TaskQueryArgs = {
      skip: 10,
      top: 2,
      inlinecount: "allpages",
      expand: "something",
      orderBy: "id desc",
      workflowInstanceId: "mambonumber5",
      dueDate: "2025-02-01",
      priority: ["LOW", "MEDIUM"],
    };

    const expected = `?$skip=${queryArg.skip}&$top=${queryArg.top}&$inlinecount=${queryArg.inlinecount}&$expand=${queryArg.expand}&$orderBy=${queryArg.orderBy}&workflowInstanceId=${queryArg.workflowInstanceId}&dueDate=${queryArg.dueDate}&priority=LOW&priority=MEDIUM`;
    const builder = new QueryBuilder();
    const result = builder.addArgument(queryArg).build();

    expect(result).to.not.be.undefined;
    expect(result).to.equal(expected);
  });

  it("Should take in an input of workflow instance query args", () => {
    const queryArg: WorkflowQueryArgs = {
      skip: 10,
      definitionId: "some-definition",
      attributes: [
        { key: "random", value: "value" },
        { key: "potato", value: "carrot" },
      ],
    };

    const mappedAttr = (queryArg.attributes as AttributeArg[]).map(
      (el) => `${el.key}=${el.value}`,
    );
    const expected = `?$skip=${queryArg.skip}&definitionId=${queryArg.definitionId}&${mappedAttr.join("&")}`;
    const builder = new QueryBuilder();
    const result = builder.addArgument(queryArg).build();

    expect(result).to.not.be.undefined;
    expect(result).to.equal(expected);
  });

  it("Should be able to handle only one Attribute argument for queries", () => {
    const queryArg: WorkflowQueryArgs = {
      attributes: { key: "random", value: "value" },
    };

    const expected = `?random=value`;
    const builder = new QueryBuilder();
    const result = builder.addArgument(queryArg).build();

    expect(result).to.not.be.undefined;
    expect(result).to.equal(expected);
  });

  it("Should be possible to chain query args into the list", () => {
    const queryArg1: DefaultQueryArgs = { skip: 2 };
    const queryArg2: DefaultQueryArgs = { top: 10 };
    const expected = `?$skip=${queryArg1.skip}&$top=${queryArg2.top}`;
    const builder = new QueryBuilder();
    const result = builder
      .addArgument(queryArg1)
      .addArgument(queryArg2)
      .build();

    expect(result).to.not.be.undefined;
    expect(result).to.equal(expected);
  });

  it("Should be possible to flush out and reuse the query builder", () => {
    const expected = `?$top=5`;
    const queryArg1: DefaultQueryArgs = { skip: 2 };
    const builder = new QueryBuilder();

    builder.addArgument(queryArg1);
    builder.flush();

    const queryArg2: DefaultQueryArgs = { top: 5 };
    const result = builder.addArgument(queryArg2).build();

    expect(result).to.not.be.undefined;
    expect(result).to.equal(expected);
  });

  it("Should be possible to fetch the given arguments out of the builder", () => {
    const queryArg1: DefaultQueryArgs = { skip: 2 };
    const queryArg2: DefaultQueryArgs = { top: 10 };
    const builder = new QueryBuilder();
    const result = builder
      .addArgument(queryArg1)
      .addArgument(queryArg2)
      .getArguments();

    expect(result).to.not.be.undefined;
    expect(result.length).to.equal(2);
  });
});
