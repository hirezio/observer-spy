# Contributing to observer-spy

We would love for you to contribute to this project.
As a contributor, here are the guidelines we would like you to follow:

## 1. Be Kind - Code of Conduct

Help us keep this project open and inclusive. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md)

## 2. Submitting an Issue

You can file new issues by selecting from our [new issue templates](https://github.com/hirezio/observer-spy/issues/new/choose) and filling out the issue template.

## 3. Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

1. Search [GitHub](https://github.com/hirezio/observer-spy/pulls) for an open or closed PR
   that relates to your submission. You don't want to duplicate effort.
1. Be sure that **there is an issue** describes the problem you're fixing, or documents the design for the feature you'd like to add.
   Discussing the design up front helps to ensure that we're ready to accept your work.

1. Fork the this repo.
1. Make your changes in a new git branch:

   ```shell
   git checkout -b my-fix-branch master
   ```

1. Create your patch, **including appropriate test cases**.
1. Run `yarn test` to check if all the tests are passing.
   and ensure that all tests pass.
1. Commit your changes using:

   ```shell
   yarn commit
   ```

   This will create a descriptive commit message that follows our
   [commit message conventions](#commit-message-format).
   This is necessary to generate meaningful release notes automatically.

1. Push your branch to GitHub:

   ```shell
   git push origin my-fix-branch
   ```

1. In GitHub, send a pull request to `observer-spy:master`.

- If we suggest changes then:

  - Make the required updates.
  - Re-run the tests to ensure tests are still passing.
  - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push -f
    ```

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

- Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

  ```shell
  git push origin --delete my-fix-branch
  ```

- Check out the master branch:

  ```shell
  git checkout master -f
  ```

- Delete the local branch:

  ```shell
  git branch -D my-fix-branch
  ```

- Update your master with the latest upstream version:

  ```shell
  git pull --ff upstream master
  ```

<hr>

This doc is based on [Angular's contributing document](https://github.com/angular/angular/blob/master/CONTRIBUTING.md)

[coc]: CODE_OF_CONDUCT.md
[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#
[github]: https://github.com/hirezio/observer-spy
[stackblitz]: https://stackblitz.com/
