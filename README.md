# Wealthwell-App Setup Guide

This guide will help you **install Docker**, **clone the Wealthwell-App Git repository**, and **run the application** on any machine (Windows, macOS, or Linux).

---

## 1. Prerequisites

* **Git** installed

  * Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win)
  * macOS: `brew install git`
  * Linux: `sudo apt install git` (Debian/Ubuntu) or equivalent for your distro

* **Docker Desktop** (for Windows/macOS) or Docker Engine (Linux)

  * Windows/macOS: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
  * Linux: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)

* Optional: **Node.js** if you want to run locally outside Docker ([https://nodejs.org/](https://nodejs.org/))

---

## 2. Install Docker

### Windows/macOS:

1. Download Docker Desktop.
2. Install and launch Docker Desktop.
3. Ensure Docker is running (look for the whale icon in the system tray).
4. Switch to **Linux containers** (if using Windows) by right-clicking the Docker icon and selecting "Switch to Linux containers".
5. Optional: Enable **WSL2 backend** on Windows for better performance.

### Linux:

1. Follow official Docker Engine installation: [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
2. After installation, start Docker:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

3. Verify installation:

```bash
docker --version
docker info
```

---

## 3. Clone the Git Repository

Open a terminal and run:

```bash
# Clone the repository
git clone https://github.com/chinanagooo/wealthwell-app.git

# Move into the project folder
cd wealthwell-app
```

> **Note:** If prompted for a password during Git push/pull, use a **GitHub Personal Access Token (PAT)** instead of your password.

### Using Personal Access Token

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token.
2. Select `repo` scope and copy the token.
3. When Git asks for your password, paste the token (typing is invisible — this is normal).

---

## 4. Build the Docker Image

Inside the project folder (where `Dockerfile` is located), run:

```bash
docker build -t wealthwell-app .
```

* `-t wealthwell-app` gives your image a name.
* `.` tells Docker to use the current directory as the build context.

---

## 5. Run the Docker Container

```bash
docker run -p 3000:3000 wealthwell-app
```

* This maps **port 3000** inside the container to **port 3000** on your host machine.
* Open your browser and go to `http://localhost:3000` to see the app.

### Optional: Run in detached mode

```bash
docker run -d -p 3000:3000 wealthwell-app
```

* `-d` runs the container in the background.
* View running containers:

```bash
docker ps
```

* Stop the container:

```bash
docker stop <container_id>
```

---

## 6. Pushing Changes to GitHub

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

* Use your **Personal Access Token** if prompted.
* Ensure your `.gitignore` excludes `node_modules/`, `.env`, and other local files.

---

## 7. Notes

* Always build the Docker image after pulling new changes from GitHub:

```bash
git pull origin main
docker build -t wealthwell-app .
```

* Use **Docker Desktop** logs to debug if the container fails to run.
* This setup ensures your app runs **identically on any machine**.

---

**Repository:** [https://github.com/chinanagooo/wealthwell-app](https://github.com/chinanagooo/wealthwell-app)
