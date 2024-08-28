import * as core from '@actions/core'
import { ActionContext } from 'src/context'
import { MAIN_BRANCH, PR_BODY, PR_TITLE, RELEASE_BRANCH } from 'src/constants'

export async function handlePush(context: ActionContext) {
  core.info('Reconciling release PR')
  const branch = await ensureBranch(context)
  core.debug(`Created branch: ${JSON.stringify(branch)}`)
  const pr = await ensurePR(context)
  core.debug(`Created pr: ${JSON.stringify(pr)}`)
  return await ensureUpdated(context, pr!.number)
}

async function ensureBranch(context: ActionContext) {
  let branch = await context.client.getBranch(RELEASE_BRANCH)
  if (!branch) {
    core.info('No branch found, creating release branch.')
    const main = await context.client.getBranch(MAIN_BRANCH)

    const commit = await context.client.createCommit({
      message: 'placeholder release commit',
      tree: main!.commit.commit.tree.sha,
      parents: [main!.commit.sha]
    })

    await context.client.createBranch(RELEASE_BRANCH, commit.sha)

    // The return type of createBranch is not assignable to branch, and I don't want to deal with it.
    branch = await context.client.getBranch(RELEASE_BRANCH)
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
    // Return type not assignable
    pull = await context.client.getPullFromBranch(RELEASE_BRANCH)
  }
  return pull
}

async function ensureUpdated(context: ActionContext, pr: number) {
  core.info(`Updating release PR ${pr}`)
  return await context.client.updatePrBranch(pr)
}
