import * as core from '@actions/core'
import { ActionContext } from 'src/context'
import { PR_BODY, PR_TITLE, RELEASE_BRANCH } from 'src/constants'

export async function handlePush(context: ActionContext) {
  core.info('Reconciling release PR')
  await ensureBranch(context)
  const pr = await ensurePR(context)
  return await ensureUpdated(context, pr!.id)
}

async function ensureBranch(context: ActionContext) {
  let branch = await context.client.getBranch(RELEASE_BRANCH)
  if (!branch) {
    core.info('No branch found, creating release branch.')
    branch = await context.client.createBranchFromMain(RELEASE_BRANCH)
  }
  return branch
}

async function ensurePR(context: ActionContext) {
  let pull = await context.client.getPullFromBranch(RELEASE_BRANCH)
  if (!pull) {
    core.info('No pull request found, creating pr.')
    await context.client.createPullFromBranch({
      head: RELEASE_BRANCH,
      body: PR_BODY,
      title: PR_TITLE,
      draft: true
    })
    // The return type of createPullFromBranch is not assignable to pull, and I don't want to deal with it.
    pull = await context.client.getPullFromBranch(RELEASE_BRANCH)
  }
  return pull
}

async function ensureUpdated(context: ActionContext, id: number) {
  core.info('Updating release branch')
  return await context.client.updatePrBranch(id)
}
