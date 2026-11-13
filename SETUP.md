# Civic Pulse: add the files to your project (src layout)

Your project keeps its code in `src/` (you can tell from "Edit src/app/index.tsx"), so everything
goes inside `src/`, except `assets/` and `app.json`, which stay at the project root.

## 1. Install the extra packages

In the VS Code terminal, inside the project folder:

    npx expo install expo-checkbox expo-splash-screen @react-native-async-storage/async-storage
    npm install zustand
    npx expo install react-native-webview

## 2. Copy the files

Unzip `civic-pulse-src.zip`. You will see `src/`, `assets/` and `app.json`.

- Copy the **contents of the zip's `src/` folder** (`app`, `components`, `constants`, `stores`) into your project's `src/` folder. Say yes to replace.
  Your own `src/app/index.tsx` is replaced by the Civic Pulse onboarding screen.
- Copy the zip's **`assets/images/`** files into your project's `assets/images/` folder.
- Replace your project's **`app.json`** with the one in the zip.

Delete any leftover starter folders if they are still there: `app-example/`, `src/hooks/`.

Your project should now look like this:

    civic-pulse/
      assets/images/          (icon, adaptive-icon, monochrome-icon, splash-icon, favicon)
      src/
        app/                  (_layout, index, login, register, forgotpassword, resetpassword, dashboard, profile)
        components/           (LoadingScreen, Toast, auth/ui, dashboard/DashboardParts, dashboard/SimMap)
        constants/            (civic, reports, simMap, toast)
        stores/               (useAuthStore, useReportsStore, useUIStore, hydration)
      app.json
      package.json

## 3. Run it

    npx expo start -c

Press **w** for the browser.

## 4. Test the whole flow

1. The loading screen appears, then onboarding.
2. "Log in": any ID or email and any password. You land on the map.
3. Tap a pin, then Upvote. Open the Profile tab: "You upvoted" and the civic score went up.
4. Refresh the page: you are still logged in.
5. Profile > Log out: you go back to onboarding.
6. "Forgot password?": email > "Proceed to change password" > new password > back at login.
7. "Browse the map as a guest": upvoting asks you to log in.

## If something goes wrong

- **"Unable to resolve @/..."**: open `tsconfig.json` and check it has `"@/*": ["./src/*"]` under `paths` (the template includes it).
- **"Unable to resolve module ..."**: run `npx expo install <package name from the error>`, then `npx expo start -c`.
- **Blank screen**: stop the server and run `npx expo start -c` again.
