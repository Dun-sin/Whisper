# Table of content

- [guidelines](#guidelines)
- [Skills needed to contribute](#-prerequisite-skills-to-contribute)
- [How to contribute](#-how-to-contribute)

## Guidelines

### Issues guidelines

- Don't work on anything unless you are assigned, if you make a pull request without being assigned to that issue, it will be closed without being merged
- Don't work on more than one issue at a time, this is so that you don't make a huge pull request and others can have opportunities to work on another issue while you work on something else

### Pull Request guidelines

- Don't create a pull request on an issue that doesn't exist, create an issue first and if the changes you are proposing are said to be okay, you can go ahead and create a pull request
- Don't work on the main branch, create your own branch by following the instructions [here](#-how-to-make-a-pull-request)
- If you are working on the backend, share a screenrecording of your working software
- don't create a PR for things outside of your issue's scope, it will lead to more work for the maintainers

### General guidelines

- Do read the `readme.md` file
- If there's no PR for an issue in the allocated time, you will be unassigned, the following labels determine the time. `2days`, `4days`, `7 days(1week)`, `2 weeks`

#### 👌🏾 How to fill a pull request template(Text)

- Your Pull Request title should be like a commit message which should look like this -> `[prefix]: [what you did]`
  [how to write what you did](https://www.freecodecamp.org/news/how-to-write-better-git-commit-messages/)
  [how to pick which prefix to use](https://kapeli.com/cheat_sheets/Conventional_Commits.docset/Contents/Resources/Documents/index)

- Your PR description should have either `fixes`, `closes` with the issue number you worked on, for example, `fixes #123` or `closes #123` where #123 is the issue you worked on. It should not be `fixes issue #123`
- Your PR description should also have the changes you did e.g added a new component, added a new image.

## 👩🏽‍💻 Prerequisite Skills to Contribute

### Contribute in Components/CSS

- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)

### Contribute in backend

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Socket.io](https://socket.io/)

---

## 💥 How to Contribute

- Take a look at the existing [Issues](https://github.com/Dun-sin/Whisper/issues) or [create a new issue](https://github.com/Dun-sin/Whisper/issues/new/choose)!
- [Fork the Repo](https://github.com/Dun-sin/Whisper/fork). Then, create a branch for any issue that you are working on. Finally, commit your work.
- Create and Push a Branch
  - To create a new branch and switch to it:
    ```bash
    git checkout -b new-branch-name
    ```
  - To push the branch to the remote repository:
    ```bash
    git push origin new-branch-name
    ```
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
