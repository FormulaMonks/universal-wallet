# Contributing to Dirua

It is most welcome if you are interested to hack on Dirua.


## Topics

* [Reporting security issues](#reporting-security-issues)
* [Reporting general issues](#reporting-general-issues)
* [Code and doc contribution](#code-and-doc-contribution)
* [Engage to help anything](#engage-to-help-anything)

## Reporting security issues

Security issues are always treated seriously. As our usual principle, we discourage anyone to spread security issues. If you find a security issue of Dirua, please do not discuss it in public and even do not open a public issue. Instead we encourage you to send us a private email to [gorka@citrusbyte.com](mailto:gorka@citrusbyte.com) to report this.

## Reporting general issues

To be honest, we regard every user of Dirua as a very kind contributor. After experiencing Dirua, you may have some feedback for the project. Then feel free to open an issue via [NEW ISSUE](https://github.com/citrusbyte/universal-wallet/issues/new).

Since we collaborate project Dirua in a distributed way, we appreciate **WELL-WRITTEN**, **DETAILED**, **EXPLICIT** issue reports. To make the communication more efficient, we wish everyone could search if your issue is an existing one in the searching list. If you find it existing, please add your details in comments under the existing issue instead of opening a brand new one.

There are lot of cases when you could open an issue:

* bug report
* feature request
* performance issues
* feature proposal
* feature design
* help wanted
* docs
* tests
* any questions on project
* and so on...

Also we must remind that when filing a new issue, please remember to remove the sensitive data from your post. Sensitive data could be passwords, private keys, wallet import format strings (wif) and so on.

## Code and doc contribution

> We are looking forward to any PR from you.

Every action to make project Dirua better is encouraged. On GitHub, every improvement for Dirua could be via a pull request.

* If you find a typo, try to fix it!
* If you find a bug, try to fix it!
* If you find some redundant codes, try to remove them!
* If you find some test cases missing, try to add them!
* If you could enhance a feature, please **DO NOT** hesitate!
* If you find code implicit, try to add comments to make it clear!
* If you find code ugly, try to refactor that!
* If you can help to improve documents, it could not be better!
* If you find document incorrect, just do it and fix that!
* ...

Since you are ready to improve Dirua with a PR, we suggest you could take a look at the PR rules here.

* [Workspace Preparation](#workspace-preparation)
* [Branch Definition](#branch-definition)
* [Commit Rules](#commit-rules)
* [PR Description](#pr-description)

### Local workstation

To put forward a PR, we assume you have registered a GitHub ID. Then you could finish the preparation in the following steps:

1. **FORK** Dirua to your repository. To make this work, you just need to click the button Fork in right-left of [citrusbyte/universal-wallet](https://github.com/citrusbyte/universal-wallet) main page. Then you will end up with your repository in `https://github.com/<your-username>/universal-wallet`, in which `your-username` is your GitHub username.

2. **CLONE** your own repository to develop locally. Use `git clone https://github.com/<your-username>/universal-wallet.git` to clone repository to your local machine. Then you can create new branches to finish the change you wish to make. 

3. **Set Remote** upstream to be https://github.com/citrusbyte/universal-wallet.git using the following two commands:
```
git remote add upstream https://github.com/citrusbyte/universal-wallet.git
git remote set-url --push upstream no-pushing
```

With this remote setting, you can check your git remote configuration like this:
```
git remote -v
origin     https://github.com/<your-username>/universal-wallet.git (fetch)
origin     https://github.com/<your-username>/universal-wallet.git (push)
upstream   https://github.com/citrusbyte/universal-wallet.git (fetch)
upstream   no-pushing (push)
```

Adding this, we can easily synchronize local branches with upstream branches.


### Setup

The first thing you will need to do is install the top level dependencies:

```
npm i
```

This will isntall [lerna](https://github.com/lerna/lerna). Dirua uses lerna to maintain a monorepo for multiple packages.

Then, depending on the package you wish to hack on you may need to take further steps. Please review the  package's README to setup your local environment.

### Branch Definition

Right now we assume every contribution via pull request is for [branch develop](https://github.com/citrusbyte/universal-wallet/tree/develop) in Dirua. Before contributing, be aware of branch definition would help a lot.

As a contributor, keep in mind again that every contribution via pull request is for branch develop.

### Commit Rules

In Dirua, we take into consideration the following rules when committing:

* [Commit Message](#commit-message)
* [Commit Content](#commit-content)

#### Commit Message

Commit message could help reviewers better understand what is the purpose of submitted PR. It could help accelerate the code review procedure as well. We encourage contributors to use **EXPLICIT** commit message rather than ambiguous message. In general, we advocate the following commit message type: 

* Module/Domain xxx. For example, "Auth: refactor to make code more readable"

On the other side, we discourage contributors from committing message like the following ways:

* ~~fix bug~~
* ~~update~~
* ~~add doc~~

#### Commit Content

Commit content represents all content changes included in one commit. It helps the review without any other commits' help. In another word, contents in one single commit can pass the CI to avoid code mess. In brief, there are two minor rules for us to keep in mind:

* avoid very large change in a commit;
* complete and reviewable for each commit.

No matter commit message, or commit content, we do take more emphasis on code review. 

### PR Description

PR is the only way to make change to Dirua project files. To help reviewers better get your purpose, PR description could not be too detailed.

## Engage to help with anything

We choose GitHub as the primary place for Dirua to collaborate. So the latest updates of Dirua are always here. Although contributions via PR is an explicit way to help, we still call for any other ways.

* reply to other's issues if you could;
* help solve other user's problems;
* help review other's PR design;
* help review other's codes in PR;
* discuss about Dirua to make things clearer;
* advocate Dirua technology beyond GitHub;
* write blogs on Dirua and so on.
