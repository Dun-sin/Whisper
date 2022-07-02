### Contributing guidelines

## 👩🏽‍💻 Prerequisite Skills to Contribute

### Contribute in Components/CSS

- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [React Redux](https://react-redux.js.org/)

### Contribute in backend

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)

---

## 💥 How to Contribute

- Take a look at the existing [Issues](https://github.com/Dun-sin/anon-chat-app/issues) or [create a new issue](https://github.com/Dun-sin/anon-chat-app/issues/new/choose)!
- [Fork the Repo](https://github.com/Dun-sin/anon-chat-app/fork). Then, create a branch for any issue that you are working on. Finally, commit your work.
- Create a [Pull Request](https://github.com/Dun-sin/anon-chat-app/compare) (PR), which will be promptly reviewed and given suggestions for improvements by the community.
- Add screenshots or screen captures to your Pull Request to help us understand the effects of the changes proposed in your PR.

---

## 🌟 HOW TO MAKE A PULL REQUEST:

1. Start by making a Fork of the [anon](https://github.com/Dun-sin/anon-chat-app) repository. Click on the <a href="https://github.com/Dun-sin/anon-chat-app/fork"><img src="https://i.imgur.com/G4z1kEe.png" height="21" width="21"></a>Fork symbol at the top right corner.

2. Clone your new fork of the repository in the terminal/CLI on your computer with the following command:

```bash
git clone https://github.com/<your-github-username>/anon-chat-app
```

3. Navigate to the newly created anon-chat-app project directory:
```bash
cd anon-chat-app
```

4. Set upstream command:
```bash
git remote add upstream https://github.com/Dun-sin/anon-chat-app.git
```

5. Create a new branch:
```bash
git checkout -b YourBranchName
```

6. Sync your fork or your local repository with the origin repository:

- In your forked repository, click on "Fetch upstream"
- Click "Fetch and merge"

### Alternatively, Git CLI way to Sync forked repository with origin repository:
```bash
git fetch upstream
```

```bash
git merge upstream/main
```

### [Github Docs](https://docs.github.com/en/github/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-on-github) for Syncing

7. Make your changes to the source code.

8. Stage your changes and commit:

⚠️ Make sure not to commit package.json or package-lock.json file

```bash
git commit -m "<your_commit_message>"
```

9. Push your local commits to the remote repository:
```bash
git push origin YourBranchName
```

10. Create a [Pull Request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)!

11. Congratulations! You've made your first contribution to [anonchat](https://github.com/Dun-sin/anon-chat-app/graphs/contributors)!

🏆 After this, the maintainers will review the PR and will merge it if it helps move the anonchat project forward. Otherwise, it will be given constructive feedback and suggestions for the changes needed to add the PR to the codebase.
