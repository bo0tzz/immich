import * as github from '@actions/github'
import { RequestError } from '@octokit/request-error'
import { MAIN_BRANCH } from 'src/constants'

export type GithubClient = ReturnType<typeof github.getOctokit>
export type CreatePullRequest = {
  head: string
  title: string
  body: string
  draft: boolean
}

export class GithubRepoClient {
  client: GithubClient
  repo: { owner: string; repo: string }

  constructor(client: GithubClient, repo: { owner: string; repo: string }) {
    this.client = client
    this.repo = repo
  }

  async getBranch(branchName: string) {
    try {
      const branch = await this.client.rest.repos.getBranch({
        ...this.repo,
        branch: branchName
      })
      return branch.data
    } catch (e) {
      if (e instanceof RequestError && e.status === 404) {
        return null
      }
      throw e
    }
  }

  async createBranch(branchName: string, sha: string) {
    const branch = await this.client.rest.git.createRef({
      ...this.repo,
      ref: `refs/heads/${branchName}`,
      sha
    })
    return branch.data
  }

  async createCommit(params: {
    tree: string
    message: string
    parents: string[]
  }) {
    const commit = await this.client.rest.git.createCommit({
      ...this.repo,
      ...params
    })
    return commit.data
  }

  async getPullFromBranch(branchName: string) {
    const pulls = await this.client.paginate(this.client.rest.pulls.list, {
      ...this.repo
    })
    return pulls.find(p => p.head.ref == branchName)
  }

  async createPullFromBranch(parameters: CreatePullRequest) {
    const pull = await this.client.rest.pulls.create({
      ...this.repo,
      ...parameters,
      base: MAIN_BRANCH
    })
    return pull.data
  }

  async updatePrBranch(pull_number: number) {
    const resp = await this.client.rest.pulls.updateBranch({
      ...this.repo,
      pull_number
    })
    return resp.data
  }
}
