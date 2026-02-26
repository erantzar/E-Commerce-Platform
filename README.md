# 🛒 E-commerce & CRM API

This is the backend server for our Full Stack final project. It handles user authentication, product management, and CRM data for an E-commerce platform.

## 👥 Team Members
* **Eran tzarfati** - [GitHub Profile Link]
* **Partner Name** - [GitHub Profile Link]

---

## 🛠 Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (with Mongoose)
* **Authentication:** JWT (JSON Web Tokens) & Bcrypt

---

## 🚀 Getting Started

1. Clone the repo.
    * git clone https://github.com/erantzar/E-Commerce-Platform.git

2. Run `pnpm install`.

3. Set up your `.env` file.

4. cd E-Commerce-Platform 
    * make sure all the git commands (new branches, commits..) are on the main file
    * so if we update the readme.md or the .gitignore it will be commited
    * and also, for later when we build the forntEnd and add more files
  

---

## 🌿 Team Workflow & Rules

To keep our project clean and avoid breaking each other's code, we follow these strictly:

### 1. The "Father" Folder Rule
- Always run your Git commands (`git add`, `git commit`, `git status`) from the root directory (`E-Commerce-Platform/`).
- This ensures that any changes to the README, `.gitignore`, or future Frontend folders are all tracked together.

### 2. Feature Branching
- Never push directly to `main`.
- Create a new branch for every task: `git checkout -b feature/name-of-feature`.

### 3. The "Post-Merge" Routine 🚨

Every time a Pull Request is merged into `main`, **BOTH partners** must run these commands immediately:
```bash
# 1. Switch back to the main branch
git checkout main

# 2. Download the newly merged code
git pull origin main

# 3. (Optional) Delete your old local feature branch to keep things clean
git branch -d feature/your-old-feature

# 4. direct the terminal on the main father file
cd E-commerce-Backend


### 4. Communication Rules
- **Before starting work:** Run `git pull origin main` to make sure you aren't working on an old version.
- **If you add a new library:** Tell your partner immediately so they know they need to run `pnpm install`.
- **Sync Daily:** A quick message to say "I'm working on the User Schema today" prevents us from editing the same file at the same time.
```

> **Note:** lets get it done 💪




