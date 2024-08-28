import * as core from '@actions/core'
import * as github from '@actions/github'
import { Context } from '@actions/github/lib/context'
import { GithubRepoClient } from 'src/github'

export type Inputs = {
  token: string
}

export function getInputs(): Inputs {
  return { token: core.getInput('token') }
}

export type ActionContext = {
  client: GithubRepoClient
  githubContext: Context
}

export function getActionContext(inputs: Inputs): ActionContext {
  const client = github.getOctokit(inputs.token)
  const ctx = github.context
  return {
    client: new GithubRepoClient(client, ctx.repo),
    githubContext: ctx
  }
}
