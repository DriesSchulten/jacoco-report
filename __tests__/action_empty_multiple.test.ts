/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as action from '../src/action'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {PATCH} from './mocks.test'

jest.mock('@actions/core')
jest.mock('@actions/github')

describe('Multiple Empty reports', function () {
  const comment = jest.fn()
  const output = jest.fn()

  const compareCommitsResponse = {
    data: {
      files: [
        {
          filename:
            'app/src/main/java/com/madrapps/playground/MainViewModel.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt',
          patch: PATCH.MULTI_MODULE.MAIN_VIEW_MODEL,
        },
        {
          filename: 'math/src/main/java/com/madrapps/math/Math.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt',
          patch: PATCH.MULTI_MODULE.MATH,
        },
        {
          filename: 'text/src/main/java/com/madrapps/text/StringOp.java',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/text/src/main/java/com/madrapps/text/StringOp.java',
          patch: PATCH.MULTI_MODULE.STRING_OP,
        },
        {
          filename:
            'app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/events/OnClickEvent.kt',
          patch: PATCH.MULTI_MODULE.ON_CLICK_EVENT,
        },
        {
          filename: 'app/src/main/java/com/madrapps/playground/MainActivity.kt',
          blob_url:
            'https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt',
          patch: PATCH.MULTI_MODULE.MAIN_ACTIVITY,
        },
      ],
    },
  }

  core.getInput = jest.fn(c => {
    switch (c) {
      case 'paths':
        return './__tests__/__fixtures__/empty_multi_module/empty-appCoverage.xml,./__tests__/__fixtures__/multi_module/mathCoverage.xml,./__tests__/__fixtures__/empty_multi_module/empty-textCoverage.xml'
      case 'token':
        return 'SMPLEHDjasdf876a987'
      case 'comment-type':
        return 'pr_comment'
      case 'min-coverage-overall':
        return 45
      case 'min-coverage-changed-files':
        return 90
      case 'pass-emoji':
        return ':green_apple:'
      case 'fail-emoji':
        return ':x:'
      case 'debug-mode':
        return 'false'
    }
  })
  github.getOctokit = jest.fn(() => {
    return {
      rest: {
        repos: {
          compareCommits: jest.fn(() => {
            return compareCommitsResponse
          }),
          listPullRequestsAssociatedWithCommit: jest.fn(() => {
            return {data: []}
          }),
        },
        issues: {
          createComment: comment,
        },
      },
    }
  })
  core.setFailed = jest.fn(c => {
    fail(c)
  })

  describe('Pull Request event', function () {
    const eventName = 'pull_request'
    const payload = {
      pull_request: {
        number: '45',
        base: {
          sha: 'guasft7asdtf78asfd87as6df7y2u3',
        },
        head: {
          sha: 'aahsdflais76dfa78wrglghjkaghkj',
        },
      },
    }

    it('publish proper comment', async () => {
      initContext(eventName, payload)
      await action.action()

      expect(comment.mock.calls[0][0].body)
        .toEqual(`|Overall Project|15.85% **\`-14.75%\`**|:x:|
|:-|:-|:-:|
|Files changed|0%|:x:|
<br>

|Module|Coverage||
|:-|:-|:-:|
|math|51.35% **\`-13.51%\`**|:x:|
|app|6.85% **\`-15.07%\`**|:x:|

<details>
<summary>Files</summary>

|Module|File|Coverage||
|:-|:-|:-|:-:|
|math|[Math.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/math/src/main/java/com/madrapps/math/Math.kt)|59.38% **\`-15.63%\`**|:x:|
|app|[MainViewModel.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainViewModel.kt)|35.71% **\`-28.57%\`**|:x:|
||[MainActivity.kt](https://github.com/thsaravana/jacoco-android-playground/blob/63aa82c13d2a6aadccb7a06ac7cb6834351b8474/app/src/main/java/com/madrapps/playground/MainActivity.kt)|0% **\`-14%\`**|:x:|

</details>`)
    })

    it('set overall coverage output', async () => {
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 15.85])
    })

    it('set changed files coverage output', async () => {
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 18.13])
    })

    it('set changed lines coverage output', async () => {
      initContext(eventName, payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[2]
      expect(out).toEqual(['coverage-changed-lines', 0])
    })
  })

  describe('Push event', function () {
    const payload = {
      before: 'guasft7asdtf78asfd87as6df7y2u3',
      after: 'aahsdflais76dfa78wrglghjkaghkj',
    }

    it('set overall coverage output', async () => {
      initContext('push', payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[0]
      expect(out).toEqual(['coverage-overall', 15.85])
    })

    it('set changed files coverage output', async () => {
      initContext('push', payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[1]
      expect(out).toEqual(['coverage-changed-files', 18.13])
    })

    it('set changed lines coverage output', async () => {
      initContext('push', payload)
      core.setOutput = output

      await action.action()

      const out = output.mock.calls[2]
      expect(out).toEqual(['coverage-changed-lines', 0])
    })
  })
})

function initContext(eventName, payload): void {
  const context = github.context
  context.eventName = eventName
  context.payload = payload
  context.repo = 'jacoco-playground'
  context.owner = 'madrapps'
}
