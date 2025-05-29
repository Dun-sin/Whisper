<div id="top"></div>

<div align="center">
  <img src="https://user-images.githubusercontent.com/88016895/196855572-7bf5a696-098e-461d-a021-61c37bca6ba3.png" width="120px">
  <h2>Whisper</h2>
  <p>An app to help you chat in secret</p>

  <p  align="center">
    <a href="https://whischat.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/Dun-sin/Whisper/issues/new?assignees=&labels=bug&template=bug.yml&title=%5BBUG%5D+%3Cdescription%3E">Report Bug</a>
    ·
    <a href="https://github.com/Dun-sin/Whisper/issues/new?assignees=&labels=feature&template=features.yml&title=%5BFEATURE%5D+%3Cdescription%3E">Request Feature</a>
  </p>

  <img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/Dun-sin/Whisper?style=flat">
  <img alt="contributors" src="https://img.shields.io/github/contributors/Dun-sin/Whisper?style=flat">
  <img alt="GitHub Repo forks" src="https://img.shields.io/github/forks/Dun-sin/Whisper?style=flat">
  <img alt="issues" src="https://img.shields.io/github/issues/Dun-sin/Whisper?style=flat"> </br>
</div>

## Whisper

This app is developed to make chatting much private and easy without stealing your data!!

### ✨ Built With

 <table>
     <tbody>
  <tr>
   <td align="Center" width="30%"> 
 <a href="https://reactjs.org/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/react-colored.svg" width="36" height="36" alt="React" /></a>
    <br>React
    </td>   
   
   <td align="Center" width="30%">
        <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/javascript-colored.svg" width="36" height="36" alt="Javascript" /></a>
    <br>JavaScript
    </td> 
  <td align="Center" width="30%">
      <a href="https://nodejs.org/en/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/nodejs-colored.svg" width="36" height="36" alt="NodeJS" /></a>
    <br>NodeJS
    </td>   
    <td align="Center" width="30%">  
<a href="https://www.mongodb.com/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/mongodb-colored.svg" width="36" height="36" alt="MongoDB" /></a>
    <br>MongoDB
    </td>  
        <td align="Center" width="30%">  
<a href="https://www.docker.com/" target="_blank" rel="noreferrer"><img src=".github/docker.png" width="36" height="36" alt="MongoDB" /></a>
    <br>Docker
    </td>   
      </tr>
</tbody>
  </table>

  <table>
   <tbody>
      <tr>
     <td align="Center" width="30%">   
<a href="https://socket.io/" target="_blank" rel="noreferrer"><img src="https://w7.pngwing.com/pngs/162/702/png-transparent-socket-io-node-js-express-js-npm-network-socket-github-angle-triangle-logo-thumbnail.png" width="36" height="36" alt="SocketIo"></a>
     <br>SocketIo
    </td>  
    <td align="Center" width="30%">      
<a href="https://tailwindcss.com/" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/danielcranney/readme-generator/main/public/icons/skills/tailwindcss-colored.svg" width="36" height="36" alt="TailwindCSS" /></a> 
  <br>TailwindCSS
    </td>
          </tr>
</tbody>
  </table>

### 🖼️ Screenshot

![image](https://user-images.githubusercontent.com/78784850/209371680-aa61e57f-167a-4a7d-86f7-0f2455e60890.png)

<p align="right">(<a href="#top">back to top</a>)</p>

## 📚 Getting Started

To get a local copy up and running follow these simple steps.

### 👇🏽 Prerequisites

Before installation, please make sure you have already installed the following tools:

- [Git](https://git-scm.com/downloads)
- [NodeJs](https://nodejs.org/en/download/)
- [Docker](https://docker.com/desktop)

### 🛠️ Installation

1. [Fork](https://github.com/Dun-sin/Whisper/fork) the project. Click on the fork icon in the top right to get started

2. Clone the project, you can use the following command:

   ```bash
   git clone https://github.com/<your-github-username>/Whisper
   ```

3. Navigate to the project directory

   ```bash
   cd Whisper
   ```

4. Use `.env_sample` to configure the `.env` file for both client and server. For the server .env mongodb url use the localhost to test

   > Check this video of how to do that: https://www.youtube.com/watch?v=D0U8vD8m1I0

5. Run the application with docker compose

   ```bash
   docker-compose up -d
   ```

6. Port mappings:

   - Server running on port `4000`
   - Client running on port `5173`
   - MongoDB running on port `27018`

7. To test things out, you can open the same URL in two different browsers or open a private browsing window in the same browser. This allows you to connect to yourself, use `login anonymously` if you aren't dealing with anything that uses user data, else use `login` and open an account on [mailtrap](https://mailtrap.io/) using their demo to domain and get the token into `.env`

> For those who do not wish to use Docker, here is another option -> [to start the project](https://github.com/Dun-sin/Whisper/blob/main/CONTRIBUTING.md#starting-the-project-without-docker)

<p align="right">(<a href="#top">back to top</a>)</p>

## 🎨 Demo

Check out the website: [Whisper](https://WhisChat.vercel.app/)

<p align="right">(<a href="#top">back to top</a>)</p>

## 👩🏽‍💻 Contributing

- Contributions make the open source community such an amazing place to learn, inspire, and create.
- Any contributions you make are greatly appreciated.
- Check out our [contribution guidelines](/CONTRIBUTING.md) for more information.

<p align="right">(<a href="#top">back to top</a>)</p>

## ✏️ Edit with Gitpod

Click this button to run this project in Gitpod which comes with pre-configured environment.

<a href="https://gitpod.io/#type=client/https://github.com/Dun-sin/Whisper">
<img
    src="https://img.shields.io/badge/Contribute%20with-Gitpod-908a85?logo=gitpod"
    alt="Contribute with Gitpod"
  />
</a>

<p align="right">(<a href="#top">back to top</a>)</p>

## 👨‍👩‍👦 Community

Don't forget to join the discord community - [Join us](https://discord.gg/ufcysW9q23)

## 🛡️ License

Whisper is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<p align="right">(<a href="#top">back to top</a>)</p>

## 💪🏽 Thanks to all Contributors

Thanks a lot for spending your time helping Whisper grow. Thanks a lot! Keep rocking🍻

[![Contributors](https://contrib.rocks/image?repo=Dun-sin/Whisper)](https://github.com/Dun-sin/Whisper/graphs/contributors)

<p align="right">(<a href="#top">back to top</a>)</p>

## 🙏🏽 Support

This project needs a star️ from you. Don't forget to leave a star🌟

<p align="right">(<a href="#top">back to top</a>)</p>
