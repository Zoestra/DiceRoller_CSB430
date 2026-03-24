React Native Android App Project

Purpose: To examine, understand and show understanding around developing an Android application using React Native.

Skills Used: Critical Thinking, Deduction, Assessment, Android development with React Native, Developing an application with a new technology with little training, CI/CD basics

Knowledge Goals: Event-driven programming, Android development with React Native, continuous workflow integration

Summary

You will implement the React Native Android App that you have been planning all quarter long. You will use the designs around architecture, decisions about classes and wireframes that you developed earlier in the quarter to create this Android app.

In addition to the class we held where we went over using React Native, there are a wide array of resources online about how to use React Native. It will be up to you to develop with this new technology. It is intentional that you have had little training with React Native. You will regularly be asked to use new tools in industry and have to learn them quickly and on your own.

The React Native Weather App Guide Links to an external site. provides a small tutorial that will also do in class.

The following are resources you can use, but they are not exhaustive at all:

React Native Homepage Links to an external site.

Tutorials Point Tutorial Links to an external site.

Simplilearn React Native Tutorial Links to an external site.

Javapoint React Native Tutorial Links to an external site.

Code Academy React Native Tutorial Links to an external site.

The required content for your React Native app will depend on the number of people in your team.

Ensure your app has the same screens you developed in the Wireframes assignment. At a minimum:

    Landing/Login Screen
    Main Screen with key features (e.g., dashboard, home screen, or activity feed)
    A Detailed Screen (e.g., specific content, product, or feature screen)
    A Settings Screen
    (Team of 5 only): User Profile or Account screen
    (For teams of 6+): Additional screens of comparable content value

The requirements of this project are intentionally very flexible. You may use whatever libraries and additions that you want, as long as your core development is React Native with Expo. While the tutorial guide given uses Redux, you are not required to use it, only recommended to do so.

In your readme.md file in your repo, list who contributed to what.

Please upload any documents you used for design and wireframes (screenshot) to your repo so I can compare your design to implementation.

CI/CD and Quality Assurance

Your repo must include a working CI pipeline using GitHub Actions that runs automatically on every pull request to main and on every push to main.

Minimum CI Requirements (Required)

    GitHub Actions Workflow (Required)

        Add a workflow file at: .github/workflows/ci.yml (or similar).

        The workflow must run on:

            pull_request targeting main

            push to main



    Automated Checks in CI (Required)

    Your workflow must run these steps, in this order:

        Install dependencies (npm ci or npm install)

        Run ESLint (npm run lint)

        Run tests (npm test)



    CI Pass Requirement (Required)

    Your main branch must have at least one successful CI run visible in the Actions tab.

    At least one pull request must show the CI checks running and passing before merge.



    Evidence in README (Required)

    Add a CI/CD section to README.md that includes:

        A short description of what your pipeline does (lint + tests, when it runs)

        A screenshot of a successful GitHub Actions run, or a direct note pointing to the Actions run(s) by date/time and workflow name

        Any special instructions (if your tests require setup)

Optional “Nice to Have” CI Enhancements (Extra Credit if you want it +10)

    Add coverage reporting (Jest coverage output)

    Add a “build” step (Expo export or similar) if feasible

    Add branch protection rules to require CI to pass before merging (if available for your repo plan)

Testing

1. Jest for React Native: Please include unit testing for the application using Jest. Two unit tests minimum per student.

ESLint and Style

Please install ESLint and use it to ensure all problems and styling is handled. See the React Native Weather App Guide Links to an external site. for more on this.

Assessment

Assessment will be according to the rubric below. Some specifics:

    There must be a minimum of 1 screen per student on a team.
    The functional and non-functional requirements must be met.
    Adherence must be held to the design and architecture, unless a change happens late in which justification should be given in the Readme.md
    Creativity and problem-solving should be present such as:

        Successfully implementing a custom component to enhance user experience beyond the planned features, such as adding an innovative animation or integrating an external API.
    Code should be high quality with documentation such as comments.
    Github Actions workflow as describe implementing CI
    Usability will be very important. How easy is the app for users to use? To find things?
    Run ESLint and ensure there are not issues.

Extra Credit

For extra credit, each student who is involved and completes a screen, they will receive +50 points to distribute among any Riipen project assignments. If the student contacts the professor and tells them they want the points elsewhere, that will be fine too. The requirements for the project itself must be met, including CI/CD and testing. If two students in a group, for example, do the project for extra credit, please be sure to tell me who participated because it will submit as a group project for the whole team.

If you choose as a team to implement this without CI/CD but includes testing with Jest, whoever participated and completed one screen per student will receive +30 points among any Riipen project assignments.

If you choose as a team to implement this without CI/CD or testing with Jest, you can each +15 points for whoever participated and completed one screen per student among any Riipen project assignments.

Deliverables

Please submit the Github link to your repo with your React Native Android app code in it.
