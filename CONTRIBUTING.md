# Table of content

- [guidelines](#guidelines)
- [Skills needed to contribute](#-prerequisite-skills-to-contribute)
- [How to contribute](#-how-to-contribute)
- [How to Document your code](#how-to-document-your-code)

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
- Fill out issue and pull request(PR) templates properly, if you don't know how, check out previous issues/PR to know how they are filled, this video👇🏾 or [this](#-how-to-fill-a-pull-request-templatetext)

#### 👌🏾 How to fill a pull request template(video)

[pull request template.webm](https://user-images.githubusercontent.com/78784850/195570788-05a6fe61-a9a3-4abe-ae17-936ffd6ea171.webm)

#### 👌🏾 How to fill a pull request template(Text)

- Your PR title should be according to the conventional commit standards([link](https://gist.github.com/Zekfad/f51cb06ac76e2457f11c80ed705c95a3)) for example, if the added something new to the project(doesn't matter how small), your PR title should be like this -> `feat: added a text` <- Whatever you added. If you fixed something then your PR title should be like this -> `fix: wrong link` <- whatever you fixed
- Your PR description should have either `fixes`, `closes` with the issue number you worked on, for example, `fixes #123` or `closes #123` where #123 is the issue you worked on. It should not be `fixes issue #123`
- Your PR description should also have the changes you did e.g added a new component, added a new image.

### How to document your code
- Include a link to the issue you're addressing in the summary tag after the previous details tag(e.g <details>Adding a new color [#issue_number](link to issue number)</details>
- Clearly explain the issue that needs solving. Include context, such as when the issue occurs and its impact.
- Provide a detailed explanation of how you solved the problem. Include the logic behind the solution and any relevant technical details.
- If there are multiple related problems, list them separately with corresponding solutions.
- Include snippets of code that illustrate the solution. Ensure these snippets are relevant and well-commented.

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
