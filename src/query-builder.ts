import {
  TaskPriority,
  WorkflowInstanceStatus,
  DatePropertyFormat,
} from "./types";

/**
 * Attribute argument object definition
 */
export type AttributeArg = {
  key: string;
  value: string;
};

/**
 * Combined type for query arguments
 */
export type QueryArgs = DefaultQueryArgs | TaskQueryArgs | WorkflowQueryArgs;

/**
 * Default query arguments object.
 * Standard query arguments present on all possible endpoints
 */
export type DefaultQueryArgs = {
  skip?: number;
  top?: number;
  inlinecount?: "allpages" | "none";
  expand?: string | string[];
  orderBy?: `${string} desc` | `${string} asc`;
};

/**
 * Query arguments object specifically for TaskInstance endpoint.
 * Inherits the standard default query arguments.
 */
export type TaskQueryArgs = DefaultQueryArgs & {
  workflowInstanceId?: string | string[];
  workflowDefinitionId?: string | string[];
  processor?: string | string[];
  id?: string;
  activityId?: string | string[];
  description?: string | string[];
  subject?: string | string[];
  createdAt?: DatePropertyFormat;
  createdFrom?: DatePropertyFormat;
  createdUpTo?: DatePropertyFormat;
  claimedAt?: DatePropertyFormat;
  claimedFrom?: DatePropertyFormat;
  claimedUpTo?: DatePropertyFormat;
  completedAt?: DatePropertyFormat;
  completedFrom?: DatePropertyFormat;
  completedUpTo?: DatePropertyFormat;
  lastChangedAt?: DatePropertyFormat;
  lastChangedFrom?: DatePropertyFormat;
  lastChangedUpTo?: DatePropertyFormat;
  dueDate?: DatePropertyFormat;
  dueDateFrom?: DatePropertyFormat;
  dueDateUpTo?: DatePropertyFormat;
  priority?: TaskPriority | TaskPriority[];
  recipientUsers?: string | string[];
  recipientGroups?: string | string[];
  containsText?: string;
  attributes?: AttributeArg | AttributeArg[];
  definitionId?: string | string[];
  userInterfaceUri?: string;
};

/**
 * Query arguments object specifically for WorkflowInstance endpoint.
 * Inherits the standard default query arguments.
 */
export type WorkflowQueryArgs = DefaultQueryArgs & {
  id?: string;
  definitionId?: string;
  definitionVersion?: string;
  status?: WorkflowInstanceStatus | WorkflowInstanceStatus[];
  startedAt?: DatePropertyFormat;
  startedFrom?: DatePropertyFormat;
  startedUpTo?: DatePropertyFormat;
  completedAt?: DatePropertyFormat;
  completedFrom?: DatePropertyFormat;
  completedUpTo?: DatePropertyFormat;
  startedBy?: string;
  subject?: string;
  containsText?: string;
  businessKey?: string;
  rootInstanceId?: string;
  parentInstanceId?: string;
  projectId?: string;
  projectVersion?: string;
  attributes?: AttributeArg | AttributeArg[];
};

/**
 * Skip argument key
 */
const SKIP_ARG = "$skip=";

/**
 * Top argument key
 */
const TOP_ARG = "$top=";

/**
 * Inlinecount argument key
 */
const INLINECOUNT_ARG = "$inlinecount=";

/**
 * Expand argument key
 */
const EXPAND_ARG = "$expand=";

/**
 * Orderby argument key
 */
const ORDERBY_ARG = "$orderBy=";

/**
 * Default argument key list
 */
const DEFAULT_KEYS = new Set<string>([
  "skip",
  "top",
  "inline",
  "expand",
  "orderBy",
  "inlinecount",
]);

/**
 * Checks if key of given property is used as a default argument
 */
function isDefaultKey(key: string): boolean {
  return DEFAULT_KEYS.has(key);
}

/**
 * Builder class for constructing queries against SAP BPA Workflow API.
 */
export class QueryBuilder {
  private readonly arguments: QueryArgs[] = [];
  private readonly joinedArgs: string[] = [];

  /**
   * Adds query argument to object
   */
  public addArgument(arg: QueryArgs): QueryBuilder {
    this.arguments.push(arg);
    this.parseArgument(arg);
    return this;
  }

  /**
   * Returns the list of arguments currently added to the builder
   */
  public getArguments(): QueryArgs[] {
    return this.arguments;
  }

  /**
   * Empties the current query from the builder and resets everything.
   */
  public flush(): void {
    // This is the most performant way to empty the array
    this.arguments.length = 0;
    this.joinedArgs.length = 0;
  }

  /**
   * Builds the provided arguments into a URI query string
   */
  public build(): string {
    return this.joinedArgs.length <= 0 ? "" : `?${this.joinedArgs.join("&")}`;
  }

  /**
   * Parses the provided argument object into a suitable joined string
   */
  private parseArgument(arg: QueryArgs): void {
    if (arg.skip) {
      this.joinedArgs.push(`${SKIP_ARG}${arg.skip}`);
    }

    if (arg.top) {
      this.joinedArgs.push(`${TOP_ARG}${arg.top}`);
    }

    if (arg.inlinecount) {
      this.joinedArgs.push(`${INLINECOUNT_ARG}${arg.inlinecount}`);
    }

    if (arg.expand) {
      this.joinedArgs.push(`${EXPAND_ARG}${arg.expand}`);
    }

    if (arg.orderBy) {
      this.joinedArgs.push(`${ORDERBY_ARG}${arg.orderBy}`);
    }

    this.parseAdditionalArgs(arg);
  }

  /**
   * Parses additional arguments provided in the QueryArgs object, that does not match the default arguments.
   */
  private parseAdditionalArgs(arg: QueryArgs): void {
    for (const [k, v] of Object.entries(arg)) {
      if (isDefaultKey(k) || v === undefined) continue;
      if (Array.isArray(v)) {
        this.handleArrayArg(k, v);
        continue;
      } else if (this.isAttributeArg(v)) {
        this.handleAttributeArgument(v);
        continue;
      }

      this.joinedArgs.push(`${k}=${v}`);
    }
  }

  /**
   * Handles arguments which are of array type
   */
  private handleArrayArg(key: string, values: unknown[]): void {
    if (values.length <= 0) return;

    if (this.isAttributeArg(values[0])) {
      for (const el of values) {
        this.handleAttributeArgument(el as AttributeArg);
      }
      return;
    }

    for (const el of values) {
      this.joinedArgs.push(`${key}=${el}`);
    }
  }

  /**
   * Handles the custom attribute arguments object for parsed query
   */
  private handleAttributeArgument(arg: AttributeArg): void {
    this.joinedArgs.push(`${arg.key}=${arg.value}`);
  }

  /**
   * Determines whether the unknown object is of the type of AttributeArg
   */
  private isAttributeArg(item: unknown): item is AttributeArg {
    return (
      (<AttributeArg>item).key !== undefined &&
      (<AttributeArg>item).value !== undefined
    );
  }
}
