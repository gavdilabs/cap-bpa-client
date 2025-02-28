# @gavdi/cap-bpa-client - SAP Build Process Automation Workflow API Client For CAP

This package contains a predefined client that can be used with the CAP remote service connection system, to easily query the SAP BPA Workflow API.
It makes use of a custom query builder, to help you target exactly the properties you need from the different API endpoints.

On top of this, the package also comes with full object type definitions for any objects returned by the workflow API, helping you with added type safety for any calls.
This comes with alongside a full request range setup, such that you can easily start, stop, delete, fetch, or any action on the API.

## How To Use

This package strives to be an easy to use drop-in tool, to help get you off the ground as fast as possible.

It works by using the service binding you've provided to CAP, like in this example here:

```json
/* Your package.json file or .cdsrc.json */
{
    ...
    "cds": {
        "requires": {
            "workflow-api": {
                "kind": "rest",
                "credentials": {
                    "destination": "<your-wf-api-destination>"
                }
            }
        }
    }
}
```

With that binding, which you can name whatever you like but in this example is named 'workflow-api', we can then create a `WorkflowServiceClient` instance which targets that specific binding.

Once your client is configured and ready, you can then target any available endpoint using it. And should you wish to perform custom queries against an endpoint, you can use the built-in `QueryBuilder` to help you construct a proper query.

```typescript
/* Your logic file */
import { WorkflowServiceClient, TaskInstanceList, QueryBuilder, TaskQueryArgs } from "@gavdi/cap-bpa-client";

// Prepare your client
const workflowClient = new WorkflowServiceClient("workflow-api");

async function fetchTasksDueToday(): Promise<TaskInstanceList> {
    try {
        const today = new Date().toISOString();

        // Create an instance of the query builder
        const queryBuilder = new QueryBuilder();

        // Construct the argument you wish to use, depending on your endpoint
        // In this instance we use the TaskQueryArgs as we're targeting the Task Instance endpoint
        const argument: TaskQueryArgs = {
            top: 200,
            skip: 100,
            dueDate: today,
        };

        // Add your argument to the query (multiple can be added)
        queryBuilder.addArgument(argument);

        // And finally, fire away!
        const result = await workflowClient.getTaskList(queryBuilder);
        return result;
    } catch(e) {
        // Handle your errors!
    }
}
```

## Resources

All available endpoints configured for this client can be found on the official SAP API documentation page.

- [SAP API Hub - Workflow API](https://api.sap.com/api/SPA_Workflow_Runtime/overview)

## TODO

- [ ] Expand documentation to include all available options and how to use them
- [x] Allow for custom direct string query injection without using query builder (Done for 1.0.1)

---

(c) Copyright by Gavdi Labs 2024 - All Rights Reserved

