/**
 * Date time format used by SAP BPA Workflow API
 */
export type DateTimeFormat =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}T${number}${number}:${number}${number}:${number}${number}.${number}${number}${number}Z`;

/**
 * Date format used by SAP BPA Workflow API
 */
export type DateFormat =
  `${number}${number}${number}${number}-${number}${number}-${number}${number}`;

/**
 * Combined date and datetime format for multi-use properties or arguments
 */
export type DatePropertyFormat = DateTimeFormat | DateFormat;

/**
 * SendMessagePayload for SAP BPA Workflow service
 */
export type SendMessagePayload = {
  context?: object;
  definitionId?: string;
  workflowInstanceId?: string;
  workflowDefinitionId?: string;
  businessKey?: string;
};

/**
 * The priority of the user task instance.
 * Can only be one of the four given values.
 */
export type TaskPriority = "VERY_HIGH" | "HIGH" | "MEDIUM" | "LOW";

/**
 * The status of a user task instance.
 * Can only be one of the four given values.
 */
export type TaskStatus = "READY" | "RESERVED" | "CANCELED" | "COMPLETED";

/**
 * Attribute object for custom attribute added to user task instance.
 */
export type CustomTaskAttribute = {
  id?: string;
  label?: string;
  value?: string;
  type?: "string";
};

/**
 * SAP Workflow User Task Instance object
 */
export type TaskInstance = {
  id?: string;
  activityId?: string;
  claimedAt?: DatePropertyFormat;
  completedAt?: DatePropertyFormat;
  createdBy?: string;
  lastChangedAt?: DatePropertyFormat;
  description?: string;
  priority?: TaskPriority;
  dueDate?: DatePropertyFormat;
  processor?: string;
  recipientUsers?: string[];
  recipientGroups?: string[];
  status?: TaskStatus;
  subject?: string;
  workflowDefinitionId?: string;
  workflowInstanceId?: string;
  attributes?: CustomTaskAttribute[];
  definitionId?: string;
  applicationScope?: string;
  userInterfaceUri?: string;
};

/**
 * List return object of TaskInstance.
 */
export type TaskInstanceList = TaskInstance[];

/**
 * Payload used for updating Task Instance
 */
export type UpdateTaskInstancePayload = {
  context?: object;
  status?: "COMPLETED";
  decision?: string;
  subject?: string;
  description?: string;
  recipientUsers?: string;
  processor?: string;
  dueDate?: string;
  priority?: TaskPriority;
  confidenceLevel?: number;
  userInterfaceUri?: string;
};

/**
 * Task definition object
 */
export type TaskDefinition = {
  string?: string;
  name?: string;
  createdAt?: DatePropertyFormat;
  attributeDefinitions?: {
    id?: string;
    label?: string;
    type?: string;
  };
};

/**
 * List/array type of TaskDefinition object
 */
export type TaskDefinitionList = TaskDefinition[];

/**
 * Object type for SAP Workflow form metadata
 */
export type FormMetadata = {
  id?: string;
  name?: string;
  version?: number;
  revision?: string;
  type?: "start" | "task";
  createdAt?: DatePropertyFormat;
  createdBy?: string;
  workflowDefinitions?: object[];
};

/**
 * Object type for form model
 */
export type FormModel = {
  content?: object[];
};

/**
 * Object type for WorkflowDefinition object
 */
export type WorkflowDefinition = {
  id?: string;
  name?: string;
  version?: string;
  createdAt?: DatePropertyFormat;
  createdBy?: string;
  applicationScope?: string;
  jobs?: WorkflowDefinitionJob[];
};

export type WorkflowDefinitionJob = {
  id?: string;
  purpose?: "delete";
};

export type WorkflowModel = {
  contents?: object;
};

export type WorkflowDefinitionList = WorkflowDefinition[];

export type WorkflowDefinitionVersion = {
  id?: string;
  name?: string;
  version?: string;
  createdAt?: DatePropertyFormat;
  createdBy?: string;
  applicationScope?: string;
};

export type WorkflowDefinitionVersionList = WorkflowDefinitionVersion[];

export type SampleContext = {
  id?: string;
  content?: object;
  modelElementId?: string;
};

export type WorkflowInstanceUpdatePayload = {
  status?: "RUNNING" | "SUSPENDED" | "CANCELED";
  cascade?: boolean;
};

export type WorkflowInstancesUpdatePayload = {
  id: string;
  deleted: boolean;
}[];

export type WorkflowInstanceStartPayload = {
  definitionId?: string;
  context?: object;
};

export type WorkflowInstanceStatus =
  | "RUNNING"
  | "ERRONEOUS"
  | "SUSPENDED"
  | "CANCELED"
  | "COMPLETED";

/**
 * Attribute object for custom attribute added to user workflow instance.
 */
export type CustomWorkflowAttribute = {
  id?: string;
  label?: string;
  value?: string;
  type?: "string";
};

export type WorkflowInstance = {
  definitionId?: string;
  definitionVersion?: string;
  id?: string;
  startedAt?: DatePropertyFormat;
  startedBy?: string;
  completedAt?: DatePropertyFormat;
  status?: WorkflowInstanceStatus;
  businessKey?: string;
  subject?: string;
  rootInstanceId?: string;
  parentInstanceId?: string;
  applicationScope?: string;
  projectId?: string;
  projectVersion?: string;
  attributes?: CustomWorkflowAttribute[];
};

export type WorkflowInstanceList = WorkflowInstance[];

export type ConsumingWorkflowInstance = {
  id?: string;
};

export type WorkflowInstanceExecutionLogType =
  | "WORKFLOW_STARTED"
  | "WORKFLOW_COMPLETED"
  | "WORKFLOW_CANCELED"
  | "WORKFLOW_CONTINUED"
  | "WORKFLOW_SUSPENDED"
  | "WORKFLOW_CONTEXT_OVERWRITTEN_BY_ADMIN"
  | "WORKFLOW_CONTEXT_PATCHED_BY_ADMIN"
  | "WORKFLOW_ROLES_PATCHED_BY_ADMIN"
  | "WORKFLOW_RESUMED"
  | "USERTASK_CREATED"
  | "USERTASK_CLAIMED"
  | "USERTASK_RELEASED"
  | "USERTASK_COMPLETED"
  | "USERTASK_FAILED"
  | "USERTASK_PATCHED_BY_ADMIN"
  | "USERTASK_CANCELED_BY_BOUNDARY_EVENT"
  | "SERVICETASK_CREATED"
  | "SERVICETASK_COMPLETED"
  | "SERVICETASK_FAILED"
  | "SCRIPTTASK_CREATED"
  | "SCRIPTTASK_COMPLETED"
  | "SCRIPTTASK_FAILED"
  | "INTERMEDIATE_TIMER_EVENT_REACHED"
  | "INTERMEDIATE_TIMER_EVENT_TRIGGERED"
  | "INTERMEDIATE_TIMER_EVENT_FAILED"
  | "INTERMEDIATE_MESSAGE_EVENT_REACHED"
  | "INTERMEDIATE_MESSAGE_EVENT_TRIGGERED"
  | "NONCANCELING_BOUNDARY_TIMER_EVENT_TRIGGERED"
  | "CANCELING_BOUNDARY_TIMER_EVENT_TRIGGERED"
  | "MAILTASK_CREATED"
  | "MAILTASK_COMPLETED"
  | "MAILTASK_FAILED"
  | "EXCLUSIVE_GATEWAY_REACHED"
  | "EXCLUSIVE_GATEWAY_FAILED"
  | "PARALLEL_GATEWAY_REACHED"
  | "PARALLEL_GATEWAY_FAILED"
  | "AUTOMATIONTASK_CREATED"
  | "AUTOMATIONTASK_COMPLETED"
  | "AUTOMATIONTASK_FAILED"
  | "ACTIONTASK_CREATED"
  | "ACTIONTASK_COMPLETED"
  | "ACTIONTASK_FAILED"
  | "RULETASK_CREATED"
  | "RULETASK_COMPLETED"
  | "RULETASK_FAILED"
  | "INTERMEDIATE_ESCALATION_EVENT_EMITTED"
  | "CANCELING_BOUNDARY_ESCALATION_EVENT_TRIGGERED"
  | "NONCANCELING_BOUNDARY_ESCALATION_EVENT_TRIGGERED";

export type WorkflowInstanceExecutionLog = {
  id?: string;
  type?: WorkflowInstanceExecutionLogType;
  timestamp?: string;
  referenceInstanceId?: string;
  activityId?: string;
  parentInstanceId?: string;
  rootInstanceId?: string;
  subject?: string;
  userId?: string;
  escalationCode?: string;
  ruleService?: {
    id?: string;
    version?: string;
    revision?: string;
  };
  actionTask?: {
    actionIdentifier?: string;
    destination?: string;
  };
  automationTask?: {
    type?: "automation" | "uipath.automation";
  };
  error?: {
    message?: string;
    errorCode?: string;
    logId?: string;
  };
  recipientUsers?: string[];
  recipientGroups?: string[];
  initiatorId?: string;
  restEndpoint?: {
    httpMethod?: string;
    destinationName?: string;
    destinationSubdomain?: string;
    destinationUrl?: string;
    relativePath?: string;
  };
  retriesRemaining?: number;
  taskId?: string;
  changes?: {
    create?: string[];
    update?: string[];
    delete?: string[];
  };
  recipients?: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
    ignored?: string[];
  };
  sendDisabled?: boolean;
  propagatedPrincipal?: string;
  activityName?: string;
  cause?: string;
  boundaryEventName?: string;
  destinationSubdomain?: string;
};

export type WorkflowInstanceExecutionLogList = WorkflowInstanceExecutionLog[];

export type WorkflowInstanceErrorMessage = {
  activityId?: string;
  activityName?: string;
  errorCode?: string;
  logId?: string;
  message?: string;
  timestamp?: string;
};

export type WorkflowInstanceErrorMessageList = WorkflowInstanceErrorMessage[];

export type WorkflowInstanceRoles = {
  viewerUsers?: string[];
  viewerGroups?: string[];
  adminUsers?: string[];
  adminGroups?: string[];
  contextViewerUsers?: string[];
  contextViewerGroups?: string[];
  contextAdminUsers?: string[];
  contextAdminGroups?: string[];
};

export type Job = {
  status?: string;
  details?: object;
  error?: {
    code?: string;
    message?: string;
    logId?: string;
  };
};

export type TaskDefinitionAttribute = {
  id?: string;
  label?: string;
  type?: "string";
};

export type TaskDefinitionAttributeList = TaskDefinitionAttribute[];
