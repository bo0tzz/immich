import * as core from '@actions/core'
import * as github from '@actions/github'
import { handlePush } from 'src/handler/push'
import { getActionContext, getInputs } from 'src/context'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputs = getInputs()
    const actionContext = getActionContext(inputs)

    switch (github.context.eventName) {
      case 'push':
        await handlePush(actionContext)
        break
      case 'workflow_dispatch':
        await handlePush(actionContext)
        break
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}
