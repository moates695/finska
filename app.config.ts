import 'dotenv/config';
import { config as loadEnv } from "dotenv";
import path from "path";

const envFile = process.env.ENVFILE || './envs/.env.dev'; 
loadEnv({ path: path.resolve(process.cwd(), envFile) });

export default ({ config }: any) => {
  return {
    ...config,
    expo: {
      name: "Finska Tracker",
      slug: "finska",
      version: "0.0.3",
      orientation: "portrait",
      userInterfaceStyle: "automatic",
      android: {
        versionCode: 2,
        compileSdkVersion: 34,
        targetSdkVersion: 34,
        package: "com.moates.finska",
        adaptiveIcon: {
          foregroundImage: "./assets/images/adaptive-icon.png",
          backgroundColor: "#FFFFFF",
        },
        displayName: "Finska Tracker"
      },
      ios: {
        bundleIdentifier: "com.moates.finska"
      },
      extra: {
        maxNameLength: process.env.MAX_NAME_LENGTH,
        eas: {
          "projectId": "17b301fd-3c8d-46a2-a0cc-90f945dd0f62"
        }
      },
      owner: "moates",
      plugins: [
        "expo-asset",
        "expo-font",
        [
          "expo-splash-screen",
          {
            backgroundColor: "#ffffff",
            image: "./assets/images/splash-icon.png",
            dark: {
              image: "./assets/images/splash-icon.png",
              backgroundColor: "#181818",
            },
            imageWidth: 200,
          }
        ]
      ],
      icon: "./assets/images/icon.png",
    },
  }
};