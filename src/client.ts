import cds, { Service } from "@sap/cds";
import {
  ConsumingWorkflowInstance,
  CustomTaskAttribute,
  CustomWorkflowAttribute,
  Job,
  SampleContext,
  SendMessagePayload,
  TaskDefinitionList,
  TaskInstance,
  TaskInstanceList,
  UpdateTaskInstancePayload,
  WorkflowDefinition,
  WorkflowDefinitionList,
  WorkflowDefinitionVersion,
  WorkflowInstance,
  WorkflowInstanceErrorMessageList,
  WorkflowInstanceExecutionLogList,
  WorkflowInstanceList,
  WorkflowInstanceStartPayload,
  WorkflowInstancesUpdatePayload,
  WorkflowInstanceUpdatePayload,
  WorkflowModel,
} from "./types";
import { QueryBuilder } from "./query-builder";

/**
 * Universal logger for all created clients.
 *
 * Could be made instance based if SAP ever exposes the implementation.
 */
const LOGGER = cds.log("workflow-api");
const GENERIC_ERR_MSG = "Communication with SAP BPA failed with error";

/**
 * Client for querying against SAP BPA Workflow API.
 * Integrates directly with CAP, based on service bindings from package.json.
 *
 * Implementation based on:
 * https://api.sap.com/api/SPA_Workflow_Runtime/overview
 */
export default class WorkflowServiceClient {
  // Endpoints
  private readonly TASK_INSTANCES_URI: string;
  private readonly TASK_DEFINITIONS_URI: string;
  private readonly WORKFLOW_DEFINITIONS_URI: string;
  private readonly WORKFLOW_INSTANCES_URI: string;
  private readonly FORMS_URI: string;
  private readonly JOBS_URI: string;
  private readonly MESSAGES_URI: string;

  // Properties
  private readonly bindingDefinition: string;
  private serviceConnection: Service | undefined;

  constructor(binding: string, usePrefix: boolean = true) {
    this.bindingDefinition = binding;

    // Configure the endpoints available from the service
    const prefix = usePrefix ? "/v1" : "";
    this.TASK_INSTANCES_URI = `${prefix}/task-instances`;
    this.TASK_DEFINITIONS_URI = `${prefix}/task-definitions`;
    this.WORKFLOW_DEFINITIONS_URI = `${prefix}/workflow-definitions`;
    this.WORKFLOW_INSTANCES_URI = `${prefix}/workflow-instances`;
    this.FORMS_URI = `${prefix}/forms`;
    this.JOBS_URI = `${prefix}/jobs`;
    this.MESSAGES_URI = `${prefix}/messages`;
  }

  /**
   * Retrieves user task instances by parameters. If no parameters are specified, all instances with status READY, RESERVED, CANCELED, or COMPLETED are returned.
   * Parameters for different attributes of the instance are evaluated using the logical 'and' operator. If a parameter is specified multiple times,
   * results are matched using the logical 'or' operator, unless noted otherwise. Empty parameters are treated as if they were not specified.
   * By default, returned tasks are sorted by creation time in ascending order.
   *
   * Note: Certain selection criteria and response fields are not relevant for workflows that originate from the process builder of SAP Build Process Automation. They do exist for
   * tasks that originate from other editors.
   */
  public async getTaskList(
    queryBuilder?: QueryBuilder,
  ): Promise<TaskInstanceList> {
    try {
      const client = await this.getClient();
      const query = `${this.TASK_INSTANCES_URI}${queryBuilder?.build() ?? ""}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Updates the attributes of a list of user tasks. The user will need administrative privileges.
   */
  public async updateTaskList(
    data: UpdateTaskInstancePayload[],
  ): Promise<void> {
    try {
      const client = await this.getClient();
      const query = `${this.TASK_INSTANCES_URI}`;
      await client.patch(query, data);
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves the user task instance with the specified task instance ID.
   */
  public async findTaskInstance(
    id: string,
    expandAttributes: boolean = false,
  ): Promise<TaskInstance> {
    try {
      const client = await this.getClient();
      const query = `${this.TASK_INSTANCES_URI}/${id}${expandAttributes ? "?$expand=attributes" : ""}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Updates the status of a user task, its properties, for example, the subject, and its context with the attributes provided in the request body.
   * Depending on the provided attributes, the user might need administrative privileges for the task instance.
   * Without administrative privileges, a user can only set the status to COMPLETED. Optionally, the user can change the context when completing the task.
   *
   * Workflows validate and restrict the update of the context if they originate from the process builder of SAP Build Process Automation. If the validation fails, the response code is 422. See the detail fields of the response body on the specific validations that failed.
   *
   * Note that patching a translated subject or description is not supported. That means, that GET requests that are executed on a translated user task do not display the patched text.
   */
  public async updateTaskInstance(
    id: string,
    data: UpdateTaskInstancePayload,
  ): Promise<void> {
    try {
      const client = await this.getClient();
      const query = `${this.TASK_INSTANCES_URI}/${id}`;
      await client.patch(query, data);
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves custom task attributes of a user task. Labels as well as the order of the custom task attributes in which they are returned, are taken from the latest versions of the workflow definitions where these attributes are present.
   */
  public async findTaskInstanceAttributes(
    id: string,
  ): Promise<CustomTaskAttribute[]> {
    try {
      const client = await this.getClient();
      const query = `${this.TASK_INSTANCES_URI}/${id}/attributes`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves the context of a user task.
   *
   * Workflows that were created using the process builder of SAP Build Process Automation return the context as it was provided to the user task, that is, after input mapping.
   * If there are no input mappings defined, this API returns the complete context.
   */
  public async findTaskInstanceContext<T>(id: string): Promise<T> {
    try {
      const client = await this.getClient();
      const query = `${this.TASK_INSTANCES_URI}/${id}/context`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves task definitions by query parameters.
   *
   * A task definition is identified by the ID of the respective activity within a workflow definition (for example, usertask1) and the workflow definition ID.
   * The workflow definition ID is version independent. That means, this API assumes that task definitions are semantically the same if they span several
   * workflow versions and therefore have the same identifier. The latest workflow definition version is expected to contain the leading property values of
   * the task definition.
   *
   * At the moment, filtering is limited to the $skip and $top parameters for paging through the available task definitions.
   *
   * The returned task definitions are sorted in descending order of their creation time.
   */
  public async getTaskDefinitionList(
    queryBuilder?: QueryBuilder,
  ): Promise<TaskDefinitionList> {
    try {
      const client = await this.getClient();
      const query = `${this.TASK_DEFINITIONS_URI}${queryBuilder?.build() ?? ""}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves a list of the latest version of each deployed workflow definition. The request can be parameterized.
   */
  public async getWorkflowDefinitionList(
    queryBuilder?: QueryBuilder,
  ): Promise<WorkflowDefinitionList> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_DEFINITIONS_URI}${queryBuilder?.build() ?? ""}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves the latest version of the specified workflow definition.
   */
  public async findWorkflowDefinition(id: string): Promise<WorkflowDefinition> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_DEFINITIONS_URI}/${id}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Undeploys all versions of an existing workflow definition and deletes the corresponding workflow instances. Once the undeployment has started, you can no longer start a new workflow instance based on this workflow definition.
   *
   * This only applies to classic workflows developed in SAP Business Application Studio.
   */
  public async deleteWorkflowDefinition(id: string): Promise<void> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_DEFINITIONS_URI}/${id}`;
      await client.delete(query);
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves a list of all deployed versions of the specified workflow definition.
   */
  public async findWorkflowDefinitionVersionList(
    id: string,
    queryBuilder?: QueryBuilder,
  ): Promise<WorkflowDefinitionVersion[]> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_DEFINITIONS_URI}/${id}/versions${queryBuilder?.build() ?? ""}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves the specified version of the specified workflow definition.
   */
  public async findWorkflowDefinitionVersion(
    id: string,
    version: string,
  ): Promise<WorkflowDefinitionVersion> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_DEFINITIONS_URI}/${id}/versions/${version}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves the model of the latest version of the specified workflow definition.
   */
  public async findWorkflowDefinitionModel(id: string): Promise<WorkflowModel> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_DEFINITIONS_URI}/${id}/model`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves the default start context of the latest version of the specified workflow definition.
   */
  public async findWorkflowDefinitionStartContext(
    id: string,
  ): Promise<SampleContext> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_DEFINITIONS_URI}/${id}/sample-contexts/default-start-context`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves the default start context of the specified version of the specified workflow definition.
   */
  public async findWorkflowDefinitionStartContextForVersion(
    id: string,
    version: string,
  ): Promise<SampleContext> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_DEFINITIONS_URI}/${id}/versions/${version}/sample-contexts/default-start-context`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves workflow instances by parameters. If no parameters are specified, all RUNNING, or ERRONEOUS instances are returned.
   * Parameters for different attributes of the instance are evaluated using the logical 'and' operator. If multiple parameters are
   * specified for the same attribute or a parameter is specified multiple times, results are matched using the logical 'or' operator,
   * unless noted otherwise. Empty parameters are treated as if they were not given.
   */
  public async getWorkflowInstanceList(
    queryBuilder?: QueryBuilder,
  ): Promise<WorkflowInstanceList> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}${queryBuilder?.build() ?? ""}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Starts a new workflow instance of the provided workflow definition. Specify the ID of the workflow definition in the body.
   * The workflow instance automatically starts based on the latest deployed version of the definition.
   */
  public async startWorkflow(
    payload: WorkflowInstanceStartPayload,
  ): Promise<WorkflowInstance> {
    try {
      const client = await this.getClient();
      const res = await client.post(this.WORKFLOW_INSTANCES_URI, payload);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Modifies the given workflow instances according to the specified operations.
   * Currently, the only operation supported is the deletion of workflow instances.
   * You can at most specify 10000 instances to delete in one API call.
   */
  public async updateWorkflowInstanceList(
    payload: WorkflowInstancesUpdatePayload,
  ): Promise<void> {
    try {
      const client = await this.getClient();
      await client.patch(this.WORKFLOW_INSTANCES_URI, payload);
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Finds workflows based on the query parameters and uses their ids to delete them.
   * You can at most specify 10000 instances to delete in one API call.
   */
  public async deleteWorkflowInstances(
    queryBuilder: QueryBuilder,
  ): Promise<void> {
    try {
      const workflows = await this.getWorkflowInstanceList(queryBuilder);
      const payload: WorkflowInstancesUpdatePayload =
        workflows?.map((el) => ({
          id: el.id as string,
          deleted: true,
        })) ?? [];

      await this.updateWorkflowInstanceList(payload);
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Modifies the properties of a given workflow instance, for example, sets its status to CANCELED or RUNNING.
   *
   * Status changes may not take effect immediately, due to asynchronous processing of the request. When you change the status to CANCELED, note the following:
   *
   *    Workflow instances in CANCELED status are considered final, that is, no further changes are allowed. This is valid as well for other APIs and the processing according to the workflow definition.
   *
   *    Workflow instances in CANCELED status stop processing as soon as the system allows.
   *
   * When you are changing the status to SUSPENDED, note the following:
   *
   *    Status SUSPENDED manually and temporarily suspends processing.
   *
   *    You can choose to suspend the specified instance or the whole cascade by setting boolean parameter "cascade". By default, the parameter is false. When set to true, the operation is cascaded to its referenced subflow instances.
   *
   *    Workflow instances in SUSPENDED status stop processing as soon as the system allows.
   *
   *    Workflow instances remain in SUSPENDED status until a status change to RUNNING or CANCELED is requested.
   *
   *    While the workflow instance status reported by the respective API might change with immediate effect, follow-up actions might only be successful, after asynchronous processing within the workflow instance actually has stopped. To check whether asynchronous processing is ongoing, analyze the execution logs or check the workflow definition structure.
   *
   * When you are changing the status to RUNNING, note the following:
   *
   *    For workflow instances in ERRONEOUS status, this retries the failed activities. If these activities continue failing, the workflow instance automatically moves again into ERRONEOUS status.
   *
   *    If the workflow instance had previously been suspended while in ERRONEOUS status, failed activities, such as service tasks, are retried.
   *
   *    You can choose to retry or resume the specified instance or the whole cascade by setting boolean parameter "cascade". By default, the parameter is false. When set to true, the operation is cascaded to its referenced subflow instances.
   *
   * When you propagate the status change to subflow instances with the 'cascade' parameter, note the following:
   *
   *    The effects outlined above are appropriately applied to the subflow instances. For example, instances in a final status like CANCELED are not changed by the API.
   *
   * The status values in relation to this API have the following corresponding terms in user interfaces of SAP Build Process Automation:
   *
   *    RUNNING - Running
   *    ERRONEOUS - Error
   *    SUSPENDED - On Hold
   *    CANCELED - Canceled
   *    COMPLETED - Completed
   */
  public async updateWorkflowInstance(
    id: string,
    payload: WorkflowInstanceUpdatePayload,
  ): Promise<void> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}/${id}`;
      await client.patch(query, payload);
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves the workflow instance with the specified workflow instance ID.
   */
  public async findWorkflowInstance(
    id: string,
    expandAttributes: boolean = false,
  ): Promise<WorkflowInstance> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}/${id}${expandAttributes ? "?$expand=attributes" : ""}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves custom workflow attributes for a workflow instance. Labels as well as the order of the custom workflow attributes in which they are returned, are taken from the latest versions of the workflow definitions where these attributes are present.
   */
  public async findWorkflowInstanceAttributes(
    id: string,
  ): Promise<CustomWorkflowAttribute[]> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}/${id}/attributes`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves the context for a workflow instance independent of its status.
   */
  public async findWorkflowInstanceContext<T>(id: string): Promise<T> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}/${id}/context`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Modifies parts of the context for a workflow instance independent of its status. Allows updating the workflow context to remove sensitive data, leaving the workflow instance in place.
   *
   * Take special care when using this API, because it might change the workflow context in ways that are incompatible with the expectations
   * of the tasks in the workflow definition. Before changing the context, we recommend that you suspend the workflow instance and make sure that
   * the execution has come to a halt, that is, that no further steps are being added to the execution log. Refer to PATCH on the parent resource
   * and GET on the 'execution-logs' sibling resource.
   */
  public async updateWorkflowInstanceContext(
    id: string,
    ctx: object,
  ): Promise<void> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}/${id}/context`;
      await client.patch(query, ctx);
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Overrides the context for a workflow instance independent of its status.
   *
   * Take special care when using this API, because it will override the workflow context, that is, it might change the workflow context
   * in ways that are incompatible with the expectations of the tasks in the workflow definition. Before changing the context, we recommend that you
   * suspend the workflow instance and check that the execution has come to a halt, that is, no further steps are being added to the execution log.
   * Refer to PATCH on the parent resource and GET on the 'execution-logs' sibling resource.
   */
  public async overwriteWorkflowInstanceContext(
    id: string,
    ctx: object,
  ): Promise<void> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}/${id}/context`;
      await client.put(query, ctx);
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves a fragment of the context for a workflow instance independent of its status.
   */
  public async findWorkflowInstanceContextProperty<T>(
    id: string,
    propertyPath: string,
  ): Promise<T> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}/${id}/context/${propertyPath}`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves current error messages for a workflow instance.
   */
  public async findWorkflowInstanceErrorMessages(
    id: string,
  ): Promise<WorkflowInstanceErrorMessageList> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}/${id}/error-messages`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Retrieves execution logs for a given workflow instance.
   */
  public async findWorkflowInstanceExecutionLog(
    id: string,
  ): Promise<WorkflowInstanceExecutionLogList> {
    try {
      const client = await this.getClient();
      const query = `${this.WORKFLOW_INSTANCES_URI}/${id}/execution-logs`;
      const res = await client.get(query);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Undeploys all versions of an existing form. This only applies to classic workflow forms developed in SAP Business Application Studio.
   */
  public async deleteForm(formId: string): Promise<void> {
    try {
      const client = await this.getClient();
      await client.delete(`${this.FORMS_URI}/${formId}`);
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Tracks the status of API requests, which the server executed asynchronously.
   */
  public async getJob(jobId: string): Promise<Job> {
    try {
      const client = await this.getClient();
      const res = await client.get(`${this.JOBS_URI}/${jobId}`);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Sends a message to a set of workflow instances for consumption in intermediate message events. The message is identified by the name specified in the workflow model (request body parameter 'definitionId')
   * and parameters identifying the workflow instances that should consume the message.
   *
   * From the process builder of SAP Build Process Automation, you currently cannot model intermediate message events. This API exists for workflows that originate from other editors.
   *
   * The message is consumed by the workflow instances that match the following criteria:
   *
   *    The instance can be a specific match when using its workflow instance ID (request body parameter 'workflowInstanceId').
   *    Or the instance is a generic match when using the ID of the workflow model together with the business key (request body parameters 'workflowDefinitionId' respectively 'businessKey').
   *     You can either use the specific or generic match but not both in the same call.
   *
   *    The workflow instance is not in the SUSPENDED state.
   *
   *    The workflow instance currently waits at the intermediate message event referring to the specified message.
   *
   * The business key of a workflow instance matches if the business key specified in the request body is the same.
   */
  public async sendMessage(
    payload: SendMessagePayload,
  ): Promise<ConsumingWorkflowInstance> {
    try {
      const client = await this.getClient();
      const res = await client.post(this.MESSAGES_URI, payload);
      return res;
    } catch (e) {
      LOGGER.error(GENERIC_ERR_MSG, e);
      throw e;
    }
  }

  /**
   * Gets the active service connection through CDS to the remote service
   */
  private async getClient(): Promise<Service> {
    if (!this.serviceConnection) {
      this.serviceConnection = await cds.connect.to(this.bindingDefinition);
    }

    return this.serviceConnection;
  }
}
