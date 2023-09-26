# Table of content

- [Rules](#rules)
- [Skills needed to contribute](#-prerequisite-skills-to-contribute)
- [How to contribute](#-how-to-contribute)

## Rules

- Don't create a pull request on an issue that doesn't exist, create an issue first and if the changes you are proposing are said to be okay, you can go ahead and create a pull request

- Don't work on anything unless you are assigned, if you make a pull request without being assigned to that issue, it will be closed without being merged

- Don't work on more than one issue at a time, this is so that you don't make a huge pull request and others can have opportunities to work on another issue while you work on something else

- Do read the `readme.md` file

- Don't work on the main branch, create your own branch by following the instructions [here](#-how-to-make-a-pull-request)

- Fill out issue and pull request(PR) templates properly, if you don't know how, check out previous issues/PR to know how they are filled, this video👇🏾 or [this](#-how-to-fill-a-pull-request-templatetext)

#### 👌🏾 How to fill a pull request template(video)

[pull request template.webm](https://user-images.githubusercontent.com/78784850/195570788-05a6fe61-a9a3-4abe-ae17-936ffd6ea171.webm)

#### 👌🏾 How to fill a pull request template(Text)

- Your PR title should be according to the conventional commit standards([link](https://gist.github.com/Zekfad/f51cb06ac76e2457f11c80ed705c95a3)) for example, if the added something new to the project(doesn't matter how small), your PR title should be like this -> `feat: added a text` <- Whatever you added. If you fixed something then your PR title should be like this -> `fix: wrong link` <- whatever you fixed
- Your PR description should have either `fixes`, `closes` with the issue number you worked on, for example, `fixes #123` or `closes #123` where #123 is the issue you worked on. It should not be `fixes issue #123`
- Your PR description should also have the changes you did e.g added a new component, added a new image.

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

- Take a look at the existing [Issues](https://github.com/Dun-sin/Whisper/issues) or [create a new issue](https://github.com/Dun-sin/Whisper/issues/new/choose)!
- [Fork the Repo](https://github.com/Dun-sin/Whisper/fork). Then, create a branch for any issue that you are working on. Finally, commit your work.
- Create a [Pull Request](https://github.com/Dun-sin/Whisper/compare) (PR), which will be promptly reviewed and given suggestions for improvements by the community.
- Add screenshots or screen captures to your Pull Request to help us understand the effects of the changes proposed in your PR.

---

## Starting the Project without Docker

- Navigate to the Client Folder
  ```bash
  cd client
  ```
- Start the client Side
  ```bash
  npm start
  ```
- Navigate to the Server Folder
  ```bash
  cd server
  ```
- Start the Server Side
  ```bash
  nodemon index.js
  ```
  > Note: you must have gotten past step 5 in ["Installation"](https://github.com/Dun-sin/Whisper#%EF%B8%8F-installation) part of the readme file

## 🌟 HOW TO MAKE A PULL REQUEST:

1. Start by making a Fork of the [Whisper](https://github.com/Dun-sin/Whisper) repository. Click on the <a href="https://github.com/Dun-sin/Whisper/fork"><img src="https://i.imgur.com/G4z1kEe.png" height="21" width="21"></a>Fork symbol at the top right corner.

2. Clone your new fork of the repository in the terminal/CLI on your computer with the following command:

```bash
git clone https://github.com/<your-github-username>/Whisper
```

3. Navigate to the newly created Whisper project directory:

```bash
cd Whisper
```

4. Set upstream command:

```bash
git remote add upstream https://github.com/Dun-sin/Whisper.git
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
git cz
```

9. Push your local commits to the remote repository:

```bash
git push origin YourBranchName
```

10. Create a [Pull Request](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request)!

11. Congratulations! You've made your first contribution to [Whisper](https://github.com/Dun-sin/Whisper/graphs/contributors)!

🏆 After this, the maintainers will review the PR and will merge it if it helps move the Whisper project forward. Otherwise, it will be given constructive feedback and suggestions for the changes needed to add the PR to the codebase.

---

## 💥 Issues

In order to discuss changes, you are welcome to [open an issue](https://github.com/Dun-sin/Whisper/issues/new/choose) about what you would like to contribute. Enhancements are always encouraged and appreciated.
